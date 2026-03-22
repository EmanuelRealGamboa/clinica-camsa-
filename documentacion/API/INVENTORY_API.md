# Inventory API - Documentación

## ✅ Implementación Completada

Se ha implementado un sistema completo de gestión de inventario con:
1. **InventoryBalance** - Balance actual de cada producto (OneToOne)
2. **InventoryMovement** - Registro histórico de movimientos
3. **Operaciones transaccionales** - Uso de `select_for_update()` y transacciones
4. **Validaciones de stock** - Prevención de stock negativo

---

## 📋 Modelos

### InventoryBalance Model

```python
class InventoryBalance(models.Model):
    product = OneToOneField(Product, on_delete=CASCADE)
    on_hand = IntegerField(default=0, validators=[MinValueValidator(0)])
    reserved = IntegerField(default=0, validators=[MinValueValidator(0)])
    reorder_level = IntegerField(blank=True, null=True, validators=[MinValueValidator(0)])
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Propiedades calculadas:**
- `available` - Cantidad disponible (on_hand - reserved)
- `needs_reorder` - Si está por debajo del nivel de reorden

**Ejemplo:**
```json
{
  "id": 1,
  "product": 1,
  "product_name": "Agua Natural",
  "product_category": "Bebidas",
  "product_sku": "BEB-001",
  "on_hand": 100,
  "reserved": 10,
  "available": 90,
  "reorder_level": 20,
  "needs_reorder": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

### InventoryMovement Model

```python
class InventoryMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ('RECEIPT', 'Receipt'),      # Recepción de stock
        ('ADJUSTMENT', 'Adjustment'), # Ajuste manual
        ('WASTE', 'Waste'),          # Desperdicio/pérdida
        ('RESERVE', 'Reserve'),      # Reservar para orden
        ('RELEASE', 'Release'),      # Liberar reserva
        ('CONSUME', 'Consume'),      # Consumir (orden completada)
    ]

    product = ForeignKey(Product, on_delete=CASCADE)
    movement_type = CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = IntegerField(validators=[MinValueValidator(1)])
    order = ForeignKey(Order, on_delete=SET_NULL, null=True, blank=True)
    created_by = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)
    note = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Ejemplo:**
```json
{
  "id": 1,
  "product": 1,
  "product_name": "Agua Natural",
  "movement_type": "RECEIPT",
  "movement_type_display": "Receipt",
  "quantity": 100,
  "order": null,
  "created_by": 1,
  "created_by_email": "staff@clinic.com",
  "note": "Initial stock",
  "created_at": "2024-01-15T10:00:00.000Z"
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

### 1. Listar Balances de Inventario

**GET** `/api/inventory/balances/`

**Descripción:** Ver todos los balances de inventario

**Response:**
```json
[
  {
    "id": 1,
    "product": 1,
    "product_name": "Agua Natural",
    "product_category": "Bebidas",
    "product_sku": "BEB-001",
    "on_hand": 100,
    "reserved": 10,
    "available": 90,
    "reorder_level": 20,
    "needs_reorder": false,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
]
```

---

### 2. Obtener Balance Específico

**GET** `/api/inventory/balances/{id}/`

**Descripción:** Ver balance de un producto específico

**Response:**
```json
{
  "id": 1,
  "product": 1,
  "product_name": "Agua Natural",
  "product_category": "Bebidas",
  "product_sku": "BEB-001",
  "on_hand": 100,
  "reserved": 10,
  "available": 90,
  "reorder_level": 20,
  "needs_reorder": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

---

### 3. Recibir Stock (Receipt)

**POST** `/api/inventory/stock/receipt`

**Descripción:** Aumentar el stock disponible (recepción de mercancía)

**Request:**
```json
{
  "product_id": 1,
  "quantity": 100,
  "note": "Initial stock receipt"
}
```

**Validaciones:**
- `product_id` debe existir y estar activo
- `quantity` debe ser mayor a 0
- `note` es opcional

**Response (201):**
```json
{
  "success": true,
  "message": "Stock received: 100 units",
  "balance": {
    "id": 1,
    "product": 1,
    "product_name": "Agua Natural",
    "on_hand": 100,
    "reserved": 0,
    "available": 100,
    "reorder_level": 20,
    "needs_reorder": false
  },
  "movement": {
    "id": 1,
    "product": 1,
    "product_name": "Agua Natural",
    "movement_type": "RECEIPT",
    "movement_type_display": "Receipt",
    "quantity": 100,
    "created_by": 1,
    "created_by_email": "staff@clinic.com",
    "note": "Initial stock receipt",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Características transaccionales:**
- Usa `transaction.atomic()`
- `select_for_update()` en Product y InventoryBalance
- Crea InventoryBalance si no existe
- Crea registro de movimiento

---

### 4. Ajustar Stock (Adjustment)

**POST** `/api/inventory/stock/adjust`

**Descripción:** Ajustar stock (positivo o negativo) por correcciones, pérdidas, etc.

**Request (incremento):**
```json
{
  "product_id": 1,
  "delta": 50,
  "note": "Found additional stock"
}
```

**Request (decremento):**
```json
{
  "product_id": 1,
  "delta": -5,
  "note": "Damaged items"
}
```

**Validaciones:**
- `product_id` debe existir y estar activo
- `delta` no puede ser 0
- El nuevo `on_hand` no puede ser negativo
- El nuevo `on_hand` no puede ser menor que `reserved`

**Response (200):**
```json
{
  "success": true,
  "message": "Stock adjusted by -5 units",
  "balance": {
    "id": 1,
    "product": 1,
    "product_name": "Agua Natural",
    "on_hand": 95,
    "reserved": 10,
    "available": 85,
    "reorder_level": 20,
    "needs_reorder": false
  },
  "movement": {
    "id": 2,
    "product": 1,
    "product_name": "Agua Natural",
    "movement_type": "ADJUSTMENT",
    "movement_type_display": "Adjustment",
    "quantity": 5,
    "note": "-5 - Damaged items",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Errores comunes:**

Stock insuficiente:
```json
{
  "error": "Insufficient stock. Current: 95, Requested delta: -100"
}
```

Reducción por debajo de reservado:
```json
{
  "error": "Cannot reduce stock below reserved quantity. Reserved: 10, New on_hand would be: 5"
}
```

**Características transaccionales:**
- Usa `transaction.atomic()`
- `select_for_update()` en Product y InventoryBalance
- Valida stock negativo
- Valida on_hand >= reserved
- Crea registro de movimiento

---

## 🧪 Ejemplos con cURL

### Autenticación

```bash
# 1. Login para obtener token
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@clinic.com", "password": "password123"}'

# Guarda el token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Listar Balances

```bash
# Ver todos los balances
curl -X GET http://127.0.0.1:8000/api/inventory/balances/ \
  -H "Authorization: Bearer $TOKEN"

# Ver balance específico
curl -X GET http://127.0.0.1:8000/api/inventory/balances/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Recibir Stock

```bash
# Recibir 100 unidades
curl -X POST http://127.0.0.1:8000/api/inventory/stock/receipt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 100,
    "note": "Initial stock"
  }'

# Recibir más stock
curl -X POST http://127.0.0.1:8000/api/inventory/stock/receipt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 50,
    "note": "Restock"
  }'
```

### Ajustar Stock

```bash
# Ajuste positivo (encontrar stock adicional)
curl -X POST http://127.0.0.1:8000/api/inventory/stock/adjust \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "delta": 10,
    "note": "Found additional stock in warehouse"
  }'

# Ajuste negativo (items dañados)
curl -X POST http://127.0.0.1:8000/api/inventory/stock/adjust \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "delta": -5,
    "note": "Damaged during transport"
  }'
