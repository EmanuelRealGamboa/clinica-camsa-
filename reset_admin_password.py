import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Get the admin user
try:
    user = User.objects.get(email='admin@clinicacamsa.com')
    # Reset password
    user.set_password('AdminCamsa2024')
    user.save()
    print('Password updated successfully!')
    print('Email: admin@clinicacamsa.com')
    print('New Password: AdminCamsa2024')
except User.DoesNotExist:
    print('User not found')
