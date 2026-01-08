from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import InventoryBalanceViewSet, StockOperationsViewSet

router = DefaultRouter()
router.register(r'balances', InventoryBalanceViewSet, basename='inventory-balance')

# Stock operations are handled via a ViewSet with custom actions
urlpatterns = [
    path('stock/receipt', StockOperationsViewSet.as_view({'post': 'stock_receipt'}), name='stock-receipt'),
    path('stock/adjust', StockOperationsViewSet.as_view({'post': 'stock_adjustment'}), name='stock-adjust'),
]

# Add router URLs
urlpatterns += router.urls
