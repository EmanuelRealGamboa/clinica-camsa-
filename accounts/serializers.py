from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with roles
    """
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'roles', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_roles(self, obj):
        """
        Get user roles from UserRole model
        """
        # Get custom roles from UserRole
        custom_roles = obj.get_roles()

        # Fallback to Django permissions if no custom roles
        if not custom_roles:
            if obj.is_superuser:
                return ['ADMIN']
            if obj.is_staff:
                return ['STAFF']
            return ['USER']

        return custom_roles


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login with email and password
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Authenticate user
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )

            if not user:
                raise serializers.ValidationError(
                    'Invalid credentials. Please check your email and password.',
                    code='authorization'
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.',
                    code='authorization'
                )

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".',
                code='authorization'
            )


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for authenticated user
    """
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'username',
            'roles',
            'permissions',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def get_roles(self, obj):
        """
        Get user roles from UserRole model
        """
        # Get custom roles from UserRole
        custom_roles = obj.get_roles()

        # Fallback to Django permissions if no custom roles
        if not custom_roles:
            if obj.is_superuser:
                return ['ADMIN']
            if obj.is_staff:
                return ['STAFF']
            return ['USER']

        return custom_roles

    def get_permissions(self, obj):
        """
        Get user permissions
        """
        if obj.is_superuser:
            return ['all']

        return list(obj.get_all_permissions())
