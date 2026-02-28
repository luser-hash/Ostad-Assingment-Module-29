from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Count

from rest_framework import generics, permissions, serializers
from rest_framework.views import APIView, Response
from rest_framework.exceptions import PermissionDenied

from .models import Course, Lessons, Enrollment, LessonProgress

from .serializers import (
    CourseSerializer,
    CourseDetailSerializer,
    LessonSerializers,
    EnrollmentSerializer,
    LessonProgressSerializer
    )

from .permissions import (
    IsInstructor,
    IsStudent,
    IsOwnerInstructorOrReadOnly,
    IsCourseOwnerInstructor,
)


class CourseListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseSerializer

    queryset = (
        Course.objects
        .select_related("instructor")
        .annotate(lessons_count=Count("lessons"))
        .order_by("-created_at")
    )


class InstructorCourseListApiView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user

        return (
            Course.objects
            .filter(instructor=user)  
            .select_related("instructor")
            .annotate(lessons_count=Count("lessons"))
            .order_by("-created_at")
        )


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Course.objects.select_related("instructor").all().order_by("-created_at")
    serializer_class = CourseDetailSerializer


class CreateCourseView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    serializer_class = CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseUpdateDeletView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerInstructorOrReadOnly]
    queryset = Course.objects.select_related("instructor").all()
    serializer_class = CourseSerializer


class LessonListByCourseView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LessonSerializers

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        return Lessons.objects.filter(course_id=course_id).order_by("order")
    

class CourseLessonDetailApiView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LessonSerializers

    # url: courses/course_id/lessons/lesson_id
    def get_queryset(self):
        course = self.kwargs["course_id"]
        lesson = self.kwargs["lesson_id"]

        return Lessons.objects.filter(course=course, id=lesson)


class LessonDetailApiView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LessonSerializers

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        return Lessons.objects.filter(id=lesson_id)


class LessonCreateApiView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCourseOwnerInstructor]
    serializer_class = LessonSerializers

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs["course_id"])
        try:
            serializer.save(course=course)
        except IntegrityError:
            raise serializers.ValidationError({"order": "This order is already used in this course."})


class LessonUpdateDeleteApiView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerInstructorOrReadOnly]
    serializer_class = LessonSerializers
    
    def get_object(self):
        obj = get_object_or_404(
            Lessons.objects.select_related("course"),
            pk=self.kwargs["lesson_id"],
            course_id=self.kwargs["course_id"],
        )
        self.check_object_permissions(self.request, obj)
        return obj


class EnrollCourseAPiView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = EnrollmentSerializer

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs['pk'])
        try:
            serializer.save(student=self.request.user, course=course)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "You're already enrolled in this course!"})


class MyEnrolledCoursesApiView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(enrollmentcourses__student=user).order_by('-created_at')


class MarkLessonCompletedApiView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = LessonProgressSerializer

    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        lesson_id = self.kwargs['lesson_id']

        # Fetch lesson and ensure it belongs to the course
        lesson = get_object_or_404(Lessons, id=lesson_id, course_id=course_id)

        # Ensure student is enrolled in that course
        if not Enrollment.objects.filter(student=self.request.user, course_id=course_id).exists():
            raise PermissionDenied("You are not enrolled in this course.")
        try:
            serializer.save(student=self.request.user, lesson=lesson, completed=True)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Lesson Already Completed!"})


class ListLessonPogressPerCourseApiView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, course_id):

        # GET /courses/:courseId/progress/  -> { completed_lessons: [1,2,3] } 

        user = request.user
        course = get_object_or_404(Course, pk=course_id)

        # Must be enrolled
        if not Enrollment.objects.filter(student=user, course=course).exists():
            raise PermissionDenied("You are not enrolled in this course!")
        
        # Progress rows for this student, for lessons in this course,that are completed
        completed_lessons_ids = list(
            LessonProgress.objects.filter(
                student=user,
                lesson__course=course,
                completed=True
            ).values_list("lesson_id", flat=True)
        )

        return Response({"completed_lessons": completed_lessons_ids})


class CourseProgressApiView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):

        # Check user role == student
        if request.user.role != 'student':
            return Response({"detail": "Only students can view their progress."})

        # get the course
        course = get_object_or_404(Course, pk=course_id)

        # Check if student is enrolled to the course
        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course
        ).exists()
        if not enrolled:
            return Response({"detail": "You're not enrolled to this course. Enroll First to see Progress!"})

        # Count all course lessons
        total = course.lessons.count()

        # Count completed lessons
        completed = LessonProgress.objects.filter(
            student=request.user,
            lesson__course=course,
            completed=True
        ).count()

        percent = 0 if total == 0 else round((completed/total) * 100, 2)

        return Response({
            "course_id": course.id,
            "total_lessons": total,
            "completed_lessons": completed,
            "progress_percent": percent,
        })
