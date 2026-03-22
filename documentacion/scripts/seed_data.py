"""
Script para poblar la base de datos con datos de prueba.
Ejecutar con: python manage.py shell < seed_data.py
O: python manage.py runscript seed_data (si tienes django-extensions)
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.db import transaction
from accounts.models import User, Role, UserRole
from clinic.models import Room, Device, Patient, PatientAssignment
from catalog.models import ProductCategory, Product, ProductTag

def create_roles():
    """Crear roles básicos"""
    print("Creando roles...")
    admin_role, _ = Role.objects.get_or_create(
        name='ADMIN',
        defaults={'description': 'Administrador del sistema'}
    )
    staff_role, _ = Role.objects.get_or_create(
        name='STAFF',
        defaults={'description': 'Personal de atención'}
    )
    return admin_role, staff_role

def create_users(admin_role, staff_role):
    """Crear usuarios de prueba"""
    print("Creando usuarios...")
    
    # Admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@camsa.com',
        defaults={
            'username': 'admin',
            'full_name': 'Administrador CAMSA',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        UserRole.objects.get_or_create(user=admin_user, role=admin_role)
    
    # Staff user
    staff_user, created = User.objects.get_or_create(
        email='staff@camsa.com',
        defaults={
            'username': 'staff',
            'full_name': 'Personal de Atención',
        }
    )
    if created:
        staff_user.set_password('staff123')
        staff_user.save()
        UserRole.objects.get_or_create(user=staff_user, role=staff_role)
    
    return admin_user, staff_user

def create_rooms():
    """Crear habitaciones"""
    print("Creando habitaciones...")
    rooms_data = [
        {'code': '101', 'floor': '1'},
        {'code': '102', 'floor': '1'},
        {'code': '201', 'floor': '2'},
        {'code': '202', 'floor': '2'},
    ]
    rooms = []
    for data in rooms_data:
        room, _ = Room.objects.get_or_create(
            code=data['code'],
            defaults={'floor': data['floor'], 'is_active': True}
        )
        rooms.append(room)
    return rooms

def create_devices(rooms, staff_user):
    """Crear dispositivos/kiosks"""
    print("Creando dispositivos...")
    devices_data = [
        {'device_uid': '1', 'device_type': 'IPAD', 'room_index': 0},
        {'device_uid': '01', 'device_type': 'IPAD', 'room_index': 0},
        {'device_uid': '2', 'device_type': 'IPAD', 'room_index': 1},
        {'device_uid': '3', 'device_type': 'WEB', 'room_index': 2},
    ]
    devices = []
    for data in devices_data:
        device, _ = Device.objects.get_or_create(
            device_uid=data['device_uid'],
            defaults={
                'device_type': data['device_type'],
                'room': rooms[data['room_index']],
                'is_active': True,
            }
        )
        device.assigned_staff.add(staff_user)
        devices.append(device)
    return devices

def create_patients():
    """Crear pacientes de prueba"""
    print("Creando pacientes...")
    patients_data = [
        {'full_name': 'Juan Pérez García', 'phone_e164': '+521234567890', 'email': 'juan@email.com'},
        {'full_name': 'María López Hernández', 'phone_e164': '+521234567891', 'email': 'maria@email.com'},
        {'full_name': 'Carlos Rodríguez Martínez', 'phone_e164': '+521234567892', 'email': 'carlos@email.com'},
    ]
    patients = []
    for data in patients_data:
        patient, _ = Patient.objects.get_or_create(
            phone_e164=data['phone_e164'],
            defaults={
                'full_name': data['full_name'],
                'email': data['email'],
                'is_active': True,
            }
        )
        patients.append(patient)
    return patients

def create_patient_assignments(patients, devices, rooms, staff_user):
    """Crear asignaciones de pacientes a dispositivos"""
    print("Creando asignaciones de pacientes...")
    
    # Desactivar asignaciones anteriores
    PatientAssignment.objects.filter(is_active=True).update(is_active=False)
    
    # Crear asignaciones activas
    assignments_data = [
        {'patient_index': 0, 'device_index': 0, 'room_index': 0},  # Juan en device 1
        {'patient_index': 0, 'device_index': 1, 'room_index': 0},  # Juan en device 01 (mismo paciente)
        {'patient_index': 1, 'device_index': 2, 'room_index': 1},  # María en device 2
    ]
    
    assignments = []
    for data in assignments_data:
        assignment, _ = PatientAssignment.objects.get_or_create(
            patient=patients[data['patient_index']],
            device=devices[data['device_index']],
            is_active=True,
            defaults={
                'staff': staff_user,
                'room': rooms[data['room_index']],
                'order_limits': {'DRINK': 3, 'SNACK': 2, 'FOOD': 1},
                'survey_enabled': True,
                'can_patient_order': True,
            }
        )
        assignments.append(assignment)
    return assignments

def create_categories():
    """Crear categorías de productos"""
    print("Creando categorías...")
    categories_data = [
        {'name': 'Bebidas', 'icon': '🥤', 'category_type': 'DRINK', 'show_in_carousel': True, 'carousel_order': 1},
        {'name': 'Snacks', 'icon': '🍪', 'category_type': 'SNACK', 'show_in_carousel': True, 'carousel_order': 2},
        {'name': 'Comidas', 'icon': '🍽️', 'category_type': 'FOOD', 'show_in_carousel': True, 'carousel_order': 3},
        {'name': 'Otros', 'icon': '📦', 'category_type': 'OTHER', 'show_in_carousel': False, 'carousel_order': 4},
    ]
    categories = []
    for data in categories_data:
        category, _ = ProductCategory.objects.get_or_create(
            name=data['name'],
            defaults={
                'icon': data['icon'],
                'category_type': data['category_type'],
                'show_in_carousel': data['show_in_carousel'],
                'carousel_order': data['carousel_order'],
            }
        )
        categories.append(category)
    return categories

def create_tags():
    """Crear tags de productos"""
    print("Creando tags...")
    tags_data = [
        {'name': 'Popular', 'color': '#FF6B6B', 'icon': '🔥'},
        {'name': 'Nuevo', 'color': '#4ECDC4', 'icon': '✨'},
        {'name': 'Sin Azúcar', 'color': '#45B7D1', 'icon': '🍃'},
        {'name': 'Vegano', 'color': '#96CEB4', 'icon': '🌱'},
    ]
    tags = []
    for data in tags_data:
        tag, _ = ProductTag.objects.get_or_create(
            name=data['name'],
            defaults={'color': data['color'], 'icon': data['icon']}
        )
        tags.append(tag)
    return tags

def create_products(categories, tags):
    """Crear productos de prueba"""
    print("Creando productos...")
    
    drinks = categories[0]  # Bebidas
    snacks = categories[1]  # Snacks
    food = categories[2]    # Comidas
    
    products_data = [
        # Bebidas
        {'name': 'Agua Natural', 'category': drinks, 'unit_label': 'botella', 'description': 'Agua purificada 500ml', 'is_featured': True},
        {'name': 'Jugo de Naranja', 'category': drinks, 'unit_label': 'vaso', 'description': 'Jugo natural de naranja', 'is_featured': True},
        {'name': 'Café Americano', 'category': drinks, 'unit_label': 'taza', 'description': 'Café recién preparado'},
        {'name': 'Té Verde', 'category': drinks, 'unit_label': 'taza', 'description': 'Té verde natural'},
        {'name': 'Limonada', 'category': drinks, 'unit_label': 'vaso', 'description': 'Limonada fresca'},
        
        # Snacks
        {'name': 'Galletas Integrales', 'category': snacks, 'unit_label': 'paquete', 'description': 'Galletas de avena'},
        {'name': 'Fruta Picada', 'category': snacks, 'unit_label': 'porción', 'description': 'Mix de frutas frescas', 'is_featured': True},
        {'name': 'Yogurt Natural', 'category': snacks, 'unit_label': 'vaso', 'description': 'Yogurt sin azúcar'},
        {'name': 'Barra de Granola', 'category': snacks, 'unit_label': 'unidad', 'description': 'Barra energética'},
        
        # Comidas
        {'name': 'Sándwich de Pollo', 'category': food, 'unit_label': 'unidad', 'description': 'Sándwich con pollo a la plancha', 'price': 85.00},
        {'name': 'Ensalada César', 'category': food, 'unit_label': 'porción', 'description': 'Ensalada con aderezo césar', 'price': 75.00},
        {'name': 'Sopa del Día', 'category': food, 'unit_label': 'tazón', 'description': 'Sopa caliente del día', 'price': 55.00},
    ]
    
    products = []
    for data in products_data:
        product, created = Product.objects.get_or_create(
            name=data['name'],
            category=data['category'],
            defaults={
                'description': data['description'],
                'unit_label': data['unit_label'],
                'price': data.get('price'),
                'is_featured': data.get('is_featured', False),
                'rating': 4.5,
                'benefits': ['Saludable', 'Fresco'],
            }
        )
        if created and tags:
            # Agregar algunos tags aleatorios
            if data.get('is_featured'):
                product.tags.add(tags[0])  # Popular
        products.append(product)
    
    return products

@transaction.atomic
def run_seed():
    """Ejecutar todo el proceso de seed"""
    print("=" * 50)
    print("Iniciando población de base de datos...")
    print("=" * 50)
    
    # Crear datos
    admin_role, staff_role = create_roles()
    admin_user, staff_user = create_users(admin_role, staff_role)
    rooms = create_rooms()
    devices = create_devices(rooms, staff_user)
    patients = create_patients()
    assignments = create_patient_assignments(patients, devices, rooms, staff_user)
    categories = create_categories()
    tags = create_tags()
    products = create_products(categories, tags)
    
    print("=" * 50)
    print("¡Base de datos poblada exitosamente!")
    print("=" * 50)
    print(f"\nResumen:")
    print(f"  - Roles: {Role.objects.count()}")
    print(f"  - Usuarios: {User.objects.count()}")
    print(f"  - Habitaciones: {Room.objects.count()}")
    print(f"  - Dispositivos: {Device.objects.count()}")
    print(f"  - Pacientes: {Patient.objects.count()}")
    print(f"  - Asignaciones activas: {PatientAssignment.objects.filter(is_active=True).count()}")
    print(f"  - Categorías: {ProductCategory.objects.count()}")
    print(f"  - Productos: {Product.objects.count()}")
    print(f"\nCredenciales de prueba:")
    print(f"  Admin: admin@camsa.com / admin123")
    print(f"  Staff: staff@camsa.com / staff123")
    print(f"\nDispositivos disponibles (device_uid):")
    for d in Device.objects.all():
        print(f"  - {d.device_uid} ({d.device_type}) - Room: {d.room.code if d.room else 'N/A'}")

if __name__ == '__main__':
    run_seed()
else:
    run_seed()
