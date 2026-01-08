from datetime import datetime
from django.db.models import Count, Avg, Sum, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsStaffOrAdmin

from orders.models import Order, OrderItem
from feedbacks.models import Feedback


class ReportsViewSet(viewsets.ViewSet):
    """
    ViewSet for reports and analytics (Staff only)
    """
    permission_classes = [IsStaffOrAdmin]

    @action(detail=False, methods=['get'], url_path='orders/daily')
    def daily_orders(self, request):
        """
        Get daily order statistics
        GET /api/reports/orders/daily?from=YYYY-MM-DD&to=YYYY-MM-DD
        """
        # Get date range from query params
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')

        if not from_date or not to_date:
            return Response({
                'error': 'Both "from" and "to" date parameters are required (format: YYYY-MM-DD)'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse dates
            from_datetime = datetime.strptime(from_date, '%Y-%m-%d')
            to_datetime = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)

            # Query orders in date range
            orders = Order.objects.filter(
                placed_at__gte=from_datetime,
                placed_at__lte=to_datetime
            )

            # Aggregate statistics
            total_orders = orders.count()

            # Count by status
            status_counts = {
                'placed': orders.filter(status='PLACED').count(),
                'preparing': orders.filter(status='PREPARING').count(),
                'ready': orders.filter(status='READY').count(),
                'delivered': orders.filter(status='DELIVERED').count(),
                'cancelled': orders.filter(status='CANCELLED').count(),
            }

            # Group by date
            daily_breakdown = []
            current_date = from_datetime.date()
            end_date = to_datetime.date()

            while current_date <= end_date:
                day_start = datetime.combine(current_date, datetime.min.time())
                day_end = datetime.combine(current_date, datetime.max.time())

                day_orders = orders.filter(
                    placed_at__gte=day_start,
                    placed_at__lte=day_end
                )

                daily_breakdown.append({
                    'date': current_date.isoformat(),
                    'total': day_orders.count(),
                    'delivered': day_orders.filter(status='DELIVERED').count(),
                    'cancelled': day_orders.filter(status='CANCELLED').count(),
                })

                current_date = datetime.fromordinal(current_date.toordinal() + 1).date()

            return Response({
                'success': True,
                'from': from_date,
                'to': to_date,
                'total_orders': total_orders,
                'status_breakdown': status_counts,
                'daily_breakdown': daily_breakdown
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='products/top')
    def top_products(self, request):
        """
        Get top products by order count
        GET /api/reports/products/top?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=10
        """
        # Get parameters
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        limit = int(request.query_params.get('limit', 10))

        if not from_date or not to_date:
            return Response({
                'error': 'Both "from" and "to" date parameters are required (format: YYYY-MM-DD)'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse dates
            from_datetime = datetime.strptime(from_date, '%Y-%m-%d')
            to_datetime = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)

            # Query order items in date range
            order_items = OrderItem.objects.filter(
                order__placed_at__gte=from_datetime,
                order__placed_at__lte=to_datetime,
                order__status='DELIVERED'  # Only count delivered orders
            ).select_related('product')

            # Aggregate by product
            product_stats = order_items.values(
                'product__id',
                'product__name',
                'product__category__name'
            ).annotate(
                total_quantity=Sum('quantity'),
                order_count=Count('order', distinct=True)
            ).order_by('-total_quantity')[:limit]

            return Response({
                'success': True,
                'from': from_date,
                'to': to_date,
                'limit': limit,
                'products': list(product_stats)
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD or invalid limit value'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='ratings/summary')
    def ratings_summary(self, request):
        """
        Get ratings summary
        GET /api/reports/ratings/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
        """
        # Get date range from query params
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')

        if not from_date or not to_date:
            return Response({
                'error': 'Both "from" and "to" date parameters are required (format: YYYY-MM-DD)'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse dates
            from_datetime = datetime.strptime(from_date, '%Y-%m-%d')
            to_datetime = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)

            # Query feedbacks in date range
            feedbacks = Feedback.objects.filter(
                created_at__gte=from_datetime,
                created_at__lte=to_datetime
            )

            total_feedbacks = feedbacks.count()

            if total_feedbacks == 0:
                return Response({
                    'success': True,
                    'from': from_date,
                    'to': to_date,
                    'total_feedbacks': 0,
                    'order_rating': {
                        'average': 0,
                        'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                    },
                    'stay_rating': {
                        'average': 0,
                        'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                    }
                }, status=status.HTTP_200_OK)

            # Aggregate ratings
            order_rating_avg = feedbacks.aggregate(Avg('order_rating'))['order_rating__avg'] or 0
            stay_rating_avg = feedbacks.aggregate(Avg('stay_rating'))['stay_rating__avg'] or 0

            # Distribution of order ratings
            order_rating_dist = {
                1: feedbacks.filter(order_rating=1).count(),
                2: feedbacks.filter(order_rating=2).count(),
                3: feedbacks.filter(order_rating=3).count(),
                4: feedbacks.filter(order_rating=4).count(),
                5: feedbacks.filter(order_rating=5).count(),
            }

            # Distribution of stay ratings
            stay_rating_dist = {
                1: feedbacks.filter(stay_rating=1).count(),
                2: feedbacks.filter(stay_rating=2).count(),
                3: feedbacks.filter(stay_rating=3).count(),
                4: feedbacks.filter(stay_rating=4).count(),
                5: feedbacks.filter(stay_rating=5).count(),
            }

            return Response({
                'success': True,
                'from': from_date,
                'to': to_date,
                'total_feedbacks': total_feedbacks,
                'order_rating': {
                    'average': round(order_rating_avg, 2),
                    'distribution': order_rating_dist
                },
                'stay_rating': {
                    'average': round(stay_rating_avg, 2),
                    'distribution': stay_rating_dist
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
