from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


def validate_attachment(file):
    max_size = 10 * 1024 * 1024
    allowed = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]
    content_type = getattr(file, "content_type", None)
    if file.size > max_size:
        raise ValidationError("Attachment must be 10MB or smaller.")
    if content_type and content_type not in allowed:
        raise ValidationError("Unsupported attachment type.")


class Complaint(models.Model):
    STATUS_CHOICES = [
        ("Submitted", "Submitted"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
        ("Rejected", "Rejected"),
        ("Escalated", "Escalated"),
    ]
    CATEGORY_CHOICES = [
        ("Academic", "Academic"),
        ("Administrative", "Administrative"),
        ("Facilities", "Facilities"),
        ("Behavior-related", "Behavior-related"),
        ("Other", "Other"),
    ]
    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Urgent", "Urgent"),
    ]
    ROUTED_ROLE_CHOICES = [
        ("HOD", "HOD"),
        ("DSA", "DSA / Administrator"),
        ("Supervisor", "Supervisor"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    severity = models.CharField(max_length=10)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="Medium")
    suggested_category = models.CharField(max_length=50, blank=True, null=True)
    suggested_priority = models.CharField(max_length=10, blank=True, null=True)
    department = models.ForeignKey(
        "users.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
    )
    routed_to_role = models.CharField(max_length=30, choices=ROUTED_ROLE_CHOICES, default="HOD")
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Submitted"
    )
    assigned_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_complaints",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints_assigned",
    )
    teacher_comments = models.TextField(blank=True, null=True)
    deadline = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    escalated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.is_anonymous:
            return f"Anonymous Complaint #{self.id}"
        return f"{self.title} ({self.status})"

    @property
    def assigned_to(self):
        return self.assigned_teacher


class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="complaint_attachments/", validators=[validate_attachment])
    file_type = models.CharField(max_length=120, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for complaint #{self.complaint_id}"


class ComplaintComment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on complaint #{self.complaint_id}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, null=True, blank=True)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message


class CategoryRouting(models.Model):
    category = models.CharField(max_length=50, choices=Complaint.CATEGORY_CHOICES)
    default_role = models.CharField(max_length=30, choices=Complaint.ROUTED_ROLE_CHOICES)
    department = models.ForeignKey(
        "users.Department",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="category_routes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("category", "department")

    def __str__(self):
        scope = self.department.name if self.department else "Global"
        return f"{self.category} -> {self.default_role} ({scope})"


class ActivityLog(models.Model):
    action = models.CharField(max_length=255)
    complaint = models.ForeignKey(
        Complaint, on_delete=models.CASCADE, null=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    old_value = models.CharField(max_length=255, blank=True, null=True)
    new_value = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.action
