from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from accounts.permissions import IsStaffOrAdmin

from .models import ProductCategory, Product, ProductTag
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
    PublicProductCategorySerializer,
    PublicProductSerializer,
    ProductTagSerializer
)


# Staff endpoints (require authentication)

class ProductTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductTag model (Staff only)
    Provides CRUD operations for tags

    list: Get all tags
    retrieve: Get a specific tag
    create: Create a new tag
    update: Update a tag
    partial_update: Partially update a tag
    destroy: Delete a tag
    """
    queryset = ProductTag.objects.all()
    serializer_class = ProductTagSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['sort_order', 'name', 'created_at']
    ordering = ['sort_order', 'name']


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
    parser_classes = [MultiPartParser, FormParser, JSONParser]
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
    ordering = ['category__sort_order', 'product_sort_order', 'name']


# Custom public endpoints for Kiosk

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_product(request):
    """
    Get the featured product (product of the month/week)
    Returns the product marked as featured with highest sort_order
    """
    product = Product.objects.select_related('category').prefetch_related('tags').filter(
        is_active=True,
        category__is_active=True,
        is_featured=True
    ).order_by('-product_sort_order').first()

    if product:
        serializer = PublicProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    return Response(None)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products_by_category(request, category_id):
    """
    Get products for a specific category (for carousels)
    Returns active products ordered by sort_order
    """
    products = Product.objects.select_related('category').prefetch_related('tags').filter(
        category_id=category_id,
        is_active=True,
        category__is_active=True
    ).order_by('product_sort_order', 'name')

    serializer = PublicProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_most_ordered_products(request):
    """
    Get the most ordered products
    Returns top 10 products ordered by number of times they appear in orders
    """
    products = Product.objects.select_related('category').prefetch_related('tags').filter(
        is_active=True,
        category__is_active=True
    ).annotate(
        order_count=Count('order_items')
    ).order_by('-order_count', 'product_sort_order', 'name')[:10]

    serializer = PublicProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_carousel_categories(request):
    """
    Get categories configured to show in carousels
    Returns active categories with show_in_carousel=True ordered by carousel_order
    """
    categories = ProductCategory.objects.filter(
        is_active=True,
        show_in_carousel=True
    ).order_by('carousel_order', 'sort_order')

    serializer = PublicProductCategorySerializer(categories, many=True)
    return Response(serializer.data)
