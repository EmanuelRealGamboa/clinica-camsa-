from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_assignment', 'room', 'patient', 'staff', 'staff_rating', 'stay_rating', 'created_at']
    list_filter = ['staff_rating', 'stay_rating', 'created_at', 'room', 'staff']
    search_fields = ['patient_assignment__id', 'room__code', 'patient__full_name', 'staff__full_name', 'comment']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Patient Assignment Information', {
            'fields': ('patient_assignment', 'room', 'patient', 'staff')
        }),
        ('Ratings', {
            'fields': ('product_ratings', 'staff_rating', 'stay_rating', 'comment')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
