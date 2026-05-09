from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0005_department_user_department"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="faculty_designation",
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
