from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'room', 'patient', 'staff', 'satisfaction_rating', 'created_at']
    list_filter = ['satisfaction_rating', 'created_at', 'room', 'staff']
    search_fields = ['order__id', 'room__code', 'patient__full_name', 'staff__full_name', 'comment']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'room', 'patient', 'staff')
        }),
        ('Feedback', {
            'fields': ('satisfaction_rating', 'comment')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
