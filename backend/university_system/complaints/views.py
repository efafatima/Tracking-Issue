from datetime import timedelta
from io import BytesIO

from django.conf import settings
from django.db.models import Avg, Count
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from reportlab.pdfgen import canvas
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import Department, User
from users.permissions import IsAdmin, IsHOD, IsPrivilegedStaff, IsStudent, IsSupervisor, IsTeacher
from .complaint_predictor import predict_category
from .models import (
    ActivityLog,
    CategoryRouting,
    Complaint,
    ComplaintAttachment,
    ComplaintComment,
    Notification,
)
from .serializers import CategoryRoutingSerializer, ComplaintSerializer, NotificationSerializer
from .severity_score import get_severity
from .similarity import find_similarity


LEGACY_STATUS_MAP = {
    "Pending": "Submitted",
    "Ready for Assignment": "Submitted",
    "Assigned": "In Progress",
    "Solved": "Resolved",
    "Fulfilled": "Closed",
}
DEFAULT_CATEGORY_ROUTES = {
    "Academic": "HOD",
    "Behavior-related": "HOD",
    "Administrative": "DSA",
    "Facilities": "HOD",
    "Other": "HOD",
}


def api_response(data=None, message="", success=True, status_code=200):
    return Response({"success": success, "message": message, "data": data}, status=status_code)


def role_names(user):
    names = set(user.groups.values_list("name", flat=True))
    if user.is_superuser:
        names.add("Supervisor")
    return names


def is_supervisor(user):
    return user.is_superuser or "Supervisor" in role_names(user)


def is_dsa(user):
    return "DSA" in role_names(user)


def is_hod(user):
    return "HOD" in role_names(user)


def is_faculty(user):
    return "Faculty Member" in role_names(user)


def normalize_status(value):
    return LEGACY_STATUS_MAP.get(value, value)


def create_activity(complaint, action, user=None, old_value=None, new_value=None):
    return ActivityLog.objects.create(
        complaint=complaint,
        action=action,
        user=user if user and user.is_authenticated else None,
        old_value=old_value,
        new_value=new_value,
    )


def notify(user, complaint, message):
    if user:
        Notification.objects.create(user=user, complaint=complaint, message=message)


def notify_role(role, complaint, message, department=None):
    qs = User.objects.filter(groups__name=role)
    if department and role != "Supervisor":
        qs = qs.filter(department=department)
    for user in qs.distinct():
        notify(user, complaint, message)


def route_for(category, department=None):
    route = None
    if department:
        route = CategoryRouting.objects.filter(category=category, department=department).first()
    route = route or CategoryRouting.objects.filter(category=category, department__isnull=True).first()
    return route.default_role if route else DEFAULT_CATEGORY_ROUTES.get(category, "HOD")


def user_can_view(user, complaint):
    if is_supervisor(user):
        return True
    if complaint.user_id == user.id:
        return True
    if complaint.assigned_teacher_id == user.id:
        return True
    if is_hod(user) and complaint.routed_to_role == "HOD":
        return bool(user.department_id) and complaint.department_id == user.department_id
    if is_dsa(user) and complaint.routed_to_role == "DSA":
        return bool(user.department_id) and complaint.department_id == user.department_id
    return False


def scoped_complaints(user):
    qs = Complaint.objects.select_related("user", "assigned_teacher", "department").prefetch_related("attachments", "comments")
    if is_supervisor(user):
        return qs
    if is_dsa(user):
        return qs.filter(routed_to_role="DSA", department=user.department) if user.department_id else qs.none()
    if is_hod(user):
        return qs.filter(routed_to_role="HOD", department=user.department) if user.department_id else qs.none()
    if is_faculty(user):
        return qs.filter(assigned_teacher=user)
    return qs.filter(user=user)


