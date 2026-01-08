"""
Script para verificar la conexión a PostgreSQL y listar bases de datos
"""
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

print("=" * 60)
print("TEST DE CONEXIÓN A POSTGRESQL")
print("=" * 60)
print()

# Credenciales desde .env
db_user = os.getenv('DATABASE_USER', 'postgres')
db_password = os.getenv('DATABASE_PASSWORD', '')
db_host = os.getenv('DATABASE_HOST', '127.0.0.1')
db_port = os.getenv('DATABASE_PORT', '5432')

print(f"Usuario: {db_user}")
print(f"Host: {db_host}")
print(f"Puerto: {db_port}")
print()

# Intentar conectar a la base de datos 'postgres' (siempre existe)
try:
    print("Intentando conectar a PostgreSQL...")
    conn = psycopg2.connect(
        dbname='postgres',  # Base de datos por defecto
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )
    print("✓ Conexión exitosa!")
    print()

    # Listar todas las bases de datos
    cursor = conn.cursor()
    cursor.execute("""
        SELECT datname
        FROM pg_database
        WHERE datistemplate = false
        ORDER BY datname;
    """)

    databases = cursor.fetchall()

    print("Bases de datos disponibles:")
    print("-" * 60)
    for db in databases:
        print(f"  - {db[0]}")
    print()

    # Verificar si existe clinic_service_db
    cursor.execute("""
        SELECT EXISTS(
            SELECT 1
            FROM pg_database
            WHERE datname = 'clinic_service_db'
        );
    """)
    exists = cursor.fetchone()[0]

    if exists:
        print("✓ La base de datos 'clinic_service_db' EXISTE")
    else:
        print("✗ La base de datos 'clinic_service_db' NO EXISTE")
        print()
        print("Creando la base de datos...")

        # Cerrar la transacción actual
        conn.commit()
        conn.set_isolation_level(0)  # Autocommit mode

        cursor.execute("CREATE DATABASE clinic_service_db OWNER postgres;")
        print("✓ Base de datos 'clinic_service_db' creada!")

    cursor.close()
    conn.close()

    print()
    print("=" * 60)
    print("Ahora intenta ejecutar: python manage.py migrate")
    print("=" * 60)

except psycopg2.OperationalError as e:
    print(f"✗ Error de conexión: {e}")
    print()
    print("Posibles soluciones:")
    print("1. Verifica que PostgreSQL esté ejecutándose")
    print("2. Verifica las credenciales en el archivo .env")
    print("3. Verifica que el puerto 5432 sea el correcto")
    print("4. En pgAdmin, verifica en qué puerto está corriendo PostgreSQL")

except Exception as e:
    print(f"✗ Error inesperado: {e}")
