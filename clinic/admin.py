from django.contrib import admin
from django.utils.html import format_html
from .models import Room, Patient, Device, PatientAssignment


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


@admin.register(PatientAssignment)
class PatientAssignmentAdmin(admin.ModelAdmin):
    """
    Admin interface for PatientAssignment model
    """
    list_display = ('patient_name', 'staff_name', 'room_code', 'device_uid', 'limits_display', 'is_active', 'started_at')
    list_filter = ('is_active', 'started_at', 'room')
    search_fields = ('patient__full_name', 'staff__full_name', 'room__code', 'device__device_uid')
    readonly_fields = ('started_at', 'ended_at', 'created_at', 'updated_at')
    ordering = ('-started_at',)

    fieldsets = (
        ('Assignment Information', {
            'fields': ('patient', 'staff', 'device', 'room', 'is_active'),
            'description': 'Basic assignment information'
        }),
        ('Order Limits Configuration', {
            'fields': ('order_limits',),
            'description': '''
                <strong>Configure order limits for this patient:</strong><br>
                Format: {"DRINK": 1, "SNACK": 1}<br>
                - DRINK: Maximum number of drinks (water, coffee, tea, juice)<br>
                - SNACK: Maximum number of snacks (fruits, cookies, bread)<br>
                - Set to 0 for no limit<br>
                Example: {"DRINK": 2, "SNACK": 1}
            '''
        }),
        ('Timestamps', {
            'fields': ('started_at', 'ended_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def patient_name(self, obj):
        return obj.patient.full_name
    patient_name.short_description = 'Patient'

    def staff_name(self, obj):
        return obj.staff.full_name
    staff_name.short_description = 'Staff'

    def room_code(self, obj):
        return obj.room.code
    room_code.short_description = 'Room'

    def device_uid(self, obj):
        return obj.device.device_uid
    device_uid.short_description = 'Device'

    def limits_display(self, obj):
        if not obj.order_limits:
            return format_html('<span style="color: #999;">No limits</span>')

        limits = []
        if obj.order_limits.get('DRINK', 0) > 0:
            limits.append(f"🥤 {obj.order_limits['DRINK']}")
        if obj.order_limits.get('SNACK', 0) > 0:
            limits.append(f"🍪 {obj.order_limits['SNACK']}")

        if not limits:
            return format_html('<span style="color: #999;">No limits</span>')

        return format_html('<span style="color: #ff9800; font-weight: bold;">{}</span>', ' | '.join(limits))
    limits_display.short_description = 'Order Limits'
