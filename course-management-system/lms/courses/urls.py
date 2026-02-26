from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    CreateCourseView,
    CourseUpdateDeletView,
    InstructorCourseListApiView,

    LessonListByCourseView,
    LessonCreateApiView,
    LessonUpdateDeleteApiView,
    CourseLessonDetailApiView,
    LessonDetailApiView,

    EnrollCourseAPiView,
    MyEnrolledCoursesApiView,

    MarkLessonCompletedApiView,
    CourseProgressApiView,
    ListLessonPogressPerCourseApiView,
    )

urlpatterns = [

    # URLs for Course
    path("courses/", CourseListView.as_view()),
    path("courses/<int:pk>/", CourseDetailView.as_view()),
    path("courses/create/", CreateCourseView.as_view()),
    path("courses/<int:pk>/manage/", CourseUpdateDeletView.as_view()),
    path("instructor/courses/", InstructorCourseListApiView.as_view()),

    # URLs for Lessons
    path("courses/<int:course_id>/lessons/", LessonListByCourseView.as_view()),
    path("courses/<int:course_id>/lessons/create", LessonCreateApiView.as_view()),
    path("courses/<int:course_id>/lessons/<int:lesson_id>/manage/", LessonUpdateDeleteApiView.as_view()),
    path("lessons/<int:lesson_id>", LessonDetailApiView.as_view()),
    path("courses/<int:course_id>/lessons/<int:lesson_id>/", CourseLessonDetailApiView.as_view()),

    # URLs for Enrollments
    path("courses/<int:pk>/enrollment/", EnrollCourseAPiView.as_view()),
    path("myenrollments/", MyEnrolledCoursesApiView.as_view()),

    # Lessson Completion
    path("courses/<int:course_id>/lessons/<int:lesson_id>/completed/", MarkLessonCompletedApiView.as_view()),
    path("courses/<int:course_id>/progress/", CourseProgressApiView.as_view()),
    path("courses/<int:course_id>/progress/list/", ListLessonPogressPerCourseApiView.as_view()),
]