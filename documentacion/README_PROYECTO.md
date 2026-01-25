# Clinic Service API

Sistema de gestión de pedidos y satisfacción para clínicas.

## 📁 Estructura del Proyecto

```
clinic_service/
├── accounts/           # Custom User, Roles, JWT Auth
├── clinic/             # Rooms, Patients, Devices  ✅
├── catalog/            # Products, Categories
├── inventory/          # Stock management
├── orders/             # Orders, OrderItems
├── feedback/           # Ratings, Comments
├── reports/            # Analytics
├── common/             # Shared utilities
├── documentacion/      # 📚 Toda la documentación
└── scripts/            # 🔧 Scripts de utilidad
```

## 🚀 Quick Start

### 1. Setup

```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar migraciones
python manage.py migrate

# Crear roles
python manage.py seed_roles

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### 2. Acceso

- **API**: http://127.0.0.1:8000/api/
- **Admin**: http://127.0.0.1:8000/admin/
- **Health**: http://127.0.0.1:8000/api/health

## 📡 Endpoints Disponibles

### Authentication (`/api/auth/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con email + password |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Clinic (`/api/clinic/`)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/clinic/rooms/` | Listar habitaciones | Staff/Admin |
| POST | `/api/clinic/rooms/` | Crear habitación | Staff/Admin |
| GET | `/api/clinic/rooms/{id}/` | Obtener habitación | Staff/Admin |
| PUT/PATCH | `/api/clinic/rooms/{id}/` | Actualizar habitación | Staff/Admin |
| DELETE | `/api/clinic/rooms/{id}/` | Eliminar habitación | Staff/Admin |
| | | |
| GET | `/api/clinic/patients/` | Listar pacientes | Staff/Admin |
| POST | `/api/clinic/patients/` | Crear paciente | Staff/Admin |
| GET | `/api/clinic/patients/{id}/` | Obtener paciente | Staff/Admin |
| PUT/PATCH | `/api/clinic/patients/{id}/` | Actualizar paciente | Staff/Admin |
| DELETE | `/api/clinic/patients/{id}/` | Eliminar paciente | Staff/Admin |
| | | |
| GET | `/api/clinic/devices/` | Listar dispositivos | Staff/Admin |
| POST | `/api/clinic/devices/` | Crear dispositivo | Staff/Admin |
| GET | `/api/clinic/devices/{id}/` | Obtener dispositivo | Staff/Admin |
| PUT/PATCH | `/api/clinic/devices/{id}/` | Actualizar dispositivo | Staff/Admin |
| DELETE | `/api/clinic/devices/{id}/` | Eliminar dispositivo | Staff/Admin |

### Catalog - Staff (`/api/catalog/`)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/catalog/categories/` | Listar categorías | Staff/Admin |
| POST | `/api/catalog/categories/` | Crear categoría | Staff/Admin |
| GET | `/api/catalog/categories/{id}/` | Obtener categoría | Staff/Admin |
| PUT/PATCH | `/api/catalog/categories/{id}/` | Actualizar categoría | Staff/Admin |
| DELETE | `/api/catalog/categories/{id}/` | Eliminar categoría | Staff/Admin |
| | | |
| GET | `/api/catalog/products/` | Listar productos | Staff/Admin |
| POST | `/api/catalog/products/` | Crear producto | Staff/Admin |
| GET | `/api/catalog/products/{id}/` | Obtener producto | Staff/Admin |
| PUT/PATCH | `/api/catalog/products/{id}/` | Actualizar producto | Staff/Admin |
| DELETE | `/api/catalog/products/{id}/` | Eliminar producto | Staff/Admin |

### Inventory (`/api/inventory/`)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/inventory/balances/` | Listar balances de inventario | Staff/Admin |
| GET | `/api/inventory/balances/{id}/` | Obtener balance específico | Staff/Admin |
| POST | `/api/inventory/stock/receipt` | Recibir stock (aumentar) | Staff/Admin |
| POST | `/api/inventory/stock/adjust` | Ajustar stock (+/-) | Staff/Admin |

