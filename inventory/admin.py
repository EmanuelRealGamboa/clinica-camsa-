from django.contrib import admin
from .models import InventoryBalance, InventoryMovement


@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'on_hand', 'reserved', 'available_display', 'reorder_level', 'needs_reorder', 'updated_at']
    list_filter = ['product__category', 'updated_at']
    search_fields = ['product__name', 'product__sku']
    readonly_fields = ['created_at', 'updated_at', 'available_display']
    ordering = ['product__category__sort_order', 'product__name']

    fieldsets = (
        ('Product Information', {
            'fields': ('product',)
        }),
        ('Stock Levels', {
            'fields': ('on_hand', 'reserved', 'available_display', 'reorder_level')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def available_display(self, obj):
        return obj.available
    available_display.short_description = 'Available'

    def has_add_permission(self, request):
        # Prevent manual creation, use stock operations
        return False


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'movement_type', 'quantity', 'order', 'created_by', 'created_at']
    list_filter = ['movement_type', 'created_at', 'product__category']
    search_fields = ['product__name', 'note', 'created_by__email', 'order__id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Movement Information', {
            'fields': ('product', 'movement_type', 'quantity')
        }),
        ('Related Information', {
            'fields': ('order', 'created_by', 'note')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
        }),
    )

    def has_add_permission(self, request):
        # Prevent manual creation, use stock operations API
        return False

    def has_change_permission(self, request, obj=None):
        # Movements should not be edited once created
        return False
