# Documentación WebSockets - Sistema de Pedidos en Tiempo Real

## Descripción General

Esta aplicación usa **Django Channels** con **Redis** para comunicación WebSocket en tiempo real. Hay dos tipos de WebSocket:

1. **WebSocket Staff** - Para que el personal/admin reciba notificaciones de nuevos pedidos
2. **WebSocket Kiosk** - Para que los iPads reciban actualizaciones del estado de sus pedidos

---

## 🚀 Guía de Configuración Paso a Paso

### Paso 1: Instalar Redis

Redis es necesario para que los WebSockets funcionen. Elige tu sistema operativo:

#### **Windows**

**Opción A: Usando Chocolatey (recomendado)**
```bash
# 1. Instala Chocolatey si no lo tienes: https://chocolatey.org/install

# 2. Instala Redis
choco install redis-64

# 3. Inicia el servicio
redis-server
```

**Opción B: Usando WSL2 (Windows Subsystem for Linux)**
```bash
# En WSL2 (Ubuntu)
sudo apt-get update
sudo apt-get install redis-server

# Inicia Redis
sudo service redis-server start
```

**Opción C: Usando Memurai (alternativa nativa para Windows)**
```bash
# Descarga desde: https://www.memurai.com/
# Instala y ejecuta como servicio de Windows
```

#### **macOS**
```bash
# Instala Redis usando Homebrew
brew install redis

# Inicia Redis como servicio
brew services start redis

# O ejecuta manualmente
redis-server
```

#### **Linux (Ubuntu/Debian)**
```bash
# Instala Redis
sudo apt-get update
sudo apt-get install redis-server

# Inicia el servicio
sudo systemctl start redis
sudo systemctl enable redis  # Para que inicie automáticamente

# Verifica que esté corriendo
sudo systemctl status redis
```

**✅ Verificar que Redis está corriendo:**
```bash
redis-cli ping
# Debe responder: PONG
```

---

### Paso 2: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```bash
# Redis URL (local por defecto)
REDIS_URL=redis://localhost:6379/0

# Orígenes permitidos para WebSockets (frontend)
WS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Si usas Redis en otro servidor:
# REDIS_URL=redis://usuario:password@servidor:6379/0
```

---

### Paso 3: Instalar Dependencias de Python

Las dependencias ya están en `requirements.txt`:

```bash
# Activa tu entorno virtual primero
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Instala las dependencias
pip install -r requirements.txt
```

Esto instalará:
- `channels==4.2.0` - Django Channels para WebSockets
- `channels-redis==4.2.1` - Backend Redis para channels
- `daphne==4.1.2` - Servidor ASGI (reemplaza a WSGI)

---

### Paso 4: Ejecutar el Servidor

Ahora puedes ejecutar el servidor con soporte para WebSockets:

```bash
# Opción 1: Usando runserver de Django (desarrollo)
python manage.py runserver

# Opción 2: Usando Daphne directamente (más cercano a producción)
daphne -b 0.0.0.0 -p 8000 clinic_service.asgi:application
```

**✅ Verificar que funciona:**

Deberías ver algo como:
```
Performing system checks...

System check identified no issues (0 silenced).
January 15, 2025 - 14:30:00
Django version 5.2.3, using settings 'clinic_service.settings'
Starting ASGI/Daphne version 4.1.2 development server at http://0.0.0.0:8000/
Quit the server with CTRL-BREAK.
```

---

### Paso 5: Probar los WebSockets

#### Instalar herramienta de prueba (opcional pero recomendado)

```bash
# Instala wscat globalmente
npm install -g wscat
```

#### **Probar WebSocket de Staff**

1. Primero obtén un token JWT:
```bash
# Login para obtener token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"tu_password"}'

# Copia el "access" token de la respuesta
```

2. Conecta el WebSocket:
```bash
wscat -c "ws://localhost:8000/ws/staff/orders/?token=TU_TOKEN_AQUI"

