# Clinic Service API

Sistema de gestión de pedidos y satisfacción para clínicas.

## Estructura del Proyecto

```
clinic_service/
├── accounts/       # Gestión de usuarios y autenticación
├── clinic/         # Datos de clínica y habitaciones
├── catalog/        # Catálogo de productos y categorías
├── inventory/      # Control de inventario
├── orders/         # Gestión de pedidos
├── feedback/       # Sistema de retroalimentación
├── reports/        # Reportes y analíticas
└── common/         # Utilidades compartidas
```

## Requisitos Previos

- Python 3.13+
- PostgreSQL 13+
- pip

## Configuración Inicial

### 1. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
DATABASE_URL=postgresql://usuario:password@localhost:5432/clinic_service_db
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Crear Base de Datos PostgreSQL

Tienes varias opciones para crear la base de datos:

#### Opción 1: Usando pgAdmin (Recomendado para Windows)

1. Abre pgAdmin
2. Conecta al servidor PostgreSQL (localhost:5432)
3. Click derecho en "Databases" → "Create" → "Database..."
4. Nombre: `clinic_service_db`
5. Owner: `postgres`
6. Click "Save"

#### Opción 2: Usando el script SQL

Ejecuta el archivo `create_database.sql` desde pgAdmin:
1. Abre pgAdmin
2. Click derecho en el servidor PostgreSQL
3. "Query Tool"
4. Abre el archivo `create_database.sql` o copia su contenido
5. Ejecuta (F5)

#### Opción 3: Línea de comandos (psql)

```bash
# Conectar a PostgreSQL
psql -U postgres -h localhost -p 5432

# Crear la base de datos
CREATE DATABASE clinic_service_db OWNER postgres;

# Salir
\q
```

### 4. Ejecutar Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear Superusuario (Opcional)

```bash
python manage.py createsuperuser
```

## Comandos Útiles

### Ejecutar Servidor de Desarrollo

```bash
python manage.py runserver
```

El servidor se ejecutará en `http://127.0.0.1:8000/`

### Ejecutar Migraciones

```bash
# Crear nuevas migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Ver migraciones pendientes
python manage.py showmigrations
```

### Crear una Nueva App

```bash
python manage.py startapp nombre_app
```

### Recolectar Archivos Estáticos

```bash
python manage.py collectstatic
```

### Abrir Shell de Django

```bash
python manage.py shell
```

## Endpoints Disponibles

### Health Check

```
GET /api/health
```

Respuesta:
```json
{
  "status": "ok"
}
```

### Admin Panel

```
http://127.0.0.1:8000/admin/
```

## Configuración

### Django REST Framework

- **Autenticación**: JWT + Session
- **Permisos por defecto**: IsAuthenticated
- **Paginación**: 50 items por página

### CORS

- **Orígenes permitidos**: Configurado via `.env`
- **Credenciales**: Habilitadas
- **Métodos**: GET, POST, PUT, PATCH, DELETE, OPTIONS

## Base de Datos

El proyecto está configurado para usar PostgreSQL en producción y puede usar SQLite como fallback para desarrollo local.

Para cambiar entre bases de datos, modifica la variable `DATABASE_URL` en el archivo `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# SQLite (comentar o eliminar DATABASE_URL para usar SQLite)
# DATABASE_URL=
```

## Estructura de Apps

- **accounts**: Gestión de usuarios, autenticación y permisos
- **clinic**: Información de la clínica, habitaciones y configuración
- **catalog**: Catálogo de productos, categorías y precios
- **inventory**: Control de stock e inventario
- **orders**: Gestión de pedidos y estados
- **feedback**: Sistema de retroalimentación y calificaciones
- **reports**: Generación de reportes y estadísticas
- **common**: Modelos base, utilidades y helpers compartidos

## Desarrollo

### Agregar un Nuevo Endpoint

1. Crea una vista en `views.py` de la app correspondiente
2. Crea un serializer si es necesario
3. Registra la URL en `urls.py` de la app
4. Incluye las URLs en `clinic_service/urls.py` con prefijo `/api/`

### Buenas Prácticas

- Usar serializers de DRF para validación
- Mantener lógica de negocio en los modelos
- Usar ViewSets para CRUD completo
- Documentar endpoints importantes
- Escribir tests para funcionalidad crítica

## Testing

```bash
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de una app específica
python manage.py test nombre_app

# Con cobertura
coverage run --source='.' manage.py test
coverage report
```

## Troubleshooting

### Error: No module named 'rest_framework'

```bash
pip install djangorestframework
```

### Error: No module named 'corsheaders'

```bash
pip install django-cors-headers
```

### Error de conexión a PostgreSQL

Verifica que:
1. PostgreSQL esté ejecutándose
2. Las credenciales en `.env` sean correctas
3. La base de datos exista

### Puerto 8000 ya en uso

```bash
# Usa un puerto diferente
python manage.py runserver 8080
```

## Próximos Pasos

1. Definir modelos en cada app
2. Crear serializers para las APIs
3. Implementar ViewSets y URLs
4. Configurar autenticación JWT
5. Implementar WebSockets para tiempo real
6. Agregar tests unitarios e integración
