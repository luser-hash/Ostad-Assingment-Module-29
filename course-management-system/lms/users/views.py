from django.conf import settings

from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer


def _set_refresh_cookie(response, refresh_token):
    max_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())
    response.set_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        value=refresh_token,
        domain=settings.JWT_REFRESH_COOKIE_DOMAIN,
        max_age=max_age,
        httponly=settings.JWT_REFRESH_COOKIE_HTTP_ONLY,
        secure=settings.JWT_REFRESH_COOKIE_SECURE,
        samesite=settings.JWT_REFRESH_COOKIE_SAMESITE,
        path=settings.JWT_REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response):
    response.delete_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        domain=settings.JWT_REFRESH_COOKIE_DOMAIN,
        path=settings.JWT_REFRESH_COOKIE_PATH,
        samesite=settings.JWT_REFRESH_COOKIE_SAMESITE,
    )


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField(required=False)

    def validate(self, attrs):
        refresh = attrs.get("refresh")
        if not refresh:
            request = self.context.get("request")
            refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME) if request else None

        if not refresh:
            raise InvalidToken("No valid refresh token found.")

        attrs["refresh"] = refresh
        return super().validate(attrs)


class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop("refresh", None)
        if refresh:
            _set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop("refresh", None)
        if refresh:
            _set_refresh_cookie(response, refresh)
        return response


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "role": u.role})
    

class LogoutApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh = request.data.get("refresh") or request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        if refresh:
            try:
                token = RefreshToken(refresh)
                token.blacklist()
            except Exception:
                # We still clear the cookie and return success.
                pass

        response = Response({"detail": "Logged Out."}, status=status.HTTP_205_RESET_CONTENT)
        _clear_refresh_cookie(response)
        return response
