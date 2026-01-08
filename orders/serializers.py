from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, OrderStatusEvent
from catalog.models import Product
from clinic.models import Device


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_category',
            'quantity',
            'unit_label',
            'created_at'
        ]
        read_only_fields = ['id', 'unit_label', 'created_at']


class OrderStatusEventSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderStatusEvent
    """
    changed_by_email = serializers.CharField(source='changed_by.email', read_only=True, allow_null=True)

    class Meta:
        model = OrderStatusEvent
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by',
            'changed_by_email',
            'changed_at',
            'note'
        ]
        read_only_fields = ['id', 'changed_at']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order (Staff view)
    """
    items = OrderItemSerializer(many=True, read_only=True)
    status_events = OrderStatusEventSerializer(many=True, read_only=True)
    device_uid = serializers.CharField(source='assignment.device_uid', read_only=True, allow_null=True)
    room_code = serializers.CharField(source='room.code', read_only=True, allow_null=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'assignment',
            'device_uid',
            'room',
            'room_code',
            'patient',
            'patient_name',
            'status',
            'status_display',
            'placed_at',
            'delivered_at',
            'cancelled_at',
            'items',
            'status_events',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'placed_at', 'created_at', 'updated_at']


class PublicOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order (Public/Kiosk view)
    """
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'status',
            'status_display',
            'placed_at',
            'delivered_at',
            'items'
        ]
        read_only_fields = ['id', 'status', 'placed_at', 'delivered_at']


class CreateOrderSerializer(serializers.Serializer):
    """
    Serializer for creating orders from kiosk
    """
    device_uid = serializers.CharField(required=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text='List of items: [{"product_id": 1, "quantity": 2}, ...]'
    )

    def validate_device_uid(self, value):
        """Validate device exists"""
        try:
            Device.objects.get(device_uid=value)
        except Device.DoesNotExist:
            raise serializers.ValidationError("Device not found")
        return value

    def validate_items(self, value):
        """Validate items structure and products"""
        if not value:
            raise serializers.ValidationError("At least one item is required")

        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Each item must have product_id")
            if 'quantity' not in item:
                raise serializers.ValidationError("Each item must have quantity")

            # Validate quantity
            try:
                quantity = int(item['quantity'])
                if quantity < 1:
                    raise serializers.ValidationError("Quantity must be at least 1")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Quantity must be a number")

            # Validate product exists and is active
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {item['product_id']} not found or inactive")

        return value


class OrderStatusChangeSerializer(serializers.Serializer):
    """
    Serializer for changing order status
    """
    to_status = serializers.ChoiceField(
        choices=['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
    )
    note = serializers.CharField(required=False, allow_blank=True)


class OrderCancelSerializer(serializers.Serializer):
    """
    Serializer for cancelling orders
    """
    note = serializers.CharField(required=False, allow_blank=True)
