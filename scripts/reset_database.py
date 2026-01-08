"""
Script para limpiar y recrear la base de datos PostgreSQL
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

print("=" * 60)
print("RESET DE BASE DE DATOS")
print("=" * 60)
print()

# Credenciales desde .env
db_user = os.getenv('DATABASE_USER', 'postgres')
db_password = os.getenv('DATABASE_PASSWORD', '')
db_host = os.getenv('DATABASE_HOST', '127.0.0.1')
db_port = os.getenv('DATABASE_PORT', '5432')
db_name = os.getenv('DATABASE_NAME', 'clinic_service_db')

print(f"Usuario: {db_user}")
print(f"Host: {db_host}")
print(f"Puerto: {db_port}")
print(f"Base de datos: {db_name}")
print()

try:
    # Conectar a la base de datos 'postgres' (siempre existe)
    print("Conectando a PostgreSQL...")
    conn = psycopg2.connect(
        dbname='postgres',
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    print("✓ Conectado")
    print()

    # Verificar si la base de datos existe
    cursor.execute(f"""
        SELECT EXISTS(
            SELECT 1
            FROM pg_database
            WHERE datname = '{db_name}'
        );
    """)
    exists = cursor.fetchone()[0]

    if exists:
        print(f"Base de datos '{db_name}' existe. Eliminando...")

        # Terminar todas las conexiones activas
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
            AND pid <> pg_backend_pid();
        """)

        # Eliminar la base de datos
        cursor.execute(f'DROP DATABASE {db_name};')
        print(f"✓ Base de datos '{db_name}' eliminada")
    else:
        print(f"Base de datos '{db_name}' no existe")

    # Crear la base de datos limpia
    print(f"Creando base de datos '{db_name}'...")
    cursor.execute(f'CREATE DATABASE {db_name} OWNER {db_user};')
    print(f"✓ Base de datos '{db_name}' creada")

    cursor.close()
    conn.close()

    print()
    print("=" * 60)
    print("✓ RESET COMPLETADO")
    print("=" * 60)
    print()
    print("Ahora ejecuta:")
    print("  1. python manage.py makemigrations")
    print("  2. python manage.py migrate")
    print("  3. python manage.py createsuperuser")
    print()

except psycopg2.OperationalError as e:
    print(f"✗ Error de conexión: {e}")
    print()
    print("Verifica que PostgreSQL esté ejecutándose")
    print("y que las credenciales en .env sean correctas")

except Exception as e:
    print(f"✗ Error: {e}")
