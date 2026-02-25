from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def validate(self, attrs):
        password = attrs.get("password")
        if not password:
            return attrs

        candidate_user = User(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
            role=attrs.get("role", User.Role.STUDENT),
        )

        try:
            validate_password(password, user=candidate_user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            role=validated_data.get("role", User.Role.STUDENT),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
