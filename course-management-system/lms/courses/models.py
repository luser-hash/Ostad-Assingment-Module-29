from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to="thumbnails/", blank=True, null=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Lessons(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    video_url = models.URLField()
    duration = models.PositiveIntegerField()  # minutes
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["course", "order"],
                name="unique_course_order",
            )
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollmentstudents")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollmentcourses")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_enrollment",
            )
        ]

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"


class LessonProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="studentprogress")
    lesson = models.ForeignKey(Lessons, on_delete=models.CASCADE, related_name="lessonprogress")
    completed = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "lesson"],
                name="unique_lesson_progress",
            )
        ]

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title}"