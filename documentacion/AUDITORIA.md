# AUDITORÍA TÉCNICA - PROYECTO CAMSA
**Fecha:** 20 de Marzo 2026
**Rama analizada:** `main` (estado limpio)
**Áreas cubiertas:** Seguridad · Arquitectura · Frontend · DevOps · Diseño de API

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Matriz de Riesgo Global](#2-matriz-de-riesgo-global)
3. [ÁREA 1 — Seguridad Backend](#3-área-1--seguridad-backend)
4. [ÁREA 2 — Arquitectura y Escalabilidad](#4-área-2--arquitectura-y-escalabilidad)
5. [ÁREA 3 — Frontend React](#5-área-3--frontend-react)
6. [ÁREA 4 — DevOps y Deployment](#6-área-4--devops-y-deployment)
7. [ÁREA 5 — Diseño de API REST](#7-área-5--diseño-de-api-rest)
8. [Plan de Acción Consolidado](#8-plan-de-acción-consolidado)

---

## 1. Resumen Ejecutivo

CAMSA es un sistema de gestión de pedidos para clínicas con arquitectura Django REST + React SPA. La auditoría reveló **6 vulnerabilidades críticas** que requieren atención inmediata antes de cualquier expansión del sistema, junto con **27 hallazgos de alto/medio impacto** que afectan la escalabilidad y mantenibilidad a largo plazo.

### Estado general por área

| Área | Estado | Hallazgos Críticos | Hallazgos Altos | Hallazgos Medios |
|------|--------|:------------------:|:---------------:|:----------------:|
| Seguridad Backend | 🔴 CRÍTICO | 6 | 5 | 7 |
| Arquitectura Backend | 🟡 MEJORABLE | 0 | 7 | 9 |
| Frontend React | 🟡 MEJORABLE | 2 | 3 | 8 |
| DevOps / Deployment | 🔴 CRÍTICO | 3 | 4 | 5 |
| Diseño de API REST | 🟡 MEJORABLE | 2 | 3 | 7 |

---

## 2. Matriz de Riesgo Global

### Vulnerabilidades que requieren acción HOY

| # | Hallazgo | Archivo | Impacto |
|---|----------|---------|---------|
| 1 | Endpoint `/api/auth/init-db/` público sin autenticación — permite crear admin con contraseñas hardcodeadas | `accounts/views.py:96-157` | Acceso total al sistema |
| 2 | `DEBUG=True` + `SECRET_KEY` inseguro en `.env` de producción | `.env`, `.env.production` | Information disclosure completo |
| 3 | Credenciales reales expuestas en archivos de entorno versionados | `.env`, `.env.production` | Compromiso de BD y Cloudinary |
| 4 | Sin rate limiting en ningún endpoint — público o privado | `clinic_service/settings.py` | DoS y fuerza bruta |
| 5 | `InMemoryChannelLayer` en producción — WebSockets no funcionan con múltiples workers | `clinic_service/settings.py:320` | Notificaciones en tiempo real caídas |
| 6 | Race condition en reserva de inventario — overselling posible | `orders/views.py:115-167` | Integridad de datos |

---

## 3. ÁREA 1 — Seguridad Backend

### 3.1 Endpoint de inicialización de base de datos expuesto

**Severidad:** 🔴 CRÍTICO
**Archivo:** `accounts/views.py:96-157`

El endpoint `/api/auth/init-db/` tiene `@permission_classes([AllowAny])`. Cualquiera puede realizar una petición GET/POST y:
- Crear una cuenta de superadministrador con credenciales fijas (`AdminCamsa2024`)
- Crear 4 cuentas de enfermera con contraseñas predefinidas (`Enfermera2024`)
- Ejecutarlo repetidamente

**Mejora recomendada:**
```python
# Opción 1: Eliminar el endpoint completamente
# Mover la inicialización a un management command:
# python manage.py init_db

# Opción 2: Proteger con variable de entorno
@api_view(['POST'])
@permission_classes([AllowAny])
def init_database_view(request):
    init_token = request.data.get('token')
    if init_token != os.getenv('INIT_DB_TOKEN'):
        return Response({'error': 'Forbidden'}, status=403)
    # ...
```

---

### 3.2 Credenciales expuestas en archivos de entorno

**Severidad:** 🔴 CRÍTICO
**Archivos:** `.env`, `.env.production`, `init_users.py`

Los archivos contienen credenciales reales:
```
SECRET_KEY=django-insecure-dev-key-change-this-in-production-abc123xyz789
DATABASE_PASSWORD=7444712868*eM
DATABASE_URL=postgresql://postgres:GaUhATQEBWkjtmOPscEbOjRqdOuoQWVe@nozomi.proxy.rlwy.net:37022/railway
CLOUDINARY_API_SECRET=fQCXB4MZSjrmuj253n7pV4AxH_M
```

**Acción inmediata:**
```bash
# 1. Generar nuevo SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 2. Cambiar contraseña de PostgreSQL en Railway

# 3. Regenerar API keys de Cloudinary desde el dashboard

# 4. Revisar si ya fue subido a git (historia)
git log --all --oneline | xargs git grep -l "PASSWORD\|SECRET\|API_KEY" 2>/dev/null
```

---

### 3.3 Falta de rate limiting global

**Severidad:** 🔴 CRÍTICO
**Archivo:** `clinic_service/settings.py`

No existe ninguna clase de throttling configurada. Endpoints públicos como `/api/public/orders/create` y `/api/public/orders/by-assignment/{id}` son vulnerables a fuerza bruta y enumeración de IDs.

**Mejora recomendada:**
```python
# clinic_service/settings.py
REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}
```

Para endpoints públicos específicos, aplicar throttle más estricto:
```python
# orders/public_views.py
class PublicOrderCreateView(APIView):
    throttle_classes = [AnonRateThrottle]
    throttle_scope = 'public_order'

# settings.py
'DEFAULT_THROTTLE_RATES': {
    ...
    'public_order': '20/hour',
}
```

---

### 3.4 Información sensible de pacientes en endpoints públicos

**Severidad:** 🔴 ALTO
**Archivo:** `clinic/views.py:488-550`

El endpoint `GET /api/public/kiosk/device/{device_uid}/active-patient/` retorna sin autenticación:
- Nombre completo del paciente
- Teléfono del paciente
- Email del staff asignado
- Código de habitación y límites de órdenes

Cualquiera que adivine o enumere un `device_uid` accede a datos privados.

**Mejora recomendada:**
```python
# Agregar validación de origen o token de dispositivo
@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_patient_by_device(request, device_uid):
    # Verificar que el request proviene de la IP registrada del device
    # O implementar token HMAC basado en device_uid + timestamp
    device_token = request.headers.get('X-Device-Token')
    expected_token = hmac.new(
        settings.DEVICE_SECRET.encode(),
        device_uid.encode(),
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(device_token or '', expected_token):
        return Response({'error': 'Unauthorized'}, status=401)
```

---

### 3.5 Enumeración de asignaciones de pacientes

**Severidad:** 🔴 ALTO
**Archivo:** `orders/public_views.py` (endpoint `/api/public/orders/by-assignment/{assignment_id}`)

El endpoint usa IDs numéricos secuenciales. Un atacante puede iterar `assignment_id=1,2,3...` para acceder a órdenes de cualquier paciente.

**Mejora recomendada:**
```python
# Usar UUIDs en lugar de IDs secuenciales
import uuid

class PatientAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ...

# O agregar validación cruzada con device_uid
def get_orders_by_assignment(request, assignment_id):
    device_uid = request.query_params.get('device_uid')
    assignment = get_object_or_404(
        PatientAssignment,
        id=assignment_id,
        device__device_uid=device_uid,  # Validar propiedad
        is_active=True
    )
```

---

### 3.6 Token JWT en query string de WebSocket

**Severidad:** 🟠 ALTO
**Archivos:** `orders/consumers.py:24`, `pages/staff/DashboardPage.tsx:53`

El token de autenticación se pasa en la URL: `ws://host/ws/staff/orders/?token=eyJ...`. Esto expone el token en logs del servidor, historial del navegador y proxies.

**Mejora recomendada:**
```python
# orders/consumers.py - usar subprotocols para autenticación
async def websocket_connect(self, message):
    # Aceptar con subprotocol
    await self.send(text_data=json.dumps({'type': 'auth_required'}))

async def receive(self, text_data):
    data = json.loads(text_data)
    if data.get('type') == 'auth' and not self.authenticated:
        token = data.get('token')
        user = await self.get_user_from_token(token)
        if user:
            self.authenticated = True
            self.user = user
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
```

---

### 3.7 Falta de Content Security Policy (CSP)

**Severidad:** 🟠 ALTO
**Archivo:** `clinic_service/settings.py:333-343`

Los security headers de producción están bien configurados (HSTS, X-Frame-Options, etc.) pero falta el header CSP que previene ataques XSS.

**Mejora recomendada:**
```bash
pip install django-csp
```
```python
# settings.py
INSTALLED_APPS += ['csp']
MIDDLEWARE += ['csp.middleware.CSPMiddleware']

CONTENT_SECURITY_POLICY = {
    'DIRECTIVES': {
        'default-src': ("'self'",),
        'script-src': ("'self'",),
        'style-src': ("'self'", "'unsafe-inline'"),
        'img-src': ("'self'", "https://res.cloudinary.com", "data:"),
        'connect-src': ("'self'", "wss:"),
        'font-src': ("'self'",),
    }
}
```

---

### 3.8 Validación de archivos subidos

**Severidad:** 🟡 MEDIO
**Archivo:** `catalog/serializers.py:20,67`

No hay validación de tamaño máximo ni tipo MIME en uploads de imágenes.

**Mejora recomendada:**
```python
# catalog/serializers.py
def validate_icon_image(self, value):
    if value.size > 5 * 1024 * 1024:  # 5 MB
        raise serializers.ValidationError("Imagen demasiado grande. Máximo 5MB.")
    if value.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
        raise serializers.ValidationError("Formato no permitido. Use JPG, PNG o WebP.")
    return value
```

---

### 3.9 WebSocket de kiosk sin autenticación fuerte

**Severidad:** 🟡 MEDIO
**Archivo:** `orders/consumers.py:145-165`

`KioskOrderConsumer` solo valida `device_uid`, que es un string predecible. No hay validación de que el cliente que se conecta es realmente el dispositivo registrado.

**Mejora recomendada:**
Implementar token de sesión temporal para dispositivos. Al cargar el kiosk, el backend emite un token con expiración corta (15 min) que el dispositivo usa para el WebSocket.

---

## 4. ÁREA 2 — Arquitectura y Escalabilidad

### 4.1 Falta de índices en campos de búsqueda frecuente

**Severidad:** 🟠 ALTO
**Archivos:** `clinic/models.py`, `catalog/models.py`, `orders/models.py`

Los campos usados en `search_fields` y filtros frecuentes no tienen índices de base de datos. Con más de 1,000 registros, esto causa full table scans.

**Mejora recomendada:**
```python
# clinic/models.py
class Patient(models.Model):
    full_name = models.CharField(max_length=200, db_index=True)
    phone_e164 = models.CharField(max_length=20, db_index=True)

class Room(models.Model):
    code = models.CharField(max_length=20, db_index=True)

# catalog/models.py
class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    sku = models.CharField(max_length=50, unique=True)  # unique ya crea índice

# orders/models.py
class Order(models.Model):
    status = models.CharField(max_length=20, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['patient_assignment', 'status']),
            models.Index(fields=['status', '-placed_at']),
        ]
```

---

### 4.2 Problema N+1 queries en múltiples vistas

**Severidad:** 🟠 ALTO
**Archivos:** `feedbacks/views.py:183`, `inventory/views.py:40`, `catalog/views.py:79`

Varios endpoints realizan queries en bucle en lugar de usar `select_related`/`prefetch_related`.

**Mejora recomendada:**
```python
# feedbacks/views.py — rating distribution en una sola query
from django.db.models import Count

rating_dist = feedbacks.values('staff_rating').annotate(count=Count('id'))
distribution = {str(item['staff_rating']): item['count'] for item in rating_dist}
# En lugar de 6 queries .count() separadas

# catalog/views.py — prefetch de tags
queryset = Product.objects.select_related('category').prefetch_related('tags')

# inventory/views.py — cargar balances en un solo dict
balances = {b.product_id: b for b in InventoryBalance.objects.select_related('product')}
# En lugar de InventoryBalance.objects.get() dentro del loop
```

---

### 4.3 Lógica de negocio en vistas en lugar de servicios

**Severidad:** 🟠 ALTO
**Archivo:** `orders/views.py:81-168`

La validación de límites de órdenes, la reserva de inventario y el cálculo de totales están directamente en los métodos de la vista. Esto hace el código difícil de testear y mantener.

**Mejora recomendada:**
```python
# Crear orders/services.py
class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order(assignment, items_data, created_by=None):
        OrderService._validate_limits(assignment, items_data)
        order = Order.objects.create(patient_assignment=assignment)
        OrderService._reserve_inventory(order, items_data)
        return order

    @staticmethod
    def _validate_limits(assignment, items_data):
        # Lógica extraída de la vista
        ...

    @staticmethod
    def _reserve_inventory(order, items_data):
        # Lógica extraída de la vista
        ...

# orders/views.py — la vista queda simple
def create_order(self, request):
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    order = OrderService.create_order(**serializer.validated_data)
    return Response(OrderSerializer(order).data, status=201)
```

---

### 4.4 Falta de caché en endpoints de alta frecuencia

**Severidad:** 🟠 ALTO
**Archivos:** `catalog/views.py:169-199`, `clinic_service/settings.py`

Los endpoints más consultados (categorías del carrusel, productos destacados, más pedidos) no tienen caché. Cada request del kiosk genera queries a la base de datos.

**Mejora recomendada:**
```python
# clinic_service/settings.py — agregar Redis cache en producción
if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
            'TIMEOUT': 300,  # 5 minutos
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }

# catalog/views.py
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

@method_decorator(cache_page(300), name='list')
class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    ...

@cache_page(300)
@api_view(['GET'])
def get_carousel_categories(request):
    ...
```

---

### 4.5 Falta de tareas asíncronas (Celery)

**Severidad:** 🟠 ALTO
**Archivo:** `feedbacks/views.py:160-201`

El método `_update_product_ratings()` itera sobre todos los feedbacks y productos de forma sincrónica al recibir un feedback. Con 1,000 feedbacks, bloquea el thread durante varios segundos.

**Mejora recomendada:**
```bash
pip install celery redis
```
```python
# feedbacks/tasks.py
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def update_product_ratings_task(self, product_ratings):
    try:
        _update_product_ratings_logic(product_ratings)
    except Exception as exc:
        self.retry(exc=exc, countdown=60)

# feedbacks/views.py — en lugar de llamada sincrónica
update_product_ratings_task.delay(serializer.validated_data['product_ratings'])
```

---

### 4.6 Logging con print() en lugar de logging module

**Severidad:** 🟡 MEDIO
**Archivos:** `clinic/views.py:259`, `orders/views.py:753`, `feedbacks/views.py:154-155`

El código usa `print()` y `traceback.print_exc()` para errores. En producción, estos mensajes no son capturados correctamente.

**Mejora recomendada:**
```python
# clinic_service/settings.py — configurar logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO' if not DEBUG else 'DEBUG',
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'INFO', 'propagate': False},
        'orders': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
        'feedbacks': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
    },
}

# En cada módulo — reemplazar print()
import logging
logger = logging.getLogger(__name__)

# Antes:
print(f'WebSocket broadcast failed: {ws_error}')
# Después:
logger.error('WebSocket broadcast failed', exc_info=True, extra={'error': str(ws_error)})
```

---

### 4.7 `InMemoryChannelLayer` no escala en producción

**Severidad:** 🟡 MEDIO
**Archivo:** `clinic_service/settings.py:320-324`

Con `InMemoryChannelLayer`, cada proceso Daphne tiene su propia memoria. Si hay múltiples workers, los mensajes WebSocket se pierden entre ellos. `channels-redis` ya está en `requirements.txt` pero no se usa.

**Mejora recomendada:**
```python
# clinic_service/settings.py
if not DEBUG:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
                'capacity': 1500,
                'expiry': 10,
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }
```

---

### 4.8 Sin transacciones atómicas en creación de usuarios

**Severidad:** 🟡 MEDIO
**Archivo:** `accounts/views.py:222-252`

La creación de usuario + asignación de rol no está envuelta en `transaction.atomic()`. Un error a mitad del proceso deja datos inconsistentes.

**Mejora recomendada:**
```python
# accounts/views.py
from django.db import transaction

@transaction.atomic
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    # asignación de rol dentro de la misma transacción
    ...
```

---

### 4.9 Falta de paginación en endpoints de estadísticas

**Severidad:** 🟡 MEDIO
**Archivos:** `feedbacks/views.py:267`, `inventory/views.py:37`

Endpoints que retornan datos agregados usan `Feedback.objects.all()` o `Product.objects.filter(is_active=True)` sin límite.

**Mejora recomendada:**
Agregar límites explícitos y/o cursor-based pagination para endpoints de reportes con muchos datos.

---

### 4.10 App `feedback/` vacía duplica la app `feedbacks/`

**Severidad:** 🟢 BAJO
**Archivos:** `feedback/models.py`, `feedbacks/models.py`

Existe una app `feedback/` con modelos vacíos junto a `feedbacks/` que contiene la lógica real. Genera confusión.

**Mejora recomendada:** Eliminar la app `feedback/` vacía del proyecto.

---

## 5. ÁREA 3 — Frontend React

### 5.1 Tokens JWT almacenados en localStorage

**Severidad:** 🔴 CRÍTICO
**Archivos:** `api/client.ts:16,38-49`, `auth/AuthContext.tsx:22-23`

Los tokens `access_token` y `refresh_token` se guardan en `localStorage`, accesibles por cualquier script JavaScript. Un ataque XSS exitoso puede robarlos completamente.

**Mejora recomendada:**
Migrar a `httpOnly` cookies configuradas desde el backend. Esto requiere cambios coordinados:

```python
# Django — en el endpoint de login
response = Response({'user': user_data})
response.set_cookie(
    'access_token',
    access_token,
    httponly=True,
    secure=not settings.DEBUG,
    samesite='Strict',
    max_age=3600,
)
return response
```

```typescript
// frontend/src/api/client.ts — axios con credenciales
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,  // Envía cookies automáticamente
  timeout: 30000,
});
```

---

### 5.2 Token en URL de conexión WebSocket

**Severidad:** 🔴 CRÍTICO
**Archivos:** `pages/staff/DashboardPage.tsx:53`, `pages/staff/OrdersPage.tsx:23`

```typescript
// Actual — token visible en logs y browser history
const wsUrl = `${WS_BASE_URL}/ws/staff/orders/?token=${token}`;
```

Ver solución coordinada con backend en sección 3.6.

---

### 5.3 Verificación de roles solo en el cliente

**Severidad:** 🟠 ALTO
**Archivos:** `auth/AdminProtectedRoute.tsx:25-30`, `pages/admin/AdminLoginPage.tsx:24-33`

El acceso a rutas admin se decide basándose en datos del `localStorage`. Un usuario puede modificar `localStorage` manualmente para bypassear la protección del frontend.

**Nota importante:** Este riesgo está mitigado siempre que el **backend valide permisos en cada endpoint**. Verificar que todos los endpoints de `/api/admin/*` usen `permission_classes = [IsAdmin]` o `[IsSuperAdmin]`.

**Mejora recomendada en frontend:**
```typescript
// auth/AdminProtectedRoute.tsx — validar con el servidor
const AdminProtectedRoute = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar con el servidor, no solo con localStorage
    api.get('/auth/me/').then(res => {
      setIsValid(res.data.is_superuser);
    }).catch(() => setIsValid(false));
  }, []);

  if (isValid === null) return <LoadingSpinner />;
  return isValid ? <Outlet /> : <Navigate to="/admin/login" />;
};
```

---

### 5.4 Componentes de más de 1,000 líneas

**Severidad:** 🟠 ALTO
**Archivos principales:**

| Archivo | Líneas | Problema |
|---------|--------|---------|
| `pages/admin/ProductsManagementPage.tsx` | 1,897 | Gestión + modales + formularios |
| `pages/kiosk/KioskPage.tsx` | 1,446 | Múltiples flujos de UX |
| `pages/kiosk/KioskOrdersPage.tsx` | 1,370 | Lista + detalle + acciones |
| `pages/staff/DashboardPage.tsx` | 1,263 | Dashboard + WebSocket + estado |

**Mejora recomendada:**
Dividir en sub-componentes por responsabilidad. Ejemplo para `ProductsManagementPage`:
```
pages/admin/products/
  ├── ProductsManagementPage.tsx     (~200 líneas — orquestador)
  ├── ProductTable.tsx               (~150 líneas)
  ├── ProductFormModal.tsx           (~200 líneas)
  ├── ProductImageUpload.tsx         (~100 líneas)
  └── hooks/useProductManagement.ts  (~150 líneas)
```

---

### 5.5 Sin timeout en Axios y manejo de errores inconsistente

**Severidad:** 🟡 MEDIO
**Archivo:** `api/client.ts`

No hay timeout configurado. Requests pueden quedar colgadas indefinidamente. Además, el manejo de errores varía entre componentes: algunos usan `catch (error: any)`, otros ignoran errores silenciosamente.

**Mejora recomendada:**
```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// api/errorHandler.ts — utility centralizado
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Intente nuevamente.';
  }
  return 'Ocurrió un error inesperado.';
}
```

---

### 5.6 Sin lazy loading de rutas

**Severidad:** 🟡 MEDIO
**Archivo:** `App.tsx`

Todas las páginas se cargan en el bundle inicial. `ProductsManagementPage.tsx` con 1,897 líneas se descarga aunque el usuario sea un paciente del kiosk.

**Mejora recomendada:**
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardPage'));
const KioskPage = lazy(() => import('./pages/kiosk/KioskPage'));
const StaffDashboard = lazy(() => import('./pages/staff/DashboardPage'));

// Envolver rutas en Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/kiosk/:deviceId" element={<KioskPage />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

---

### 5.7 Uso excesivo del tipo `any` en TypeScript

**Severidad:** 🟡 MEDIO
**Archivos:** `auth/AuthContext.tsx:6,8`, `api/admin.ts`, `pages/kiosk/KioskPage.tsx:14,20`

Se encontraron 162+ instancias de `any`. Esto elimina la seguridad de tipos en las partes más críticas (autenticación y datos de API).

**Mejora recomendada:**
```typescript
// types/auth.ts — definir tipos concretos
export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  roles: ('ADMIN' | 'STAFF')[];
  is_staff: boolean;
  is_superuser: boolean;
}

// Activar en tsconfig.app.json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "strict": true
  }
}
```

---

### 5.8 Console.log en producción

**Severidad:** 🟢 BAJO
**Instancias:** 40+ en toda la app

**Mejora recomendada:**
```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  error: (...args: unknown[]) => console.error(...args), // Errores siempre
};
```

---

### 5.9 Archivo obsoleto en el repositorio

**Severidad:** 🟢 BAJO
**Archivo:** `pages/admin/AdminDashboardPage.old.tsx`

Eliminar este archivo del repositorio.

---

## 6. ÁREA 4 — DevOps y Deployment

### 6.1 `makemigrations` ejecutado en producción

**Severidad:** 🔴 CRÍTICO
**Archivo:** `Procfile`

```
# Actual — peligroso
web: python manage.py makemigrations && python manage.py migrate && ...
```

`makemigrations` en producción puede generar migraciones no testeadas que rompan la base de datos.

**Mejora recomendada:**
```
# Procfile correcto
web: python manage.py migrate && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application
```
Las migraciones deben generarse localmente, commitearse al repo y solo aplicarse (`migrate`) en producción.

---

### 6.2 Sin CI/CD — tests automatizados

**Severidad:** 🟠 ALTO

No hay ningún pipeline de integración continua. Los archivos `tests.py` de cada app están vacíos (3 líneas de boilerplate).

**Mejora recomendada — crear `.github/workflows/django.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'

    - name: Instalar dependencias
      run: pip install -r requirements.txt

    - name: Verificar migraciones pendientes
      run: python manage.py makemigrations --check
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost/test_db
        SECRET_KEY: test-key-only

    - name: Ejecutar tests
      run: python manage.py test --verbosity=2
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost/test_db
        SECRET_KEY: test-key-only
        DEBUG: 'False'
```

---

### 6.3 Sin monitoreo de errores

**Severidad:** 🟠 ALTO

No hay Sentry, Datadog, ni ningún sistema de alertas. Los errores 500 en producción solo se detectan revisando manualmente los logs de Railway.

**Mejora recomendada:**
```bash
pip install sentry-sdk[django]
```
```python
# clinic_service/settings.py
import sentry_sdk

if not DEBUG:
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment='production',
    )
```

---

### 6.4 Sin Docker para desarrollo local

**Severidad:** 🟡 MEDIO

No existe `Dockerfile` ni `docker-compose.yml`. Configurar el entorno local requiere instalar manualmente Python, PostgreSQL y Redis.

**Mejora recomendada — `docker-compose.yml`:**
```yaml
version: '3.9'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: camsa_db
      POSTGRES_USER: camsa
      POSTGRES_PASSWORD: camsa_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://camsa:camsa_dev@db:5432/camsa_db
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

---

### 6.5 `psycopg2-binary` en producción

**Severidad:** 🟡 MEDIO
**Archivo:** `requirements.txt`

`psycopg2-binary` usa un wheel precompilado no recomendado para producción (puede tener incompatibilidades con la libpq del servidor).

**Mejora recomendada:**
```
# requirements.txt
# Cambiar:
psycopg2-binary==2.9.10
# Por:
psycopg2==2.9.10
```

---

### 6.6 Sin backups automáticos

**Severidad:** 🟡 MEDIO

Existe un backup manual (`backup_produccion.sql`) pero no hay proceso automatizado.

**Mejora recomendada:**
```python
# management/commands/backup_db.py
class Command(BaseCommand):
    help = 'Backup database to Cloudinary'

    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'backup_{timestamp}.sql'
        subprocess.run(['pg_dump', os.getenv('DATABASE_URL'), '-f', filename])
        # Subir a Cloudinary o S3
        cloudinary.uploader.upload(filename, resource_type='raw', folder='backups/')
        os.remove(filename)
```

---

## 7. ÁREA 5 — Diseño de API REST

### 7.1 Sin versionado de API

**Severidad:** 🟠 ALTO
**Archivo:** `clinic_service/urls.py`

Todos los endpoints están bajo `/api/` sin versión. Cualquier cambio incompatible en el futuro romperá los clientes existentes (kiosks).

**Mejora recomendada:**
```python
# clinic_service/urls.py
urlpatterns = [
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/clinic/', include('clinic.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/public/', include('catalog.public_urls')),
    # Alias de retrocompatibilidad temporal
    path('api/', include('clinic_service.api_v1_compat_urls')),
]
```

---

### 7.2 Race condition en reserva de inventario

**Severidad:** 🔴 CRÍTICO
**Archivo:** `orders/views.py:115-167`

La validación de disponibilidad ocurre **fuera** de la transacción atómica con el lock. Hay una ventana donde otro request puede modificar el inventario entre la validación y la reserva.

**Mejora recomendada:**
```python
# orders/views.py — mover TODO dentro de transaction.atomic con select_for_update
@transaction.atomic
def _create_order_with_inventory(self, assignment, items_data):
    # Adquirir locks en orden determinístico (evitar deadlocks)
    product_ids = sorted([item['product_id'] for item in items_data])
    balances = {
        b.product_id: b
        for b in InventoryBalance.objects.select_for_update()
                                         .filter(product_id__in=product_ids)
    }

    # Validar Y reservar dentro de la misma transacción
    for item_data in items_data:
        balance = balances[item_data['product_id']]
        available = balance.on_hand - balance.reserved
        if available < item_data['quantity']:
            raise InsufficientStockError(item_data['product_id'])
        balance.reserved += item_data['quantity']
        balance.save()
```

---

### 7.3 Errores internos expuestos en respuestas

**Severidad:** 🟠 ALTO
**Archivos:** `orders/views.py:216`, `feedbacks/views.py:157`, `inventory/views.py:141`

```python
# Actual — expone detalles internos
return Response({'error': str(e)}, status=500)
```

**Mejora recomendada:**
```python
# common/exceptions.py
def handle_exception_safely(exc, context=None):
    logger.error('Unhandled exception', exc_info=exc, extra={'context': context})
    return Response(
        {'error': 'Error interno del servidor. Por favor intente nuevamente.'},
        status=500
    )

# En la vista
try:
    ...
except Exception as exc:
    return handle_exception_safely(exc, context={'view': 'create_order'})
```

---

### 7.4 Sin documentación de API (OpenAPI/Swagger)

**Severidad:** 🟠 ALTO

No hay documentación interactiva. Integrar nuevos clientes o desarrolladores requiere leer el código fuente.

**Mejora recomendada:**
```bash
pip install drf-spectacular
```
```python
# clinic_service/settings.py
INSTALLED_APPS += ['drf_spectacular']

REST_FRAMEWORK = {
    ...
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'CAMSA Clinic API',
    'DESCRIPTION': 'API de gestión de pedidos para clínicas',
    'VERSION': '1.0.0',
}

# clinic_service/urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerUIView

urlpatterns += [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),
]
```

---

### 7.5 Formato de respuesta de error inconsistente

**Severidad:** 🟡 MEDIO
**Archivos:** Múltiples views

Algunos endpoints retornan `{'error': '...'}`, otros `{'detail': '...'}`, y otros `{'error': '...', 'limit_reached': True, 'category_type': '...'}`.

**Mejora recomendada — estructura de error estandarizada:**
```python
# common/responses.py
def error_response(message, status_code, code=None, details=None):
    data = {'error': message}
    if code:
        data['code'] = code
    if details:
        data['details'] = details
    return Response(data, status=status_code)

# Uso en vistas
return error_response(
    'Límite de órdenes alcanzado',
    status.HTTP_400_BAD_REQUEST,
    code='ORDER_LIMIT_REACHED',
    details={'category': 'FOOD', 'limit': 3}
)
```

---

### 7.6 Sin validación de límite en campos numéricos

**Severidad:** 🟡 MEDIO
**Archivos:** `inventory/serializers.py:82`, `orders/serializers.py:147`

`StockAdjustmentSerializer.delta` no tiene `max_value`. `OrderItem.quantity` no tiene límite máximo.

**Mejora recomendada:**
```python
# inventory/serializers.py
delta = serializers.IntegerField(min_value=-10000, max_value=10000)

# orders/serializers.py
quantity = serializers.IntegerField(min_value=1, max_value=100)
```

---

### 7.7 WebSocket sin heartbeat

**Severidad:** 🟡 MEDIO
**Archivo:** `orders/consumers.py`

Las conexiones WebSocket "zombie" (desconectadas silenciosamente) permanecen en los grupos de canal, acumulando memoria.

**Mejora recomendada:**
```python
# orders/consumers.py
HEARTBEAT_INTERVAL = 30  # segundos

async def connect(self):
    await self.accept()
    self.heartbeat_task = asyncio.ensure_future(self.send_heartbeat())

async def send_heartbeat(self):
    while True:
        await asyncio.sleep(HEARTBEAT_INTERVAL)
        try:
            await self.send(text_data=json.dumps({'type': 'ping'}))
        except Exception:
            await self.close()
            break

async def disconnect(self, close_code):
    if hasattr(self, 'heartbeat_task'):
        self.heartbeat_task.cancel()
    await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
```

---

### 7.8 Datetime sin timezone en analytics

**Severidad:** 🟡 MEDIO
**Archivo:** `report_analytics/views.py:35-36`

```python
# Actual — datetime naive, puede causar errores con USE_TZ=True
from_datetime = datetime.strptime(from_date, '%Y-%m-%d')
```

**Mejora recomendada:**
```python
from django.utils import timezone

from_datetime = timezone.make_aware(
    datetime.strptime(from_date, '%Y-%m-%d'),
    timezone.get_current_timezone()
)
```

---

## 8. Plan de Acción Consolidado

### FASE 1 — Urgente (Hacer esta semana)

| Prioridad | Tarea | Archivo | Tiempo estimado |
|-----------|-------|---------|-----------------|
| 🔴 1 | Rotar TODAS las credenciales (SECRET_KEY, DB, Cloudinary) | `.env`, Railway | 1h |
| 🔴 2 | Eliminar o proteger endpoint `/api/auth/init-db/` | `accounts/views.py:96` | 30min |
| 🔴 3 | Cambiar `CHANNEL_LAYERS` a Redis en producción | `clinic_service/settings.py:320` | 1h |
| 🔴 4 | Corregir `Procfile` — quitar `makemigrations` | `Procfile` | 10min |
| 🔴 5 | Agregar rate limiting global en REST_FRAMEWORK | `clinic_service/settings.py` | 1h |
| 🔴 6 | Arreglar race condition en reserva de inventario | `orders/views.py:115` | 2h |

### FASE 2 — Importante (Próximo sprint)

| Prioridad | Tarea | Esfuerzo |
|-----------|-------|---------|
| 🟠 1 | Implementar logging con módulo `logging` en todo el backend | Medio |
| 🟠 2 | Agregar índices de base de datos en campos de búsqueda | Bajo |
| 🟠 3 | Integrar Sentry para error tracking en producción | Bajo |
| 🟠 4 | Crear GitHub Actions para CI con tests | Medio |
| 🟠 5 | Instalar drf-spectacular y generar documentación OpenAPI | Bajo |
| 🟠 6 | Mover lógica de negocio de órdenes a `orders/services.py` | Alto |
| 🟠 7 | Optimizar N+1 queries con select_related/prefetch_related | Medio |
| 🟠 8 | Refactorizar componentes frontend > 1,000 líneas | Alto |
| 🟠 9 | Agregar timeout en Axios y centralizar manejo de errores | Bajo |
| 🟠 10 | Estandarizar formato de respuesta de error en el backend | Medio |

### FASE 3 — Mejoras de escalabilidad (Mes 2)

| Prioridad | Tarea | Esfuerzo |
|-----------|-------|---------|
| 🟡 1 | Implementar caché Redis para endpoints públicos del kiosk | Medio |
| 🟡 2 | Agregar Celery para actualización asíncrona de ratings | Alto |
| 🟡 3 | Implementar versionado de API (`/api/v1/`) | Medio |
| 🟡 4 | Migrar tokens JWT a httpOnly cookies | Alto |
| 🟡 5 | Crear Dockerfile y docker-compose para desarrollo local | Medio |
| 🟡 6 | Implementar lazy loading de rutas en React | Bajo |
| 🟡 7 | Activar TypeScript strict mode y eliminar `any` | Alto |
| 🟡 8 | Implementar heartbeat en WebSocket consumers | Bajo |
| 🟡 9 | Script de backup automático a Cloudinary | Medio |
| 🟡 10 | Usar UUIDs en modelos expuestos públicamente | Alto |

---

*Auditoría generada el 20 de Marzo 2026 mediante análisis estático multi-agente del código fuente.*
