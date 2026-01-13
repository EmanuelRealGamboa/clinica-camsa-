"""
Management command to seed the database with demo data
Usage: python manage.py seed_demo_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Role, UserRole
from catalog.models import ProductCategory, Product
from clinic.models import Room, Device, Patient, PatientAssignment
from inventory.models import InventoryBalance, InventoryMovement


class Command(BaseCommand):
    help = 'Seeds the database with demo data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))

        # Create roles
        self.stdout.write('Creating roles...')
        admin_role, _ = Role.objects.get_or_create(
            name=Role.ADMIN,
            defaults={'description': 'Administrator with full access'}
        )
        staff_role, _ = Role.objects.get_or_create(
            name=Role.STAFF,
            defaults={'description': 'Staff member for attending orders'}
        )
        self.stdout.write(self.style.SUCCESS(f'  - Created roles: {admin_role}, {staff_role}'))

        # Create staff users
        self.stdout.write('Creating staff users...')
        staff_users = []
        staff_data = [
            {
                'email': 'enfermera.maria@camsa.com',
                'full_name': 'María González',
                'password': 'staff123'
            },
            {
                'email': 'enfermero.juan@camsa.com',
                'full_name': 'Juan Pérez',
                'password': 'staff123'
            },
            {
                'email': 'enfermera.ana@camsa.com',
                'full_name': 'Ana Rodríguez',
                'password': 'staff123'
            },
        ]

        for data in staff_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'full_name': data['full_name'],
                    'is_staff': True,
                    'is_active': True
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                UserRole.objects.get_or_create(user=user, role=staff_role)
                self.stdout.write(self.style.SUCCESS(f'  - Created staff: {user.email}'))
            else:
                self.stdout.write(self.style.WARNING(f'  - Staff already exists: {user.email}'))
            staff_users.append(user)

        # Create product categories
        self.stdout.write('Creating product categories...')
        categories_data = [
            {'name': 'Bebidas', 'sort_order': 1},
            {'name': 'Snacks', 'sort_order': 2},
            {'name': 'Comida', 'sort_order': 3},
            {'name': 'Postres', 'sort_order': 4},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'sort_order': cat_data['sort_order']}
            )
            categories[cat_data['name']] = category
            status = 'Created' if created else 'Already exists'
            self.stdout.write(self.style.SUCCESS(f'  - {status}: {category.name}'))

        # Create products
        self.stdout.write('Creating products...')
        products_data = [
            # Bebidas
            {'name': 'Agua Natural', 'category': 'Bebidas', 'sku': 'BEB-001', 'unit_label': 'botella'},
            {'name': 'Jugo de Naranja', 'category': 'Bebidas', 'sku': 'BEB-002', 'unit_label': 'vaso'},
            {'name': 'Café', 'category': 'Bebidas', 'sku': 'BEB-003', 'unit_label': 'taza'},
            {'name': 'Té', 'category': 'Bebidas', 'sku': 'BEB-004', 'unit_label': 'taza'},
            # Snacks
            {'name': 'Galletas', 'category': 'Snacks', 'sku': 'SNK-001', 'unit_label': 'paquete'},
            {'name': 'Fruta Picada', 'category': 'Snacks', 'sku': 'SNK-002', 'unit_label': 'porción'},
            {'name': 'Yogurt', 'category': 'Snacks', 'sku': 'SNK-003', 'unit_label': 'unidad'},
            # Comida
            {'name': 'Sopa de Verduras', 'category': 'Comida', 'sku': 'COM-001', 'unit_label': 'plato'},
            {'name': 'Ensalada César', 'category': 'Comida', 'sku': 'COM-002', 'unit_label': 'plato'},
            {'name': 'Sándwich de Pollo', 'category': 'Comida', 'sku': 'COM-003', 'unit_label': 'unidad'},
            # Postres
            {'name': 'Gelatina', 'category': 'Postres', 'sku': 'POS-001', 'unit_label': 'porción'},
            {'name': 'Flan', 'category': 'Postres', 'sku': 'POS-002', 'unit_label': 'porción'},
        ]

        for prod_data in products_data:
            category = categories[prod_data['category']]
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                defaults={
                    'name': prod_data['name'],
                    'category': category,
                    'unit_label': prod_data['unit_label'],
                    'is_active': True
                }
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(self.style.SUCCESS(f'  - {status}: {product.name} ({product.sku})'))

            # Create initial inventory balance (100 units per product)
            if created:
                balance, _ = InventoryBalance.objects.get_or_create(
                    product=product,
                    defaults={'quantity': 100}
                )

                # Create initial inventory movement
                InventoryMovement.objects.create(
                    product=product,
                    movement_type='RECEIVE',
                    quantity=100,
                    notes='Inventario inicial de demostración',
                    created_by=None
                )
                self.stdout.write(self.style.SUCCESS(f'    - Initial inventory: 100 {product.unit_label}s'))

        # Create rooms
        self.stdout.write('Creating rooms...')
        rooms_data = [
            {'code': '101', 'floor': '1'},
            {'code': '102', 'floor': '1'},
            {'code': '103', 'floor': '1'},
            {'code': '201', 'floor': '2'},
            {'code': '202', 'floor': '2'},
        ]

        rooms = []
        for room_data in rooms_data:
            room, created = Room.objects.get_or_create(
                code=room_data['code'],
                defaults={'floor': room_data['floor']}
            )
            rooms.append(room)
            status = 'Created' if created else 'Already exists'
            self.stdout.write(self.style.SUCCESS(f'  - {status}: Room {room.code}'))

        # Create devices
        self.stdout.write('Creating devices...')
        devices_data = [
            {'device_uid': 'IPAD-01', 'device_type': 'IPAD', 'room_code': '101'},
            {'device_uid': 'IPAD-02', 'device_type': 'IPAD', 'room_code': '102'},
            {'device_uid': 'IPAD-03', 'device_type': 'IPAD', 'room_code': '201'},
            {'device_uid': 'WEB-01', 'device_type': 'WEB', 'room_code': '103'},
        ]

        devices = []
        for dev_data in devices_data:
            room = Room.objects.get(code=dev_data['room_code'])
            device, created = Device.objects.get_or_create(
                device_uid=dev_data['device_uid'],
                defaults={
                    'device_type': dev_data['device_type'],
                    'room': room,
                    'is_active': True,
                    'last_seen_at': timezone.now()
                }
            )
            devices.append(device)
            status = 'Created' if created else 'Already exists'
            self.stdout.write(self.style.SUCCESS(f'  - {status}: {device.device_uid} in Room {room.code}'))

            # Assign staff to devices
            if created and staff_users:
                # Assign first staff to first 2 devices, second staff to next 2
                staff_index = 0 if len(devices) <= 2 else 1
                if staff_index < len(staff_users):
                    device.assigned_staff.add(staff_users[staff_index])
                    self.stdout.write(self.style.SUCCESS(
                        f'    - Assigned to staff: {staff_users[staff_index].full_name}'
                    ))

        # Create demo patients
        self.stdout.write('Creating demo patients...')
        patients_data = [
            {'full_name': 'Pedro Martínez', 'phone_e164': '+521234567890'},
            {'full_name': 'Laura Sánchez', 'phone_e164': '+521234567891'},
            {'full_name': 'Carlos López', 'phone_e164': '+521234567892'},
        ]

        patients = []
        for pat_data in patients_data:
            patient, created = Patient.objects.get_or_create(
                phone_e164=pat_data['phone_e164'],
                defaults={'full_name': pat_data['full_name']}
            )
            patients.append(patient)
            status = 'Created' if created else 'Already exists'
            self.stdout.write(self.style.SUCCESS(f'  - {status}: {patient.full_name}'))

        # Create patient assignments
        self.stdout.write('Creating patient assignments...')
        if len(patients) >= 3 and len(devices) >= 3 and len(staff_users) >= 2:
            assignments_data = [
                {'patient_idx': 0, 'staff_idx': 0, 'device_idx': 0},
                {'patient_idx': 1, 'staff_idx': 0, 'device_idx': 1},
                {'patient_idx': 2, 'staff_idx': 1, 'device_idx': 2},
            ]

            for assign_data in assignments_data:
                patient = patients[assign_data['patient_idx']]
                staff = staff_users[assign_data['staff_idx']]
                device = devices[assign_data['device_idx']]

                assignment, created = PatientAssignment.objects.get_or_create(
                    patient=patient,
                    staff=staff,
                    device=device,
                    is_active=True,
                    defaults={'room': device.room}
                )
                status = 'Created' if created else 'Already exists'
                self.stdout.write(self.style.SUCCESS(
                    f'  - {status}: {patient.full_name} -> {staff.full_name} (Room {device.room.code})'
                ))

        self.stdout.write(self.style.SUCCESS('\n' + '=' * 50))
        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('\nYou can now:')
        self.stdout.write('  1. Access admin panel: http://localhost:5173/admin/login')
        self.stdout.write('  2. Access kiosk: http://localhost:5173/kiosk/IPAD-01')
        self.stdout.write('\nStaff login credentials:')
        for data in staff_data:
            self.stdout.write(f'  - {data["email"]} / {data["password"]}')
