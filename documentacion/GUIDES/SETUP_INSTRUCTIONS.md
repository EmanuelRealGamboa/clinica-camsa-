# Instrucciones de Configuración - Proyecto CAMSA

## Estado Actual de la Configuración

✅ **COMPLETADO:**
1. Archivo `.env` creado con credenciales de base de datos PostgreSQL
2. Entorno virtual de Python creado en `venv/`
3. Dependencias de Python instaladas desde `requirements.txt`
4. Dependencias del frontend instaladas (npm install)
5. Script de datos de prueba creado (`seed_demo_data.py`)

## Pasos Restantes (Ejecutar Manualmente)

### 1. Aplicar Migraciones de Django

Ejecuta las migraciones para crear las tablas en la base de datos `camsa_db`:

```bash
cd clinica-camsa-
.\venv\Scripts\activate
python manage.py migrate
```

Esto creará todas las tablas necesarias en PostgreSQL.

### 2. Crear Superusuario Admin

Crea el usuario administrador para acceder al panel de Django Admin:

```bash
python manage.py createsuperuser
```

Cuando te lo pida, ingresa:
- **Email**: `admin@camsa.com`
- **Full name**: `Admin CAMSA`
- **Password**: (Sugerencia segura: `Camsa2026!Admin` o la que prefieras)

### 3. Ejecutar Script de Datos de Prueba

Carga los datos de demostración (categorías, productos, salas, dispositivos, staff):

```bash
python manage.py seed_demo_data
```

Este comando creará:
- **Roles**: ADMIN y STAFF
- **Usuarios Staff** (3):
  - `enfermera.maria@camsa.com` / `staff123`
  - `enfermero.juan@camsa.com` / `staff123`
  - `enfermera.ana@camsa.com` / `staff123`
- **Categorías** (4): Bebidas, Snacks, Comida, Postres
- **Productos** (12): Con SKU y stock inicial de 100 unidades cada uno
- **Salas** (5): 101, 102, 103, 201, 202
- **Dispositivos** (4): IPAD-01, IPAD-02, IPAD-03, WEB-01
- **Pacientes** (3): Con asignaciones a staff y dispositivos

### 4. Iniciar el Backend de Django

En una terminal, ejecuta:

```bash
cd clinica-camsa-
.\venv\Scripts\activate
python manage.py runserver
```

El backend estará disponible en: **http://localhost:8000**

### 5. Iniciar el Frontend de React

En **OTRA terminal** (nueva ventana), ejecuta:

