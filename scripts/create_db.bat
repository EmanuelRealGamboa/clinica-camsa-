@echo off
echo ========================================
echo Creando Base de Datos PostgreSQL
echo ========================================
echo.
echo Base de datos: clinic_service_db
echo Usuario: postgres
echo Host: localhost
echo Puerto: 5432
echo.
echo Se te pedira la contraseña de PostgreSQL...
echo.

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE clinic_service_db OWNER postgres;"

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo crear la base de datos
    echo.
    echo Posibles causas:
    echo 1. PostgreSQL no esta ejecutandose
    echo 2. La base de datos ya existe
    echo 3. Credenciales incorrectas
    echo 4. psql no esta en el PATH
    echo.
    echo Por favor, crea la base de datos manualmente usando pgAdmin:
    echo 1. Abre pgAdmin
    echo 2. Click derecho en "Databases"
    echo 3. Create -^> Database...
    echo 4. Nombre: clinic_service_db
    echo 5. Owner: postgres
    echo 6. Save
    echo.
) else (
    echo.
    echo [SUCCESS] Base de datos creada correctamente!
    echo.
    echo Ahora puedes ejecutar:
    echo   python manage.py migrate
    echo.
)

pause