### Public - Kiosk (`/api/public/`)

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/public/categories/` | Listar categorías activas | Público |
| GET | `/api/public/categories/{id}/` | Obtener categoría activa | Público |
| GET | `/api/public/products/` | Listar productos activos | Público |
| GET | `/api/public/products/{id}/` | Obtener producto activo | Público |

## 📚 Documentación

Toda la documentación está en la carpeta [`documentacion/`](documentacion/)

| Documento | Descripción |
|-----------|-------------|
| [JWT_AUTH_GUIDE.md](documentacion/JWT_AUTH_GUIDE.md) | Guía de autenticación JWT |
| [ROLES_SYSTEM.md](documentacion/ROLES_SYSTEM.md) | Sistema de roles y permisos |
| [CUSTOM_USER_SETUP.md](documentacion/CUSTOM_USER_SETUP.md) | Setup del custom user |
| [CLINIC_API.md](documentacion/CLINIC_API.md) | API de Clinic (Rooms, Patients, Devices) |
| [CATALOG_API.md](documentacion/CATALOG_API.md) | API de Catalog (Categories, Products) |
| [INVENTORY_API.md](documentacion/INVENTORY_API.md) | API de Inventory (Stock, Balances) |
| [ADMIN_TESTING_GUIDE.md](documentacion/ADMIN_TESTING_GUIDE.md) | Guía de testing en admin |
| [INSTALL.md](documentacion/INSTALL.md) | Guía de instalación completa |
| [DATABASE_CONFIG.md](documentacion/DATABASE_CONFIG.md) | Configuración de base de datos |
| [SETUP_DATABASE.md](documentacion/SETUP_DATABASE.md) | Setup detallado de PostgreSQL |

## 🔧 Scripts

Scripts de utilidad en la carpeta [`scripts/`](scripts/)

| Script | Descripción |
|--------|-------------|
| [test_db_connection.py](scripts/test_db_connection.py) | Probar conexión a PostgreSQL |
| [reset_database.py](scripts/reset_database.py) | Limpiar y recrear BD |
| [setup_venv.bat](scripts/setup_venv.bat) | Setup entorno virtual (Windows) |
| [setup_venv.sh](scripts/setup_venv.sh) | Setup entorno virtual (Linux/Mac) |
| [fix_venv.bat](scripts/fix_venv.bat) | Reparar entorno virtual (Windows) |
| [fix_venv.sh](scripts/fix_venv.sh) | Reparar entorno virtual (Linux/Mac) |
| [create_database.sql](scripts/create_database.sql) | Script SQL para crear BD |

## 🔑 Variables de Entorno

Archivo `.env`:

```env
# Django
SECRET_KEY=tu-secret-key
DEBUG=True

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/clinic_service_db

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🏗️ Modelos Principales

### Accounts App

- **User** - Custom user con email como identificador
- **Role** - Roles (ADMIN, STAFF)
- **UserRole** - Asignación de roles a usuarios

### Clinic App ✅

- **Room** - Habitaciones del hospital
  - `code` (unique), `floor`, `is_active`
- **Patient** - Pacientes
  - `full_name`, `phone_e164`, `is_active`
- **Device** - Dispositivos (iPads, Web)
  - `device_uid` (unique), `device_type` (IPAD/WEB/OTHER), `last_seen_at`

### Catalog App ✅

- **ProductCategory** - Categorías de productos
  - `name` (unique), `sort_order`, `is_active`
- **Product** - Productos del catálogo
  - `category` (FK), `name`, `description`, `image_url`, `sku` (unique, nullable), `unit_label`, `is_active`

### Inventory App ✅

- **InventoryBalance** - Balance actual de inventario (OneToOne con Product)
  - `product` (OneToOne), `on_hand`, `reserved`, `reorder_level` (nullable)
- **InventoryMovement** - Historial de movimientos
  - `product` (FK), `movement_type` (ENUM), `quantity`, `order` (FK nullable), `created_by` (FK nullable), `note`, `created_at`

## 🔐 Autenticación

### JWT Tokens

```bash
# 1. Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "roles": ["STAFF"]
  }
}

# 2. Usar access token
curl -X GET http://127.0.0.1:8000/api/clinic/rooms/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador | Acceso total |
| **STAFF** | Personal de clínica | Acceso a clinic endpoints |
| **USER** | Usuario básico | Acceso limitado |

**Permission Classes:**
- `IsStaffOrAdmin` - Requiere rol STAFF o ADMIN
- `IsAdmin` - Solo ADMIN
- `IsStaff` - STAFF o ADMIN

## 🧪 Testing

### Con cURL

```bash
# Health check
curl http://127.0.0.1:8000/api/health

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@clinic.com", "password": "password"}'

