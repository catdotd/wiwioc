
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User

from .serializers import UserSerializer, RegisterSerializer


class RegisterView(APIView):
	permission_classes = (AllowAny,)

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		if serializer.is_valid():
			user = serializer.save()
			data = UserSerializer(user).data
			return Response(data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
	permission_classes = (AllowAny,)

	def post(self, request):
		username = request.data.get("username")
		password = request.data.get("password")

		user = authenticate(request, username=username, password=password)
		if user is None:
			return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

		refresh = RefreshToken.for_user(user)
		data = {
			"access": str(refresh.access_token),
			"refresh": str(refresh),
			"user": UserSerializer(user).data,
		}
		return Response(data)


class LogoutView(APIView):
	permission_classes = (IsAuthenticated,)

	def post(self, request):
		# If using token blacklisting, accept a refresh token and blacklist it here.
		# For now, treat logout as a client-side token discard.
		return Response(status=status.HTTP_200_OK)


class MeView(APIView):
	permission_classes = (IsAuthenticated,)

	def get(self, request):
		serializer = UserSerializer(request.user)
		return Response(serializer.data)