def serialize_complaints(request, qs):
    return ComplaintSerializer(qs.distinct().order_by("-created_at"), many=True, context={"request": request}).data


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        return scoped_complaints(self.request.user).distinct().order_by("-created_at")

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsStudent()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        complaint = serializer.save(user=self.request.user)
        create_activity(complaint, "Complaint submitted", self.request.user)

    def perform_update(self, serializer):
        complaint = self.get_object()
        if complaint.user_id != self.request.user.id or complaint.status != "Submitted":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the student owner can edit a complaint before assignment.")

        old_value = f"{complaint.title} / {complaint.category} / {complaint.priority}"
        updated = serializer.save(
            severity=serializer.validated_data.get("priority", complaint.priority),
            department=self.request.user.department,
            routed_to_role=route_for(
                serializer.validated_data.get("category", complaint.category),
                self.request.user.department,
            ),
        )
        uploads = self.request.FILES.getlist("attachments") or self.request.FILES.getlist("files")
        if uploads:
            updated.attachments.all().delete()
            for upload in uploads:
                attachment = ComplaintAttachment(complaint=updated, file=upload, file_type=getattr(upload, "content_type", ""))
                attachment.full_clean()
                attachment.save()
        new_value = f"{updated.title} / {updated.category} / {updated.priority}"
        create_activity(updated, "Complaint updated by student", self.request.user, old_value, new_value)

    def perform_destroy(self, instance):
        if not is_supervisor(self.request.user) and not (instance.user_id == self.request.user.id and instance.status == "Submitted"):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only submitted complaints can be deleted by the student owner.")
        create_activity(instance, "Complaint deleted", self.request.user)
        instance.delete()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def suggest_complaint(request):
    text = request.data.get("description") or request.data.get("complaint_text") or ""
    if not text.strip():
        return api_response(success=False, message="Description is required", status_code=400)
    existing_texts = Complaint.objects.values_list("description", flat=True)
    category = predict_category(text)
    priority = get_severity(text)
    return api_response(data={
        "suggested_category": category,
        "suggested_priority": priority,
        "similarity_score": find_similarity(text, existing_texts),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStudent])
