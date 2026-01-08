from django.urls import path
from .views import PublicOrderViewSet

urlpatterns = [
    path('orders/create', PublicOrderViewSet.as_view({'post': 'create_order'}), name='public-order-create'),
    path('orders/active', PublicOrderViewSet.as_view({'get': 'active_orders'}), name='public-order-active'),
]
