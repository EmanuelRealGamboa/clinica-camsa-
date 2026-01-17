# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0004_productcategory_category_type'),
    ]

    operations = [
        # Add price field to Product
        migrations.AddField(
            model_name='product',
            name='price',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Product price (only for FOOD category items that are paid)',
                max_digits=10,
                null=True,
                verbose_name='price'
            ),
        ),
        # Update category_type choices to include FOOD
        migrations.AlterField(
            model_name='productcategory',
            name='category_type',
            field=models.CharField(
                choices=[
                    ('DRINK', 'Bebidas'),
                    ('SNACK', 'Snacks'),
                    ('FOOD', 'Comida'),
                    ('OTHER', 'Otros')
                ],
                default='OTHER',
                help_text='Category type for order limits (DRINK, SNACK, FOOD, or OTHER)',
                max_length=20,
                verbose_name='category type'
            ),
        ),
    ]
