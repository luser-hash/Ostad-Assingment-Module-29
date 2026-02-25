from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    CreateCourseView,
    CourseUpdateDeletView,

    LessonListByCourseView,
    LessonCreateApiView,
    LessonUpdateDeleteApiView,

    EnrollCourseAPiView,
    MyEnrolledCoursesApiView,

    MarkLessonCompletedApiView,
    CourseProgressApiView,
    LessonPogressApiView,
    )

urlpatterns = [

    # URLs for Course
    path("courses/", CourseListView.as_view()),
    path("courses/<int:pk>/", CourseDetailView.as_view()),
    path("courses/create/", CreateCourseView.as_view()),
    path("courses/<int:pk>/manage/", CourseUpdateDeletView.as_view()),

    # URLs for Lessons
    path("courses/<int:course_id>/lessons/", LessonListByCourseView.as_view()),
    path("courses/<int:course_id>/lessons/create", LessonCreateApiView.as_view()),
    path("lessons/<int:pk>/manage/", LessonUpdateDeleteApiView.as_view()),

    # URLs for Enrollments
    path("courses/<int:pk>/enrollment/", EnrollCourseAPiView.as_view()),
    path("myenrollments/", MyEnrolledCoursesApiView.as_view()),

    # Lessson Completion
    path("lessons/<int:pk>/completed/", MarkLessonCompletedApiView.as_view()),
    path("courses/<int:course_id>/progress/", CourseProgressApiView.as_view()),
    path("lessons/per/completion/<int:lesson_id>/", LessonPogressApiView.as_view()),
]