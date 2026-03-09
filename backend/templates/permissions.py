from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` or `author` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if the object has an owner (Template) or author (Version)
        owner = getattr(obj, 'owner', getattr(obj, 'author', None))
        return owner == request.user

class IsReviewer(permissions.BasePermission):
    """
    Allows access only to users with the 'Reviewer' role.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return hasattr(request.user, 'profile') and request.user.profile.role.type == 'Reviewer'

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with the 'Admin' role.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return hasattr(request.user, 'profile') and request.user.profile.role.type == 'Admin'
