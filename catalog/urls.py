from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductCategoryViewSet,
    ProductViewSet,
    ProductTagViewSet,
    PublicProductCategoryViewSet,
    PublicProductViewSet,
    get_featured_product,
    get_products_by_category,
    get_most_ordered_products,
    get_most_ordered_by_category,
    get_carousel_categories
)

# Router for staff endpoints
staff_router = DefaultRouter()
staff_router.register(r'categories', ProductCategoryViewSet, basename='category')
staff_router.register(r'products', ProductViewSet, basename='product')
staff_router.register(r'tags', ProductTagViewSet, basename='tag')

# Router for public endpoints
public_router = DefaultRouter()
public_router.register(r'categories', PublicProductCategoryViewSet, basename='public-category')
public_router.register(r'products', PublicProductViewSet, basename='public-product')

# Custom public endpoints for Kiosk
public_custom_patterns = [
    path('products/featured/', get_featured_product, name='featured-product'),
    path('products/most-ordered/', get_most_ordered_products, name='most-ordered-products'),
    path('categories/<int:category_id>/products/', get_products_by_category, name='category-products'),
    path('categories/<int:category_id>/most-ordered/', get_most_ordered_by_category, name='category-most-ordered'),
    path('categories/carousel/', get_carousel_categories, name='carousel-categories'),
]

# Default urlpatterns for staff endpoints
urlpatterns = staff_router.urls
