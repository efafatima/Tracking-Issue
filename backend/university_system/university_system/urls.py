"""
URL configuration for university_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


# university_system/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.contrib.auth.views import LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static



# Simple home view
def home(request):
    return HttpResponse("Welcome to University Complaint System API")

urlpatterns = [   
    path("admin/", admin.site.urls),
    path("", home, name="home"),

    # users
      path('api/users/', include('users.urls')),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Complaints app
    path("complaints/", include("complaints.urls")),
    path("api/complaints/", include("complaints.urls")),

    # DRF browsable API login
    path("api-auth/", include("rest_framework.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
