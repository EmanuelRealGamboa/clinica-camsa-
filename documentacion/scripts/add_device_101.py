"""
Script para agregar el dispositivo 101.
Ejecutar con: python add_device_101.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.db import transaction
from accounts.models import User
from clinic.models import Room, Device, Patient, PatientAssignment

@transaction.atomic
def add_device_101():
    print("Agregando dispositivo 101...")
    
    # Obtener o crear habitación
    room, _ = Room.objects.get_or_create(
        code='101',
        defaults={'floor': '1', 'is_active': True}
    )
    print(f"  Habitación: {room.code}")
    
    # Obtener staff user
    staff_user = User.objects.filter(email='staff@camsa.com').first()
    if not staff_user:
        staff_user = User.objects.first()
    print(f"  Staff: {staff_user.email if staff_user else 'N/A'}")
    
    # Crear dispositivo 101
    device, created = Device.objects.get_or_create(
        device_uid='101',
        defaults={
            'device_type': 'IPAD',
            'room': room,
            'is_active': True,
        }
    )
    if staff_user:
        device.assigned_staff.add(staff_user)
    print(f"  Dispositivo 101: {'creado' if created else 'ya existía'}")
    
    # Crear paciente de prueba si no existe
    patient, _ = Patient.objects.get_or_create(
        phone_e164='+521234567899',
        defaults={
            'full_name': 'Paciente Habitación 101',
            'email': 'paciente101@email.com',
            'is_active': True,
        }
    )
    print(f"  Paciente: {patient.full_name}")
    
    # Crear asignación activa
    PatientAssignment.objects.filter(device=device, is_active=True).update(is_active=False)
    
    assignment, created = PatientAssignment.objects.get_or_create(
        patient=patient,
        device=device,
        is_active=True,
        defaults={
            'staff': staff_user,
            'room': room,
            'order_limits': {'DRINK': 3, 'SNACK': 2, 'FOOD': 1},
            'survey_enabled': False,
            'can_patient_order': True,
        }
    )
    print(f"  Asignación: {'creada' if created else 'ya existía'}")
    
    print("\n¡Dispositivo 101 configurado correctamente!")
    print(f"URL del kiosk: http://localhost:5173/kiosk/101")

if __name__ == '__main__':
    add_device_101()
