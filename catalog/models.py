from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class ProductTag(models.Model):
    """
    Product tag/badge model (e.g., "Más Popular", "Relajante", "Orgánico")
    """
    name = models.CharField(
        _('tag name'),
        max_length=50,
        unique=True,
        help_text=_('Tag name (e.g., "Más Popular", "Relajante")')
    )
    color = models.CharField(
        _('color'),
        max_length=7,
        default='#C78650',
        help_text=_('Hex color code for the tag (e.g., "#C78650")')
    )
    icon = models.CharField(
        _('icon'),
        max_length=50,
        blank=True,
        help_text=_('Icon emoji or icon name (optional)')
    )
    sort_order = models.IntegerField(
        _('sort order'),
        default=0,
        help_text=_('Order for displaying tags (lower numbers first)')
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether this tag is currently active')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product tag')
        verbose_name_plural = _('product tags')
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class ProductCategory(models.Model):
    """
    Product category model
    """
    CATEGORY_TYPE_CHOICES = [
        ('DRINK', _('Bebidas')),
        ('SNACK', _('Snacks')),
        ('OTHER', _('Otros')),
    ]

    name = models.CharField(
        _('category name'),
        max_length=100,
        unique=True,
        help_text=_('Unique category name')
    )
    icon = models.CharField(
        _('icon'),
        max_length=50,
        blank=True,
        help_text=_('Icon emoji or icon name for category (e.g., "🍵", "🍪", "🍓")')
    )
    category_type = models.CharField(
        _('category type'),
        max_length=20,
        choices=CATEGORY_TYPE_CHOICES,
        default='OTHER',
        help_text=_('Category type for order limits (DRINK, SNACK, or OTHER)')
    )
    sort_order = models.IntegerField(
        _('sort order'),
        default=0,
        help_text=_('Order for displaying categories (lower numbers first)')
    )
    show_in_carousel = models.BooleanField(
        _('show in carousel'),
        default=True,
        help_text=_('Whether to show this category in kiosk carousel')
    )
    carousel_order = models.IntegerField(
        _('carousel order'),
        default=0,
        help_text=_('Order for displaying in carousel (lower numbers first)')
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
    image = models.ImageField(
        _('product image'),
        upload_to='products/',
        blank=True,
        null=True,
        help_text=_('Product image file')
    )
    image_url = models.URLField(
        _('image URL'),
        max_length=500,
        blank=True,
        help_text=_('External URL to product image (optional, use if not uploading file)')
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

    # Rating and reviews
    rating = models.DecimalField(
        _('rating'),
        max_digits=2,
        decimal_places=1,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_('Product rating (0-5 stars)')
    )
    rating_count = models.IntegerField(
        _('rating count'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Number of ratings received')
    )

    # Tags and categorization
    tags = models.ManyToManyField(
        ProductTag,
        blank=True,
        related_name='products',
        verbose_name=_('tags'),
        help_text=_('Product tags/badges (e.g., "Más Popular", "Orgánico")')
    )

    # Benefits (stored as JSON)
    benefits = models.JSONField(
        _('benefits'),
        default=list,
        blank=True,
        help_text=_('Product benefits as JSON array: [{"icon": "❤️", "text": "Inmunidad Fuerte"}]')
    )

    # Featured product settings
    is_featured = models.BooleanField(
        _('is featured'),
        default=False,
        help_text=_('Mark as featured product (product of the month/week)')
    )
    featured_title = models.CharField(
        _('featured title'),
        max_length=200,
        blank=True,
        help_text=_('Custom title for featured section (optional)')
    )
    featured_description = models.TextField(
        _('featured description'),
        blank=True,
        help_text=_('Custom description for featured section (optional)')
    )

    # Ordering
    product_sort_order = models.IntegerField(
        _('product sort order'),
        default=0,
        help_text=_('Order for displaying products within category (lower numbers first)')
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
        ordering = ['category__sort_order', 'product_sort_order', 'name']

    def __str__(self):
        return f'{self.name} ({self.category.name})'

    def get_image_url(self):
        """
        Returns the image URL - prioritizes uploaded image over external URL
        """
        if self.image:
            return self.image.url
        return self.image_url or None

    def save(self, *args, **kwargs):
        """
        Override save to auto-generate SKU if not provided
        """
        # Convert empty string to None for SKU
        if self.sku == '':
            self.sku = None

        if not self.sku:
            # Generate SKU based on category and sequential number
            category_prefix = self.category.name[:3].upper().replace(' ', '')

            # Find the highest existing SKU number for this category
            existing_products = Product.objects.filter(
                sku__startswith=category_prefix
            ).order_by('-sku')

            if existing_products.exists():
                # Extract number from last SKU and increment
                last_sku = existing_products.first().sku
                try:
                    last_number = int(last_sku.replace(category_prefix, '').lstrip('-'))
                    next_number = last_number + 1
                except (ValueError, AttributeError):
                    next_number = 1
            else:
                next_number = 1

            # Generate new SKU: e.g., "BEB-0001", "ALI-0001"
            self.sku = f"{category_prefix}-{next_number:04d}"

        super().save(*args, **kwargs)
