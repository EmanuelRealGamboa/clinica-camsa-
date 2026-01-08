from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsStaffOrAdmin

from .models import ProductCategory, Product
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
    PublicProductCategorySerializer,
    PublicProductSerializer
)


# Staff endpoints (require authentication)

class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductCategory model (Staff only)
    Provides CRUD operations for categories

    list: Get all categories
    retrieve: Get a specific category
    create: Create a new category
    update: Update a category
    partial_update: Partially update a category
    destroy: Delete a category
    """
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['sort_order', 'name', 'created_at']
    ordering = ['sort_order', 'name']


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product model (Staff only)
    Provides CRUD operations for products

    list: Get all products
    retrieve: Get a specific product
    create: Create a new product
    update: Update a product
    partial_update: Partially update a product
    destroy: Delete a product
    """
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'category']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'category__sort_order', 'created_at']
    ordering = ['category__sort_order', 'name']


# Public endpoints (no authentication required)

class PublicProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for ProductCategory (Read-only)
    Returns only active categories

    list: Get all active categories
    retrieve: Get a specific active category
    """
    queryset = ProductCategory.objects.filter(is_active=True)
    serializer_class = PublicProductCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['sort_order', 'name']


class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for Product (Read-only)
    Returns only active products from active categories

    list: Get all active products
    retrieve: Get a specific active product
    """
    queryset = Product.objects.select_related('category').filter(
        is_active=True,
        category__is_active=True
    )
    serializer_class = PublicProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering = ['category__sort_order', 'name']
