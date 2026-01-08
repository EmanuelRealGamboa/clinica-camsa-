from rest_framework import permissions


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users with STAFF or ADMIN role.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers always have permission
        if request.user.is_superuser:
            return True

        # Check if user has STAFF or ADMIN role
        user_roles = request.user.get_roles()

        return 'ADMIN' in user_roles or 'STAFF' in user_roles


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users with ADMIN role.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers always have permission
        if request.user.is_superuser:
            return True

        # Check if user has ADMIN role
        user_roles = request.user.get_roles()

        return 'ADMIN' in user_roles


class IsStaff(permissions.BasePermission):
    """
    Custom permission to only allow users with STAFF role.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if user has STAFF role
        user_roles = request.user.get_roles()

        return 'STAFF' in user_roles or 'ADMIN' in user_roles


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow superusers.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Only superusers have permission
        return request.user.is_superuser
