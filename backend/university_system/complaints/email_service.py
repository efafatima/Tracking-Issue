from django.core.mail import send_mail
from django.conf import settings
import threading


def _send(subject, message, recipient_email, background=True):
    """Send email — background thread for views, synchronous for management commands."""
    if not getattr(settings, "EMAIL_NOTIFICATIONS_ENABLED", False):
        return
    if not recipient_email:
        return

    def _task():
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=_wrap_html(subject, message),
                fail_silently=False,
            )
        except Exception as e:
            print(f"[Email Error] {e}")

    if background:
        threading.Thread(target=_task, daemon=True).start()
    else:
        _task()


def _wrap_html(subject, text_body):
    """Simple HTML wrapper for plain-text email content."""
    lines = "".join(f"<p style='margin:6px 0;color:#374151;font-size:14px;'>{line}</p>" for line in text_body.splitlines() if line.strip())
    return f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#f8faff;padding:32px 24px;border-radius:16px;">
      <div style="background:linear-gradient(90deg,#5b9af5,#3d72e0);padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h2 style="color:white;margin:0;font-size:18px;">BZU Complaint System</h2>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Bahauddin Zakariya University</p>
      </div>
      <h3 style="color:#0f172a;font-size:16px;margin:0 0 16px;">{subject}</h3>
      {lines}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        This is an automated message from BZU Complaint System. Please do not reply.
      </p>
    </div>
    """


# ── Email triggers ─────────────────────────────────────────────────

def notify_complaint_submitted(complaint):
    """Student → complaint submit karne ke baad confirmation."""
    if not complaint.user or not complaint.user.email:
        return
    _send(
        subject=f"[BZU] Complaint Submitted — {complaint.title}",
        message=(
            f"Dear {complaint.user.username},\n\n"
            f"Your complaint has been submitted successfully.\n\n"
            f"Title: {complaint.title}\n"
            f"Category: {complaint.category}\n"
            f"Severity: {complaint.severity}\n"
            f"Status: Pending\n\n"
            f"We will review your complaint shortly and keep you informed at every step.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=complaint.user.email,
    )


def notify_hod_new_complaint(complaint, hod_email):
    """HOD → naya complaint aaya, review karo."""
    if not hod_email:
        return
    _send(
        subject=f"[BZU] New Complaint Pending Review — {complaint.title}",
        message=(
            f"Dear HOD,\n\n"
            f"A new complaint requires your review.\n\n"
            f"Title: {complaint.title}\n"
            f"Category: {complaint.category}\n"
            f"Severity: {complaint.severity}\n"
            f"Submitted by: {'Anonymous' if complaint.is_anonymous else (complaint.user.username if complaint.user else 'Unknown')}\n\n"
            f"Please log in to the BZU Complaint System to review and take action.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=hod_email,
    )


def notify_complaint_accepted(complaint):
    """Student → HOD ne accept kar liya."""
    if not complaint.user or not complaint.user.email:
        return
    _send(
        subject=f"[BZU] Complaint Accepted — {complaint.title}",
        message=(
            f"Dear {complaint.user.username},\n\n"
            f"Good news! Your complaint has been reviewed and accepted by the HOD.\n\n"
            f"Title: {complaint.title}\n"
            f"Status: Ready for Assignment\n\n"
            f"It will now be assigned to a relevant teacher for resolution.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=complaint.user.email,
    )


def notify_complaint_rejected(complaint):
    """Student → HOD ne reject kar diya."""
    if not complaint.user or not complaint.user.email:
        return
    _send(
        subject=f"[BZU] Complaint Rejected — {complaint.title}",
        message=(
            f"Dear {complaint.user.username},\n\n"
            f"We regret to inform you that your complaint has been reviewed and rejected by the HOD.\n\n"
            f"Title: {complaint.title}\n"
            f"Status: Rejected\n\n"
            f"If you believe this is incorrect, please resubmit with more details.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=complaint.user.email,
    )


def notify_teacher_assigned(complaint, teacher):
    """Teacher → tumhein complaint assign ki gayi hai."""
    if not teacher or not teacher.email:
        return
    _send(
        subject=f"[BZU] New Complaint Assigned to You — {complaint.title}",
        message=(
            f"Dear {teacher.username},\n\n"
            f"A new complaint has been assigned to you for resolution.\n\n"
            f"Title: {complaint.title}\n"
            f"Category: {complaint.category}\n"
            f"Severity: {complaint.severity}\n"
            f"Description: {complaint.description[:200]}{'...' if len(complaint.description) > 200 else ''}\n\n"
            f"Please log in to the BZU Complaint System and update the status.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=teacher.email,
    )


def notify_student_assignment(complaint):
    """Student → complaint assign ho gayi, in progress."""
    if not complaint.user or not complaint.user.email:
        return
    teacher_name = complaint.assigned_teacher.username if complaint.assigned_teacher else "a teacher"
    _send(
        subject=f"[BZU] Complaint In Progress — {complaint.title}",
        message=(
            f"Dear {complaint.user.username},\n\n"
            f"Your complaint has been assigned to {teacher_name} and is now being worked on.\n\n"
            f"Title: {complaint.title}\n"
            f"Status: In Progress\n\n"
            f"You will be notified once it is resolved.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=complaint.user.email,
    )


def notify_complaint_solved(complaint):
    """Student → complaint solve ho gayi, rate karo."""
    if not complaint.user or not complaint.user.email:
        return
    _send(
        subject=f"[BZU] Complaint Resolved — {complaint.title}",
        message=(
            f"Dear {complaint.user.username},\n\n"
            f"Great news! Your complaint has been resolved.\n\n"
            f"Title: {complaint.title}\n"
            f"Status: Solved\n"
            + (f"Teacher's Comment: {complaint.teacher_comments}\n" if complaint.teacher_comments else "")
            + f"\nPlease log in to rate the resolution and provide your feedback.\n"
            f"Your feedback helps us improve our services.\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=complaint.user.email,
    )


def notify_escalation(complaint, hod_email):
    """HOD → complaint 3 din se zyada unresolved hai."""
    if not hod_email:
        return
    days = max((complaint.updated_at - complaint.created_at).days, 3)
    teacher_name = complaint.assigned_teacher.username if complaint.assigned_teacher else "Unassigned"
    _send(
        subject=f"[BZU] ESCALATION — Complaint Unresolved ({days}+ days): {complaint.title}",
        message=(
            f"Dear HOD,\n\n"
            f"The following complaint has not been resolved in {days}+ days and requires immediate attention.\n\n"
            f"Title: {complaint.title}\n"
            f"Category: {complaint.category}\n"
            f"Severity: {complaint.severity}\n"
            f"Status: {complaint.status}\n"
            f"Assigned To: {teacher_name}\n"
            f"Submitted: {complaint.created_at.strftime('%d %b %Y')}\n\n"
            f"Please log in to the BZU Complaint System and take action immediately.\n\n"
            f"Regards,\nBZU Auto-Escalation System"
        ),
        recipient_email=hod_email,
        background=False,
    )


def notify_rating_received(complaint, admin_email):
    """Admin → student ne rating di."""
    if not admin_email:
        return
    _send(
        subject=f"[BZU] Complaint Rated — {complaint.title}",
        message=(
            f"Dear Admin,\n\n"
            f"A student has rated a resolved complaint.\n\n"
            f"Title: {complaint.title}\n"
            f"Rating: {'⭐' * (complaint.rating or 0)} ({complaint.rating}/5)\n"
            f"Feedback: {complaint.feedback or 'No feedback provided'}\n\n"
            f"Regards,\nBZU Complaint System"
        ),
        recipient_email=admin_email,
    )
