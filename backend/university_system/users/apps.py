from django.apps import AppConfig
from django.db.models.signals import post_migrate

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        
         

        # Create groups after migrations
        from django.contrib.auth.models import Group, Permission
        from django.contrib.contenttypes.models import ContentType
        from complaints.models import Complaint

        def create_groups(sender, **kwargs):
            groups = ['Supervisor', 'HOD', 'DSA', 'Faculty Member', 'Student']
            for g in groups:
                Group.objects.get_or_create(name=g)

            ct = ContentType.objects.get_for_model(Complaint)
            perms = Permission.objects.filter(content_type=ct)
            supervisor_group = Group.objects.get(name='Supervisor')
            supervisor_group.permissions.set(perms)

        post_migrate.connect(create_groups, sender=self)
