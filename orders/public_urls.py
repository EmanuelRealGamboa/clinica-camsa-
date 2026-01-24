from django.urls import path
from .views import PublicOrderViewSet

urlpatterns = [
    path('orders/create', PublicOrderViewSet.as_view({'post': 'create_order'}), name='public-order-create'),
    path('orders/active', PublicOrderViewSet.as_view({'get': 'active_orders'}), name='public-order-active'),
    path('orders/by-assignment/<int:assignment_id>/', PublicOrderViewSet.as_view({'get': 'orders_by_assignment'}), name='public-order-by-assignment'),
]
