from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

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

    @action(detail=True, methods=["get"], url_path="viewer-data")
    def viewer_data(self, request, pk=None):
        template = self.get_object()
        versions = template.versions.all().order_by("-created_at")

        if not versions.exists():
            return Response(
                {
                    "id": str(template.id),
                    "name": template.name,
                    "versionLabel": None,
                    "baseline": {},
                    "draft": {},
                }
            )

        draft_version = versions.first()

        if draft_version.parent_version:
            baseline_version = draft_version.parent_version
        elif versions.count() > 1:
            baseline_version = versions[1]
        else:
            baseline_version = draft_version

        return Response(
            {
                "id": str(template.id),
                "name": template.name,
                "versionLabel": draft_version.version_label,
                "baseline": baseline_version.json_content,
                "draft": draft_version.json_content,
            }
        )


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