"""
URL routing for authentication endpoints.

All endpoints are prefixed with /api/auth/ from the main URL configuration.
"""

from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    CurrentUserView,
    CSRFTokenView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf-token'),
]
