import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()

# Create roles if they don't exist
admin_role, created = Role.objects.get_or_create(
    name='ADMIN',
    defaults={'description': 'Administrator with full access'}
)
if created:
    print('Created ADMIN role')
else:
    print('ADMIN role already exists')

staff_role, created = Role.objects.get_or_create(
    name='STAFF',
    defaults={'description': 'Staff member with limited access'}
)
if created:
    print('Created STAFF role')
else:
    print('STAFF role already exists')

# Assign ADMIN role to admin user
try:
    admin_user = User.objects.get(email='admin@clinicacamsa.com')
    user_role, created = UserRole.objects.get_or_create(
        user=admin_user,
        role=admin_role
    )
    if created:
        print(f'Assigned ADMIN role to {admin_user.email}')
    else:
        print(f'{admin_user.email} already has ADMIN role')

    print('\n=== Setup Complete ===')
    print(f'User: {admin_user.email}')
    print(f'Roles: {admin_user.get_roles()}')
    print(f'Is superuser: {admin_user.is_superuser}')
    print(f'Is staff: {admin_user.is_staff}')
except User.DoesNotExist:
    print('ERROR: Admin user not found')
