from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JSON_Template, JSON_Version, Comment, Review_Request, Review_Decision

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CommentSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'version', 'author', 'author_detail', 
            'parent_comment', 'text', 'created_at', 'replies'
        ]
        read_only_fields = ['id', 'created_at']

    def get_replies(self, obj):
        # This handles the internal threading logic for the API
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class ReviewDecisionSerializer(serializers.ModelSerializer):
    reviewer = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    reviewer_detail = UserSerializer(source='reviewer', read_only=True)

    class Meta:
        model = Review_Decision
        fields = ['id', 'review_request', 'reviewer', 'reviewer_detail', 'status', 'decided_at']
        read_only_fields = ['id', 'decided_at']

class ReviewRequestSerializer(serializers.ModelSerializer):
    requester_detail = UserSerializer(source='requester', read_only=True)
    decisions = ReviewDecisionSerializer(many=True, read_only=True)

    class Meta:
        model = Review_Request
        fields = ['id', 'version', 'requester', 'requester_detail', 'created_at', 'decisions']
        read_only_fields = ['id', 'created_at']

class JSONVersionSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author_detail = UserSerializer(source='author', read_only=True)
    review_requests = ReviewRequestSerializer(many=True, read_only=True)

    class Meta:
        model = JSON_Version
        fields = [
            'id', 'template', 'parent_version', 'author', 'author_detail',
            'version_label', 'json_content', 'status', 'created_at', 
            'approved_at', 'rejected_at', 'comments', 'review_requests'
        ]

class JSONTemplateSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    owner_detail = UserSerializer(source='owner', read_only=True)
    versions = JSONVersionSerializer(many=True, read_only=True)

    class Meta:
        model = JSON_Template
        fields = ['id', 'name', 'owner', 'owner_detail', 'created_at', 'versions']
