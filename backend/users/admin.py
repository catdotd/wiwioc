from django.contrib import admin
from .models import Role, Profile

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('type',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username',)

# Register your models here.
