from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of username.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model where email is the unique identifier
    and username is optional.
    """
    username = models.CharField(
        _('username'),
        max_length=150,
        blank=True,
        null=True,
        help_text=_('Optional. 150 characters or fewer.'),
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )
    full_name = models.CharField(
        _('full name'),
        max_length=255,
        blank=True,
        help_text=_('Optional full name of the user.')
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Email is already required by USERNAME_FIELD

    objects = CustomUserManager()

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def get_full_name(self):
        """
        Return the full_name if set, otherwise return email.
        """
        return self.full_name if self.full_name else self.email

    def get_short_name(self):
        """
        Return the short name for the user (first part of email).
        """
        return self.email.split('@')[0] if self.email else ''

    def has_role(self, role_name):
        """
        Check if user has a specific role
        """
        return self.user_roles.filter(role__name=role_name).exists()

    def get_roles(self):
        """
        Get list of role names for this user
        """
        return list(self.user_roles.values_list('role__name', flat=True))


class Role(models.Model):
    """
    Role model for user roles (ADMIN, STAFF)
    """
    ADMIN = 'ADMIN'
    STAFF = 'STAFF'

    ROLE_CHOICES = [
        (ADMIN, _('Administrator')),
        (STAFF, _('Staff')),
    ]

    name = models.CharField(
        _('role name'),
        max_length=50,
        unique=True,
        choices=ROLE_CHOICES,
        help_text=_('Unique role name')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Optional description of the role')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('role')
        verbose_name_plural = _('roles')
        ordering = ['name']

    def __str__(self):
        return self.name


class UserRole(models.Model):
    """
    User-Role relationship (many-to-many)
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles',
        verbose_name=_('user')
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_users',
        verbose_name=_('role')
    )
    assigned_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('assigned at')
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='roles_assigned',
        verbose_name=_('assigned by')
    )

    class Meta:
        verbose_name = _('user role')
        verbose_name_plural = _('user roles')
        unique_together = ('user', 'role')
        ordering = ['user', 'role']

    def __str__(self):
        return f'{self.user.email} - {self.role.name}'