# Deberías ver:
# Connected (press CTRL+C to quit)
```

#### **Probar WebSocket de Kiosk**

```bash
# Conecta con un device_uid válido
wscat -c "ws://localhost:8000/ws/kiosk/orders/?device_uid=ipad-room-101"

# Deberías ver:
# Connected (press CTRL+C to quit)
```

#### **Generar eventos de prueba**

En otra terminal, crea un pedido para ver las notificaciones:

```bash
# Crear pedido (esto enviará notificación al WebSocket de staff)
curl -X POST http://localhost:8000/api/public/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "device_uid": "ipad-room-101",
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

Deberías ver en el WebSocket de staff:
```json
{
  "type": "new_order",
  "order_id": 1,
  "room_code": null,
  "device_uid": "ipad-room-101",
  "placed_at": "2025-01-15T14:30:00.000Z"
}
```

---

## 📡 Detalles de los WebSockets

### WebSocket para Staff (Personal)

#### **Endpoint**
```
ws://localhost:8000/ws/staff/orders/?token=<JWT_ACCESS_TOKEN>
```

#### **Autenticación**
- **Requerido**: Token JWT de acceso en el query string
- **Permiso**: El usuario debe tener rol `STAFF` o `ADMIN`

#### **Ejemplo de Conexión (JavaScript)**

```javascript
// Obtener token JWT del login
const token = localStorage.getItem('access_token');

// Conectar al WebSocket
const ws = new WebSocket(`ws://localhost:8000/ws/staff/orders/?token=${token}`);

ws.onopen = () => {
  console.log('✅ Conectado al WebSocket de pedidos (staff)');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Mensaje recibido:', data);

  if (data.type === 'new_order') {
    // Manejar notificación de nuevo pedido
    mostrarNotificacion(`Nuevo pedido #${data.order_id} desde ${data.device_uid}`);
    reproducirSonido();
    actualizarListaPedidos();
  }
};

ws.onerror = (error) => {
  console.error('❌ Error en WebSocket:', error);
};

ws.onclose = (event) => {
  console.log('🔌 WebSocket cerrado:', event.code);
  // Lógica de reconexión aquí
  setTimeout(() => conectarWebSocket(), 3000);
};
```

#### **Eventos Recibidos**

##### Evento: `new_order`

Se dispara cuando se crea un nuevo pedido desde un kiosk.

```json
{
  "type": "new_order",
  "order_id": 123,
  "room_code": "101",
  "device_uid": "ipad-room-101",
  "placed_at": "2025-01-15T14:30:00.000Z"
}
```

**Campos:**
- `type` (string): Siempre es "new_order"
- `order_id` (int): ID del pedido recién creado
- `room_code` (string|null): Código de habitación si tiene asignada
- `device_uid` (string): UID del dispositivo que hizo el pedido
- `placed_at` (string): Timestamp ISO 8601 de cuándo se hizo el pedido

#### **Códigos de Error**

- `4001` - Token JWT faltante o inválido
- `4003` - Usuario no es staff ni admin

---

### WebSocket para Kiosk (iPad)

#### **Endpoint**
```
ws://localhost:8000/ws/kiosk/orders/?device_uid=<DEVICE_UID>
```

#### **Autenticación**
- **Requerido**: `device_uid` válido en el query string
- **Validación**: El dispositivo debe existir y estar activo en la base de datos

#### **Ejemplo de Conexión (JavaScript)**

```javascript
// UID del dispositivo (almacenado en el iPad/kiosk)
const deviceUid = 'ipad-room-101';

// Conectar al WebSocket
const ws = new WebSocket(`ws://localhost:8000/ws/kiosk/orders/?device_uid=${deviceUid}`);

