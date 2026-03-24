from django.contrib import admin
from .models import JSON_Template, JSON_Version, Comment, Review_Request, Review_Decision

@admin.register(JSON_Template)
class JSONTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'owner__username')

@admin.register(JSON_Version)
class JSONVersionAdmin(admin.ModelAdmin):
    list_display = ('template', 'version_label', 'status', 'author', 'created_at')
    list_filter = ('status', 'template')
    search_fields = ('template__name', 'version_label')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'version', 'parent_comment', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('text', 'author__username')

@admin.register(Review_Request)
class ReviewRequestAdmin(admin.ModelAdmin):
    list_display = ('version', 'requester', 'created_at')
    list_filter = ('created_at',)

@admin.register(Review_Decision)
class ReviewDecisionAdmin(admin.ModelAdmin):
    list_display = ('review_request', 'reviewer', 'status', 'decided_at')
    list_filter = ('status', 'decided_at')
