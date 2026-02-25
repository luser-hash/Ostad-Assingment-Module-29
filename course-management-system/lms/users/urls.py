from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, MeView, LogoutApiView

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),  # Registration
    path("auth/token/", TokenObtainPairView.as_view()),  # Login
    path("auth/token/refresh/", TokenRefreshView.as_view()),  # Refresh Token
    path("me/", MeView.as_view()),  # User data
    path("auth/logout/", LogoutApiView.as_view()),  # Logout 
]