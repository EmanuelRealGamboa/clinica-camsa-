import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Configuración del superusuario
email = 'admin@clinicacamsa.com'
password = 'Admin123456!'
full_name = 'Administrador CAMSA'

# Verificar si el usuario ya existe
if User.objects.filter(email=email).exists():
    print(f'El usuario {email} ya existe.')
else:
    # Crear superusuario
    user = User.objects.create_superuser(
        email=email,
        password=password,
        full_name=full_name
    )
    print(f'Superusuario creado exitosamente!')
    print(f'Email: {email}')
    print(f'Password: {password}')
    print(f'Nombre: {full_name}')
