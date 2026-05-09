from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Count
from .serializers import RegisterSerializer
from .serializers import DepartmentSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from users.permissions import IsAdmin, IsSupervisor, IsPrivilegedStaff
from users.models import User, Department


DEPARTMENT_LEAD_ROLES = {
    "hod": "HOD",
    "dsa": "DSA",
}


def set_department_lead(department, field_name, new_user, previous_user=None):
    role_name = DEPARTMENT_LEAD_ROLES[field_name]
    group, _ = Group.objects.get_or_create(name=role_name)
    previous_user = previous_user if previous_user is not None else getattr(department, field_name)

    if previous_user and previous_user != new_user:
        previous_user.is_active = False
        previous_user.save(update_fields=["is_active"])

    if new_user:
        same_role_users = User.objects.filter(
            department=department,
            groups=group,
            is_active=True,
        ).exclude(id=new_user.id)
        for user in same_role_users:
            user.is_active = False
            user.save(update_fields=["is_active"])

        new_user.groups.add(group)
        new_user.department = department
        new_user.is_active = True
        new_user.save(update_fields=["department", "is_active"])


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            # email se bhi try karo
            try:
                u = User.objects.get(email=username)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        group = user.groups.first()
        role = "supervisor" if user.is_superuser else (group.name.lower() if group else None)

        full_name = f"{user.first_name} {user.last_name}".strip()
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "full_name": full_name or user.username,
            "email": user.email,
            "role": role,
            "department": user.department_id,
            "department_name": user.department.name if user.department else None,
            "faculty_designation": user.faculty_designation,
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(["GET"])
@permission_classes([AllowAny])
def department_choices(request):
    data = [{"id": dept.id, "name": dept.name} for dept in Department.objects.all().order_by("name")]
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def get_users(request):
    role = request.query_params.get("role")
    department = request.query_params.get("department")
    include_inactive = request.query_params.get("include_inactive") in ["1", "true", "True", "yes"]

    if include_inactive and (request.user.is_superuser or request.user.groups.filter(name="Supervisor").exists()):
        users = User.objects.all()
    else:
        users = User.objects.filter(is_active=True)

    if role:
        if role.lower() in ["teacher", "faculty", "faculty member"]:
            users = users.filter(groups__name="Faculty Member")
        elif role.lower() in ["admin", "dsa"]:
            users = users.filter(groups__name="DSA")
        else:
            users = users.filter(groups__name__iexact=role)
    if department:
        users = users.filter(department_id=department)
    if not (request.user.is_superuser or request.user.groups.filter(name__in=["Supervisor", "DSA"]).exists()):
        users = users.filter(department=request.user.department)

    data = [
        {
            "id": u.id,
            "name": u.username,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "department": u.department_id,
            "department_name": u.department.name if u.department else None,
            "faculty_designation": u.faculty_designation,
            "is_active": u.is_active,
        }
        for u in users
    ]

    return Response(data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSupervisor])
def departments(request):
    if request.method == "GET":
        from complaints.models import Complaint

        departments_qs = Department.objects.all().order_by("name")
        serialized = DepartmentSerializer(departments_qs, many=True).data
        status_names = ["Submitted", "In Progress", "Resolved", "Closed", "Rejected", "Escalated"]

        for item in serialized:
            dept_id = item["id"]
            complaints = Complaint.objects.filter(department_id=dept_id)
            status_counts = {
                row["status"]: row["count"]
                for row in complaints.values("status").annotate(count=Count("id"))
            }
            item["complaint_stats"] = {
                "total": complaints.count(),
                **{status.lower().replace(" ", "_"): status_counts.get(status, 0) for status in status_names},
            }
            item["staff_status"] = [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "faculty_designation": user.faculty_designation,
                    "is_active": user.is_active,
                }
                for user in User.objects.filter(
                    department_id=dept_id,
                    groups__name__in=["HOD", "DSA"],
                ).distinct().order_by("-is_active", "username")
            ]
        return Response(serialized)
    serializer = DepartmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsSupervisor])
def department_detail(request, pk):
    department = Department.objects.get(pk=pk)
    old_hod = department.hod
    old_dsa = department.dsa
    old_hod_id = old_hod.id if old_hod else None
    old_dsa_id = old_dsa.id if old_dsa else None
    serializer = DepartmentSerializer(department, data=request.data, partial=True)
    if serializer.is_valid():
        with transaction.atomic():
            department = serializer.save()
            if "hod" in request.data and department.hod_id != old_hod_id:
                set_department_lead(department, "hod", department.hod, old_hod)
            elif department.hod:
                set_department_lead(department, "hod", department.hod)

            if "dsa" in request.data and department.dsa_id != old_dsa_id:
                set_department_lead(department, "dsa", department.dsa, old_dsa)
            elif department.dsa:
                set_department_lead(department, "dsa", department.dsa)
        return Response(DepartmentSerializer(department).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPrivilegedStaff])
def create_staff_user(request):
    role = request.data.get("role", "Faculty Member")
    allowed_roles = ["Faculty Member"]
    if request.user.is_superuser or request.user.groups.filter(name="Supervisor").exists():
        allowed_roles += ["HOD", "DSA", "Supervisor"]
    if role not in allowed_roles:
        return Response({"role": "You cannot create this role."}, status=status.HTTP_403_FORBIDDEN)

    username = "_".join(request.data.get("username", "").strip().split())
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    faculty_designation = request.data.get("faculty_designation", "").strip()
    department_id = request.data.get("department") or request.user.department_id
    if not (request.user.is_superuser or request.user.groups.filter(name="Supervisor").exists()):
        department_id = request.user.department_id
    if not username or not email or not password:
        return Response({"message": "username, email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    if role in ["HOD", "DSA"] and not department_id:
        return Response({"message": "Department is required for HOD and DSA users."}, status=status.HTTP_400_BAD_REQUEST)
    if role == "Faculty Member" and not department_id:
        return Response({"message": "Department is required for faculty members."}, status=status.HTTP_400_BAD_REQUEST)
    if role == "Faculty Member" and not faculty_designation:
        return Response({"message": "Please select the faculty member role/designation."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username__iexact=username).exists() or User.objects.filter(email__iexact=email).exists():
        return Response({"message": "Username or email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(password)
    except DjangoValidationError as exc:
        return Response({"message": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            department_id=department_id,
            faculty_designation=faculty_designation if role == "Faculty Member" else "",
        )
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)
        if role in ["HOD", "DSA"] and department_id:
            department = Department.objects.get(id=department_id)
            field_name = "hod" if role == "HOD" else "dsa"
            setattr(department, field_name, user)
            department.save(update_fields=[field_name, "updated_at"])
            set_department_lead(department, field_name, user)
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
