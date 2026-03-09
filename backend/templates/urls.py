from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JSONTemplateViewSet, 
    JSONVersionViewSet, 
    CommentViewSet,
    ReviewRequestViewSet,
    ReviewDecisionViewSet
)

router = DefaultRouter()
router.register(r'templates', JSONTemplateViewSet)
router.register(r'versions', JSONVersionViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'review-requests', ReviewRequestViewSet)
router.register(r'review-decisions', ReviewDecisionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
