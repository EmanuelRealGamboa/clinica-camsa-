# Configuración de Base de Datos PostgreSQL

Este documento detalla cómo configurar PostgreSQL para el proyecto Clinic Service.

## Credenciales de Conexión

- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: 7444712868*eM
- **Base de datos**: clinic_service_db

## Paso a Paso: Crear Base de Datos

### Opción 1: Usando pgAdmin (Más Fácil)

1. **Abrir pgAdmin**
   - Inicia pgAdmin desde el menú de inicio de Windows

2. **Conectar al Servidor**
   - En el panel izquierdo, expande "Servers"
   - Click en "PostgreSQL 13" (o tu versión)
   - Introduce la contraseña: `7444712868*eM`

3. **Crear la Base de Datos**
   - Click derecho en "Databases"
   - Selecciona "Create" → "Database..."
   - En el diálogo:
     - **Database**: `clinic_service_db`
     - **Owner**: `postgres`
   - Click en "Save"

4. **Verificar Creación**
   - Deberías ver `clinic_service_db` en la lista de bases de datos

### Opción 2: Usando Query Tool en pgAdmin

1. **Abrir Query Tool**
   - En pgAdmin, click derecho en "PostgreSQL 13"
   - Selecciona "Query Tool"

2. **Ejecutar Script SQL**
   - Copia y pega el siguiente comando:
   ```sql
   CREATE DATABASE clinic_service_db
       WITH
       OWNER = postgres
       ENCODING = 'UTF8'
       CONNECTION LIMIT = -1;
   ```

3. **Ejecutar**
   - Click en el botón "Execute/Refresh" (⚡ o F5)
   - Deberías ver el mensaje "CREATE DATABASE"

### Opción 3: Línea de Comandos (psql)

1. **Abrir Terminal/CMD**
   - Presiona `Win + R`, escribe `cmd`, Enter

2. **Conectar a PostgreSQL**
   ```bash
   psql -U postgres -h localhost -p 5432
   ```
   - Introduce la contraseña cuando se solicite: `7444712868*eM`

3. **Crear Base de Datos**
   ```sql
   CREATE DATABASE clinic_service_db OWNER postgres;
   ```

4. **Verificar**
   ```sql
   \l
   ```
   - Deberías ver `clinic_service_db` en la lista

5. **Salir**
   ```sql
   \q
   ```

## Verificar Conexión desde Django

Una vez creada la base de datos, verifica la conexión:

1. **Verificar archivo .env**
   ```env
   DATABASE_URL=postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db
   ```

2. **Probar conexión**
   ```bash
   python manage.py check --database default
   ```

3. **Crear tablas (migraciones)**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

## Verificar que la Base de Datos Existe

### Desde pgAdmin:
- Expande "Servers" → "PostgreSQL 13" → "Databases"
- Busca `clinic_service_db`

### Desde línea de comandos:
```bash
psql -U postgres -h localhost -p 5432 -l
```

Deberías ver una lista que incluye `clinic_service_db`.

## Problemas Comunes

### Error: "database does not exist"
**Solución**: La base de datos no fue creada. Sigue los pasos anteriores para crearla.

### Error: "FATAL: password authentication failed"
**Solución**:
- Verifica que la contraseña en `.env` sea correcta: `7444712868*eM`
- Verifica que el usuario sea `postgres`

### Error: "could not connect to server"
**Solución**:
- Verifica que PostgreSQL esté ejecutándose:
  - Abre "Servicios" de Windows (`Win + R` → `services.msc`)
  - Busca "postgresql-x64-13" (o tu versión)
  - Asegúrate que el estado sea "En ejecución"

### Error: "port 5432 is already in use"
**Solución**: PostgreSQL ya está ejecutándose en ese puerto, esto es normal.

### Error: "psycopg2" related errors
**Solución**: Reinstala el driver:
```bash
pip install --upgrade psycopg2-binary
```

## Conexión String Format

La URL de conexión tiene el siguiente formato:
```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_bd]
```

Para este proyecto:
```
postgresql://postgres:7444712868*eM@localhost:5432/clinic_service_db
```

## Comandos Útiles de PostgreSQL

### Ver todas las bases de datos:
```sql
\l
```

### Conectar a una base de datos:
```sql
\c clinic_service_db
```

### Ver todas las tablas:
```sql
\dt
```

### Ver estructura de una tabla:
```sql
\d nombre_tabla
```

### Eliminar base de datos (⚠️ Cuidado):
```sql
DROP DATABASE clinic_service_db;
```

## Respaldo y Restauración

### Crear respaldo:
```bash
pg_dump -U postgres -h localhost -p 5432 clinic_service_db > backup.sql
```

### Restaurar desde respaldo:
```bash
psql -U postgres -h localhost -p 5432 clinic_service_db < backup.sql
```

## Próximos Pasos

Una vez que la base de datos esté creada y Django pueda conectarse:

1. Ejecutar migraciones iniciales
2. Crear un superusuario para el admin
3. Iniciar el servidor de desarrollo
4. Acceder al endpoint de health check

Ver [README.md](README.md) para instrucciones detalladas.
