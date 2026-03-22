# Catalog API - Documentación

## ✅ Implementación Completada

Se ha implementado un sistema completo de catálogo de productos con dos tipos de endpoints:
1. **Staff endpoints** - CRUD completo (requiere autenticación)
2. **Public endpoints** - Solo lectura (sin autenticación)

### Modelos Implementados

1. **ProductCategory** - Categorías de productos
2. **Product** - Productos del catálogo

---

## 📋 Modelos

### ProductCategory Model

```python
class ProductCategory(models.Model):
    name = CharField(max_length=100, unique=True)  # Nombre único
    sort_order = IntegerField(default=0)  # Orden de visualización
    is_active = BooleanField(default=True)  # Activa/Inactiva
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Ejemplo:**
```json
{
  "id": 1,
  "name": "Bebidas",
  "sort_order": 1,
  "is_active": true,
  "product_count": 5,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

### Product Model

```python
class Product(models.Model):
    category = ForeignKey(ProductCategory, on_delete=CASCADE, related_name='products')
    name = CharField(max_length=200)  # Nombre del producto
    description = TextField(blank=True)  # Descripción
    image_url = URLField(max_length=500, blank=True)  # URL de imagen
    sku = CharField(max_length=50, unique=True, blank=True, null=True)  # SKU único opcional
    unit_label = CharField(max_length=50, default='unidad')  # Etiqueta de unidad
    is_active = BooleanField(default=True)  # Activo/Inactivo
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Ejemplo:**
```json
{
  "id": 1,
  "category": 1,
  "category_name": "Bebidas",
  "name": "Agua Natural",
  "description": "Agua purificada 500ml",
  "image_url": "https://example.com/images/agua.jpg",
  "sku": "BEB-001",
  "unit_label": "botella",
  "is_active": true,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

---

## 🔐 Permisos

### Staff Endpoints

**Requieren:**
- ✅ Usuario autenticado
- ✅ Rol **STAFF** o **ADMIN**

**Permission Class:** `IsStaffOrAdmin`

**Headers requeridos:**
```
Authorization: Bearer <access_token>
```

### Public Endpoints

**No requieren autenticación**
- ✅ Acceso público (AllowAny)
- ✅ Solo datos activos (is_active=True)
- ✅ Solo lectura (GET)

---

## 📡 Endpoints

## Staff Endpoints (Autenticados)

### ProductCategory - Staff

Base URL: `/api/catalog/categories`

#### 1. Listar Categorías

**GET** `/api/catalog/categories/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bebidas",
    "sort_order": 1,
    "is_active": true,
    "product_count": 5,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Alimentos",
    "sort_order": 2,
    "is_active": true,
    "product_count": 10,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Filtros disponibles:**
- `?is_active=true` - Filtrar por estado
- `?search=Bebidas` - Buscar por nombre
- `?ordering=sort_order` - Ordenar por orden
- `?ordering=-created_at` - Ordenar por fecha (descendente)

**Ejemplos:**
```bash
GET /api/catalog/categories/?is_active=true
GET /api/catalog/categories/?search=Bebidas
GET /api/catalog/categories/?ordering=sort_order
```

#### 2. Obtener Categoría

**GET** `/api/catalog/categories/{id}/`

**Response:**
```json
{
  "id": 1,
  "name": "Bebidas",
  "sort_order": 1,
  "is_active": true,
  "product_count": 5,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

#### 3. Crear Categoría

**POST** `/api/catalog/categories/`

**Request:**
```json
{
  "name": "Postres",
  "sort_order": 3,
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Postres",
  "sort_order": 3,
  "is_active": true,
  "product_count": 0,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

#### 4. Actualizar Categoría

**PUT** `/api/catalog/categories/{id}/`

**Request:**
```json
{
  "name": "Postres",
  "sort_order": 5,
  "is_active": true
}
```

**PATCH** `/api/catalog/categories/{id}/` (Actualización parcial)

**Request:**
```json
{
  "is_active": false
}
```

#### 5. Eliminar Categoría

**DELETE** `/api/catalog/categories/{id}/`

**Response (204):** No content

---

### Product - Staff

Base URL: `/api/catalog/products`

#### 1. Listar Productos

**GET** `/api/catalog/products/`

**Response:**
```json
[
  {
    "id": 1,
    "category": 1,
    "category_name": "Bebidas",
    "name": "Agua Natural",
    "description": "Agua purificada 500ml",
    "image_url": "https://example.com/images/agua.jpg",
    "sku": "BEB-001",
    "unit_label": "botella",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Filtros disponibles:**
- `?is_active=true` - Filtrar por estado
- `?category=1` - Filtrar por categoría
- `?search=Agua` - Buscar por nombre o descripción
- `?ordering=name` - Ordenar por nombre
- `?ordering=-created_at` - Ordenar por fecha

**Ejemplos:**
```bash
GET /api/catalog/products/?category=1
GET /api/catalog/products/?is_active=true
GET /api/catalog/products/?search=Agua
```

#### 2. Obtener Producto

**GET** `/api/catalog/products/{id}/`

#### 3. Crear Producto

**POST** `/api/catalog/products/`

**Request:**
```json
{
  "category": 1,
  "name": "Jugo de Naranja",
  "description": "Jugo natural de naranja 250ml",
  "image_url": "https://example.com/images/jugo.jpg",
  "sku": "BEB-002",
  "unit_label": "vaso",
  "is_active": true
}
```

**Validaciones:**
- `name` es requerido
- `category` debe existir
- `sku` debe ser único (si se proporciona)
- `image_url` debe ser URL válida

#### 4. Actualizar Producto

**PUT** `/api/catalog/products/{id}/`

**PATCH** `/api/catalog/products/{id}/`

**Request parcial:**
```json
{
  "is_active": false
}
```

#### 5. Eliminar Producto

**DELETE** `/api/catalog/products/{id}/`

---

## Public Endpoints (Sin Autenticación)

### PublicProductCategory

Base URL: `/api/public/categories`

#### 1. Listar Categorías Públicas

**GET** `/api/public/categories/`

**Sin autenticación requerida**

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bebidas",
    "sort_order": 1,
    "product_count": 5
  },
  {
    "id": 2,
    "name": "Alimentos",
    "sort_order": 2,
    "product_count": 10
  }
]
```

**Características:**
- Solo categorías activas (is_active=True)
- Campos limitados (sin created_at, updated_at, is_active)
- No requiere autenticación
- Solo lectura (GET)

**Filtros disponibles:**
- `?search=Bebidas` - Buscar por nombre
- `?ordering=sort_order` - Ordenar

#### 2. Obtener Categoría Pública

**GET** `/api/public/categories/{id}/`

**Response:**
```json
{
  "id": 1,
  "name": "Bebidas",
  "sort_order": 1,
  "product_count": 5
}
```

---

### PublicProduct

Base URL: `/api/public/products`

#### 1. Listar Productos Públicos

**GET** `/api/public/products/`

**Sin autenticación requerida**

**Response:**
```json
[
  {
    "id": 1,
    "category": 1,
    "category_name": "Bebidas",
    "name": "Agua Natural",
    "description": "Agua purificada 500ml",
    "image_url": "https://example.com/images/agua.jpg",
    "unit_label": "botella"
  }
]
```

**Características:**
- Solo productos activos (is_active=True)
- Solo de categorías activas (category__is_active=True)
- Campos limitados (sin sku, created_at, updated_at, is_active)
- No requiere autenticación
- Solo lectura (GET)

**Filtros disponibles:**
- `?category=1` - Filtrar por categoría
- `?search=Agua` - Buscar por nombre o descripción
- `?ordering=name` - Ordenar

**Ejemplos:**
```bash
GET /api/public/products/
GET /api/public/products/?category=1
GET /api/public/products/?search=Agua
```

#### 2. Obtener Producto Público

**GET** `/api/public/products/{id}/`

**Response:**
```json
{
  "id": 1,
  "category": 1,
  "category_name": "Bebidas",
  "name": "Agua Natural",
  "description": "Agua purificada 500ml",
  "image_url": "https://example.com/images/agua.jpg",
  "unit_label": "botella"
}
```

---

## 🧪 Ejemplos con cURL

### Staff Endpoints (con autenticación)

```bash
# 1. Login para obtener token
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@clinic.com", "password": "password123"}'

# Guarda el token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# 2. Listar categorías (Staff)
curl -X GET http://127.0.0.1:8000/api/catalog/categories/ \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear categoría (Staff)
curl -X POST http://127.0.0.1:8000/api/catalog/categories/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bebidas", "sort_order": 1, "is_active": true}'

# 4. Crear producto (Staff)
curl -X POST http://127.0.0.1:8000/api/catalog/products/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": 1,
    "name": "Agua Natural",
    "description": "Agua purificada 500ml",
    "image_url": "https://example.com/images/agua.jpg",
    "sku": "BEB-001",
    "unit_label": "botella",
    "is_active": true
  }'

# 5. Actualizar producto (Staff)
curl -X PATCH http://127.0.0.1:8000/api/catalog/products/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# 6. Eliminar categoría (Staff)
curl -X DELETE http://127.0.0.1:8000/api/catalog/categories/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Public Endpoints (sin autenticación)

```bash
# 1. Listar categorías públicas (sin token)
curl -X GET http://127.0.0.1:8000/api/public/categories/

# 2. Obtener categoría específica
curl -X GET http://127.0.0.1:8000/api/public/categories/1/

# 3. Listar productos públicos
curl -X GET http://127.0.0.1:8000/api/public/products/

# 4. Filtrar productos por categoría
curl -X GET "http://127.0.0.1:8000/api/public/products/?category=1"

# 5. Buscar productos
curl -X GET "http://127.0.0.1:8000/api/public/products/?search=Agua"

# 6. Obtener producto específico
curl -X GET http://127.0.0.1:8000/api/public/products/1/
```

---

## 🖥️ Admin Panel

Los modelos están registrados en el Django Admin:

**URL:** http://127.0.0.1:8000/admin/

### Sección CATALOG

- **Product Categories** - Gestionar categorías
- **Products** - Gestionar productos

**Características:**
- Filtros por is_active, category, created_at
- Búsqueda por nombre, descripción, SKU
- Ordenamiento por sort_order, nombre
- Campos readonly: created_at, updated_at
- Product count calculado dinámicamente

---

## 📋 Próximos Pasos

### Para aplicar los cambios:

```bash
# 1. Crear migraciones
python manage.py makemigrations catalog

# 2. Aplicar migraciones
python manage.py migrate

# 3. Iniciar servidor
python manage.py runserver

# 4. Probar endpoints públicos (sin auth)
curl http://127.0.0.1:8000/api/public/categories/

# 5. Probar endpoints staff (con auth)
curl http://127.0.0.1:8000/api/catalog/categories/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Authentication credentials were not provided"

**Causa:** Intentando acceder a endpoint staff sin token.

**Solución:** Agrega el header Authorization:
```bash
-H "Authorization: Bearer <access_token>"
```

### Error: "You do not have permission to perform this action"

**Causa:** El usuario no tiene rol STAFF o ADMIN.

**Solución:** Asigna rol STAFF o ADMIN al usuario en el admin.

### Error: "product category with this name already exists"

**Causa:** El nombre de categoría ya existe.

**Solución:** Los nombres de categorías deben ser únicos.

### Error: "product with this sku already exists"

**Causa:** El SKU ya existe.

**Solución:** Usa un SKU único o deja el campo vacío (null).

### Endpoint público retorna 404

**Causa:** El objeto está inactivo (is_active=False).

**Solución:** Los endpoints públicos solo muestran objetos activos. Activa el objeto desde el admin o endpoint staff.

---

## ✨ Diferencias entre Staff y Public Endpoints

| Característica | Staff Endpoints | Public Endpoints |
|----------------|-----------------|------------------|
| **URL Base** | `/api/catalog/` | `/api/public/` |
| **Autenticación** | Requiere JWT | Sin autenticación |
| **Permisos** | IsStaffOrAdmin | AllowAny |
| **Operaciones** | CRUD completo | Solo GET (lectura) |
| **Datos** | Todos los registros | Solo activos |
| **Campos** | Todos los campos | Campos limitados |
| **created_at/updated_at** | ✅ Incluidos | ❌ Ocultos |
| **is_active** | ✅ Incluido | ❌ Oculto |
| **sku** (Product) | ✅ Incluido | ❌ Oculto |

---

## 📊 Casos de Uso

### Para Staff/Admin (Panel de administración)

```bash
# Ver todas las categorías (activas e inactivas)
GET /api/catalog/categories/

# Crear nueva categoría
POST /api/catalog/categories/

# Desactivar categoría
PATCH /api/catalog/categories/1/
{"is_active": false}

# Ver todos los productos (activos e inactivos)
GET /api/catalog/products/

# Actualizar precio o descripción
PATCH /api/catalog/products/1/
```

### Para Kiosco (iPad del paciente)

```bash
# Ver solo categorías activas
GET /api/public/categories/

# Ver solo productos activos de una categoría
GET /api/public/products/?category=1

# Buscar productos
GET /api/public/products/?search=Agua

# Ver detalle de un producto
GET /api/public/products/1/
```

---

## ✨ Resumen

✅ **Modelos:** ProductCategory, Product
✅ **CRUD completo** para Staff con autenticación
✅ **API pública** de solo lectura sin autenticación
✅ **Permisos:** IsStaffOrAdmin para staff, AllowAny para público
✅ **Filtros:** is_active, category, search
✅ **Ordenamiento:** sort_order, name, created_at
✅ **Admin:** Interfaces completas con filtros y búsqueda
✅ **Validaciones:** SKU único, URLs válidas
✅ **Serializadores separados:** Staff (full) vs Public (limited)
✅ **Query optimization:** select_related para category

El sistema está listo para usar. Ejecuta las migraciones y comienza a probar los endpoints.
