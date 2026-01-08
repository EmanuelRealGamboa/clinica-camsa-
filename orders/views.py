from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.permissions import IsStaffOrAdmin
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Order, OrderItem, OrderStatusEvent
from catalog.models import Product
from clinic.models import Device
from inventory.models import InventoryBalance, InventoryMovement
from .serializers import (
    OrderSerializer,
    PublicOrderSerializer,
    CreateOrderSerializer,
    OrderStatusChangeSerializer,
    OrderCancelSerializer
)


class PublicOrderViewSet(viewsets.ViewSet):
    """
    Public ViewSet for orders (Kiosk/iPad)
    No authentication required - uses device_uid
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='create')
    def create_order(self, request):
        """
        Create a new order from kiosk
        POST /api/public/orders/create
        {
            "device_uid": "ipad-room-101",
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1}
            ]
        }
        """
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        device_uid = serializer.validated_data['device_uid']
        items_data = serializer.validated_data['items']

        try:
            with transaction.atomic():
                # Get device and validate it's active
                device = Device.objects.select_for_update().get(device_uid=device_uid, is_active=True)

                # Get active patient assignment for this device
                from clinic.models import PatientAssignment
                patient_assignment = PatientAssignment.objects.filter(
                    device=device,
                    is_active=True
                ).select_related('patient', 'room').first()

                if not patient_assignment:
                    return Response({
                        'error': 'No active patient assigned to this device'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Update device last_seen_at
                device.last_seen_at = timezone.now()
                device.save(update_fields=['last_seen_at'])

                # Validate inventory availability for all items first
                inventory_checks = []
                for item_data in items_data:
                    product = Product.objects.select_for_update().get(
                        id=item_data['product_id'],
                        is_active=True
                    )

                    # Get or create inventory balance with lock
                    balance, created = InventoryBalance.objects.select_for_update().get_or_create(
                        product=product,
                        defaults={'on_hand': 0, 'reserved': 0}
                    )

                    # Check availability: available = on_hand - reserved
                    available = balance.on_hand - balance.reserved
                    requested_qty = item_data['quantity']

                    if available < requested_qty:
                        return Response({
                            'error': f'Insufficient inventory for {product.name}. Available: {available}, Requested: {requested_qty}'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    inventory_checks.append({
                        'product': product,
                        'balance': balance,
                        'quantity': requested_qty
                    })

                # Create order
                order = Order.objects.create(
                    assignment=device,
                    patient_assignment=patient_assignment,
                    patient=patient_assignment.patient,
                    room=patient_assignment.room,
                    status='PLACED'
                )

                # Create order items and reserve inventory
                for check in inventory_checks:
                    product = check['product']
                    balance = check['balance']
                    quantity = check['quantity']

                    # Create order item
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        unit_label=product.unit_label  # Snapshot unit_label
                    )

                    # Reserve inventory
                    balance.reserved += quantity
                    balance.save(update_fields=['reserved', 'updated_at'])

                    # Create inventory movement for reservation
                    InventoryMovement.objects.create(
                        product=product,
                        movement_type='RESERVE',
                        quantity=quantity,
                        order=order,
                        note=f'Reserved for order #{order.id}'
                    )

                # Create initial status event
                OrderStatusEvent.objects.create(
                    order=order,
                    from_status='',
                    to_status='PLACED',
                    note='Order placed from kiosk'
                )

                # Broadcast new order to staff via WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'staff_orders',
                    {
                        'type': 'new_order',
                        'order_id': order.id,
                        'room_code': order.room.code if order.room else None,
                        'device_uid': device.device_uid,
                        'placed_at': order.placed_at.isoformat(),
                    }
                )

                return Response({
                    'success': True,
                    'message': 'Order created successfully',
                    'order': PublicOrderSerializer(order).data
                }, status=status.HTTP_201_CREATED)

        except Device.DoesNotExist:
            return Response({
                'error': 'Device not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='active')
    def active_orders(self, request):
        """
        Get active orders for a device
        GET /api/public/orders/active?device_uid=ipad-room-101
        """
        device_uid = request.query_params.get('device_uid')
        if not device_uid:
            return Response({
                'error': 'device_uid parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = Device.objects.get(device_uid=device_uid)

            # Get active orders (not delivered or cancelled)
            orders = Order.objects.filter(
                assignment=device,
                status__in=['PLACED', 'PREPARING', 'READY']
            ).prefetch_related('items', 'items__product').order_by('-placed_at')

            return Response({
                'success': True,
                'orders': PublicOrderSerializer(orders, many=True).data
            }, status=status.HTTP_200_OK)

        except Device.DoesNotExist:
            return Response({
                'error': 'Device not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing orders (Staff only)
    """
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrAdmin]
    queryset = Order.objects.all().prefetch_related(
        'items',
        'items__product',
        'status_events',
        'assignment',
        'room',
        'patient'
    ).order_by('-placed_at')

    def get_queryset(self):
        """
        Filter orders based on staff's active patient assignment
        Superusers (admins) can see all orders without filtering
        """
        from clinic.models import PatientAssignment

        queryset = super().get_queryset()

        # Superusers can see all orders, no filtering needed
        if self.request.user.is_superuser:
            return queryset

        # If 'my_orders' param is present, filter by current user's active patient assignment
        if self.request.query_params.get('my_orders') == 'true':
            # Get the active patient assignment for this staff member
            active_assignment = PatientAssignment.objects.filter(
                staff=self.request.user,
                is_active=True
            ).first()

            if active_assignment:
                # Filter orders to only show those from the assigned patient's device
                queryset = queryset.filter(
                    assignment=active_assignment.device,
                    patient=active_assignment.patient
                )
            else:
                # If no active assignment, show no orders
                queryset = queryset.none()

        return queryset

    @action(detail=False, methods=['get'], url_path='queue')
    def order_queue(self, request):
        """
        Get orders in queue (PLACED or PREPARING)
        GET /api/orders/queue?status=PLACED,PREPARING&my_orders=true
        """
        status_filter = request.query_params.get('status', 'PLACED,PREPARING')
        statuses = [s.strip() for s in status_filter.split(',')]

        # Validate statuses
        valid_statuses = ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
        statuses = [s for s in statuses if s in valid_statuses]

        if not statuses:
            statuses = ['PLACED', 'PREPARING']

        # Use get_queryset() to apply my_orders filter
        orders = self.get_queryset().filter(status__in=statuses)

        serializer = self.get_serializer(orders, many=True)
        return Response({
            'success': True,
            'count': orders.count(),
            'orders': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='status')
    def change_status(self, request, pk=None):
        """
        Change order status
        PATCH /api/orders/{id}/status
        {
            "to_status": "PREPARING",
            "note": "Started preparing order"
        }
        """
        serializer = OrderStatusChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        to_status = serializer.validated_data['to_status']
        note = serializer.validated_data.get('note', '')

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=pk)
                from_status = order.status

                # Validate status transition
                if from_status == 'DELIVERED':
                    return Response({
                        'error': 'Cannot change status of delivered order'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if from_status == 'CANCELLED':
                    return Response({
                        'error': 'Cannot change status of cancelled order'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # If changing to DELIVERED, consume inventory
                if to_status == 'DELIVERED':
                    # Get all order items with products
                    items = order.items.select_related('product').all()

                    for item in items:
                        # Get inventory balance with lock
                        balance = InventoryBalance.objects.select_for_update().get(
                            product=item.product
                        )

                        # Consume inventory: reserved -= qty, on_hand -= qty
                        balance.reserved -= item.quantity
                        balance.on_hand -= item.quantity
                        balance.save(update_fields=['reserved', 'on_hand', 'updated_at'])

                        # Create inventory movement for consumption
                        InventoryMovement.objects.create(
                            product=item.product,
                            movement_type='CONSUME',
                            quantity=item.quantity,
                            order=order,
                            created_by=request.user if request.user.is_authenticated else None,
                            note=f'Consumed for order #{order.id} delivery'
                        )

                    order.delivered_at = timezone.now()

                # Update order status
                order.status = to_status

                # Update timestamps
                if to_status == 'CANCELLED':
                    order.cancelled_at = timezone.now()

                order.save(update_fields=['status', 'delivered_at', 'cancelled_at', 'updated_at'])

                # Create status event
                status_event = OrderStatusEvent.objects.create(
                    order=order,
                    from_status=from_status,
                    to_status=to_status,
                    changed_by=request.user if request.user.is_authenticated else None,
                    note=note
                )

                # Broadcast status change to kiosk via WebSocket
                if order.assignment:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'device_{order.assignment.id}',
                        {
                            'type': 'order_status_changed',
                            'order_id': order.id,
                            'status': to_status,
                            'from_status': from_status,
                            'changed_at': status_event.changed_at.isoformat(),
                        }
                    )

                return Response({
                    'success': True,
                    'message': f'Order status changed from {from_status} to {to_status}',
                    'order': OrderSerializer(order).data
                }, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except InventoryBalance.DoesNotExist:
            return Response({
                'error': 'Inventory balance not found for one or more products'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """
        Cancel an order
        POST /api/orders/{id}/cancel
        {
            "note": "Customer requested cancellation"
        }
        """
        serializer = OrderCancelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        note = serializer.validated_data.get('note', '')

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=pk)
                from_status = order.status

                # Validate can cancel
                if from_status == 'DELIVERED':
                    return Response({
                        'error': 'Cannot cancel delivered order'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if from_status == 'CANCELLED':
                    return Response({
                        'error': 'Order is already cancelled'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Release reserved inventory
                items = order.items.select_related('product').all()

                for item in items:
                    # Get inventory balance with lock
                    balance = InventoryBalance.objects.select_for_update().get(
                        product=item.product
                    )

                    # Release reservation: reserved -= qty
                    balance.reserved -= item.quantity
                    balance.save(update_fields=['reserved', 'updated_at'])

                    # Create inventory movement for release
                    InventoryMovement.objects.create(
                        product=item.product,
                        movement_type='RELEASE',
                        quantity=item.quantity,
                        order=order,
                        created_by=request.user if request.user.is_authenticated else None,
                        note=f'Released from cancelled order #{order.id}'
                    )

                # Update order status
                order.status = 'CANCELLED'
                order.cancelled_at = timezone.now()
                order.save(update_fields=['status', 'cancelled_at', 'updated_at'])

                # Create status event
                status_event = OrderStatusEvent.objects.create(
                    order=order,
                    from_status=from_status,
                    to_status='CANCELLED',
                    changed_by=request.user if request.user.is_authenticated else None,
                    note=note or 'Order cancelled'
                )

                # Broadcast cancellation to kiosk via WebSocket
                if order.assignment:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'device_{order.assignment.id}',
                        {
                            'type': 'order_status_changed',
                            'order_id': order.id,
                            'status': 'CANCELLED',
                            'from_status': from_status,
                            'changed_at': status_event.changed_at.isoformat(),
                        }
                    )

                return Response({
                    'success': True,
                    'message': 'Order cancelled successfully',
                    'order': OrderSerializer(order).data
                }, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except InventoryBalance.DoesNotExist:
            return Response({
                'error': 'Inventory balance not found for one or more products'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
