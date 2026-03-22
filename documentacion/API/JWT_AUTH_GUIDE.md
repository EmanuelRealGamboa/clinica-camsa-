# JWT Authentication Guide

## ✅ Implementación Completada

Se ha implementado autenticación JWT usando `djangorestframework-simplejwt`.

### Archivos Creados/Modificados

1. **[accounts/serializers.py](accounts/serializers.py)**
   - `LoginSerializer`: Validación de credenciales
   - `UserSerializer`: Serialización básica de usuario
   - `UserDetailSerializer`: Información completa del usuario

2. **[accounts/views.py](accounts/views.py)**
   - `login_view`: POST /api/auth/login
   - `me_view`: GET /api/auth/me
   - `logout_view`: POST /api/auth/logout

3. **[accounts/urls.py](accounts/urls.py)**
   - Rutas de autenticación

4. **[clinic_service/settings.py](clinic_service/settings.py)**
   - Configuración de JWT
   - Token blacklist habilitado

5. **[clinic_service/urls.py](clinic_service/urls.py)**
   - Inclusión de rutas de auth

## 📡 Endpoints Disponibles

### 1. Login (POST /api/auth/login)

Autenticar usuario y obtener tokens JWT.

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@clinic.com",
  "password": "your-password"
}
```

**Response Success (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@clinic.com",
    "full_name": "Administrator",
    "roles": ["admin", "staff"],
    "permissions": ["all"],
    "is_staff": true,
    "is_active": true,
    "date_joined": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (401):**
```json
{
  "error": "Invalid credentials",
  "detail": "Please check your email and password"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@clinic.com", "password": "your-password"}'
```

---

### 2. Get Current User (GET /api/auth/me)

Obtener información del usuario autenticado.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "id": 1,
  "email": "admin@clinic.com",
  "full_name": "Administrator",
  "username": null,
  "roles": ["admin", "staff"],
  "permissions": ["all"],
  "is_staff": true,
  "is_active": true,
  "date_joined": "2024-01-01T00:00:00.000Z",
  "last_login": "2024-01-15T10:30:00.000Z"
}
```

**Response Error (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**cURL Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

### 3. Refresh Token (POST /api/auth/refresh)

Obtener un nuevo access token usando el refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response Success (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Note:** Con `ROTATE_REFRESH_TOKENS: True`, también se genera un nuevo refresh token.

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."}'
```

---

### 4. Logout (POST /api/auth/logout)

Cerrar sesión y blacklistear el refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response Success (200):**
```json
{
  "message": "Successfully logged out"
}
```

**Response Error (400):**
```json
{
  "error": "Invalid token or token already blacklisted"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."}'
```

---

## ⚙️ Configuración JWT

### Token Lifetimes

- **Access Token:** 1 hora
- **Refresh Token:** 7 días

### Características Habilitadas

- ✅ **Rotate Refresh Tokens:** Genera nuevo refresh token al refrescar
- ✅ **Blacklist After Rotation:** Invalida refresh tokens antiguos
- ✅ **Update Last Login:** Actualiza last_login al generar tokens
- ✅ **Token Blacklist:** Sistema de logout con blacklist

### Headers

**Authorization Header:**
```
Authorization: Bearer <access_token>
```

El access token debe enviarse en todas las peticiones protegidas.

---

## 🔐 Roles y Permisos

### Roles Disponibles

El campo `roles[]` contiene los roles del usuario:

| Role | Condición | Descripción |
|------|-----------|-------------|
| `admin` | `is_superuser=True` | Acceso total al sistema |
| `staff` | `is_staff=True` | Personal de la clínica |
| `user` | Por defecto | Usuario básico |
| Grupos | `groups` | Roles personalizados via grupos Django |

### Permisos

El campo `permissions[]` contiene:
- `["all"]` para superusuarios
- Lista de permisos específicos para otros usuarios
- Se obtienen de permisos directos + permisos de grupos

---

## 🧪 Testing con cURL

### 1. Login y Guardar Tokens

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@clinic.com", "password": "your-password"}' \
  | jq

# Guardar access token en variable (bash)
export ACCESS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### 2. Usar Access Token

```bash
# Get current user
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq
```

### 3. Refresh Token

```bash
# Refresh
curl -X POST http://127.0.0.1:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."}' \
  | jq
```

### 4. Logout

```bash
# Logout
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."}' \
  | jq
```

---

## 🎨 Integración con Frontend

### React/JavaScript Example

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();

  // Guardar tokens
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
};

// Get current user
const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unauthorized');
  }

  return await response.json();
};

// Refresh token
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');

  const response = await fetch('http://127.0.0.1:8000/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    // Redirect to login
    throw new Error('Session expired');
  }

  const data = await response.json();

  // Actualizar tokens
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);

  return data;
};

// Logout
const logout = async () => {
  const token = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');

  await fetch('http://127.0.0.1:8000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  // Limpiar storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};
```

### Axios Interceptor (Auto-refresh)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Request interceptor: agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://127.0.0.1:8000/api/auth/refresh',
          { refresh }
        );

        const { access, refresh: newRefresh } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', newRefresh);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 📋 Próximos Pasos

### Para aplicar los cambios:

```bash
# 1. Ejecutar migraciones (para token_blacklist)
python manage.py migrate

# 2. Iniciar servidor
python manage.py runserver

# 3. Probar login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@clinic.com", "password": "your-password"}'
```

### Testing Manual

1. **Login:** POST /api/auth/login
2. **Get User:** GET /api/auth/me (con Authorization header)
3. **Refresh:** POST /api/auth/refresh
4. **Logout:** POST /api/auth/logout

---

## 🔍 Verificación

### Verificar que los endpoints funcionan:

```bash
# Health check
curl http://127.0.0.1:8000/api/health

# Login (reemplaza con tus credenciales)
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@example.com", "password": "tu-password"}'
```

Si el login funciona, deberías recibir los tokens JWT.

---

## 🐛 Troubleshooting

### Error: "Token blacklist app is not installed"

**Solución:** Asegúrate que `rest_framework_simplejwt.token_blacklist` esté en `INSTALLED_APPS` y ejecuta:
```bash
python manage.py migrate
```

### Error: "Invalid credentials"

**Causas:**
- Email o password incorrectos
- Usuario no está activo (`is_active=False`)
- Usuario no existe

**Verificar:**
```bash
python manage.py shell
from accounts.models import User
User.objects.filter(email='tu-email@example.com').exists()
```

### Error: "Authentication credentials were not provided"

**Causa:** No se envió el header Authorization

**Solución:** Agregar header:
```
Authorization: Bearer <access_token>
```

### Token Expirado

Los access tokens expiran en 1 hora. Usa el refresh token para obtener uno nuevo:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh": "tu-refresh-token"}'
```

---

## 📚 Documentación Relacionada

- [Custom User Setup](CUSTOM_USER_SETUP.md)
- [README](README.md)
- [Django REST Framework SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/)
