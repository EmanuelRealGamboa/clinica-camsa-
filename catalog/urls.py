from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductCategoryViewSet,
    ProductViewSet,
    PublicProductCategoryViewSet,
    PublicProductViewSet
)

# Router for staff endpoints
staff_router = DefaultRouter()
staff_router.register(r'categories', ProductCategoryViewSet, basename='category')
staff_router.register(r'products', ProductViewSet, basename='product')

# Router for public endpoints
public_router = DefaultRouter()
public_router.register(r'categories', PublicProductCategoryViewSet, basename='public-category')
public_router.register(r'products', PublicProductViewSet, basename='public-product')

# Default urlpatterns for staff endpoints
urlpatterns = staff_router.urls
