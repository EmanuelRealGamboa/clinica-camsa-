from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from orders.models import Order
from clinic.models import Room, Patient


class Feedback(models.Model):
    """
    Feedback model for order ratings
    Each order can have exactly one feedback (OneToOne relationship)
    """
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='feedback',
        verbose_name=_('order'),
        help_text=_('The order this feedback is for (unique)')
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        verbose_name=_('room'),
        help_text=_('The room where the order was delivered')
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='feedbacks',
        verbose_name=_('patient'),
        help_text=_('The patient who provided the feedback (optional)')
    )
    staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_feedbacks',
        verbose_name=_('staff member'),
        help_text=_('Staff member (nurse) who attended this order')
    )
    satisfaction_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('satisfaction rating'),
        help_text=_('Overall satisfaction rating (1-5 stars)')
    )
    comment = models.TextField(
        null=True,
        blank=True,
        verbose_name=_('comment'),
        help_text=_('Optional feedback comment')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('created at')
    )

    class Meta:
        verbose_name = _('feedback')
        verbose_name_plural = _('feedbacks')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['room', '-created_at']),
            models.Index(fields=['staff', '-created_at']),
            models.Index(fields=['satisfaction_rating', '-created_at']),
        ]

    def __str__(self):
        staff_name = self.staff.full_name if self.staff else 'Unknown'
        return f'Feedback for Order #{self.order.id} - {self.satisfaction_rating}/5 stars - Attended by {staff_name}'
