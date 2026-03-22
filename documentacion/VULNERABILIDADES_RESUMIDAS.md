# VULNERABILIDADES CRÍTICAS - CAMSA
## Explicación simple para aplicación en Railway Hobby

---

## 1. 🔴 ENDPOINT `/api/auth/init-db/` PÚBLICO
### ¿Cuál es el problema?

Existe un botón invisible que **cualquiera en internet** puede presionar para:
- Crear un usuario administrador (acceso total)
- Crear enfermeras con contraseñas conocidas
- Lo puede hacer una y otra vez

**Ubicación:** `http://tu-app/api/auth/init-db/`

Un atacante solo necesita saber esta URL y ejecutar: `curl http://tu-app/api/auth/init-db/`

### ¿Qué pasa si no se arregla?
- 🚨 **Alguien toma control total del sistema**
- Accede a todos los datos de pacientes
- Modifica órdenes
- Elimina información
- **Tu clínica pierde el sistema completamente**

### ¿Cómo se arregla?
**Opción 1 — Eliminar el endpoint (MÁS SEGURO):**
```python
# En accounts/urls.py, comenta o elimina la línea:
# path('init-db/', init_database_view, name='init_db'),

# Mover la creación de usuario admin a un comando manual:
# Ejecutar SOLO en local antes de desplegar:
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.create_superuser('admin@mail.com', 'password123')
```

**Opción 2 — Protegerlo con un token secreto (TEMPORAL):**
```python
# En accounts/views.py
@api_view(['POST'])
@permission_classes([AllowAny])
def init_database_view(request):
    token = request.data.get('init_token', '')
    # Generar: python -c "import secrets; print(secrets.token_hex(32))"
    if token != 'abc123def456...(tu-token-largo-generado)':
        return Response({'error': 'Forbidden'}, status=403)
    # resto del código...
```

### Impacto al arreglarlo
✅ **Positivo:**
- El sistema ya no puede ser inicializado por desconocidos
- La única forma es acceso a la consola del servidor
- Máxima seguridad

❌ **Negativo:**
- Ninguno (es CRÍTICO arreglarlo)

**⏰ Tiempo:** 10 minutos

---

## 2. 🔴 CREDENCIALES REALES EN ARCHIVOS `.env`
### ¿Cuál es el problema?

Tu contraseña de base de datos, API keys y secretos están guardados en archivos de texto:
- `SECRET_KEY=django-insecure-abc123xyz789`
- `DATABASE_PASSWORD=7444712868*eM`
- `CLOUDINARY_API_SECRET=fQCXB4MZSjrmuj253n7pV4AxH_M`

**¿Dónde están expuestas?**
1. Si alguien descarga tu código → obtiene todo
2. Si hacen `git log` en Railway → ven el historial
3. Cualquier persona con acceso al repositorio privado

### ¿Qué pasa si no se arregla?
- 🚨 **Acceso directo a tu base de datos**
- 🚨 **Acceso a tu cuenta de Cloudinary** → borran/roban imágenes
- 🚨 **Cualquiera puede crear sesiones falsas** con el SECRET_KEY
- Los atacantes no necesitan el servidor, directamente usan tus credenciales

### ¿Cómo se arregla?

**Paso 1 — Generar nuevas credenciales:**
```bash
# Nuevo SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Output: django-insecure-p9z6k@^z6_-5$v6l...

# Cambiar contraseña de BD en Railway:
# 1. Ve a Railway.app > tu proyecto > PostgreSQL
# 2. Settings > Change password

# Regenerar API de Cloudinary:
# 1. Ve a cloudinary.com
# 2. Settings > API Keys > Regenerate API Secret
```

**Paso 2 — Actualizar en Railway:**
```
1. Ve a Railway.app > tu proyecto > Variables
2. Actualiza:
   - SECRET_KEY = (nueva generada)
   - DATABASE_PASSWORD = (nueva de PostgreSQL)
   - CLOUDINARY_API_SECRET = (nuevo de Cloudinary)
3. Redeploy
```

**Paso 3 — Limpiar historial de git (AVANZADO):**
```bash
# Si las credenciales fueron pusheadas a GitHub:
# Este paso remove del historial (es destructivo)
git log --all --oneline | head
# Nota los commits antiguos

# Usar herramienta para limpiar:
pip install git-filter-repo
git filter-repo --path .env --invert-paths
git push --force-with-lease

# ⚠️ Esto reescribe la historia. Solo si está en repo privado.
```

### Impacto al arreglarlo
✅ **Positivo:**
- Las credenciales antiguas ya no funcionan
- Incluso si alguien tiene el código antiguo, no puede acceder
- Máxima seguridad

❌ **Negativo:**
- **TEMPORAL:** El app quebrará hasta que redeploys en Railway (2-3 min de downtime)
- **Ninguno más**

**⏰ Tiempo:** 15 minutos

---

