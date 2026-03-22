# Clinic API - Documentación

## ✅ Implementación Completada

Se ha implementado un CRUD completo para los modelos de la app `clinic` usando ViewSets de Django REST Framework.

### Modelos Implementados

1. **Room** - Habitaciones del hospital
2. **Patient** - Pacientes
3. **Device** - Dispositivos (iPads, Web browsers)

---

## 📋 Modelos

### Room Model

```python
class Room(models.Model):
    code = CharField(max_length=50, unique=True)  # Código único de habitación
    floor = CharField(max_length=20, blank=True, null=True)  # Piso
    is_active = BooleanField(default=True)  # Activa/Inactiva
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Ejemplo:**
```json
{
  "id": 1,
  "code": "101",
  "floor": "1",
  "is_active": true,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

### Patient Model

```python
class Patient(models.Model):
    full_name = CharField(max_length=255)  # Nombre completo
    phone_e164 = CharField(max_length=20)  # Teléfono en formato E.164
    is_active = BooleanField(default=True)  # Activo/Inactivo
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Validación de teléfono:**
- Debe empezar con `+`
- Solo puede contener `+` y dígitos
- Entre 7 y 15 dígitos después del `+`
- Formato E.164: `+1234567890`

**Ejemplo:**
```json
{
  "id": 1,
  "full_name": "Juan Pérez",
  "phone_e164": "+525512345678",
  "is_active": true,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

### Device Model

```python
class Device(models.Model):
    device_uid = CharField(max_length=255, unique=True)  # UID único del dispositivo
    device_type = CharField(choices=['IPAD', 'WEB', 'OTHER'])  # Tipo de dispositivo
    is_active = BooleanField(default=True)  # Activo/Inactivo
    last_seen_at = DateTimeField(null=True, blank=True)  # Última vez visto
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Tipos de dispositivo:**
- `IPAD` - iPad
- `WEB` - Web Browser
- `OTHER` - Otro

**Ejemplo:**
```json
{
  "id": 1,
  "device_uid": "ipad-room-101",
  "device_type": "IPAD",
  "device_type_display": "iPad",
  "is_active": true,
  "last_seen_at": "2024-01-15T14:30:00.000Z",
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

---

## 🔐 Permisos

**Todos los endpoints requieren:**
- ✅ Usuario autenticado
- ✅ Rol **STAFF** o **ADMIN**

**Permission Class:** `IsStaffOrAdmin`

**Headers requeridos:**
```
Authorization: Bearer <access_token>
```

---

## 📡 Endpoints

### Room Endpoints

Base URL: `/api/clinic/rooms`

#### 1. Listar Habitaciones

**GET** `/api/clinic/rooms/`

**Response:**
```json
[
  {
    "id": 1,
    "code": "101",
    "floor": "1",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "code": "102",
    "floor": "1",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Filtros disponibles:**
- `?is_active=true` - Filtrar por estado
- `?floor=1` - Filtrar por piso
- `?search=101` - Buscar por código o piso
- `?ordering=code` - Ordenar por código
- `?ordering=-created_at` - Ordenar por fecha (descendente)

**Ejemplos:**
```bash
GET /api/clinic/rooms/?is_active=true
GET /api/clinic/rooms/?floor=1
GET /api/clinic/rooms/?search=101
GET /api/clinic/rooms/?ordering=code
```

#### 2. Obtener Habitación

**GET** `/api/clinic/rooms/{id}/`

**Response:**
```json
{
  "id": 1,
  "code": "101",
  "floor": "1",
  "is_active": true,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

#### 3. Crear Habitación

**POST** `/api/clinic/rooms/`

**Request:**
```json
{
  "code": "103",
  "floor": "1",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "code": "103",
  "floor": "1",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

#### 4. Actualizar Habitación

**PUT** `/api/clinic/rooms/{id}/`

**Request:**
```json
{
  "code": "103",
  "floor": "2",
  "is_active": true
}
```

**PATCH** `/api/clinic/rooms/{id}/` (Actualización parcial)

**Request:**
```json
{
  "is_active": false
}
```

#### 5. Eliminar Habitación

**DELETE** `/api/clinic/rooms/{id}/`

**Response (204):** No content

---

### Patient Endpoints

Base URL: `/api/clinic/patients`

#### 1. Listar Pacientes

**GET** `/api/clinic/patients/`

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "Juan Pérez",
    "phone_e164": "+525512345678",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Filtros disponibles:**
- `?is_active=true` - Filtrar por estado
- `?search=Juan` - Buscar por nombre o teléfono
- `?ordering=full_name` - Ordenar por nombre
- `?ordering=-created_at` - Ordenar por fecha

#### 2. Obtener Paciente

**GET** `/api/clinic/patients/{id}/`

#### 3. Crear Paciente

**POST** `/api/clinic/patients/`

**Request:**
```json
{
  "full_name": "María García",
  "phone_e164": "+525598765432",
  "is_active": true
}
```

**Validaciones:**
- `phone_e164` debe empezar con `+`
- Solo números y `+`
- 7-15 dígitos después del `+`

**Errores comunes:**
```json
{
  "phone_e164": [
    "Phone number must start with +"
  ]
}
```

```json
{
  "phone_e164": [
    "Phone number can only contain + and digits"
  ]
}
```

```json
{
  "phone_e164": [
    "Phone number must have between 7 and 15 digits after +"
  ]
}
```

#### 4. Actualizar Paciente

**PUT** `/api/clinic/patients/{id}/`

**PATCH** `/api/clinic/patients/{id}/`

#### 5. Eliminar Paciente

**DELETE** `/api/clinic/patients/{id}/`

---

### Device Endpoints

Base URL: `/api/clinic/devices`

#### 1. Listar Dispositivos

**GET** `/api/clinic/devices/`

**Response:**
```json
[
  {
    "id": 1,
    "device_uid": "ipad-room-101",
    "device_type": "IPAD",
    "device_type_display": "iPad",
    "is_active": true,
    "last_seen_at": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
]
```

**Filtros disponibles:**
- `?is_active=true` - Filtrar por estado
- `?device_type=IPAD` - Filtrar por tipo
- `?search=room-101` - Buscar por UID
- `?ordering=-last_seen_at` - Ordenar por última vez visto

**Ejemplos:**
```bash
GET /api/clinic/devices/?device_type=IPAD
GET /api/clinic/devices/?is_active=true
GET /api/clinic/devices/?ordering=-last_seen_at
```

#### 2. Obtener Dispositivo

**GET** `/api/clinic/devices/{id}/`

#### 3. Crear Dispositivo

**POST** `/api/clinic/devices/`

**Request:**
```json
{
  "device_uid": "ipad-room-102",
  "device_type": "IPAD",
  "is_active": true,
  "last_seen_at": "2024-01-15T14:30:00.000Z"
}
```

**Tipos válidos:**
- `IPAD`
- `WEB`
- `OTHER`

#### 4. Actualizar Dispositivo

**PUT** `/api/clinic/devices/{id}/`

**PATCH** `/api/clinic/devices/{id}/`

**Ejemplo - Actualizar last_seen_at:**
```json
{
  "last_seen_at": "2024-01-15T15:00:00.000Z"
}
```

#### 5. Eliminar Dispositivo

**DELETE** `/api/clinic/devices/{id}/`

---

## 🧪 Ejemplos con cURL

### Autenticación

Primero obtén un token:

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@clinic.com", "password": "password123"}'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}

# Guarda el token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Rooms

```bash
# Listar habitaciones
curl -X GET http://127.0.0.1:8000/api/clinic/rooms/ \
  -H "Authorization: Bearer $TOKEN"

# Crear habitación
curl -X POST http://127.0.0.1:8000/api/clinic/rooms/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "201", "floor": "2", "is_active": true}'

# Obtener habitación específica
curl -X GET http://127.0.0.1:8000/api/clinic/rooms/1/ \
  -H "Authorization: Bearer $TOKEN"

# Actualizar habitación (parcial)
curl -X PATCH http://127.0.0.1:8000/api/clinic/rooms/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# Eliminar habitación
curl -X DELETE http://127.0.0.1:8000/api/clinic/rooms/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Patients

```bash
# Listar pacientes
curl -X GET http://127.0.0.1:8000/api/clinic/patients/ \
  -H "Authorization: Bearer $TOKEN"

# Crear paciente
curl -X POST http://127.0.0.1:8000/api/clinic/patients/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Juan Pérez", "phone_e164": "+525512345678", "is_active": true}'

# Filtrar pacientes activos
curl -X GET "http://127.0.0.1:8000/api/clinic/patients/?is_active=true" \
  -H "Authorization: Bearer $TOKEN"

# Buscar paciente
curl -X GET "http://127.0.0.1:8000/api/clinic/patients/?search=Juan" \
  -H "Authorization: Bearer $TOKEN"
```

### Devices

```bash
# Listar dispositivos
curl -X GET http://127.0.0.1:8000/api/clinic/devices/ \
  -H "Authorization: Bearer $TOKEN"

# Crear dispositivo
curl -X POST http://127.0.0.1:8000/api/clinic/devices/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_uid": "ipad-room-101", "device_type": "IPAD", "is_active": true}'

# Filtrar por tipo
curl -X GET "http://127.0.0.1:8000/api/clinic/devices/?device_type=IPAD" \
  -H "Authorization: Bearer $TOKEN"

# Actualizar last_seen_at
curl -X PATCH http://127.0.0.1:8000/api/clinic/devices/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"last_seen_at": "2024-01-15T15:00:00.000Z"}'
```

---

## 🖥️ Admin Panel

Los modelos están registrados en el Django Admin:

**URL:** http://127.0.0.1:8000/admin/

### Sección CLINIC

- **Rooms** - Gestionar habitaciones
- **Patients** - Gestionar pacientes
- **Devices** - Gestionar dispositivos

**Características:**
- Filtros por is_active, floor, device_type
- Búsqueda por código, nombre, UID
- Ordenamiento por fecha, nombre, etc.
- Campos readonly: created_at, updated_at

---

## 📋 Próximos Pasos

### Para aplicar los cambios:

```bash
# 1. Instalar django-filter
pip install -r requirements.txt

# 2. Crear migraciones
python manage.py makemigrations clinic

# 3. Aplicar migraciones
python manage.py migrate

# 4. Iniciar servidor
python manage.py runserver

# 5. Probar endpoints
curl http://127.0.0.1:8000/api/clinic/rooms/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Authentication credentials were not provided"

**Causa:** No se envió el token JWT.

**Solución:** Agrega el header Authorization:
```bash
-H "Authorization: Bearer <access_token>"
```

### Error: "You do not have permission to perform this action"

**Causa:** El usuario no tiene rol STAFF o ADMIN.

**Solución:** Asigna rol STAFF o ADMIN al usuario en el admin.

### Error: "Phone number must be in E.164 format"

**Causa:** El teléfono no cumple con el formato.

**Solución:** Usa formato E.164:
```
Correcto: +525512345678
Incorrecto: 5512345678, 55-1234-5678, (55) 1234-5678
```

### Error: "room with this room code already exists"

**Causa:** El código de habitación ya existe.

**Solución:** Usa un código único para cada habitación.

### Error: "device with this device UID already exists"

**Causa:** El device_uid ya existe.

**Solución:** Usa un UID único para cada dispositivo.

---

## ✨ Resumen

✅ **Modelos:** Room, Patient, Device
✅ **CRUD completo** con ViewSets
✅ **Permisos:** IsStaffOrAdmin
✅ **Validaciones:** Phone E.164
✅ **Filtros:** is_active, floor, device_type
✅ **Búsqueda:** code, name, UID
✅ **Ordenamiento:** Múltiples campos
✅ **Admin:** Interfaces completas

El sistema está listo para usar. Ejecuta las migraciones y comienza a probar los endpoints.
