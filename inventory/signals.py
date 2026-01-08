from django.db.models.signals import post_save
from django.dispatch import receiver
from catalog.models import Product
from .models import InventoryBalance


@receiver(post_save, sender=Product)
def create_inventory_balance(sender, instance, created, **kwargs):
    """
    Automatically create InventoryBalance when a new Product is created
    """
    if created:
        InventoryBalance.objects.get_or_create(
            product=instance,
            defaults={
                'on_hand': 0,
                'reserved': 0,
            }
        )