def submit_complaint_ml(request):
    text = (request.data.get("description") or request.data.get("complaint_text") or "").strip()
    title = (request.data.get("title") or "").strip()
    category = request.data.get("category")
    priority = request.data.get("priority") or request.data.get("severity")
    is_anonymous = str(request.data.get("is_anonymous", request.data.get("anonymous", False))).lower() in ["true", "1", "yes"]
    department_id = request.data.get("department") or request.user.department_id

    if not title:
        return api_response(success=False, message="Complaint title is required", status_code=400)
    if not text:
        return api_response(success=False, message="Complaint description is required", status_code=400)
    if category not in dict(Complaint.CATEGORY_CHOICES):
        return api_response(success=False, message="Valid category is required", status_code=400)
    if priority not in dict(Complaint.PRIORITY_CHOICES):
        return api_response(success=False, message="Valid priority is required", status_code=400)

    existing_texts = Complaint.objects.values_list("description", flat=True)
    similarity_score = find_similarity(text, existing_texts)
    suggested_category = predict_category(text)
    suggested_priority = get_severity(text)
    department = Department.objects.filter(id=department_id).first() if department_id else None
    routed_role = route_for(category, department)

    complaint = Complaint.objects.create(
        user=request.user,
        title=title,
        description=text,
        category=category,
        priority=priority,
        severity=priority,
        suggested_category=suggested_category,
        suggested_priority=suggested_priority,
        department=department,
        routed_to_role=routed_role,
        is_anonymous=is_anonymous,
        status="Submitted",
    )

    for upload in request.FILES.getlist("attachments") or request.FILES.getlist("files"):
        attachment = ComplaintAttachment(complaint=complaint, file=upload, file_type=getattr(upload, "content_type", ""))
        attachment.full_clean()
        attachment.save()

    create_activity(complaint, f"Complaint submitted and routed to {routed_role}", request.user)
    notify(request.user, complaint, f"Complaint #{complaint.id} submitted.")
    notify_role(routed_role, complaint, f"New {category} complaint #{complaint.id} routed to {routed_role}.", department)

    return api_response(
        data={
            "id": complaint.id,
            "category": category,
            "priority": priority,
            "severity": priority,
            "suggested_category": suggested_category,
            "suggested_priority": suggested_priority,
            "similarity_score": similarity_score,
            "routed_to_role": routed_role,
            "status": complaint.status,
        },
        message="Complaint submitted successfully",
        status_code=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_stats(request):
    qs = Complaint.objects.filter(user=request.user)
    return api_response(data={
        "total": qs.count(),
        "pending": qs.filter(status="Submitted").count(),
        "in_progress": qs.filter(status="In Progress").count(),
        "solved": qs.filter(status__in=["Resolved", "Closed"]).count(),
        "resolved": qs.filter(status="Resolved").count(),
        "closed": qs.filter(status="Closed").count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_complaints(request):
    return api_response(data=serialize_complaints(request, Complaint.objects.filter(user=request.user)))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def complaint_detail(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint):
        return api_response(success=False, message="Not allowed", status_code=403)
    return api_response(data=ComplaintSerializer(complaint, context={"request": request}).data)


def save_comment_response(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint):
        return api_response(success=False, message="Not allowed", status_code=403)
    text = (request.data.get("comment") or request.data.get("description") or "").strip()
    if not text:
        return api_response(success=False, message="Comment is required", status_code=400)
    is_internal = bool(request.data.get("is_internal", False)) and not role_names(request.user).issubset({"Student"})
    comment = ComplaintComment.objects.create(complaint=complaint, user=request.user, description=text, is_internal=is_internal)
    complaint.teacher_comments = text if is_faculty(request.user) else complaint.teacher_comments
    complaint.save(update_fields=["teacher_comments", "updated_at"])
    create_activity(complaint, "Comment added", request.user)
    notify(complaint.user, complaint, f"New comment on complaint #{complaint.id}.")
    return api_response(data={"id": comment.id, "comment": comment.description}, message="Comment saved successfully")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_comment(request, id):
    return save_comment_response(request, id)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):
    qs = Notification.objects.filter(user=request.user).order_by("-created_at")[:50]
    return api_response(data=NotificationSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    notification = get_object_or_404(Notification, id=id, user=request.user)
    notification.is_read = True
    notification.save(update_fields=["is_read"])
    return api_response(message="Notification marked read")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def complaint_analytics(request):
    qs = scoped_complaints(request.user).distinct()
    monthly = qs.annotate(month=TruncMonth("created_at")).values("month").annotate(count=Count("id")).order_by("month")
    return api_response(data={
        "total": qs.count(),
        "status_data": [{"label": x["status"], "value": x["count"]} for x in qs.values("status").annotate(count=Count("id"))],
        "category_data": [{"label": x["category"], "value": x["count"]} for x in qs.values("category").annotate(count=Count("id"))],
        "priority_data": [{"label": x["priority"], "value": x["count"]} for x in qs.values("priority").annotate(count=Count("id"))],
        "department_data": [{"label": x["department__name"] or "Unassigned", "value": x["count"]} for x in qs.values("department__name").annotate(count=Count("id"))],
        "monthly_data": [{"month": x["month"].strftime("%b") if x["month"] else "", "value": x["count"]} for x in monthly],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsHOD])
def hod_admin_review(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint):
        return api_response(success=False, message="Not allowed", status_code=403)
    action = request.data.get("action", "").lower()
    if action == "reject":
        old = complaint.status
        complaint.status = "Rejected"
        complaint.save(update_fields=["status", "updated_at"])
        create_activity(complaint, "Complaint rejected", request.user, old, complaint.status)
        notify(complaint.user, complaint, f"Complaint #{complaint.id} was rejected.")
    elif action == "accept":
        create_activity(complaint, "Complaint accepted for assignment", request.user)
    else:
        return api_response(success=False, message="Invalid action", status_code=400)
    return api_response(data={"status": complaint.status}, message=f"Complaint {action}ed successfully")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHOD])
def get_pending_complaints(request):
    qs = scoped_complaints(request.user).filter(status="Submitted")
    return api_response(data=serialize_complaints(request, apply_filters(qs, request)))


def apply_filters(qs, request):
    for key in ["category", "priority", "status"]:
        value = request.query_params.get(key)
        if value and value != "All":
            qs = qs.filter(**{key: normalize_status(value)})
    date = request.query_params.get("date")
    if date:
        qs = qs.filter(created_at__date=date)
    search = request.query_params.get("search")
    if search:
        qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)
    return qs


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHOD])
def hod_stats(request):
    qs = scoped_complaints(request.user).distinct()
    return api_response(data={
        "pending": qs.filter(status="Submitted").count(),
        "assigned": qs.filter(status="In Progress").count(),
        "rejected": qs.filter(status="Rejected").count(),
        "overdue": qs.filter(escalated=True).count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHOD])
