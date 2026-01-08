from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Order(models.Model):
    """
    Customer order model
    """
    STATUS_CHOICES = [
        ('PLACED', _('Placed')),
        ('PREPARING', _('Preparing')),
        ('READY', _('Ready')),
        ('DELIVERED', _('Delivered')),
        ('CANCELLED', _('Cancelled')),
    ]

    assignment = models.ForeignKey(
        'clinic.Device',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='orders',
        verbose_name=_('device assignment'),
        help_text=_('Device (iPad/Kiosk) that placed this order')
    )
    patient_assignment = models.ForeignKey(
        'clinic.PatientAssignment',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='orders',
        verbose_name=_('patient assignment'),
        help_text=_('Patient assignment at the time of order')
    )
    room = models.ForeignKey(
        'clinic.Room',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='orders',
        verbose_name=_('room')
    )
    patient = models.ForeignKey(
        'clinic.Patient',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='orders',
        verbose_name=_('patient')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='PLACED',
        help_text=_('Current order status')
    )
    placed_at = models.DateTimeField(
        _('placed at'),
        auto_now_add=True,
        help_text=_('When the order was placed')
    )
    delivered_at = models.DateTimeField(
        _('delivered at'),
        blank=True,
        null=True,
        help_text=_('When the order was delivered')
    )
    cancelled_at = models.DateTimeField(
        _('cancelled at'),
        blank=True,
        null=True,
        help_text=_('When the order was cancelled')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('order')
        verbose_name_plural = _('orders')
        ordering = ['-placed_at']

    def __str__(self):
        return f'Order #{self.id} - {self.get_status_display()} - {self.placed_at.strftime("%Y-%m-%d %H:%M")}'


class OrderItem(models.Model):
    """
    Individual item in an order
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('order')
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name=_('product')
    )
    quantity = models.IntegerField(
        _('quantity'),
        validators=[MinValueValidator(1)],
        help_text=_('Quantity ordered')
    )
    unit_label = models.CharField(
        _('unit label'),
        max_length=50,
        help_text=_('Snapshot of product unit label at time of order')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('order item')
        verbose_name_plural = _('order items')
        ordering = ['id']

    def __str__(self):
        return f'{self.product.name} x{self.quantity} ({self.unit_label})'


class OrderStatusEvent(models.Model):
    """
    Log of order status changes
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_events',
        verbose_name=_('order')
    )
    from_status = models.CharField(
        _('from status'),
        max_length=20,
        blank=True,
        help_text=_('Previous status (empty for initial status)')
    )
    to_status = models.CharField(
        _('to status'),
        max_length=20,
        help_text=_('New status')
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='order_status_changes',
        verbose_name=_('changed by')
    )
    changed_at = models.DateTimeField(
        _('changed at'),
        auto_now_add=True,
        help_text=_('When the status change occurred')
    )
    note = models.TextField(
        _('note'),
        blank=True,
        help_text=_('Additional notes about this status change')
    )

    class Meta:
        verbose_name = _('order status event')
        verbose_name_plural = _('order status events')
        ordering = ['-changed_at']

    def __str__(self):
        return f'Order #{self.order.id}: {self.from_status or "NEW"} → {self.to_status}'
