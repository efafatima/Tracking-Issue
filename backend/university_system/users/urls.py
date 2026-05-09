from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    get_users,
    departments,
    department_choices,
    department_detail,
    create_staff_user,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path("departments/public/", department_choices),
    path("departments/", departments),
    path("departments/<int:pk>/", department_detail),
    path("staff/", create_staff_user),
    path("", get_users)
]
