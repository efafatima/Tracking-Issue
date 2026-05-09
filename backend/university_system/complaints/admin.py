# complaints/admin.py

from django.contrib import admin
from .models import ActivityLog, CategoryRouting, Complaint, ComplaintAttachment, ComplaintComment, Notification

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'assigned_teacher', 'department', 'routed_to_role', 'priority', 'category', 'created_at')
    list_filter = ('status', 'category', 'priority', 'department', 'routed_to_role', 'escalated')
    search_fields = ('title', 'description', 'user__username', 'assigned_teacher__username')


@admin.register(ComplaintAttachment)
class ComplaintAttachmentAdmin(admin.ModelAdmin):
    list_display = ("complaint", "file_type", "uploaded_at")


@admin.register(ComplaintComment)
class ComplaintCommentAdmin(admin.ModelAdmin):
    list_display = ("complaint", "user", "is_internal", "created_at")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "complaint", "message", "is_read", "created_at")
    list_filter = ("is_read",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "complaint", "user", "old_value", "new_value", "created_at")


@admin.register(CategoryRouting)
class CategoryRoutingAdmin(admin.ModelAdmin):
    list_display = ("category", "default_role", "department", "updated_at")
