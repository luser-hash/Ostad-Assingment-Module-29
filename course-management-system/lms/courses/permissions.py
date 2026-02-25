from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.shortcuts import get_object_or_404
from .models import Course


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )
    

class IsStudent(BasePermission):
    message = " Only students can Enroll to a course/ See their Lesson Progress."
    
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'student'
        )


class IsOwnerInstructorOrReadOnly(BasePermission):

    message = "You are not Owner of this Course/Lesson."
    """
    Read: Anyone Authenticated
    Write: Only Instructor who owns the course
    has_object_permission() Only runs when DRF already has an object.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:  # any authenticated user can read
            return True
        
        if not request.user.is_authenticated:
            return False
        
        if getattr(request.user, "role", None) != "instructor":
            return False
        
        # if obj is a course
        if hasattr(obj, "instructor_id"):
            return obj.instructor_id == request.user.id
        
        # If obj is a lesson: OwnerShip via course
        if hasattr(obj, "course") and hasattr(obj.course, "instructor_id"):
            return obj.course.instructor_id == request.user.id
        
        return False
        

class IsCourseOwnerInstructor(BasePermission):
    """
    Allow Creating lessons only if the user is an instructor and
    owns the course in the URL.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # any authenticated user can read
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if getattr(request.user, "role", None) != "instructor":
            return False
        
        course_id = view.kwargs.get("course_id")
        if not course_id:
            return False
        
        course = get_object_or_404(Course, pk=course_id)
        return course.instructor_id == request.user.id