# Crear habitación
curl -X POST http://127.0.0.1:8000/api/clinic/rooms/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "101", "floor": "1", "is_active": true}'
```

### Desde Admin

1. Login: http://127.0.0.1:8000/admin/
2. Secciones disponibles:
   - **ACCOUNTS**: Users, Roles, User roles
   - **CLINIC**: Rooms, Patients, Devices

Ver [ADMIN_TESTING_GUIDE.md](documentacion/ADMIN_TESTING_GUIDE.md) para más detalles.

## 📦 Dependencias

```
Django==5.2.3
djangorestframework==3.16.0
djangorestframework-simplejwt==5.5.1
django-cors-headers==4.9.0
django-filter==24.3
python-dotenv==1.1.1
psycopg2-binary==2.9.10
dj-database-url==3.0.1
```

## 🛠️ Comandos Útiles

```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Crear roles
python manage.py seed_roles

# Crear superusuario
python manage.py createsuperuser

# Servidor
python manage.py runserver

# Shell
python manage.py shell

# Colectar estáticos
python manage.py collectstatic
```

## 🗂️ Estructura Completa

```
camsa-project/
├── accounts/
│   ├── models.py           # User, Role, UserRole
│   ├── serializers.py      # User, Login serializers
│   ├── views.py            # login, me, logout
│   ├── permissions.py      # IsStaffOrAdmin, IsAdmin
│   ├── admin.py            # Admin interfaces
│   └── management/
│       └── commands/
│           └── seed_roles.py
├── clinic/
│   ├── models.py           # Room, Patient, Device
│   ├── serializers.py      # Serializers con validaciones
│   ├── views.py            # ViewSets con permisos
│   ├── urls.py             # Router con endpoints
│   └── admin.py            # Admin interfaces
├── clinic_service/
│   ├── settings.py         # Configuración completa
│   └── urls.py             # URLs principales
├── documentacion/          # 📚 Toda la documentación
│   ├── JWT_AUTH_GUIDE.md
│   ├── ROLES_SYSTEM.md
│   ├── CLINIC_API.md
│   └── ...
├── scripts/                # 🔧 Scripts de utilidad
│   ├── test_db_connection.py
│   ├── reset_database.py
│   └── ...
├── .env                    # Variables de entorno
├── requirements.txt        # Dependencias
└── manage.py
```

## ✅ Estado del Proyecto

| Feature | Estado |
|---------|--------|
| Django Setup | ✅ |
| PostgreSQL | ✅ |
| Custom User (email-based) | ✅ |
| JWT Authentication | ✅ |
| Roles System | ✅ |
| Clinic Models (Room, Patient, Device) | ✅ |
| Clinic CRUD API | ✅ |
| Catalog Models (Category, Product) | ✅ |
| Catalog Staff API | ✅ |
| Catalog Public API (Kiosk) | ✅ |
| Inventory Models (Balance, Movement) | ✅ |
| Inventory API (Transaccional) | ✅ |
| Admin Interfaces | ✅ |
| Permissions (IsStaffOrAdmin) | ✅ |
| Documentation | ✅ |
| | |
| Orders System | 🔜 Pendiente |
| Feedback System | 🔜 Pendiente |
| WebSocket (Real-time) | 🔜 Pendiente |

## 📝 Notas

- El proyecto usa email como identificador único (no username)
- JWT tokens expiran en 1 hora (access) y 7 días (refresh)
- Todos los endpoints de `/api/clinic/` requieren autenticación
- Phone validation: formato E.164 (+525512345678)
- Las migraciones deben ejecutarse antes de usar la API

## 🐛 Troubleshooting

Ver documentación específica:
- Problemas de instalación: [INSTALL.md](documentacion/INSTALL.md)
- Problemas de BD: [DATABASE_CONFIG.md](documentacion/DATABASE_CONFIG.md)
- Problemas de JWT: [JWT_AUTH_GUIDE.md](documentacion/JWT_AUTH_GUIDE.md)

## 📞 Soporte

Para reportar issues o contribuir:
1. Revisa la documentación en [`documentacion/`](documentacion/)
2. Consulta los scripts en [`scripts/`](scripts/)
3. Revisa los ejemplos en cada guía

---

**Versión:** 0.1.0
**Última actualización:** Diciembre 2024
