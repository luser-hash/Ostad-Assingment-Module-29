from django.contrib import admin
from .models import Course, Lessons, Enrollment, LessonProgress


# Register your models here.

admin.site.register(Course)
admin.site.register(Lessons)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)