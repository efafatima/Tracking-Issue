from django.test import TestCase

# Create your tests here.

from django.test import TestCase
from .models import User

class UserTests(TestCase):
    def test_student_registration(self):
        user = User.objects.create_user(username="teststudent", password="test123", role="Student")
        self.assertEqual(user.role, "Student")
