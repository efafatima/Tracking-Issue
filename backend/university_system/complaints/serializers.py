from rest_framework import serializers
from .models import (
    ActivityLog,
    CategoryRouting,
    Complaint,
    ComplaintAttachment,
    ComplaintComment,
    Notification,
)
from .similarity import find_similarity


class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintAttachment
        fields = ["id", "file", "file_url", "file_type", "uploaded_at"]
        read_only_fields = ["id", "file_url", "file_type", "uploaded_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class ComplaintCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintComment
        fields = ["id", "complaint", "user", "user_name", "user_role", "description", "is_internal", "created_at"]
        read_only_fields = ["id", "complaint", "user", "user_name", "user_role", "created_at"]

    def get_user_role(self, obj):
        return obj.user.role if obj.user else "System"


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "action", "complaint", "user", "user_name", "old_value", "new_value", "created_at"]


class ComplaintSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    similarity_score = serializers.SerializerMethodField()
    assigned_to_name = serializers.CharField(source="assigned_teacher.username", read_only=True)
    assigned_teacher_name = serializers.CharField(source="assigned_teacher.username", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)
    comments = ComplaintCommentSerializer(many=True, read_only=True)
    activity_logs = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            "id",
            "title",
            "description",
            "category",
            "severity",
            "priority",
            "suggested_category",
            "suggested_priority",
            "status",
            "is_anonymous",
            "assigned_teacher",
            "assigned_to_name",
            "assigned_teacher_name",
            "assigned_by",
            "teacher_comments",
            "department",
            "department_name",
            "routed_to_role",
            "deadline",
            "resolved_at",
            "escalated",
            "rating",
            "feedback",
            "created_at",
            "updated_at",
            "user_name",
            "similarity_score",
            "attachments",
            "comments",
            "activity_logs",
        ]
        read_only_fields = [
            "status",
            "assigned_teacher",
            "assigned_by",
            "created_at",
            "updated_at",
            "resolved_at",
            "suggested_category",
            "suggested_priority",
            "routed_to_role",
        ]

    def get_user_name(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if obj.is_anonymous and user and user.groups.filter(name__in=["HOD", "DSA", "Faculty Member"]).exists():
            return "Anonymous"
        return obj.user.username if obj.user else None

    def get_similarity_score(self, obj):
        existing_texts = Complaint.objects.exclude(id=obj.id).values_list("description", flat=True)
        if not existing_texts:
            return 0
        return find_similarity(obj.description, existing_texts)

    def get_activity_logs(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not (
            user.is_superuser
            or user.groups.filter(name__in=["HOD", "DSA", "Supervisor"]).exists()
        ):
            return []
        return ActivityLogSerializer(obj.activitylog_set.order_by("-created_at"), many=True).data


class CategoryRoutingSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = CategoryRouting
        fields = ["id", "category", "default_role", "department", "department_name", "created_at", "updated_at"]


class NotificationSerializer(serializers.ModelSerializer):
    complaint_title = serializers.CharField(source="complaint.title", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "user", "complaint", "complaint_title", "message", "is_read", "is_sent", "created_at"]
        read_only_fields = ["id", "user", "complaint_title", "created_at"]
