from rest_framework import serializers
from .models import InventoryBalance, InventoryMovement
from catalog.models import Product


class InventoryBalanceSerializer(serializers.ModelSerializer):
    """
    Serializer for InventoryBalance model
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    available = serializers.IntegerField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryBalance
        fields = [
            'id',
            'product',
            'product_name',
            'product_category',
            'product_sku',
            'on_hand',
            'reserved',
            'available',
            'reorder_level',
            'needs_reorder',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InventoryMovementSerializer(serializers.ModelSerializer):
    """
    Serializer for InventoryMovement model
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True, allow_null=True)

    class Meta:
        model = InventoryMovement
        fields = [
            'id',
            'product',
            'product_name',
            'movement_type',
            'movement_type_display',
            'quantity',
            'order',
            'created_by',
            'created_by_email',
            'note',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StockReceiptSerializer(serializers.Serializer):
    """
    Serializer for receiving stock
    """
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_product_id(self, value):
        try:
            Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
        return value


class StockAdjustmentSerializer(serializers.Serializer):
    """
    Serializer for adjusting stock (positive or negative delta)
    """
    product_id = serializers.IntegerField()
    delta = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_product_id(self, value):
        try:
            Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
        return value

    def validate_delta(self, value):
        if value == 0:
            raise serializers.ValidationError("Delta cannot be zero")
        return value
