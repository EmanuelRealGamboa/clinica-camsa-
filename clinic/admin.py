from django.contrib import admin
from .models import Room, Patient, Device


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """
    Admin interface for Room model
    """
    list_display = ('code', 'floor', 'is_active', 'created_at')
    list_filter = ('is_active', 'floor')
    search_fields = ('code', 'floor')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('code',)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """
    Admin interface for Patient model
    """
    list_display = ('full_name', 'phone_e164', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('full_name', 'phone_e164')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    """
    Admin interface for Device model
    """
    list_display = ('device_uid', 'device_type', 'is_active', 'last_seen_at', 'created_at')
    list_filter = ('device_type', 'is_active', 'last_seen_at')
    search_fields = ('device_uid',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-last_seen_at',)
