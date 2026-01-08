from django.contrib import admin
from .models import Order, OrderItem, OrderStatusEvent


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'unit_label', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class OrderStatusEventInline(admin.TabularInline):
    model = OrderStatusEvent
    extra = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'changed_at', 'note']
    can_delete = False
    ordering = ['-changed_at']

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'assignment', 'room', 'patient', 'placed_at', 'delivered_at']
    list_filter = ['status', 'placed_at', 'delivered_at']
    search_fields = ['id', 'assignment__device_uid', 'room__code', 'patient__full_name']
    readonly_fields = ['placed_at', 'delivered_at', 'cancelled_at', 'created_at', 'updated_at']
    ordering = ['-placed_at']
    inlines = [OrderItemInline, OrderStatusEventInline]

    fieldsets = (
        ('Order Information', {
            'fields': ('status', 'assignment', 'room', 'patient')
        }),
        ('Timestamps', {
            'fields': ('placed_at', 'delivered_at', 'cancelled_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'unit_label', 'created_at']
    list_filter = ['created_at', 'product__category']
    search_fields = ['order__id', 'product__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        # Order items should only be created through order creation
        return False

    def has_change_permission(self, request, obj=None):
        # Order items should not be changed after creation
        return False


@admin.register(OrderStatusEvent)
class OrderStatusEventAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'from_status', 'to_status', 'changed_by', 'changed_at']
    list_filter = ['to_status', 'changed_at']
    search_fields = ['order__id', 'note', 'changed_by__email']
    readonly_fields = ['changed_at']
    ordering = ['-changed_at']

    def has_add_permission(self, request):
        # Status events should only be created through status changes
        return False

    def has_change_permission(self, request, obj=None):
        # Status events should not be changed after creation
        return False
