from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.permissions import IsStaffOrAdmin

from .models import Feedback
from orders.models import Order
from clinic.models import Device
from .serializers import CreateFeedbackSerializer, FeedbackSerializer


class PublicFeedbackViewSet(viewsets.ViewSet):
    """
    Public ViewSet for feedback (Kiosk/iPad)
    No authentication required - uses device_uid
    """
    permission_classes = [AllowAny]

    def create_feedback(self, request, order_id=None):
        """
        Create feedback for a delivered order
        POST /api/public/orders/{order_id}/feedback
        {
            "device_uid": "ipad-room-101",
            "satisfaction_rating": 5,
            "comment": "Great service!" (optional)
        }
        """
        serializer = CreateFeedbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        device_uid = serializer.validated_data['device_uid']
        satisfaction_rating = serializer.validated_data['satisfaction_rating']
        comment = serializer.validated_data.get('comment', '')

        try:
            with transaction.atomic():
                # Get and validate device
                device = Device.objects.select_for_update().get(device_uid=device_uid, is_active=True)

                # Get and validate order with related data
                order = Order.objects.select_related(
                    'assignment',
                    'room',
                    'patient',
                    'patient_assignment',
                    'patient_assignment__staff'
                ).get(id=order_id)

                # Validate order belongs to this device
                if order.assignment != device:
                    return Response({
                        'error': 'This order does not belong to this device'
                    }, status=status.HTTP_403_FORBIDDEN)

                # Validate order is delivered
                if order.status != 'DELIVERED':
                    return Response({
                        'error': 'Feedback can only be submitted for delivered orders'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Check if feedback already exists
                if hasattr(order, 'feedback'):
                    return Response({
                        'error': 'Feedback already submitted for this order'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Get staff from patient assignment (the nurse who attended)
                staff = None
                if order.patient_assignment:
                    staff = order.patient_assignment.staff

                # Create feedback
                feedback = Feedback.objects.create(
                    order=order,
                    room=order.room,
                    patient=order.patient,
                    staff=staff,
                    satisfaction_rating=satisfaction_rating,
                    comment=comment if comment else None
                )

                # End the patient assignment automatically after feedback is submitted
                if order.patient_assignment and order.patient_assignment.is_active:
                    order.patient_assignment.end_care()

                return Response({
                    'success': True,
                    'message': 'Thank you for your feedback!',
                    'feedback': FeedbackSerializer(feedback).data
                }, status=status.HTTP_201_CREATED)

        except Device.DoesNotExist:
            return Response({
                'error': 'Device not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FeedbackManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing feedback (Staff/Admin only)
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsStaffOrAdmin]
    queryset = Feedback.objects.all().select_related(
        'order',
        'room',
        'patient',
        'staff'
    ).order_by('-created_at')

    def get_queryset(self):
        """
        Optionally filter feedbacks by query parameters
        """
        queryset = super().get_queryset()

        # Filter by rating
        rating = self.request.query_params.get('rating', None)
        if rating:
            queryset = queryset.filter(satisfaction_rating=rating)

        # Filter by staff
        staff_id = self.request.query_params.get('staff', None)
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)

        # Filter by room
        room_id = self.request.query_params.get('room', None)
        if room_id:
            queryset = queryset.filter(room_id=room_id)

        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)

        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get feedback statistics
        GET /api/admin/feedbacks/stats/
        Returns:
        - Total feedbacks
        - Average rating
        - Today's feedbacks count
        - Response rate (feedbacks / delivered orders)
        - Rating distribution
        """
        # Get base queryset
        feedbacks = Feedback.objects.all()

        # Total feedbacks
        total_feedbacks = feedbacks.count()

        # Average satisfaction rating
        avg_rating = feedbacks.aggregate(avg=Avg('satisfaction_rating'))['avg'] or 0

        # Today's feedbacks
        today = timezone.now().date()
        today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        today_feedbacks = feedbacks.filter(created_at__gte=today_start).count()

        # Response rate calculation
        total_delivered_orders = Order.objects.filter(status='DELIVERED').count()
        response_rate = (total_feedbacks / total_delivered_orders * 100) if total_delivered_orders > 0 else 0

        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            count = feedbacks.filter(satisfaction_rating=i).count()
            rating_distribution[str(i)] = count

        # Top rated staff
        top_staff = feedbacks.filter(staff__isnull=False).values(
            'staff__id',
            'staff__full_name'
        ).annotate(
            avg_rating=Avg('satisfaction_rating'),
            feedback_count=Count('id')
        ).order_by('-avg_rating')[:5]

        # Recent trends (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_feedbacks = feedbacks.filter(created_at__gte=seven_days_ago)
        recent_avg = recent_feedbacks.aggregate(avg=Avg('satisfaction_rating'))['avg'] or 0

        return Response({
            'total_feedbacks': total_feedbacks,
            'average_rating': round(avg_rating, 2),
            'today_feedbacks': today_feedbacks,
            'response_rate': round(response_rate, 2),
            'rating_distribution': rating_distribution,
            'top_staff': list(top_staff),
            'recent_average': round(recent_avg, 2),
            'recent_feedbacks_count': recent_feedbacks.count()
        })
