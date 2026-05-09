from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Student").exists()


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Faculty Member").exists()


class IsHOD(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="HOD").exists()


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.groups.filter(name__in=["DSA", "Supervisor"]).exists()
        )


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.groups.filter(name="Supervisor").exists()


class IsPrivilegedStaff(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["HOD", "DSA", "Supervisor"]
            ).exists()
        )

