from django.urls import path

from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    RegisterView,
    MeView,
    LogoutApiView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),  # Registration
    path("auth/token/", CookieTokenObtainPairView.as_view()),  # Login
    path("auth/token/refresh/", CookieTokenRefreshView.as_view()),  # Refresh Token
    path("me/", MeView.as_view()),  # User data
    path("auth/logout/", LogoutApiView.as_view()),  # Logout 
]