ws.onopen = () => {
  console.log('✅ Conectado al WebSocket de pedidos (kiosk)');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Actualización recibida:', data);

  if (data.type === 'order_status_changed') {
    // Actualizar UI con el nuevo estado
    actualizarEstadoPedido(data.order_id, data.status);

    // Notificaciones específicas por estado
    if (data.status === 'READY') {
      mostrarNotificacion('¡Tu pedido está listo para recoger!', 'success');
      reproducirSonido('orden-lista');
    } else if (data.status === 'PREPARING') {
      mostrarNotificacion('Tu pedido está siendo preparado', 'info');
    } else if (data.status === 'DELIVERED') {
      mostrarNotificacion('Pedido entregado. ¡Gracias!', 'success');
      setTimeout(() => cerrarNotificacionPedido(data.order_id), 5000);
    } else if (data.status === 'CANCELLED') {
      mostrarNotificacion('El pedido ha sido cancelado', 'warning');
    }
  }
};

ws.onerror = (error) => {
  console.error('❌ Error en WebSocket:', error);
};

ws.onclose = (event) => {
  console.log('🔌 WebSocket cerrado:', event.code);
  // Reconectar automáticamente
  setTimeout(() => conectarWebSocket(), 3000);
};
```

#### **Eventos Recibidos**

##### Evento: `order_status_changed`

Se dispara cuando cambia el estado de un pedido (ej: PLACED → PREPARING → READY → DELIVERED).

```json
{
  "type": "order_status_changed",
  "order_id": 123,
  "status": "READY",
  "from_status": "PREPARING",
  "changed_at": "2025-01-15T14:35:00.000Z"
}
```

**Campos:**
- `type` (string): Siempre es "order_status_changed"
- `order_id` (int): ID del pedido
- `status` (string): Nuevo estado (PLACED, PREPARING, READY, DELIVERED, CANCELLED)
- `from_status` (string): Estado anterior
- `changed_at` (string): Timestamp ISO 8601 del cambio

#### **Códigos de Error**

- `4001` - device_uid faltante o inválido (dispositivo no existe o está inactivo)

---

## 🔧 Detalles Técnicos de Implementación

### Grupos de Canales (Channel Groups)

El sistema usa grupos de canales para organizar las conexiones:

1. **Grupo Staff**: `staff_orders`
   - Todos los usuarios staff/admin conectados se unen a este grupo
   - Reciben notificaciones de TODOS los pedidos nuevos del sistema

2. **Grupo por Dispositivo**: `device_{device_id}`
   - Cada kiosk/iPad se une a su propio grupo específico
   - Solo recibe actualizaciones de estado de SUS propios pedidos

### Cómo se Envían los Eventos

Los eventos se emiten usando el sistema de mensajería grupal de Django Channels:

```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

# Enviar a todos los staff (nuevo pedido)
async_to_sync(channel_layer.group_send)(
    'staff_orders',
    {
        'type': 'new_order',
        'order_id': order.id,
        'room_code': order.room.code,
        'device_uid': device.device_uid,
        'placed_at': order.placed_at.isoformat(),
    }
)

# Enviar a un kiosk específico (cambio de estado)
async_to_sync(channel_layer.group_send)(
    f'device_{device.id}',
    {
        'type': 'order_status_changed',
        'order_id': order.id,
        'status': 'READY',
        'from_status': 'PREPARING',
        'changed_at': timezone.now().isoformat(),
    }
)
```

---

## 💻 Ejemplos de Integración con React

### Hook de React para Staff

Crea este archivo: `hooks/useStaffOrders.ts`

```typescript
import { useEffect, useState, useRef } from 'react';

interface NewOrderEvent {
  type: 'new_order';
  order_id: number;
  room_code: string | null;
  device_uid: string;
  placed_at: string;
}

