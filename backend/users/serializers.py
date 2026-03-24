from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Role


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ("role",)

    def get_role(self, obj):
        return obj.role.type if obj.role else None


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "profile")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password", "role")

    def create(self, validated_data):
        role_name = validated_data.pop("role", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if role_name:
            role = Role.objects.filter(type=role_name).first()
            if role:
                # profile is created by post_save signal
                user.profile.role = role
                user.profile.save()

        return user
