"""
Authentication serializers.

Handles validation for login, logout, and user data.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Serializer for user login credentials."""
    
    username = serializers.CharField(
        max_length=150,
        help_text='Username for authentication'
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='User password'
    )
    
    def validate(self, data):
        """Validate credentials and authenticate user."""
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError(
                'Both username and password are required.'
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError(
                'Invalid credentials. Please check your username and password.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'This account has been deactivated.'
            )
        
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='Password (minimum 8 characters)'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='Confirm password'
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate_username(self, value):
        """Ensure username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value
    
    def validate_email(self, value):
        """Ensure email is unique."""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate(self, data):
        """Validate password confirmation matches."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
