# Configuración de Base de Datos

## Credenciales PostgreSQL Configuradas

### Información de Conexión
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: 7444712868*eM
- **Base de datos**: clinic_service_db

## Configuración en Archivos

### 1. Archivo `.env` (Configurado)

El archivo [.env](.env) ya tiene las credenciales configuradas de dos formas:

#### Opción 1: Connection String (En uso)
```env
DATABASE_URL=postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db
```

#### Opción 2: Credenciales Individuales (Disponible como respaldo)
```env
DATABASE_NAME=clinic_service_db
DATABASE_USER=postgres
DATABASE_PASSWORD=7444712868*eM
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### 2. Archivo `settings.py` (Configurado)

El archivo [clinic_service/settings.py](clinic_service/settings.py) está configurado para usar las credenciales en el siguiente orden de prioridad:

1. **DATABASE_URL** (si existe) - Usa la connection string completa
2. **Credenciales individuales** (si DATABASE_NAME existe) - Usa DATABASE_NAME, DATABASE_USER, etc.
3. **SQLite** (fallback) - Si no hay variables de PostgreSQL configuradas

## Configuración Actual

Actualmente, el proyecto está usando:
- ✅ **DATABASE_URL** con PostgreSQL
- ✅ Credenciales: `postgres:7444712868*eM@localhost:5432/clinic_service_db`

## Verificar Configuración

### Verificar que Django detecta PostgreSQL:

```bash
python manage.py check --database default
```

### Verificar variables de entorno:

```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
```

## Cambiar Entre Configuraciones

### Usar Connection String (Actual):
En `.env`, mantén:
```env
DATABASE_URL=postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db
```

### Usar Credenciales Individuales:
En `.env`, comenta DATABASE_URL y usa:
```env
# DATABASE_URL=postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db

DATABASE_NAME=clinic_service_db
DATABASE_USER=postgres
DATABASE_PASSWORD=7444712868*eM
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Usar SQLite (Desarrollo):
En `.env`, comenta todas las variables de PostgreSQL:
```env
# DATABASE_URL=postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db
# DATABASE_NAME=clinic_service_db
# DATABASE_USER=postgres
# etc...
```

## Próximos Pasos

1. **Crear la base de datos** (si aún no existe):
   - Sigue las instrucciones en [SETUP_DATABASE.md](SETUP_DATABASE.md)

2. **Ejecutar migraciones**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Verificar conexión**:
   ```bash
   python manage.py dbshell
   ```

4. **Crear superusuario**:
   ```bash
   python manage.py createsuperuser
   ```

## Troubleshooting

### Error: "role does not exist"
Si ves un error sobre el rol "postgres", crea el usuario:
```sql
CREATE USER postgres WITH PASSWORD '7444712868*eM';
ALTER USER postgres WITH SUPERUSER;
```

### Error: "database does not exist"
Crea la base de datos siguiendo [SETUP_DATABASE.md](SETUP_DATABASE.md)

### Error: "password authentication failed"
Verifica que la contraseña en `.env` sea correcta: `7444712868*eM`

### Verificar que PostgreSQL está corriendo
En Windows:
1. Win + R
2. Escribe `services.msc`
3. Busca "postgresql-x64-13" (o tu versión)
4. Debe estar "En ejecución"

## Seguridad

⚠️ **IMPORTANTE**:
- El archivo `.env` contiene credenciales sensibles
- Nunca subas `.env` a git (ya está en `.gitignore`)
- En producción, usa variables de entorno del sistema o un gestor de secretos
- Cambia las credenciales en producción

## Resumen de Archivos

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `.env` | Credenciales activas | ✅ Configurado |
| `.env.example` | Plantilla de ejemplo | ✅ Actualizado |
| `settings.py` | Configuración de Django | ✅ Configurado |
| `create_database.sql` | Script SQL para crear BD | ✅ Disponible |
| `SETUP_DATABASE.md` | Guía paso a paso | ✅ Disponible |

Todo está listo para conectar a PostgreSQL. Solo falta crear la base de datos y ejecutar las migraciones.
