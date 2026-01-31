"""
Authentication views.

Provides REST endpoints for login, logout, registration,
and session management.
"""

import logging

from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import LoginSerializer, UserSerializer, RegisterSerializer

logger = logging.getLogger(__name__)


class LoginView(APIView):
    """
    User login endpoint.
    
    POST /api/auth/login/
    
    Authenticates user credentials and creates a session.
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Authenticate user and create session.
        
        Request Body:
            - username: string
            - password: string
        
        Response:
            - 200: Login successful with user data
            - 400: Invalid credentials
        """
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Login failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.validated_data['user']
        login(request, user)
        
        logger.info(f"User logged in: {user.username}")
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'csrfToken': get_token(request),
        })


class LogoutView(APIView):
    """
    User logout endpoint.
    
    POST /api/auth/logout/
    
    Terminates the current session.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Log out the current user.
        
        Response:
            - 200: Logout successful
        """
        username = request.user.username
        logout(request)
        
        logger.info(f"User logged out: {username}")
        
        return Response({'message': 'Logout successful'})


class RegisterView(APIView):
    """
    User registration endpoint.
    
    POST /api/auth/register/
    
    Creates a new user account.
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Register a new user.
        
        Request Body:
            - username: string
            - email: string
            - password: string
            - password_confirm: string
            - first_name: string (optional)
            - last_name: string (optional)
        
        Response:
            - 201: Registration successful
            - 400: Validation error
        """
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Registration failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        
        # Auto-login after registration
        login(request, user)
        
        logger.info(f"New user registered: {user.username}")
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    """
    Get current authenticated user.
    
    GET /api/auth/me/
    
    Returns the currently logged-in user's profile.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get current user profile.
        
        Response:
            - 200: User profile data
            - 401: Not authenticated
        """
        return Response({
            'user': UserSerializer(request.user).data,
            'isAuthenticated': True,
        })


class CSRFTokenView(APIView):
    """
    Get CSRF token for form submissions.
    
    GET /api/auth/csrf/
    
    Returns a CSRF token for use in subsequent requests.
    No authentication required.
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get CSRF token."""
        return Response({
            'csrfToken': get_token(request)
        })
