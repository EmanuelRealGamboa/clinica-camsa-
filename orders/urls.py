from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderManagementViewSet
from .dashboard_stats import dashboard_stats

router = DefaultRouter()
router.register(r'', OrderManagementViewSet, basename='order')

urlpatterns = [
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
] + router.urls