```bash
cd clinica-camsa-/frontend
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## Verificación del Sistema

Una vez que ambos servidores estén corriendo, puedes verificar:

### 1. Panel de Administración
- URL: http://localhost:5173/admin/login
- Login con cualquier cuenta de staff:
  - Email: `enfermera.maria@camsa.com`
  - Password: `staff123`

### 2. Kiosk (Punto de Venta)
- URL: http://localhost:5173/kiosk/IPAD-01
- Selecciona productos y crea una orden de prueba

### 3. Dashboard con Gráficas
- Accede al admin y navega al Dashboard
- Deberías ver 5 paneles de gráficas:
  1. Órdenes en tiempo real (por estado)
  2. Ocupación de salas
  3. Dispositivos activos (iPad vs Web)
  4. Satisfacción del cliente
  5. Productos más solicitados

### 4. WebSockets (Tiempo Real)
- Abre el kiosk en una pestaña: http://localhost:5173/kiosk/IPAD-01
- Abre el panel staff en otra pestaña: http://localhost:5173/admin/orders
- Crea una orden desde el kiosk
- La orden debería aparecer automáticamente en el panel de staff (tiempo real)

## Credenciales Creadas

### Superusuario (Django Admin)
- Email: `admin@camsa.com`
- Password: (la que ingresaste en el paso 2)

### Usuarios Staff (Frontend)
1. **María González**
   - Email: `enfermera.maria@camsa.com`
   - Password: `staff123`

2. **Juan Pérez**
   - Email: `enfermero.juan@camsa.com`
   - Password: `staff123`

3. **Ana Rodríguez**
   - Email: `enfermera.ana@camsa.com`
   - Password: `staff123`

## Estructura de Datos Creada

### Productos (12 items)
**Bebidas:**
- Agua Natural (BEB-001)
- Jugo de Naranja (BEB-002)
- Café (BEB-003)
- Té (BEB-004)

**Snacks:**
- Galletas (SNK-001)
- Fruta Picada (SNK-002)
- Yogurt (SNK-003)

**Comida:**
- Sopa de Verduras (COM-001)
- Ensalada César (COM-002)
- Sándwich de Pollo (COM-003)

**Postres:**
- Gelatina (POS-001)
- Flan (POS-002)

### Salas
- 101 (Piso 1)
- 102 (Piso 1)
- 103 (Piso 1)
- 201 (Piso 2)
- 202 (Piso 2)

### Dispositivos
- IPAD-01 → Sala 101
- IPAD-02 → Sala 102
- IPAD-03 → Sala 201
- WEB-01 → Sala 103

## Flujo de Prueba Completo

1. **Crear Orden desde Kiosk:**
   - Accede a http://localhost:5173/kiosk/IPAD-01
   - Selecciona productos
   - Completa la orden

2. **Ver Orden en Staff Dashboard:**
   - Login en http://localhost:5173/admin/login
   - Navega a "Órdenes"
   - Verás la orden en estado "PENDING"

3. **Cambiar Estado de Orden:**
   - Cambia el estado a "PREPARING", "READY", luego "DELIVERED"
   - Los cambios deben reflejarse en tiempo real vía WebSocket

4. **Modal de Satisfacción:**
   - Cuando marques una orden como "DELIVERED"
   - El kiosk mostrará automáticamente un modal pidiendo calificación (1-5 estrellas)

5. **Ver Dashboard con Gráficas:**
   - Navega al Dashboard
   - Verás estadísticas en tiempo real de órdenes, salas, dispositivos, etc.

## Solución de Problemas

### Error: "Database does not exist"
```bash
# Crear la base de datos manualmente en PostgreSQL:
psql -U postgres
CREATE DATABASE camsa_db;
\q
```

### Error: "Connection refused to PostgreSQL"
- Verifica que PostgreSQL esté corriendo
- Verifica que las credenciales en `.env` sean correctas

### Error: "Module not found"
```bash
# Reinstalar dependencias de Python
cd clinica-camsa-
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Error en el Frontend
```bash
# Reinstalar dependencias de npm
cd clinica-camsa-/frontend
npm install
```

### WebSockets no funcionan
- Verifica que el backend esté corriendo con `python manage.py runserver`
- Verifica que Redis esté corriendo (opcional, el proyecto usa InMemoryChannelLayer por defecto)

## Información de Configuración

### Archivo .env (Ya creado)
```env
SECRET_KEY=django-insecure-camsa-2026-dev-key-change-in-production-k9m2p4x7
DEBUG=True
DATABASE_URL=postgresql://postgres:emanuel@localhost:5432/camsa_db
CORS_ALLOWED_ORIGINS=http://localhost:5173
WS_ALLOWED_ORIGINS=http://localhost:5173
```

### Puertos Utilizados
- **Backend Django**: 8000
- **Frontend React**: 5173
- **PostgreSQL**: 5432

## Próximos Pasos

Una vez que todo esté funcionando:

1. Explora todas las funcionalidades del panel admin
2. Prueba el sistema de inventario (recibir stock, ajustes)
3. Crea más órdenes y observa las gráficas del dashboard
4. Prueba el sistema de feedback/satisfacción
5. Experimenta con las actualizaciones en tiempo real (WebSockets)

¡Disfruta explorando el sistema CAMSA! 🎉
