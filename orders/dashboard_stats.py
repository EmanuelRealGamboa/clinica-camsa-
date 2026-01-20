from django.db.models import Count, Q, Avg, F, ExpressionWrapper, DurationField
from django.db.models.functions import TruncHour, TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStaffOrAdmin

from .models import Order, OrderItem
from clinic.models import Room, Device, PatientAssignment
from feedbacks.models import Feedback
from catalog.models import Product


@api_view(['GET'])
@permission_classes([IsStaffOrAdmin])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics
    """
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    # Panel 1: Orders in Real Time
    orders_by_status = Order.objects.values('status').annotate(count=Count('id'))
    orders_status_dict = {item['status']: item['count'] for item in orders_by_status}

    orders_last_24h = Order.objects.filter(
        placed_at__gte=last_24h
    ).annotate(
        hour=TruncHour('placed_at')
    ).values('hour').annotate(count=Count('id')).order_by('hour')

    # Panel 2: Room Occupancy
    active_assignments = PatientAssignment.objects.filter(is_active=True).select_related('room', 'patient')
    rooms_with_patients = {}
    for assignment in active_assignments:
        room_code = assignment.room.code if assignment.room else 'N/A'
        if room_code not in rooms_with_patients:
            rooms_with_patients[room_code] = {
                'room_code': room_code,
                'patients': [],
                'order_count': 0
            }
        rooms_with_patients[room_code]['patients'].append({
            'name': assignment.patient.full_name if assignment.patient else 'N/A',
            'staff': assignment.staff.full_name if assignment.staff else 'N/A'
        })

    # Add order counts per room
    orders_by_room = Order.objects.filter(
        status__in=['PLACED', 'PREPARING', 'READY']
    ).values('room__code').annotate(count=Count('id'))

    for item in orders_by_room:
        room_code = item['room__code'] or 'N/A'
        if room_code in rooms_with_patients:
            rooms_with_patients[room_code]['order_count'] = item['count']

    # Panel 3: Active Devices
    total_devices = Device.objects.filter(is_active=True).count()
    active_threshold = now - timedelta(minutes=30)
    active_devices = Device.objects.filter(
        is_active=True,
        last_seen_at__gte=active_threshold
    ).count()

    devices_by_type = Device.objects.filter(is_active=True).values('device_type').annotate(count=Count('id'))

    recent_devices = Device.objects.filter(
        is_active=True
    ).select_related('room').order_by('-last_seen_at')[:10]

    # Panel 4: Customer Satisfaction
    feedbacks_last_7d = Feedback.objects.filter(created_at__gte=last_7d)

    # Calculate average satisfaction from staff_rating and stay_rating
    # Use staff_rating as primary metric (or average of both if needed)
    satisfaction_distribution = []
    for rating in range(1, 6):
        count = feedbacks_last_7d.filter(staff_rating=rating).count()
        if count > 0:
            satisfaction_distribution.append({
                'satisfaction_rating': rating,
                'count': count
            })

    # Calculate average satisfaction from staff_rating
    avg_satisfaction = feedbacks_last_7d.aggregate(avg=Avg('staff_rating'))['avg'] or 0
    if avg_satisfaction is None:
        avg_satisfaction = 0

    # Satisfaction trend based on staff_rating
    satisfaction_trend = feedbacks_last_7d.annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        avg_rating=Avg('staff_rating'),
        count=Count('id')
    ).order_by('date')

    # Top staff based on staff_rating
    top_staff = Feedback.objects.filter(
        staff__isnull=False,
        created_at__gte=last_7d
    ).values(
        'staff__id',
        'staff__full_name'
    ).annotate(
        avg_rating=Avg('staff_rating'),
        count=Count('id')
    ).order_by('-avg_rating')[:3]

    # Panel 5: Most Requested Products
    top_products = OrderItem.objects.filter(
        order__placed_at__gte=last_7d
    ).values(
        'product__id',
        'product__name',
        'product__category__name'
    ).annotate(
        total_quantity=Count('id')
    ).order_by('-total_quantity')[:10]

    # Low stock alerts
    from inventory.models import InventoryBalance
    low_stock = InventoryBalance.objects.filter(
        Q(on_hand__lte=F('reorder_level')) | Q(on_hand__lte=10)
    ).select_related('product').values(
        'product__name',
        'on_hand',
        'reorder_level'
    )[:5]

    return Response({
        'orders': {
            'by_status': orders_status_dict,
            'last_24h': list(orders_last_24h),
            'active_count': Order.objects.filter(
                status__in=['PLACED', 'PREPARING', 'READY']
            ).count()
        },
        'rooms': {
            'occupied': list(rooms_with_patients.values()),
            'total_active': len(rooms_with_patients),
            'total_rooms': Room.objects.filter(is_active=True).count()
        },
        'devices': {
            'total': total_devices,
            'active': active_devices,
            'by_type': list(devices_by_type),
            'recent': [{
                'device_uid': d.device_uid,
                'device_type': d.device_type,
                'room': d.room.code if d.room else 'N/A',
                'last_seen': d.last_seen_at.isoformat() if d.last_seen_at else None
            } for d in recent_devices]
        },
        'satisfaction': {
            'average': round(avg_satisfaction, 2),
            'distribution': list(satisfaction_distribution),
            'trend': list(satisfaction_trend),
            'top_staff': list(top_staff),
            'total_responses': feedbacks_last_7d.count()
        },
        'products': {
            'top_requested': list(top_products),
            'low_stock': list(low_stock)
        }
    })
