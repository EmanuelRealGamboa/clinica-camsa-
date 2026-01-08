"""
Script to initialize inventory balances for all products
Run with: python manage.py shell < init_inventory.py
"""

from catalog.models import Product
from inventory.models import InventoryBalance

# Get all active products
products = Product.objects.filter(is_active=True)

print(f"Found {products.count()} active products")

for product in products:
    # Create or update inventory balance
    balance, created = InventoryBalance.objects.get_or_create(
        product=product,
        defaults={
            'on_hand': 100,
            'reserved': 0
        }
    )

    if created:
        print(f"✓ Created inventory balance for: {product.name} (100 units)")
    else:
        # Update existing balance
        balance.on_hand = 100
        balance.reserved = 0
        balance.save()
        print(f"✓ Updated inventory balance for: {product.name} (100 units)")

print("\n✅ Inventory initialization complete!")
print(f"Total inventory balances: {InventoryBalance.objects.count()}")
