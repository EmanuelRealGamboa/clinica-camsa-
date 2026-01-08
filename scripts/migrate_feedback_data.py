"""
Script to migrate existing feedback data to new format
This script will:
1. Copy order_rating to satisfaction_rating for existing feedbacks
2. Try to populate staff field from order's patient_assignment

Run: python manage.py shell < scripts/migrate_feedback_data.py
Or: python scripts/migrate_feedback_data.py (if you have Django setup)
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from feedbacks.models import Feedback

def migrate_feedback_data():
    """Migrate existing feedback data to new format"""

    print("Starting feedback data migration...")

    feedbacks = Feedback.objects.all()
    total = feedbacks.count()

    if total == 0:
        print("No feedbacks to migrate.")
        return

    print(f"Found {total} feedbacks to migrate")

    migrated = 0
    errors = 0

    for feedback in feedbacks:
        try:
            # If satisfaction_rating doesn't exist yet, use order_rating
            if hasattr(feedback, 'order_rating') and not hasattr(feedback, 'satisfaction_rating'):
                feedback.satisfaction_rating = feedback.order_rating

            # Try to populate staff from order's patient_assignment
            if not feedback.staff and feedback.order:
                if hasattr(feedback.order, 'patient_assignment') and feedback.order.patient_assignment:
                    feedback.staff = feedback.order.patient_assignment.staff

            feedback.save()
            migrated += 1
            print(f"✓ Migrated feedback #{feedback.id}")

        except Exception as e:
            errors += 1
            print(f"✗ Error migrating feedback #{feedback.id}: {str(e)}")

    print(f"\nMigration complete:")
    print(f"  - Total: {total}")
    print(f"  - Migrated: {migrated}")
    print(f"  - Errors: {errors}")

if __name__ == '__main__':
    migrate_feedback_data()
