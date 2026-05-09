# complaints/utils.py
from django.contrib.auth.models import Group

def get_user_group(user):
    if user.is_authenticated:
        groups = user.groups.all()
        return groups[0].name if groups else None
    return None