export function useStaffOrders(token: string | null) {
  const [newOrders, setNewOrders] = useState<NewOrderEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/staff/orders/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Conectado a WebSocket de staff');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: NewOrderEvent = JSON.parse(event.data);
      if (data.type === 'new_order') {
        console.log('🆕 Nuevo pedido:', data);
        setNewOrders(prev => [...prev, data]);

        // Notificación del navegador
        if (Notification.permission === 'granted') {
          new Notification(`Nuevo pedido #${data.order_id}`, {
            body: `De: ${data.device_uid}`,
            icon: '/icon-order.png'
          });
        }
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Error en WebSocket:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket cerrado');
      setIsConnected(false);

      // Reconectar después de 3 segundos
      setTimeout(() => {
        console.log('🔄 Intentando reconectar...');
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const clearOrders = () => setNewOrders([]);

  return { newOrders, isConnected, clearOrders };
}
```

**Uso del hook:**

```typescript
// En tu componente de dashboard de staff
import { useStaffOrders } from './hooks/useStaffOrders';

function StaffDashboard() {
  const token = localStorage.getItem('access_token');
  const { newOrders, isConnected, clearOrders } = useStaffOrders(token);

  return (
    <div>
      <div className="status">
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>

      <h2>Pedidos Nuevos ({newOrders.length})</h2>
      {newOrders.map(order => (
        <div key={order.order_id} className="order-notification">
          <h3>Pedido #{order.order_id}</h3>
          <p>Dispositivo: {order.device_uid}</p>
          <p>Habitación: {order.room_code || 'N/A'}</p>
          <p>Hora: {new Date(order.placed_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Hook de React para Kiosk

Crea este archivo: `hooks/useKioskOrders.ts`

```typescript
import { useEffect, useRef } from 'react';

interface StatusChangeEvent {
  type: 'order_status_changed';
  order_id: number;
  status: string;
  from_status: string;
  changed_at: string;
}

export function useKioskOrders(
  deviceUid: string,
  onStatusChange: (event: StatusChangeEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/kiosk/orders/?device_uid=${deviceUid}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Conectado a WebSocket de kiosk');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: StatusChangeEvent = JSON.parse(event.data);
      if (data.type === 'order_status_changed') {
        console.log('📬 Estado actualizado:', data);
        onStatusChange(data);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Error en WebSocket:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket cerrado, reconectando...');
      setIsConnected(false);

      // Reconectar automáticamente
      setTimeout(() => {
        console.log('🔄 Reconectando...');
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, [deviceUid, onStatusChange]);

  return { isConnected, wsRef };
}
```

**Uso del hook:**

```typescript
// En tu componente de iPad/Kiosk
import { useKioskOrders } from './hooks/useKioskOrders';

function KioskApp() {
  const deviceUid = 'ipad-room-101'; // Obtener del almacenamiento local
  const [orders, setOrders] = useState([]);

  const handleStatusChange = (event: StatusChangeEvent) => {
    // Actualizar el pedido en el estado local
    setOrders(prev => prev.map(order =>
      order.id === event.order_id
        ? { ...order, status: event.status }
        : order
    ));

    // Mostrar notificación según el estado
    if (event.status === 'READY') {
      showToast('¡Tu pedido está listo! 🎉', 'success');
      playSound('/sounds/order-ready.mp3');
    } else if (event.status === 'PREPARING') {
      showToast('Estamos preparando tu pedido... 👨‍🍳', 'info');
    }
  };

  const { isConnected } = useKioskOrders(deviceUid, handleStatusChange);

  return (
    <div>
      <div className="connection-status">
        {isConnected ? '🟢 En línea' : '🔴 Sin conexión'}
      </div>

      <h2>Mis Pedidos</h2>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          // El estado se actualiza automáticamente vía WebSocket
        />
      ))}
    </div>
  );
}
```

---

## 🧪 Solución de Problemas

### Problema 1: El WebSocket no se conecta

#### ✅ Verifica que Redis esté corriendo

```bash
# Test de conexión a Redis
redis-cli ping

# Debe responder: PONG
```

Si no responde:
- **Windows**: Ejecuta `redis-server` en una terminal
- **macOS/Linux**: `brew services start redis` o `sudo systemctl start redis`

#### ✅ Verifica que el servidor ASGI esté corriendo

```bash
# Debe estar corriendo con Daphne o runserver
python manage.py runserver

# O
daphne clinic_service.asgi:application
```

**NO uses** gunicorn o uwsgi (solo soportan WSGI, no ASGI)

#### ✅ Verifica los orígenes permitidos

En tu `.env`:
```bash
WS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Asegúrate de incluir el origen de tu frontend.

---

### Problema 2: No recibo mensajes en el WebSocket

#### ✅ Verifica la configuración del channel layer

Abre el shell de Django:
```bash
python manage.py shell
```

Ejecuta:
```python
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()
print(channel_layer)

# Debe mostrar: RedisChannelLayer
```

Si muestra `InMemoryChannelLayer`, revisa tu `settings.py` y asegúrate de que Redis esté configurado correctamente.

#### ✅ Revisa los logs del servidor

Busca errores como:
- `Connection refused` - Redis no está corriendo
- `Authentication failed` - Credenciales de Redis incorrectas
- `Group send failed` - Problema con el channel layer

---

### Problema 3: Errores de autenticación

#### Error 4001 en Staff WebSocket

```bash
# El token puede estar:
# 1. Expirado (verifica la fecha de expiración)
# 2. Mal formado (debe ser solo el access token, sin "Bearer ")
# 3. Inválido (genera un nuevo token haciendo login)
```

**Solución:**
```bash
# Haz login nuevamente para obtener un token fresco
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tu_password"}'

# Usa el "access" token (no "refresh")
```

#### Error 4001 en Kiosk WebSocket

```bash
# El device_uid puede:
# 1. No existir en la base de datos
# 2. Estar inactivo (is_active=False)
```

**Solución:**
```python
# Verifica en el shell de Django
python manage.py shell

from clinic.models import Device
device = Device.objects.filter(device_uid='ipad-room-101').first()
print(f"Existe: {device is not None}")
print(f"Activo: {device.is_active if device else 'N/A'}")

# Si no existe, créalo:
Device.objects.create(
    device_uid='ipad-room-101',
    device_type='IPAD',
    is_active=True
)
```

#### Error 4003 en Staff WebSocket

El usuario no tiene permisos de STAFF o ADMIN.

**Solución:**
```python
# En el shell de Django
from accounts.models import User
user = User.objects.get(email='tu@email.com')
user.role = 'STAFF'  # O 'ADMIN'
user.save()
```

---

### Problema 4: El WebSocket se desconecta constantemente

Posibles causas:
1. **Timeout del proxy** (si usas Nginx/Apache)
2. **Inactividad** - El servidor cierra conexiones inactivas
3. **Límite de conexiones de Redis**

**Solución:**

Implementa reconexión automática en tu cliente:

```javascript
let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:8000/ws/staff/orders/?token=' + token);

  ws.onopen = () => {
    console.log('✅ Conectado');
    reconnectAttempts = 0; // Reset contador
  };

  ws.onclose = () => {
    console.log('🔌 Desconectado');

    // Reconectar con backoff exponencial
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`Reconectando en ${delay}ms...`);

      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket();
      }, delay);
    } else {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
    }
  };

  // Implementa ping/pong para mantener la conexión viva
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000); // Cada 30 segundos
}

connectWebSocket();
```

---

## 🚀 Despliegue en Producción

### 1. Configuración de Redis en Producción

**Opción A: Redis Cloud (Recomendado para principiantes)**

```bash
# Obtén una cuenta gratis en: https://redis.com/try-free/
# Copia tu REDIS_URL

# En .env de producción:
REDIS_URL=redis://default:password@redis-12345.cloud.redislabs.com:12345
```

**Opción B: Redis Auto-hospedado**

Configura Redis con persistencia (`redis.conf`):

```conf
# Guardar a disco
save 900 1      # Guardar si al menos 1 clave cambió en 900s
save 300 10     # Guardar si al menos 10 claves cambiaron en 300s
save 60 10000   # Guardar si al menos 10000 claves cambiaron en 60s

# Modo append-only (más seguro)
appendonly yes
appendfilename "appendonly.aof"

# Seguridad
requirepass tu_password_seguro_aqui
```

### 2. Ejecutar Daphne con Supervisor

Crea `/etc/supervisor/conf.d/clinic_daphne.conf`:

```ini
[program:clinic_daphne]
command=/home/usuario/venv/bin/daphne -b 0.0.0.0 -p 8000 clinic_service.asgi:application
directory=/home/usuario/camsa-project
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/clinic/daphne.log
stderr_logfile=/var/log/clinic/daphne_error.log
environment=PATH="/home/usuario/venv/bin"
```

Reinicia supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start clinic_daphne
```

### 3. Configuración de Nginx

Crea `/etc/nginx/sites-available/clinic`:

```nginx
upstream daphne {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Certificados SSL (usa Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración WebSocket
    location /ws/ {
        proxy_pass http://daphne;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts importantes para WebSocket
        proxy_read_timeout 86400;  # 24 horas
        proxy_send_timeout 86400;
    }

    # API REST normal
    location / {
        proxy_pass http://daphne;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos
    location /static/ {
        alias /home/usuario/camsa-project/staticfiles/;
    }
}
```

Activa el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/clinic /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

### 4. Usar `wss://` en lugar de `ws://`

En tu frontend de producción:

```javascript
// Detectar automáticamente http/ws vs https/wss
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws/staff/orders/?token=${token}`;

const ws = new WebSocket(wsUrl);
```

---

## 🔒 Consideraciones de Seguridad

### 1. Tokens JWT
- ✅ Mantén los tokens cortos (1 hora recomendado)
- ✅ Usa refresh tokens para renovar
- ✅ Nunca expongas tokens en logs
- ✅ Usa HTTPS en producción

### 2. Autenticación de Dispositivos
- ✅ Los device_uid deben ser únicos y difíciles de adivinar
- ✅ Considera agregar IP whitelist para kiosks
- ✅ Monitorea uso sospechoso de device_uid
- ✅ Implementa límite de intentos de conexión

### 3. Rate Limiting
```python
# Añadir a settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
            'capacity': 1500,  # Máximo de mensajes en cola
            'expiry': 10,  # Segundos antes de expirar mensajes
        },
    },
}
```

### 4. SSL/TLS
- ✅ Usa `wss://` en producción (nunca `ws://`)
- ✅ Configura certificados SSL correctamente
- ✅ Habilita HSTS headers
- ✅ Usa certificados de Let's Encrypt (gratis)

---

## 📚 Referencias

- [Django Channels - Documentación Oficial](https://channels.readthedocs.io/)
- [Channels Redis](https://github.com/django/channels_redis)
- [Daphne - Servidor ASGI](https://github.com/django/daphne)
- [WebSocket API - MDN](https://developer.mozilla.org/es/docs/Web/API/WebSocket)
- [Redis - Documentación](https://redis.io/docs/)

---

## ✨ Resumen de Comandos Rápidos

```bash
# 1. Instalar Redis (Windows con Chocolatey)
choco install redis-64

# 2. Iniciar Redis
redis-server

# 3. Verificar Redis
redis-cli ping

# 4. Instalar dependencias Python
pip install -r requirements.txt

# 5. Ejecutar servidor
python manage.py runserver

# 6. Probar WebSocket (con wscat)
npm install -g wscat
wscat -c "ws://localhost:8000/ws/staff/orders/?token=TU_TOKEN"

# 7. Crear pedido de prueba
curl -X POST http://localhost:8000/api/public/orders/create \
  -H "Content-Type: application/json" \
  -d '{"device_uid":"ipad-room-101","items":[{"product_id":1,"quantity":2}]}'
```

¡Listo! Ahora tienes WebSockets funcionando en tiempo real 🎉
