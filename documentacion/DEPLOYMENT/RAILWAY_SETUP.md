# 🚂 Guía Completa de Configuración para Railway

Esta guía te ayudará a desplegar el proyecto en Railway (Plan Hobby) con una base de datos limpia y todas las configuraciones necesarias.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración en Railway](#configuración-en-railway)
3. [Variables de Entorno Backend](#variables-de-entorno-backend)
4. [Variables de Entorno Frontend](#variables-de-entorno-frontend)
5. [Proceso de Deployment](#proceso-de-deployment)
6. [Usuarios Iniciales](#usuarios-iniciales)
7. [Verificación Post-Deployment](#verificación-post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- Cuenta en Railway (Plan Hobby)
- Cuenta en Cloudinary (para almacenamiento de imágenes)
- Repositorio de GitHub configurado: `https://github.com/Quint4n4/MenuInteractivo.git`

---

## 🚀 Configuración en Railway

### Paso 1: Crear Nuevo Proyecto

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Selecciona el repositorio: `Quint4n4/MenuInteractivo`

### Paso 2: Agregar Base de Datos PostgreSQL

1. En el proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. La variable `DATABASE_URL` se configurará automáticamente

### Paso 3: Crear Servicio Backend (Django)

1. En el proyecto, haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona el mismo repositorio: `Quint4n4/MenuInteractivo`
3. Railway detectará automáticamente que es un proyecto Python/Django

**Configuración del Servicio Backend:**

- **Root Directory**: (dejar vacío, usa la raíz del proyecto)
- **Build Command**: (Railway lo detecta automáticamente desde `requirements.txt`)
- **Start Command**: (Railway usa el `Procfile` automáticamente)

El `Procfile` ya está configurado y ejecutará:
```
python manage.py migrate && python init_users.py && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application
```

### Paso 4: Crear Servicio Frontend (React)

1. En el mismo proyecto, haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona el mismo repositorio: `Quint4n4/MenuInteractivo`
3. Configura el servicio:

**Configuración del Servicio Frontend:**

- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: (Railway puede servir archivos estáticos automáticamente, o usar un servidor estático)

**Nota**: Para servir el frontend en Railway, puedes usar:
- **Opción 1**: Railway Static (si está disponible en tu plan)
- **Opción 2**: Agregar un servidor estático simple (ver sección de troubleshooting)

---

## 🔐 Variables de Entorno Backend

Configura estas variables en el servicio **Backend** de Railway:

### Variables Obligatorias

| Variable | Descripción | Ejemplo | Cómo Obtenerla |
|----------|-------------|---------|----------------|
| `SECRET_KEY` | Clave secreta de Django | `django-insecure-...` | Generar nueva (ver abajo) |
| `DEBUG` | Modo debug | `False` | Siempre `False` en producción |
| `ALLOWED_HOSTS` | Dominios permitidos | `tu-backend.railway.app` | URL del servicio backend en Railway |
| `CSRF_TRUSTED_ORIGINS` | Orígenes confiables CSRF | `https://tu-frontend.railway.app` | URL del servicio frontend |
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://...` | **Se configura automáticamente** al agregar PostgreSQL |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la nube Cloudinary | `tu-cloud-name` | Desde dashboard de Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `123456789012345` | Desde dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `abcdefghijklmnop` | Desde dashboard de Cloudinary |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos CORS | `https://tu-frontend.railway.app` | URL del servicio frontend |
| `WS_ALLOWED_ORIGINS` | Orígenes permitidos WebSocket | `https://tu-frontend.railway.app` | URL del servicio frontend |

### Variables Opcionales (con valores por defecto)

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `DATABASE_NAME` | (no usado si DATABASE_URL existe) | Nombre de la BD |
| `DATABASE_USER` | (no usado si DATABASE_URL existe) | Usuario de la BD |
| `DATABASE_PASSWORD` | (no usado si DATABASE_URL existe) | Contraseña de la BD |
| `DATABASE_HOST` | (no usado si DATABASE_URL existe) | Host de la BD |
| `DATABASE_PORT` | (no usado si DATABASE_URL existe) | Puerto de la BD |

### Cómo Generar SECRET_KEY

Ejecuta este comando en Python:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

O usa este comando en terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**⚠️ IMPORTANTE**: Genera una SECRET_KEY nueva y única para el proyecto de la empresa. NO uses la misma que en tu proyecto personal.

---

## 🎨 Variables de Entorno Frontend

Configura estas variables en el servicio **Frontend** de Railway:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL del backend (con https://) | `https://tu-backend.railway.app` |
| `VITE_WS_BASE_URL` | URL WebSocket del backend (con wss://) | `wss://tu-backend.railway.app` |

**Nota**: 
- Para HTTP usa `https://`
- Para WebSocket usa `wss://` (WebSocket Secure)
- NO incluyas `/api` al final, el código lo agrega automáticamente

---

## 📝 Proceso de Deployment Paso a Paso

### 1. Configurar Variables de Entorno Backend

1. Ve al servicio **Backend** en Railway
2. Haz clic en la pestaña **"Variables"**
3. Agrega cada variable una por una:

```
SECRET_KEY=<tu-secret-key-generada>
DEBUG=False
ALLOWED_HOSTS=tu-backend.railway.app
CSRF_TRUSTED_ORIGINS=https://tu-frontend.railway.app
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
CORS_ALLOWED_ORIGINS=https://tu-frontend.railway.app
WS_ALLOWED_ORIGINS=https://tu-frontend.railway.app
```

**Nota**: `DATABASE_URL` se configura automáticamente cuando agregas PostgreSQL y la conectas al servicio backend.

### 2. Conectar Base de Datos al Backend

1. En el servicio **PostgreSQL**, haz clic en **"Connect"**
2. Selecciona el servicio **Backend**
3. Railway configurará automáticamente `DATABASE_URL`

### 3. Configurar Variables de Entorno Frontend

1. Ve al servicio **Frontend** en Railway
2. Haz clic en la pestaña **"Variables"**
3. Agrega:

```
VITE_API_BASE_URL=https://tu-backend.railway.app
VITE_WS_BASE_URL=wss://tu-backend.railway.app
```

**⚠️ IMPORTANTE**: Reemplaza `tu-backend.railway.app` y `tu-frontend.railway.app` con las URLs reales que Railway te asigne.

### 4. Obtener URLs de los Servicios

1. En cada servicio (Backend y Frontend), haz clic en **"Settings"**
2. En **"Domains"**, Railway te dará una URL como:
   - Backend: `https://tu-backend-production.up.railway.app`
   - Frontend: `https://tu-frontend-production.up.railway.app`
3. Usa estas URLs en las variables de entorno

### 5. Iniciar Deployment

1. Railway comenzará el deployment automáticamente
2. El backend ejecutará:
   - Migraciones de base de datos
   - Creación de usuarios iniciales (via `init_users.py`)
   - Recolección de archivos estáticos
   - Inicio del servidor Daphne

---

## 👥 Usuarios Iniciales

El script `init_users.py` se ejecuta automáticamente en cada deployment (es idempotente, seguro ejecutarlo múltiples veces).

### Usuarios Creados Automáticamente

#### Administrador
- **Email**: `admin@clinicacamsa.com`
- **Password**: `AdminCamsa2024`
- **Rol**: ADMIN (Superusuario)

#### Staff (Enfermeras)
- **Email**: `enfermera1@clinicacamsa.com` / Password: `Enfermera2024`
- **Email**: `enfermera2@clinicacamsa.com` / Password: `Enfermera2024`
- **Email**: `enfermera3@clinicacamsa.com` / Password: `Enfermera2024`
- **Email**: `enfermera4@clinicacamsa.com` / Password: `Enfermera2024`
- **Rol**: STAFF

### ⚠️ Cambiar Credenciales Después del Primer Deploy

**IMPORTANTE**: Cambia las contraseñas inmediatamente después del primer deployment:

1. Accede al panel de administración: `https://tu-frontend.railway.app/admin/login`
2. Inicia sesión con `admin@clinicacamsa.com` / `AdminCamsa2024`
3. Ve a la sección de usuarios y cambia todas las contraseñas
4. O usa el comando de Django:
   ```bash
   python manage.py changepassword admin@clinicacamsa.com
   ```

### Personalizar Usuarios Iniciales

Si quieres cambiar los usuarios que se crean automáticamente, edita el archivo `init_users.py` antes de hacer push al repositorio.

---

## ✅ Verificación Post-Deployment

### 1. Verificar Backend

1. Visita: `https://tu-backend.railway.app/api/`
2. Deberías ver una respuesta JSON o la interfaz de Django REST Framework
3. Verifica los logs en Railway para asegurarte de que no hay errores

### 2. Verificar Base de Datos

1. En Railway, ve al servicio PostgreSQL
2. Haz clic en **"Query"** o **"Connect"**
3. Verifica que las tablas se hayan creado:
   ```sql
   \dt
   ```

### 3. Verificar Frontend

1. Visita: `https://tu-frontend.railway.app`
2. Deberías ver la aplicación React cargando
3. Verifica la consola del navegador para errores de conexión

### 4. Verificar Autenticación

1. Visita: `https://tu-frontend.railway.app/admin/login`
2. Intenta iniciar sesión con: `admin@clinicacamsa.com` / `AdminCamsa2024`
3. Deberías poder acceder al panel de administración

### 5. Verificar WebSockets

1. Abre la aplicación en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **Network** → **WS** (WebSocket)
4. Deberías ver una conexión WebSocket activa

---

## 🔧 Troubleshooting

### Error: "DATABASE_URL not found"

**Solución**: 
1. Asegúrate de que el servicio PostgreSQL esté conectado al servicio Backend
2. En PostgreSQL → **"Connect"** → Selecciona el servicio Backend

### Error: "SECRET_KEY not set"

**Solución**: 
1. Ve a Variables del servicio Backend
2. Agrega `SECRET_KEY` con un valor generado

### Error: "CORS error" o "CSRF verification failed"

**Solución**: 
1. Verifica que `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` tengan la URL correcta del frontend
2. Asegúrate de usar `https://` (no `http://`)
3. No incluyas la barra final `/` en las URLs

### Error: Frontend no se conecta al Backend

**Solución**: 
1. Verifica que `VITE_API_BASE_URL` tenga la URL correcta del backend
2. Asegúrate de usar `https://` (no `http://`)
3. Verifica que el backend esté funcionando visitando su URL directamente

### Error: WebSocket no funciona

**Solución**: 
1. Verifica que `VITE_WS_BASE_URL` use `wss://` (no `ws://`)
2. Verifica que `WS_ALLOWED_ORIGINS` tenga la URL del frontend
3. Railway puede requerir configuración adicional para WebSockets

### Error: "No module named 'X'"

**Solución**: 
1. Verifica que `requirements.txt` tenga todas las dependencias
2. Railway debería instalar automáticamente, pero revisa los logs de build

### Frontend no se sirve correctamente

**Solución**: 
Si Railway no sirve archivos estáticos automáticamente, puedes:

1. **Opción 1**: Usar Railway Static (si está disponible)
2. **Opción 2**: Agregar un servidor estático simple al frontend:
   - Instalar: `npm install -g serve`
   - Cambiar start command a: `serve -s dist -l $PORT`

### Los usuarios no se crean automáticamente

**Solución**: 
1. Verifica los logs del backend en Railway
2. El script `init_users.py` se ejecuta en cada deploy
3. Si hay errores, revisa la conexión a la base de datos

### Error: "Port already in use" o problemas con $PORT

**Solución**: 
1. Railway configura automáticamente `$PORT`
2. El Procfile ya usa `$PORT` correctamente
3. No necesitas configurar esta variable manualmente

---

## 📊 Estructura del Deployment en Railway

```
Railway Project: MenuInteractivo
│
├── 📦 PostgreSQL Database
│   └── DATABASE_URL (auto-configurada)
│
├── 🐍 Backend Service (Django)
│   ├── Build: pip install -r requirements.txt
│   ├── Start: Procfile (migrate → init_users → collectstatic → daphne)
│   ├── Variables:
│   │   ├── SECRET_KEY
│   │   ├── DEBUG=False
│   │   ├── ALLOWED_HOSTS
│   │   ├── CSRF_TRUSTED_ORIGINS
│   │   ├── DATABASE_URL (auto)
│   │   ├── CLOUDINARY_*
│   │   ├── CORS_ALLOWED_ORIGINS
│   │   └── WS_ALLOWED_ORIGINS
│   └── URL: https://tu-backend.railway.app
│
└── ⚛️ Frontend Service (React)
    ├── Root: frontend/
    ├── Build: npm install && npm run build
    ├── Start: (servir archivos estáticos)
    ├── Variables:
    │   ├── VITE_API_BASE_URL
    │   └── VITE_WS_BASE_URL
    └── URL: https://tu-frontend.railway.app
```

---

## 🔄 Mantener Ambos Proyectos Funcionando

### Proyecto Personal (Original)
- **Remote**: `origin` → `https://github.com/EmanuelRealGamboa/clinica-camsa-.git`
- **Railway**: Tu proyecto personal existente
- **Base de datos**: Tu base de datos actual con tus datos

### Proyecto Empresa (Nuevo)
- **Remote**: `railway` → `https://github.com/Quint4n4/MenuInteractivo.git`
- **Railway**: Nuevo proyecto de Railway
- **Base de datos**: Nueva base de datos PostgreSQL (vacía)

### Hacer Cambios en Ambos Proyectos

```powershell
# Hacer cambios y commit
git add .
git commit -m "Descripción del cambio"

# Push al proyecto personal
git push origin main

# Push al proyecto empresa
git push railway main
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Railway (pestaña "Deployments" → selecciona deployment → "View Logs")
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las URLs sean correctas y usen `https://` y `wss://`
4. Revisa esta guía de troubleshooting

---

## ✅ Checklist de Deployment

- [ ] Repositorio creado en GitHub
- [ ] Proyecto creado en Railway
- [ ] Base de datos PostgreSQL agregada
- [ ] Servicio Backend creado y configurado
- [ ] Servicio Frontend creado y configurado
- [ ] Variables de entorno Backend configuradas
- [ ] Variables de entorno Frontend configuradas
- [ ] PostgreSQL conectado al servicio Backend
- [ ] URLs obtenidas de ambos servicios
- [ ] Deployment completado sin errores
- [ ] Backend accesible y funcionando
- [ ] Frontend accesible y funcionando
- [ ] Usuarios iniciales creados
- [ ] Credenciales cambiadas después del primer deploy
- [ ] WebSockets funcionando
- [ ] CORS y CSRF configurados correctamente

---

¡Listo! Tu proyecto debería estar funcionando en Railway. 🎉