## 3. 🔴 WEBSOCKETS CON `InMemoryChannelLayer`
### ¿Cuál es el problema?

Las notificaciones en tiempo real (cuando llega una orden, cuando se entrega) están guardadas **solo en la memoria del proceso**.

Con múltiples workers en Railway:
- **Worker 1** recibe orden → notifica en memoria local
- **Worker 2** tiene otro cliente conectado → ¡no recibe la notificación!

Resultado: Los staff ven notificaciones incompletas, órdenes que no aparecen.

### ¿Qué pasa si no se arregla?
- 📲 **Los datos en tiempo real no se sincronizan** entre workers
- **Inconsistencia:** Staff A ve una orden, Staff B no la ve
- **Peor aún:** Con más de 1 worker en Railway, es caótico

### ¿Cómo se arregla?

**Cambiar a Redis (solución en 2 líneas):**
```python
# clinic_service/settings.py — líneas 320-324
# Cambiar esto:
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# Por esto:
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
```

**En Railway Hobby:**
- Ya tienes Redis instalado (verificar en Variables)
- Si no lo tienes: Railway > Add Service > Redis
- Railway genera la URL automáticamente

```python
# Versión más robusta (para Railway):
import os

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
        },
    },
}
```

### Impacto al arreglarlo
✅ **Positivo:**
- Notificaciones sincronizadas entre todos los workers
- El sistema escala sin problemas
- Staff verá órdenes en tiempo real correctamente

❌ **Negativo:**
- **TEMPORAL:** Desconexiones de WebSocket mientras redeploya (30-60 seg)
- Los clientes se reconectarán automáticamente

**⏰ Tiempo:** 5 minutos

---

## 4. 🔴 `makemigrations` EN EL PROCFILE
### ¿Cuál es el problema?

```
# Procfile actual (PELIGROSO)
web: python manage.py makemigrations && python manage.py migrate && ...
```

Cada vez que se despliega:
1. Django **intenta crear nuevas migraciones** automáticamente
2. Si hay cambios sin testear → **ROMPE LA BASE DE DATOS**

Ejemplo: Cambias un campo de `CharField` a `IntegerField` sin migración → app se congela.

### ¿Qué pasa si no se arregla?
- 🚨 **Deploy automático puede romper tu BD**
- Downtime impredecible
- Pérdida de datos potencial
- El app no levanta

### ¿Cómo se arregla?

**Cambiar Procfile:**
```
# Antes (INCORRECTO)
web: python manage.py makemigrations && python manage.py migrate && daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application

# Después (CORRECTO)
web: python manage.py migrate && daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application
```

**Flujo correcto:**
1. Hacer cambios en `models.py` localmente
2. Generar migración: `python manage.py makemigrations`
3. **Testear localmente:** `python manage.py migrate` y `python manage.py test`
4. Hacer commit: `git add -A && git commit -m "..."`
5. Push → Railway despliega y **aplica** migraciones (sin crearlas)

### Impacto al arreglarlo
✅ **Positivo:**
- El app no se rompe por cambios sin testear
- Migraciones son controladas y seguras
- Downtime CERO

❌ **Negativo:**
- **Ninguno** (es más seguro)

**⏰ Tiempo:** 2 minutos

---

## 5. 🔴 SIN RATE LIMITING
### ¿Cuál es el problema?

No hay límite en cuántas peticiones puede hacer alguien. Alguien podría:
- Enviar 1,000 peticiones por segundo → **DoS (deniega servicio)**
- Intentar contraseña 1,000 veces por segundo → **Fuerza bruta**
- Enumerar pacientes: `GET /patient/1, /patient/2, /patient/3...` → **Datos expuestos**

Tu app corre en Railway Hobby (máquina compartida) → Se cae fácilmente.

### ¿Qué pasa si no se arregla?
- 🚨 **Cualquiera puede tumbar tu app con un script simple**
- 🚨 **Alguien puede intentar adivinar contraseñas sin límite**
- 🚨 **Alguien puede extraer datos de pacientes iterando IDs**
- Tu app estará **DOWN** sin poder hacer nada

### ¿Cómo se arregla?

```python
# clinic_service/settings.py — agregar después de REST_FRAMEWORK

REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',      # Visitantes: 100 peticiones por hora
        'user': '1000/hour',      # Usuarios logueados: 1,000 por hora
    },
}
```

**Para endpoints públicos más estrictos:**
```python
# orders/views.py
from rest_framework.throttling import AnonRateThrottle

class PublicOrderThrottle(AnonRateThrottle):
    scope = 'public_order'

class PublicOrderCreateView(APIView):
    throttle_classes = [PublicOrderThrottle]
    # ...

# settings.py agregar:
'DEFAULT_THROTTLE_RATES': {
    ...
    'public_order': '20/hour',  # Solo 20 órdenes por hora por IP
}
```

