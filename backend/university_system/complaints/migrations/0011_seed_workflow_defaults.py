from django.db import migrations


def seed_defaults(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Complaint = apps.get_model("complaints", "Complaint")
    CategoryRouting = apps.get_model("complaints", "CategoryRouting")

    for name in ["Supervisor", "HOD", "DSA", "Faculty Member", "Student"]:
        Group.objects.get_or_create(name=name)

    status_map = {
        "Pending": "Submitted",
        "Ready for Assignment": "Submitted",
        "Assigned": "In Progress",
        "Solved": "Resolved",
        "Fulfilled": "Closed",
    }
    for old, new in status_map.items():
        Complaint.objects.filter(status=old).update(status=new)

    for complaint in Complaint.objects.filter(priority__isnull=True):
        complaint.priority = complaint.severity or "Medium"
        complaint.save(update_fields=["priority"])

    for category, role in {
        "Academic": "HOD",
        "Behavior-related": "HOD",
        "Administrative": "DSA",
        "Facilities": "HOD",
        "Other": "HOD",
    }.items():
        CategoryRouting.objects.get_or_create(
            category=category,
            department=None,
            defaults={"default_role": role},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("complaints", "0010_activitylog_new_value_activitylog_old_value_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_defaults, migrations.RunPython.noop),
    ]
