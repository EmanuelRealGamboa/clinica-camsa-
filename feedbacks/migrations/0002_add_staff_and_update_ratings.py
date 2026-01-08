# Generated migration for feedback model updates
# Run: python manage.py migrate feedbacks

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('feedbacks', '0001_initial'),
    ]

    operations = [
        # Add new staff field
        migrations.AddField(
            model_name='feedback',
            name='staff',
            field=models.ForeignKey(
                blank=True,
                help_text='Staff member (nurse) who attended this order',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='received_feedbacks',
                to=settings.AUTH_USER_MODEL,
                verbose_name='staff member'
            ),
        ),

        # Add new satisfaction_rating field
        migrations.AddField(
            model_name='feedback',
            name='satisfaction_rating',
            field=models.IntegerField(
                default=5,
                help_text='Overall satisfaction rating (1-5 stars)',
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5)
                ],
                verbose_name='satisfaction rating'
            ),
            preserve_default=False,
        ),

        # Remove old rating fields (optional - comment out if you want to keep data)
        # migrations.RemoveField(
        #     model_name='feedback',
        #     name='order_rating',
        # ),
        # migrations.RemoveField(
        #     model_name='feedback',
        #     name='stay_rating',
        # ),

        # Add new indexes
        migrations.AddIndex(
            model_name='feedback',
            index=models.Index(fields=['staff', '-created_at'], name='feedbacks_f_staff_i_idx'),
        ),
        migrations.AddIndex(
            model_name='feedback',
            index=models.Index(fields=['satisfaction_rating', '-created_at'], name='feedbacks_f_satisfa_idx'),
        ),
    ]
