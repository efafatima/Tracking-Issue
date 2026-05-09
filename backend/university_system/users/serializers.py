from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from .models import Department

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'department']

    def create(self, validated_data):
        validated_data.pop("role", None)
        username = validated_data["username"].strip()
        email = validated_data["email"].strip()
        password = validated_data["password"]

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "Username already taken"})
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email already registered"})
        validate_password(password)

        user = User.objects.create_user(username=username, email=email, password=password, department=validated_data.get("department"))
        group, _ = Group.objects.get_or_create(name="Student")
        user.groups.add(group)
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    hod_name = serializers.CharField(source="hod.username", read_only=True)
    dsa_name = serializers.CharField(source="dsa.username", read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "hod", "hod_name", "dsa", "dsa_name", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "department", "department_name", "faculty_designation", "is_active"]

    def get_role(self, obj):
        return obj.role