```

---

## 🔒 Seguridad y Transacciones

### Select For Update

Todos los endpoints que modifican balances usan `select_for_update()`:

```python
with transaction.atomic():
    product = Product.objects.select_for_update().get(id=product_id)
    balance, created = InventoryBalance.objects.select_for_update().get_or_create(
        product=product,
        defaults={'on_hand': 0, 'reserved': 0}
    )
    # Modificar balance...
```

**Beneficios:**
- ✅ Previene race conditions
- ✅ Garantiza consistencia de datos
- ✅ Evita conflictos en concurrencia
- ✅ Locks a nivel de base de datos

### Validaciones

**Stock Receipt:**
- Product debe existir y estar activo
- Quantity > 0

**Stock Adjustment:**
- Product debe existir y estar activo
- Delta ≠ 0
- new_on_hand ≥ 0
- new_on_hand ≥ reserved

### Atomic Transactions

Todas las operaciones son atómicas:
- Si falla cualquier paso, se hace rollback
- Se crean balance + movement juntos
- Consistencia garantizada

---

## 🖥️ Admin Panel

Los modelos están registrados en el Django Admin:

**URL:** http://127.0.0.1:8000/admin/

### Sección INVENTORY

#### Inventory Balances
- **List display:** product, on_hand, reserved, available, reorder_level, needs_reorder
- **Filtros:** category, updated_at
- **Búsqueda:** product name, SKU
- **Permisos:** No se puede crear manualmente (usar API)

#### Inventory Movements
- **List display:** product, movement_type, quantity, created_by, order, created_at
- **Filtros:** movement_type, created_at, category
- **Búsqueda:** product name, note, created_by email
- **Permisos:** Solo lectura (no crear, no editar)

---

## 📊 Tipos de Movimientos

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **RECEIPT** | Recepción de stock | Entrada de mercancía del proveedor |
| **ADJUSTMENT** | Ajuste manual | Correcciones de inventario |
| **WASTE** | Desperdicio/pérdida | Items dañados, vencidos, etc. |
| **RESERVE** | Reservar para orden | Al crear una orden |
| **RELEASE** | Liberar reserva | Al cancelar una orden |
| **CONSUME** | Consumir stock | Al completar una orden |

---

## 📋 Flujo de Trabajo

### 1. Recepción Inicial de Stock

```bash
POST /api/inventory/stock/receipt
{
  "product_id": 1,
  "quantity": 100,
  "note": "Initial stock"
}
```

**Resultado:**
- on_hand: 0 → 100
- reserved: 0
- available: 100

### 2. Orden Crea Reserva (futuro)

```python
# Cuando se crea una orden
balance.reserved += order_quantity
InventoryMovement.create(type='RESERVE', quantity=order_quantity)
```

**Resultado:**
- on_hand: 100
- reserved: 0 → 10
- available: 90

### 3. Orden se Completa (futuro)

```python
# Cuando se completa una orden
balance.on_hand -= order_quantity
balance.reserved -= order_quantity
InventoryMovement.create(type='CONSUME', quantity=order_quantity)
```

**Resultado:**
- on_hand: 100 → 90
- reserved: 10 → 0
- available: 90

### 4. Ajuste por Daño

```bash
POST /api/inventory/stock/adjust
{
  "product_id": 1,
  "delta": -5,
  "note": "Damaged items"
}
```

**Resultado:**
- on_hand: 90 → 85
- reserved: 0
- available: 85

---

## 🐛 Troubleshooting

### Error: "Authentication credentials were not provided"

**Causa:** No se envió el token JWT.

**Solución:** Agrega el header Authorization:
```bash
-H "Authorization: Bearer <access_token>"
```

### Error: "Product not found or inactive"

**Causa:** El product_id no existe o el producto está inactivo.

**Solución:** Verifica que el producto existe y está activo:
```bash
GET /api/catalog/products/{id}/
```

### Error: "Insufficient stock"

**Causa:** Intentando reducir stock por debajo de 0.

**Solución:** Verifica el balance actual:
```bash
GET /api/inventory/balances/
```

### Error: "Cannot reduce stock below reserved quantity"

**Causa:** Intentando reducir on_hand por debajo de la cantidad reservada.

**Solución:** Primero libera las reservas o ajusta con un delta menor.

---

## ✨ Resumen

✅ **Modelos:** InventoryBalance (OneToOne), InventoryMovement (historial)
✅ **Transacciones:** Uso de `transaction.atomic()` y `select_for_update()`
✅ **Validaciones:** Stock no negativo, on_hand >= reserved
✅ **Endpoints:** Receipt (recepción), Adjust (ajustes), Balances (consulta)
✅ **Admin:** Interfaces de solo lectura para auditoría
✅ **Tipos de movimiento:** 6 tipos (RECEIPT, ADJUSTMENT, WASTE, RESERVE, RELEASE, CONSUME)
✅ **Seguridad:** Prevención de race conditions y consistencia garantizada

El sistema está listo para gestionar inventario con total seguridad transaccional.
