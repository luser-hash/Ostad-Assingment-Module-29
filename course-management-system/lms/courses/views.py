from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Count

from rest_framework import generics, permissions, serializers
from rest_framework.views import APIView, Response
from rest_framework.pagination import PageNumberPagination

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


class CourseListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"  # frontend can override it
    max_page_size = 30


class CourseListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseSerializer
    pagination_class = CourseListPagination

    queryset = (
        Course.objects
        .select_related("instructor")
        .annotate(lessons_count=Count("lessons"))
        .order_by("-created_at")
    )


class InstructorCourseListApiView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    serializer_class = CourseSerializer
    pagination_class = CourseListPagination

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
    queryset = Lessons.objects.select_related("course").all()


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
        lesson = get_object_or_404(Lessons, pk=self.kwargs['pk'])
        try:
            serializer.save(student=self.request.user, lesson=lesson, completed=True)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Progress already exists for this lesson."})


class LessonPogressApiView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        # Get the Lesson
        lesson = get_object_or_404(Lessons, pk=lesson_id)

        # Check the completion status of the lesson
        is_completed = LessonProgress.objects.filter(
            student=request.user,
            lesson=lesson,
            completed=True
            ).first()

        completed = is_completed.completed if is_completed else False

        return Response(
            {
                "lesson_id": lesson.id,
                "title": lesson.title,
                "Completed": completed,
            }
        )


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
