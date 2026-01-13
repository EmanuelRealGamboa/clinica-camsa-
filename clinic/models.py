from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _


def get_default_order_limits():
    """Return default order limits: 1 DRINK and 1 SNACK"""
    return {'DRINK': 1, 'SNACK': 1}


class Room(models.Model):
    """
    Hospital room model
    """
    code = models.CharField(
        _('room code'),
        max_length=50,
        unique=True,
        help_text=_('Unique room code (e.g., 101, A-205)')
    )
    floor = models.CharField(
        _('floor'),
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Floor number or name')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this room is currently available')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('room')
        verbose_name_plural = _('rooms')
        ordering = ['code']

    def __str__(self):
        return self.code


class Patient(models.Model):
    """
    Patient model
    """
    phone_regex = RegexValidator(
        regex=r'^\+[1-9]\d{1,14}$',
        message=_("Phone number must be in E.164 format (e.g., +1234567890). Max 15 digits.")
    )

    full_name = models.CharField(
        _('full name'),
        max_length=255,
        help_text=_('Patient full name')
    )
    phone_e164 = models.CharField(
        _('phone number'),
        max_length=20,
        validators=[phone_regex],
        help_text=_('Phone in E.164 format (e.g., +1234567890)')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this patient is currently active')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('patient')
        verbose_name_plural = _('patients')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.phone_e164})'


class Device(models.Model):
    """
    Device model for iPad kiosks and web clients
    """
    IPAD = 'IPAD'
    WEB = 'WEB'
    OTHER = 'OTHER'

    DEVICE_TYPE_CHOICES = [
        (IPAD, _('iPad')),
        (WEB, _('Web Browser')),
        (OTHER, _('Other')),
    ]

    device_uid = models.CharField(
        _('device UID'),
        max_length=255,
        unique=True,
        help_text=_('Unique device identifier')
    )
    device_type = models.CharField(
        _('device type'),
        max_length=10,
        choices=DEVICE_TYPE_CHOICES,
        default=IPAD,
        help_text=_('Type of device')
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='devices',
        verbose_name=_('room'),
        help_text=_('Room where this device is located')
    )
    assigned_staff = models.ManyToManyField(
        'accounts.User',
        blank=True,
        related_name='assigned_devices',
        verbose_name=_('assigned staff'),
        help_text=_('Staff members who can view orders from this device')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this device is currently active')
    )
    last_seen_at = models.DateTimeField(
        _('last seen at'),
        null=True,
        blank=True,
        help_text=_('Last time this device was seen online')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('device')
        verbose_name_plural = _('devices')
        ordering = ['-last_seen_at']

    def __str__(self):
        return f'{self.get_device_type_display()} - {self.device_uid}'


class PatientAssignment(models.Model):
    """
    Patient assignment model - links patient to staff, device, and room
    Represents the current care relationship
    """
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name=_('patient'),
        help_text=_('Patient being cared for')
    )
    staff = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='patient_assignments',
        verbose_name=_('staff'),
        help_text=_('Staff member providing care')
    )
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name='patient_assignments',
        verbose_name=_('device'),
        help_text=_('Device used for orders')
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='patient_assignments',
        verbose_name=_('room'),
        help_text=_('Room where patient is located')
    )
    order_limits = models.JSONField(
        _('order limits'),
        default=get_default_order_limits,
        blank=True,
        help_text=_('Order limits by category type (e.g., {"DRINK": 1, "SNACK": 1})')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this assignment is currently active')
    )
    started_at = models.DateTimeField(
        _('started at'),
        auto_now_add=True,
        help_text=_('When care started')
    )
    ended_at = models.DateTimeField(
        _('ended at'),
        null=True,
        blank=True,
        help_text=_('When care ended')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('patient assignment')
        verbose_name_plural = _('patient assignments')
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['staff', 'is_active']),
            models.Index(fields=['device', 'is_active']),
            models.Index(fields=['patient', 'is_active']),
        ]

    def __str__(self):
        return f'{self.patient.full_name} - {self.staff.full_name} ({self.room.code})'

    def end_care(self):
        """Mark this assignment as ended"""
        from django.utils import timezone
        self.is_active = False
        self.ended_at = timezone.now()
        self.save()
