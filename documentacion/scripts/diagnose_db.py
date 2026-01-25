import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("DATABASE DIAGNOSTICS")
print("=" * 60)

# Check database connection
print("\n1. Database Connection Info:")
print(f"   Database Name: {connection.settings_dict['NAME']}")
print(f"   Database User: {connection.settings_dict['USER']}")
print(f"   Database Host: {connection.settings_dict['HOST']}")
print(f"   Database Port: {connection.settings_dict['PORT']}")

# Check search path
print("\n2. PostgreSQL Search Path:")
with connection.cursor() as cursor:
    cursor.execute("SHOW search_path;")
    search_path = cursor.fetchone()
    print(f"   Search Path: {search_path[0]}")

# Check if tables exist in public schema
print("\n3. Tables in 'public' schema:")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename LIKE 'accounts_%'
        ORDER BY tablename;
    """)
    tables = cursor.fetchall()
    if tables:
        for table in tables:
            print(f"   ✓ {table[0]}")
    else:
        print("   ⚠ No accounts_* tables found in public schema")

# Check all schemas
print("\n4. All schemas in database:")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT schema_name
        FROM information_schema.schemata
        ORDER BY schema_name;
    """)
    schemas = cursor.fetchall()
    for schema in schemas:
        print(f"   - {schema[0]}")

# Check accounts_user in all schemas
print("\n5. Looking for accounts_user in all schemas:")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE tablename = 'accounts_user';
    """)
    locations = cursor.fetchall()
    if locations:
        for schema, table in locations:
            print(f"   ✓ Found in schema: {schema}")
    else:
        print("   ⚠ accounts_user table not found in any schema")

# Try to query User model
print("\n6. Attempting to query User model:")
try:
    count = User.objects.count()
    print(f"   ✓ Successfully queried User model")
    print(f"   ✓ Total users: {count}")

    if count > 0:
        print("\n   Users in database:")
        for user in User.objects.all()[:10]:
            print(f"     - {user.email} (superuser: {user.is_superuser}, staff: {user.is_staff})")
except Exception as e:
    print(f"   ✗ Error querying User model: {e}")

# Check Django migrations
print("\n7. Django migrations status:")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT app, name
        FROM django_migrations
        WHERE app = 'accounts'
        ORDER BY applied DESC
        LIMIT 5;
    """)
    migrations = cursor.fetchall()
    if migrations:
        print("   Recent accounts migrations:")
        for app, name in migrations:
            print(f"     ✓ {app}.{name}")
    else:
        print("   ⚠ No accounts migrations found")

# Check table ownership
print("\n8. Table ownership:")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT tablename, tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename LIKE 'accounts_%'
        ORDER BY tablename;
    """)
    tables = cursor.fetchall()
    if tables:
        for table, owner in tables:
            print(f"   {table}: owned by {owner}")

# Check current user permissions
print("\n9. Current database user permissions:")
with connection.cursor() as cursor:
    cursor.execute("SELECT current_user;")
    current_user = cursor.fetchone()[0]
    print(f"   Current user: {current_user}")

    cursor.execute("""
        SELECT has_table_privilege(%s, 'accounts_user', 'SELECT') as can_select,
               has_table_privilege(%s, 'accounts_user', 'INSERT') as can_insert,
               has_table_privilege(%s, 'accounts_user', 'UPDATE') as can_update;
    """, [current_user, current_user, current_user])
    perms = cursor.fetchone()
    if perms:
        print(f"   SELECT permission: {perms[0]}")
        print(f"   INSERT permission: {perms[1]}")
        print(f"   UPDATE permission: {perms[2]}")

print("\n" + "=" * 60)
print("DIAGNOSTICS COMPLETE")
print("=" * 60)