def hod_trend_analytics(request):
    return trend_data(request)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHOD])
def hod_category_analytics(request):
    qs = scoped_complaints(request.user).distinct()
    return api_response(data=[{"category": x["category"], "count": x["count"]} for x in qs.values("category").annotate(count=Count("id"))])


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def get_ready_for_assignment_complaints(request):
    qs = scoped_complaints(request.user).filter(status="Submitted")
    return api_response(data=serialize_complaints(request, apply_filters(qs, request)))


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def admin_assign_teacher(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint) and not is_supervisor(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)

    assignee_id = request.data.get("assignee_id") or request.data.get("teacher_id")
    teacher_name = request.data.get("teacher_name")
    teacher_qs = User.objects.filter(groups__name="Faculty Member").distinct()
    if complaint.department_id and not is_supervisor(request.user):
        teacher_qs = teacher_qs.filter(department=complaint.department)
    teacher = teacher_qs.filter(id=assignee_id).first() if assignee_id else teacher_qs.filter(username__iexact=teacher_name).first()
    if not teacher:
        return api_response(success=False, message="Select a valid registered faculty member.", status_code=400)

    old_assignee = complaint.assigned_teacher.username if complaint.assigned_teacher else "Unassigned"
    complaint.assigned_teacher = teacher
    complaint.assigned_by = request.user
    complaint.status = "In Progress"
    if request.data.get("deadline"):
        complaint.deadline = request.data.get("deadline")
    complaint.save()

    action = "Complaint reassigned" if old_assignee != "Unassigned" else "Complaint assigned"
    create_activity(complaint, f"{action} to {teacher.username}", request.user, old_assignee, teacher.username)
    notify(teacher, complaint, f"Complaint #{complaint.id} assigned to you.")
    notify(complaint.user, complaint, f"Complaint #{complaint.id} assigned to {teacher.username}.")
    return api_response(data={"status": complaint.status, "assigned_to": teacher.username}, message="Faculty member assigned successfully")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def update_complaint_priority(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint) and not is_supervisor(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
    priority = request.data.get("priority")
    if priority not in dict(Complaint.PRIORITY_CHOICES):
        return api_response(success=False, message="Valid priority is required", status_code=400)
    old = complaint.priority
    complaint.priority = priority
    complaint.severity = priority
    complaint.save(update_fields=["priority", "severity", "updated_at"])
    create_activity(complaint, "Priority updated", request.user, old, priority)
    notify(complaint.user, complaint, f"Complaint #{complaint.id} priority changed to {priority}.")
    return api_response(data={"priority": priority, "severity": priority})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def set_deadline(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint) and not is_supervisor(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
    old = str(complaint.deadline or "")
    complaint.deadline = request.data.get("deadline")
    complaint.save(update_fields=["deadline", "updated_at"])
    create_activity(complaint, "Deadline updated", request.user, old, str(complaint.deadline or ""))
    return api_response(data={"deadline": complaint.deadline})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def escalate_complaint(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if not user_can_view(request.user, complaint) and not is_supervisor(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
    complaint.escalated = True
    complaint.save(update_fields=["escalated", "updated_at"])
    create_activity(complaint, "Complaint escalated", request.user)
    notify(complaint.user, complaint, f"Complaint #{complaint.id} was escalated.")
    notify_role("Supervisor", complaint, f"Complaint #{complaint.id} escalated.")
    return api_response(data={"escalated": True}, message="Complaint escalated")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_finalize(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if complaint.status != "Resolved":
        return api_response(success=False, message="Only resolved complaints can be closed", status_code=400)
    old = complaint.status
    complaint.status = "Closed"
    complaint.save(update_fields=["status", "updated_at"])
    create_activity(complaint, f"Complaint #{complaint.id} closed", request.user, old, complaint.status)
    notify(complaint.user, complaint, f"Complaint #{complaint.id} closed.")
    return api_response(data={"status": complaint.status}, message="Complaint closed successfully")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def get_solved_complaints(request):
    return api_response(data=serialize_complaints(request, scoped_complaints(request.user).filter(status__in=["Resolved", "Closed"])))


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def get_activity_feed(request):
    logs = ActivityLog.objects.select_related("complaint", "user")
    if not is_supervisor(request.user):
        logs = logs.filter(complaint__in=scoped_complaints(request.user).distinct())
    logs = logs.order_by("-created_at")[:50]
    data = [{
        "action": log.action,
        "complaint_title": log.complaint.title if log.complaint else None,
        "complaint_status": log.complaint.status if log.complaint else None,
        "department": log.complaint.department.name if log.complaint and log.complaint.department else "Unassigned",
        "user": log.user.username if log.user else "System",
        "time": log.created_at.strftime("%Y-%m-%d %H:%M"),
        "old_value": log.old_value,
        "new_value": log.new_value,
    } for log in logs]
    return api_response(data=data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_reject_solved(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if complaint.status not in ["Resolved", "Closed"]:
        return api_response(success=False, message="Only resolved or closed complaints can be returned", status_code=400)
    old = complaint.status
    complaint.status = "In Progress"
    complaint.save(update_fields=["status", "updated_at"])
    create_activity(complaint, f"Complaint #{complaint.id} returned to faculty", request.user, old, complaint.status)
    return api_response(data={"status": complaint.status}, message="Complaint sent back to faculty")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_trend_analytics(request):
    return trend_data(request)


def trend_data(request):
    today = timezone.now().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    qs = scoped_complaints(request.user).distinct()
    return api_response(data=[{
        "date": day.strftime("%a"),
        "total": qs.filter(created_at__date=day).count(),
        "solved": qs.filter(created_at__date=day, status__in=["Resolved", "Closed"]).count(),
        "pending": qs.filter(created_at__date=day, status="Submitted").count(),
        "accepted": qs.filter(created_at__date=day, status="In Progress").count(),
        "rejected": qs.filter(created_at__date=day, status="Rejected").count(),
    } for day in days])


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def teacher_performance_analytics(request):
    teachers = User.objects.filter(groups__name="Faculty Member").distinct()
    data = []
    for teacher in teachers:
        assigned = Complaint.objects.filter(assigned_teacher=teacher)
        resolved = assigned.filter(status__in=["Resolved", "Closed"]).count()
        total = assigned.count()
        data.append({
            "teacher": teacher.username,
            "assigned": total,
            "solved": resolved,
            "pending": assigned.exclude(status__in=["Resolved", "Closed"]).count(),
            "efficiency_percent": round((resolved / total * 100), 2) if total else 0,
        })
    return api_response(data=data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeacher])
def update_complaint_status(request, id):
    complaint = get_object_or_404(Complaint, id=id)
    if complaint.assigned_teacher != request.user:
        return api_response(success=False, message="Not assigned to you", status_code=403)
    new_status = normalize_status(request.data.get("status"))
    allowed = {"In Progress": ["Resolved"], "Resolved": [], "Submitted": ["In Progress"]}
    if new_status not in allowed.get(complaint.status, []):
        return api_response(success=False, message=f"Invalid transition from {complaint.status} to {new_status}", status_code=400)
    old = complaint.status
    complaint.status = new_status
    if new_status == "Resolved":
        complaint.resolved_at = timezone.now()
    complaint.save()
    create_activity(complaint, "Status updated", request.user, old, new_status)
    notify(complaint.user, complaint, f"Complaint #{complaint.id} status changed to {new_status}.")
    return api_response(data={"status": complaint.status}, message="Status updated successfully")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeacher])
def add_teacher_comment(request, id):
    return save_comment_response(request, id)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_teacher_complaints(request):
    return api_response(data=serialize_complaints(request, Complaint.objects.filter(assigned_teacher=request.user)))


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_workload_analytics(request):
    complaints = Complaint.objects.filter(assigned_teacher=request.user)
    active_complaints = complaints.exclude(status__in=["Resolved", "Closed"])
    overdue = active_complaints.filter(deadline__lt=timezone.now())
    pending_3_days = active_complaints.filter(created_at__gte=timezone.now() - timedelta(days=3))
    new_today = active_complaints.filter(created_at__date=timezone.now().date())
    return api_response(data={
        "overdue_count": overdue.count(),
        "pending_3_days_count": pending_3_days.count(),
        "new_today_count": new_today.count(),
        "overdue_list": ComplaintSerializer(overdue, many=True, context={"request": request}).data,
        "pending_list": ComplaintSerializer(pending_3_days, many=True, context={"request": request}).data,
        "new_today_list": ComplaintSerializer(new_today, many=True, context={"request": request}).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def get_teachers(request):
    qs = User.objects.filter(groups__name="Faculty Member").distinct()
    if not is_supervisor(request.user) and request.user.department_id:
        qs = qs.filter(department=request.user.department)
    return api_response(data=[{
        "id": u.id,
        "username": u.username,
        "name": u.username,
        "email": u.email,
        "department": u.department_id,
        "department_name": u.department.name if u.department else None,
        "faculty_designation": u.faculty_designation,
    } for u in qs])


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsSupervisor])
def delete_complaint(request, id):
    get_object_or_404(Complaint, id=id).delete()
    return api_response(message="Complaint deleted")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStudent])
def rate_complaint(request, pk):
    complaint = get_object_or_404(Complaint, id=pk, user=request.user)
    if complaint.status not in ["Resolved", "Closed"]:
        return api_response(success=False, message="Complaint not resolved yet", status_code=400)
    if complaint.rating is not None:
        return api_response(success=False, message="Complaint already rated", status_code=400)
    try:
        rating = int(request.data.get("rating"))
    except (TypeError, ValueError):
        return api_response(success=False, message="Rating must be a number from 1 to 5", status_code=400)
    if rating < 1 or rating > 5:
        return api_response(success=False, message="Rating must be between 1 and 5", status_code=400)
    complaint.rating = rating
    complaint.feedback = request.data.get("feedback", "")
    complaint.save(update_fields=["rating", "feedback", "updated_at"])
    create_activity(complaint, "Rating received", request.user)
    return api_response(data={"id": complaint.id, "rating": rating, "feedback": complaint.feedback, "rated": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def weekly_report(request):
    qs = scoped_complaints(request.user).filter(created_at__gte=timezone.now() - timedelta(days=7)).distinct()
    return api_response(data={
        "total_complaints": qs.count(),
        "solved": qs.filter(status__in=["Resolved", "Closed"]).count(),
        "pending": qs.filter(status="Submitted").count(),
        "in_progress": qs.filter(status="In Progress").count(),
        "average_rating": qs.aggregate(Avg("rating"))["rating__avg"],
        "category_stats": list(qs.values("category").annotate(count=Count("pk"))),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def weekly_report_pdf(request):
    data = weekly_report(request).data["data"]
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.setFont("Helvetica", 14)
    p.drawString(100, 800, "Weekly Complaint Report")
    p.setFont("Helvetica", 11)
    y = 760
    for label in ["total_complaints", "solved", "pending", "in_progress", "average_rating"]:
        p.drawString(100, y, f"{label.replace('_', ' ').title()}: {data.get(label) or 'N/A'}")
        y -= 20
    p.showPage()
    p.save()
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="Weekly_Report.pdf"'
    return response


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSupervisor])
def category_routes(request):
    if request.method == "GET":
        return api_response(data=CategoryRoutingSerializer(CategoryRouting.objects.all(), many=True).data)
    serializer = CategoryRoutingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return api_response(data=serializer.data, status_code=201)
    return api_response(success=False, data=serializer.errors, message="Invalid route", status_code=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def bot_submit_complaint(request):
    if request.headers.get("X-Bot-Key", "") != settings.BOT_API_KEY:
        return api_response(success=False, message="Unauthorized", status_code=401)
    username = request.data.get("username", "").strip()
    try:
        user = User.objects.get(username__iexact=username)
    except User.DoesNotExist:
        return api_response(success=False, message=f"User '{username}' not found", status_code=404)
    request.user = user
    return submit_complaint_ml(request)


@api_view(["GET"])
@permission_classes([AllowAny])
def bot_complaint_status(request):
    if request.headers.get("X-Bot-Key", "") != settings.BOT_API_KEY:
        return api_response(success=False, message="Unauthorized", status_code=401)
    username = request.query_params.get("username", "").strip()
    complaint_id = request.query_params.get("id", "").strip()
    user = get_object_or_404(User, username__iexact=username)
    complaints = Complaint.objects.filter(user=user).order_by("-created_at")
    if complaint_id:
        complaints = complaints.filter(id=complaint_id)
    data = [{
        "id": c.id,
        "title": c.title,
        "status": c.status,
        "category": c.category,
        "priority": c.priority,
        "assigned_to": c.assigned_teacher.username if c.assigned_teacher else "Not assigned yet",
        "created_at": c.created_at.strftime("%d %b %Y"),
    } for c in complaints[:5]]
    return api_response(data=data, message="Complaints fetched")




# DSA VIEWS — paste these into your views.py
# ─────────────────────────────────────────────────────────────
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dsa_stats(request):
    """Stats for DSA dashboard — only DSA role can access."""
    if not is_dsa(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
 
    qs = scoped_complaints(request.user).distinct()
 
    return api_response(data={
        "needsAssignment": qs.filter(status="Submitted").count(),
        "inProgress":      qs.filter(status="In Progress").count(),
        "resolvedForReview": qs.filter(status="Resolved").count(),
        "overdue":         qs.filter(escalated=True).count(),
    })
 
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dsa_pending_complaints(request):
    """Pending (Submitted) complaints scoped to DSA's department."""
    if not is_dsa(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
 
    qs = scoped_complaints(request.user).filter(status="Submitted")
    return api_response(data=serialize_complaints(request, apply_filters(qs, request)))
 
 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def dsa_review_complaint(request, id):
    """DSA accepts or rejects a complaint (same logic as HOD review)."""
    if not is_dsa(request.user):
        return api_response(success=False, message="Not allowed", status_code=403)
 
    complaint = get_object_or_404(Complaint, id=id)
 
    if not user_can_view(request.user, complaint):
        return api_response(success=False, message="Not allowed", status_code=403)
 
    action = request.data.get("action", "").lower()
 
    if action == "reject":
        old = complaint.status
        complaint.status = "Rejected"
        complaint.save(update_fields=["status", "updated_at"])
        create_activity(complaint, "Complaint rejected by DSA", request.user, old, complaint.status)
        notify(complaint.user, complaint, f"Complaint #{complaint.id} was rejected.")
        return api_response(data={"status": complaint.status}, message="Complaint rejected successfully")
 
    elif action == "accept":
        create_activity(complaint, "Complaint accepted by DSA for assignment", request.user)
        return api_response(data={"status": complaint.status}, message="Complaint accepted successfully")
 
    return api_response(success=False, message="Invalid action. Use 'accept' or 'reject'.", status_code=400)