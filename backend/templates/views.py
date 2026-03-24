from rest_framework import viewsets, permissions
from .models import JSON_Template, JSON_Version, Comment, Review_Request, Review_Decision
from .serializers import (
    JSONTemplateSerializer, 
    JSONVersionSerializer, 
    CommentSerializer,
    ReviewRequestSerializer,
    ReviewDecisionSerializer
)

from .permissions import IsAuthorOrReadOnly, IsReviewer, IsAdminUser

class JSONTemplateViewSet(viewsets.ModelViewSet):
    queryset = JSON_Template.objects.all().order_by('-created_at')
    serializer_class = JSONTemplateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class JSONVersionViewSet(viewsets.ModelViewSet):
    queryset = JSON_Version.objects.all().order_by('-created_at')
    serializer_class = JSONVersionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ReviewRequestViewSet(viewsets.ModelViewSet):
    queryset = Review_Request.objects.all().order_by('-created_at')
    serializer_class = ReviewRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

class ReviewDecisionViewSet(viewsets.ModelViewSet):
    queryset = Review_Decision.objects.all().order_by('-decided_at')
    serializer_class = ReviewDecisionSerializer
    permission_classes = [permissions.IsAuthenticated, IsReviewer]

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
