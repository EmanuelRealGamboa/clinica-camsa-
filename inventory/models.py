from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class InventoryBalance(models.Model):
    """
    Current inventory balance for each product (one-to-one with Product)
    """
    product = models.OneToOneField(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='inventory_balance',
        verbose_name=_('product')
    )
    on_hand = models.IntegerField(
        _('on hand quantity'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Current quantity in stock')
    )
    reserved = models.IntegerField(
        _('reserved quantity'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Quantity reserved for orders')
    )
    reorder_level = models.IntegerField(
        _('reorder level'),
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
        help_text=_('Minimum quantity before reorder is needed')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('inventory balance')
        verbose_name_plural = _('inventory balances')
        ordering = ['product__category__sort_order', 'product__name']

    def __str__(self):
        return f'{self.product.name} - On Hand: {self.on_hand}, Reserved: {self.reserved}'

    @property
    def available(self):
        """Available quantity (on_hand - reserved)"""
        return self.on_hand - self.reserved

    @property
    def needs_reorder(self):
        """Check if stock is below reorder level"""
        if self.reorder_level is None:
            return False
        return self.on_hand <= self.reorder_level


class InventoryMovement(models.Model):
    """
    Inventory movement log (receipts, adjustments, waste, etc.)
    """
    MOVEMENT_TYPE_CHOICES = [
        ('RECEIPT', _('Receipt')),
        ('ADJUSTMENT', _('Adjustment')),
        ('WASTE', _('Waste')),
        ('RESERVE', _('Reserve')),
        ('RELEASE', _('Release')),
        ('CONSUME', _('Consume')),
    ]

    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='inventory_movements',
        verbose_name=_('product')
    )
    movement_type = models.CharField(
        _('movement type'),
        max_length=20,
        choices=MOVEMENT_TYPE_CHOICES,
        help_text=_('Type of inventory movement')
    )
    quantity = models.IntegerField(
        _('quantity'),
        validators=[MinValueValidator(1)],
        help_text=_('Quantity moved (always positive, sign determined by movement_type)')
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='inventory_movements',
        verbose_name=_('order')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='inventory_movements',
        verbose_name=_('created by')
    )
    note = models.TextField(
        _('note'),
        blank=True,
        help_text=_('Additional notes about this movement')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('inventory movement')
        verbose_name_plural = _('inventory movements')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_movement_type_display()} - {self.product.name} ({self.quantity})'
