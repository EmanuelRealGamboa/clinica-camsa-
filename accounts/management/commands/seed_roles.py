from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import Role


class Command(BaseCommand):
    help = 'Create default roles (ADMIN, STAFF) if they do not exist'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding roles...'))

        roles_data = [
            {
                'name': Role.ADMIN,
                'description': 'Administrator role with full access to the system'
            },
            {
                'name': Role.STAFF,
                'description': 'Staff role for clinic personnel'
            },
        ]

        created_count = 0
        existing_count = 0

        with transaction.atomic():
            for role_data in roles_data:
                role, created = Role.objects.get_or_create(
                    name=role_data['name'],
                    defaults={'description': role_data['description']}
                )

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Created role: {role.name}')
                    )
                else:
                    existing_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'○ Role already exists: {role.name}')
                    )

        self.stdout.write('')
        self.stdout.write(self.style.MIGRATE_HEADING('Summary:'))
        self.stdout.write(f'  Created: {created_count}')
        self.stdout.write(f'  Already existed: {existing_count}')
        self.stdout.write(f'  Total roles: {Role.objects.count()}')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✓ Role seeding complete!'))
