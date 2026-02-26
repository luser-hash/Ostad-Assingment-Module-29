from rest_framework import serializers
from django.shortcuts import get_object_or_404
from . import models


class LessonSerializers(serializers.ModelSerializer):
    class Meta:
        model = models.Lessons
        fields = '__all__'
        read_only_fields = ["course"]

    def validate(self, attrs):
        # Reuse for both create and update.
        # Get the Intended Order
        # if user is creating lesson, order is inside attrs
        # if user is updating lesson and does not provide order then use the current instance value
        order = attrs.get("order", getattr(self.instance, "order", None))

        # Get the correct course
        # On create, course comes from URL.
        # On update, use the instance course.
        # If Update self.instance exists and if create self.instance None
        course = getattr(self.instance, "course", None)
        if course is None:
            # fetch the course from URL
            course_id = self.context["view"].kwargs.get("course_id")
            if course_id is not None:
                course = get_object_or_404(models.Course, pk=course_id)

        if course is None or order is None:
            return attrs
        
        # check duplication, find lesson in same course with same order
        qs = models.Lessons.objects.filter(course=course, order=order)
        if self.instance:
            # exclude because during update the query will find the current object itself
            # if we don't exclude then update would fail 
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({"order": "This order is already used in this course."})

        return attrs


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(
        source="instructor.username",
        read_only=True
    )
    lessons_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = models.Course
        fields = ["id", "title", "description", "thumbnail", "instructor", "instructor_name", "lessons_count", "created_at"]
        read_only_fields = ["instructor", "created_at"]


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(
        source="instructor.username",
        read_only=True
    )
    lessons = LessonSerializers(many=True, read_only=True)

    class Meta:
        model = models.Course
        fields = ["id", "title", "description", "thumbnail", "instructor", "instructor_name", "created_at", "lessons"]


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Enrollment
        fields = '__all__'
        read_only_fields = ["student", "course", "enrolled_at"]

    def validate(self, attrs):
        # this method runs after field validation but before saving
        # final check before creating enrollment to prevent duplication
        student = self.context['request'].user
        course_id = self.context['view'].kwargs.get('pk')

        if models.Enrollment.objects.filter(student=student, course=course_id).exists():
            raise serializers.ValidationError({"detail": "You're already enrolled in this course!"})

        return attrs


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.LessonProgress
        fields = '__all__'
        read_only_fields = ["student", "lesson"]

    def validate(self, attrs):
        # this method runs after field validation but before saving
        # final check before Mark lesson as complete to prevent not enrolled course lesson as marked
        request = self.context["request"]
        user = request.user

        lesson_id = self.context["view"].kwargs.get("pk")
        lesson = get_object_or_404(models.Lessons, pk=lesson_id)

        # Must be enrolled in the lesson's course
        if not models.Enrollment.objects.filter(student=user, course=lesson.course).exists():
            raise serializers.ValidationError({"detail": "You're not enrolled in this course."})

        if models.LessonProgress.objects.filter(student=user, lesson=lesson).exists():
            raise serializers.ValidationError({"detail": "Progress already exists for this lesson."})

        return attrs
