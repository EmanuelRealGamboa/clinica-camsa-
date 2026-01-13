from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStaffOrAdmin

from .models import InventoryBalance, InventoryMovement
from catalog.models import Product
from .serializers import (
    InventoryBalanceSerializer,
    InventoryMovementSerializer,
    StockReceiptSerializer,
    StockAdjustmentSerializer
)


class InventoryBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing inventory balances (Staff only)
    Read-only - balances are updated through stock operations

    list: Get all inventory balances
    retrieve: Get a specific inventory balance
    """
    queryset = InventoryBalance.objects.select_related('product', 'product__category').all()
    serializer_class = InventoryBalanceSerializer
    permission_classes = [IsStaffOrAdmin]

    @action(detail=False, methods=['get'])
    def all_products(self, request):
        """
        Get all products with their inventory data
        Shows both inventoried and non-inventoried products
        GET /api/inventory/balances/all_products/
        """
        # Get all active products
        products = Product.objects.filter(is_active=True).select_related('category').order_by('category__name', 'name')

        result = []
        for product in products:
            try:
                # Try to get inventory balance
                balance = InventoryBalance.objects.get(product=product)
                result.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.category.name,
                    'sku': product.sku or '-',
                    'inventoried': True,
                    'on_hand': balance.on_hand,
                    'reserved': balance.reserved,
                    'available': balance.available,
                    'reorder_level': balance.reorder_level,
                    'needs_reorder': balance.needs_reorder,
                })
            except InventoryBalance.DoesNotExist:
                # Product not in inventory system
                result.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.category.name,
                    'sku': product.sku or '-',
                    'inventoried': False,
                    'on_hand': None,
                    'reserved': None,
                    'available': None,
                    'reorder_level': None,
                    'needs_reorder': False,
                })

        return Response({
            'count': len(result),
            'results': result
        }, status=status.HTTP_200_OK)


class StockOperationsViewSet(viewsets.ViewSet):
    """
    ViewSet for stock operations (Staff only)
    Handles stock receipt and adjustments with transactions
    """
    permission_classes = [IsStaffOrAdmin]

    @action(detail=False, methods=['post'], url_path='receipt')
    def stock_receipt(self, request):
        """
        Receive stock (increase on_hand)
        POST /api/inventory/stock/receipt
        {
            "product_id": 1,
            "quantity": 100,
            "note": "Initial stock"
        }
        """
        serializer = StockReceiptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        note = serializer.validated_data.get('note', '')

        try:
            with transaction.atomic():
                # Get product
                product = Product.objects.select_for_update().get(id=product_id)

                # Get or create inventory balance with lock
                balance, created = InventoryBalance.objects.select_for_update().get_or_create(
                    product=product,
                    defaults={'on_hand': 0, 'reserved': 0}
                )

                # Update balance
                balance.on_hand += quantity
                balance.save(update_fields=['on_hand', 'updated_at'])

                # Create movement record
                movement = InventoryMovement.objects.create(
                    product=product,
                    movement_type='RECEIPT',
                    quantity=quantity,
                    created_by=request.user if request.user.is_authenticated else None,
                    note=note
                )

                return Response({
                    'success': True,
                    'message': f'Stock received: {quantity} units',
                    'balance': InventoryBalanceSerializer(balance).data,
                    'movement': InventoryMovementSerializer(movement).data
                }, status=status.HTTP_201_CREATED)

        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='adjust')
    def stock_adjustment(self, request):
        """
        Adjust stock (positive or negative delta)
        POST /api/inventory/stock/adjust
        {
            "product_id": 1,
            "delta": -5,
            "note": "Damaged items"
        }
        """
        serializer = StockAdjustmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']
        delta = serializer.validated_data['delta']
        note = serializer.validated_data.get('note', '')

        try:
            with transaction.atomic():
                # Get product
                product = Product.objects.select_for_update().get(id=product_id)

                # Get or create inventory balance with lock
                balance, created = InventoryBalance.objects.select_for_update().get_or_create(
                    product=product,
                    defaults={'on_hand': 0, 'reserved': 0}
                )

                # Calculate new on_hand
                new_on_hand = balance.on_hand + delta

                # Validate that on_hand won't go negative
                if new_on_hand < 0:
                    return Response({
                        'error': f'Insufficient stock. Current: {balance.on_hand}, Requested delta: {delta}'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Validate that on_hand >= reserved
                if new_on_hand < balance.reserved:
                    return Response({
                        'error': f'Cannot reduce stock below reserved quantity. Reserved: {balance.reserved}, New on_hand would be: {new_on_hand}'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Update balance
                balance.on_hand = new_on_hand
                balance.save(update_fields=['on_hand', 'updated_at'])

                # Create movement record
                movement = InventoryMovement.objects.create(
                    product=product,
                    movement_type='ADJUSTMENT',
                    quantity=abs(delta),
                    created_by=request.user if request.user.is_authenticated else None,
                    note=f"{'+' if delta > 0 else ''}{delta} - {note}"
                )

                return Response({
                    'success': True,
                    'message': f'Stock adjusted by {delta} units',
                    'balance': InventoryBalanceSerializer(balance).data,
                    'movement': InventoryMovementSerializer(movement).data
                }, status=status.HTTP_200_OK)

        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
