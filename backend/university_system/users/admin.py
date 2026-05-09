from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Department, User


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "hod", "dsa", "created_at")
    search_fields = ("name", "hod__username", "dsa__username")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "username", "email", "department", "get_groups", "is_staff", "is_superuser")
    list_filter = ("groups", "department", "is_staff", "is_superuser")
    search_fields = ("username", "email")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("University Scope", {"fields": ("department",)}),
    )

    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])

    get_groups.short_description = "Groups"
