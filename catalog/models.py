from django.db import models
from django.utils.translation import gettext_lazy as _


class ProductCategory(models.Model):
    """
    Product category model
    """
    name = models.CharField(
        _('category name'),
        max_length=100,
        unique=True,
        help_text=_('Unique category name')
    )
    sort_order = models.IntegerField(
        _('sort order'),
        default=0,
        help_text=_('Order for displaying categories (lower numbers first)')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this category is currently active')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product category')
        verbose_name_plural = _('product categories')
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Product model
    """
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('category')
    )
    name = models.CharField(
        _('product name'),
        max_length=200,
        help_text=_('Product name')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Product description')
    )
    image_url = models.URLField(
        _('image URL'),
        max_length=500,
        blank=True,
        help_text=_('URL to product image')
    )
    sku = models.CharField(
        _('SKU'),
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text=_('Stock Keeping Unit (optional)')
    )
    unit_label = models.CharField(
        _('unit label'),
        max_length=50,
        default='unidad',
        help_text=_('Unit label (e.g., "unidad", "pieza", "botella")')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this product is currently active')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['category__sort_order', 'name']

    def __str__(self):
        return f'{self.name} ({self.category.name})'
