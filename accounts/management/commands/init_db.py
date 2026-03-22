import os
from django.core.management.base import BaseCommand
from accounts.models import User, UserRole


class Command(BaseCommand):
    help = 'Initialize the database with default roles and users from environment variables'

    def handle(self, *args, **options):
        from accounts.models import Role

        # Create roles
        admin_role, created = Role.objects.get_or_create(
            name='ADMIN',
            defaults={'description': 'Administrator with full access'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created role: ADMIN'))
        else:
            self.stdout.write('Role ADMIN already exists')

        staff_role, created = Role.objects.get_or_create(
            name='STAFF',
            defaults={'description': 'Staff member with limited access'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created role: STAFF'))
        else:
            self.stdout.write('Role STAFF already exists')

        # Create admin user from environment variables
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@clinicacamsa.com')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        admin_name = os.environ.get('ADMIN_FULL_NAME', 'Administrador CAMSA')

        if not admin_password:
            self.stderr.write(self.style.ERROR(
                'ADMIN_PASSWORD environment variable is required. Skipping admin creation.'
            ))
        elif not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password=admin_password,
                full_name=admin_name
            )
            UserRole.objects.get_or_create(user=admin_user, role=admin_role)
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_email}'))
        else:
            self.stdout.write(f'Admin user {admin_email} already exists')

        # Create staff/nurse users from environment variables
        staff_password = os.environ.get('STAFF_PASSWORD')
        staff_count = int(os.environ.get('STAFF_COUNT', '4'))

        if not staff_password:
            self.stderr.write(self.style.ERROR(
                'STAFF_PASSWORD environment variable is required. Skipping staff creation.'
            ))
        else:
            for i in range(1, staff_count + 1):
                staff_email = os.environ.get(f'STAFF_EMAIL_{i}', f'enfermera{i}@clinicacamsa.com')
                staff_name = os.environ.get(f'STAFF_NAME_{i}', f'Enfermera {i}')

                if not User.objects.filter(email=staff_email).exists():
                    staff_user = User.objects.create_user(
                        email=staff_email,
                        password=staff_password,
                        full_name=staff_name,
                        is_staff=True
                    )
                    UserRole.objects.get_or_create(user=staff_user, role=staff_role)
                    self.stdout.write(self.style.SUCCESS(f'Created staff user: {staff_email}'))
                else:
                    self.stdout.write(f'Staff user {staff_email} already exists')

        total_users = User.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Database initialization complete. Total users: {total_users}'))
