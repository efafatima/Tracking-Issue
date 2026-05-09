from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from complaints.models import ActivityLog, Complaint, Notification
from users.models import User
from complaints.email_service import notify_escalation


class Command(BaseCommand):
    help = "Check for unresolved complaints older than 3 days and escalate to HOD"

    def handle(self, *args, **kwargs):
        threshold = timezone.now()

        # Complaints that are unresolved, older than 3 days, not yet escalated
        overdue = Complaint.objects.filter(
            deadline__lte=threshold,
            escalated=False,
        ).exclude(status__in=["Resolved", "Closed", "Rejected"])

        if not overdue.exists():
            self.stdout.write("No overdue complaints found.")
            return

        hod_users = User.objects.filter(groups__name="HOD")
        hod_emails = [h.email for h in hod_users if h.email]

        count = 0
        for complaint in overdue:
            for email in hod_emails:
                notify_escalation(complaint, email)
            complaint.escalated = True
            complaint.save(update_fields=["escalated"])
            ActivityLog.objects.create(complaint=complaint, action="Complaint escalated by overdue deadline")
            if complaint.user:
                Notification.objects.create(
                    user=complaint.user,
                    complaint=complaint,
                    message=f"Complaint #{complaint.id} is overdue and was escalated.",
                )
            count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Escalated {count} complaint(s) to {len(hod_emails)} HOD(s).")
        )
