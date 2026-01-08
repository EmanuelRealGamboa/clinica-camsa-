from rest_framework.routers import DefaultRouter
from .views import (
    PublicProductCategoryViewSet,
    PublicProductViewSet
)

# Router for public endpoints
public_router = DefaultRouter()
public_router.register(r'categories', PublicProductCategoryViewSet, basename='public-category')
public_router.register(r'products', PublicProductViewSet, basename='public-product')

urlpatterns = public_router.urls