### Impacto al arreglarlo
✅ **Positivo:**
- Protección contra DoS y ataques de fuerza bruta
- El app sigue funcionando incluso bajo carga
- Usuarios legítimos no notan nada

❌ **Negativo:**
- Los bots/scripts de prueba pueden ser bloqueados (pero es intencional)

**⏰ Tiempo:** 10 minutos

---

## 6. 🔴 RACE CONDITION EN INVENTARIO
### ¿Cuál es el problema?

Cuando 2 personas piden el último producto simultáneamente:

```
SITUACIÓN: Solo hay 1 producto en stock

Tiempo 1ms:  Usuario A → ¿Hay 1 en stock?
             Sistema: Sí ✅

Tiempo 2ms:  Usuario B → ¿Hay 1 en stock?
             Sistema: Sí ✅  (¡FALTA VERIFICAR DE NUEVO!)

Tiempo 3ms:  Usuario A → VENDO 1 → Ahora hay 0

Tiempo 4ms:  Usuario B → VENDO 1 → ¡¡¡VENDO 1 QUE NO EXISTE!!!

RESULTADO: -1 en inventario 🚨
```

### ¿Qué pasa si no se arregla?
- 📦 **Overselling:** Vendes más de lo que tienes
- 💸 **Pérdida de dinero:** Prometiste 2 productos, solo tienes 1
- 😠 **Clientes enojados:** Les llegas a entregar 1 en lugar de 2
- 📊 **Contabilidad rota:** El inventario no cuadra con las órdenes

### ¿Cómo se arregla?

**Usar locks de base de datos (ATOMIC TRANSACTIONS):**
```python
# orders/views.py
from django.db import transaction

@transaction.atomic  # ← IMPORTANTE: Bloquea cambios simultáneos
def create_order(self, request):
    items_data = request.data.get('items', [])
    assignment = request.data.get('assignment_id')

    # Bloquear el inventario mientras verificamos
    products = InventoryBalance.objects.select_for_update().filter(
        product__in=[item['product_id'] for item in items_data]
    )

    # Verificar dentro del mismo bloque
    for item in items_data:
        balance = products.get(product_id=item['product_id'])
        available = balance.on_hand - balance.reserved

        if available < item['quantity']:
            raise InsufficientStockError()  # Sale de la transacción

        # Si llegó aquí, NADIE MÁS puede tocar este inventario
        balance.reserved += item['quantity']
        balance.save()

    # Crear orden
    order = Order.objects.create(patient_assignment=assignment)
    return Response(OrderSerializer(order).data, status=201)
```

**¿Qué hace `@transaction.atomic`?**
- Mientras se procesa el request, **nadie más puede modificar ese inventario**
- O se completa TODO el request → COMMIT
- O falla en cualquier punto → ROLLBACK (deshace todo)
- ✅ Cero probabilidad de overselling

### Impacto al arreglarlo
✅ **Positivo:**
- Inventario 100% confiable
- Nunca overselling
- Contabilidad correcta

❌ **Negativo:**
- **Ninguno** (solo mejora)
- El request tarda 10-20ms más (imperceptible)

**⏰ Tiempo:** 1-2 horas

---

## 📋 RESUMEN DE ACCIONES

| # | Vulnerabilidad | Acción | Tiempo | Downtime | Prioridad |
|---|-----------------|--------|--------|----------|-----------|
| 1 | Endpoint init-db público | Eliminar o proteger | 10 min | NINGUNO | 🔴 HOY |
| 2 | Credenciales en .env | Rotar en Railway | 15 min | 2-3 min | 🔴 HOY |
| 3 | WebSocket no sincronizado | Cambiar a Redis | 5 min | 30-60 seg | 🔴 HOY |
| 4 | makemigrations en Procfile | Quitar línea | 2 min | NINGUNO | 🔴 HOY |
| 5 | Sin rate limiting | Agregar a settings.py | 10 min | NINGUNO | 🔴 MAÑANA |
| 6 | Race condition inventario | Agregar @transaction.atomic | 2 hrs | NINGUNO | 🔴 ESTA SEMANA |

---

## ⚡ PLAN DE IMPLEMENTACIÓN SUGERIDO

### Viernes (hoy) — 1.5 horas
```
14:00 — Punto 1: Eliminar endpoint (10 min)
14:10 — Punto 2: Rotar credenciales en Railway (15 min)
14:25 — Punto 3: Cambiar a Redis (5 min)
14:30 — Punto 4: Actualizar Procfile (2 min)
14:32 — Redeploy en Railway (5 min)

✅ Tu app está segura básicamente
```

### Lunes — 3 horas
```
09:00 — Punto 5: Agregar rate limiting (10 min)
09:10 — Punto 6: Arreglar race condition (2 hrs)
11:10 — Testing local + redeploy (30 min)

✅ Todas las vulnerabilidades críticas arregladas
```

---

**¿Tienes dudas sobre alguna vulnerabilidad? Pregunta y te explico más detalle.**
