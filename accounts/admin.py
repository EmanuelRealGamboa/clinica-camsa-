from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, Role, UserRole


class UserRoleInline(admin.TabularInline):
    """
    Inline admin for UserRole in User admin
    """
    model = UserRole
    extra = 1
    fk_name = 'user'
    readonly_fields = ('assigned_at',)
    autocomplete_fields = ['role', 'assigned_by']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin with email as the primary identifier
    """
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('full_name', 'username')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'is_staff', 'is_superuser'),
        }),
    )
    list_display = ('email', 'full_name', 'get_user_roles', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'full_name', 'username')
    ordering = ('-date_joined',)
    filter_horizontal = ('groups', 'user_permissions',)
    inlines = [UserRoleInline]

    def get_user_roles(self, obj):
        """Display user roles in list view"""
        roles = obj.get_roles()
        return ', '.join(roles) if roles else '-'
    get_user_roles.short_description = 'Roles'


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Admin interface for Role model
    """
    list_display = ('name', 'description', 'get_user_count', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)

    def get_user_count(self, obj):
        """Display count of users with this role"""
        return obj.role_users.count()
    get_user_count.short_description = 'Users'


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """
    Admin interface for UserRole model
    """
    list_display = ('user', 'role', 'assigned_at', 'assigned_by')
    list_filter = ('role', 'assigned_at')
    search_fields = ('user__email', 'role__name')
    readonly_fields = ('assigned_at',)
    autocomplete_fields = ['user', 'assigned_by']
    date_hierarchy = 'assigned_at'
    ordering = ('-assigned_at',)
