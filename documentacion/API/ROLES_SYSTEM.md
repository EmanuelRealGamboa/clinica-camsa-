# Sistema de Roles - Documentación

## ✅ Implementación Completada

Se ha implementado un sistema de roles personalizado con modelos `Role` y `UserRole`.

### Archivos Creados/Modificados

| Archivo | Descripción |
|---------|-------------|
| [accounts/models.py](accounts/models.py) | Modelos Role y UserRole + métodos helper |
| [accounts/serializers.py](accounts/serializers.py) | Actualizado para usar roles personalizados |
| [accounts/permissions.py](accounts/permissions.py) | Permisos DRF personalizados |
| [accounts/admin.py](accounts/admin.py) | Admin para Role y UserRole |
| [accounts/management/commands/seed_roles.py](accounts/management/commands/seed_roles.py) | Comando para crear roles |

---

## 📋 Modelos

### Role Model

Modelo para definir roles del sistema.

```python
class Role(models.Model):
    ADMIN = 'ADMIN'
    STAFF = 'STAFF'

    name = CharField(max_length=50, unique=True)  # ADMIN, STAFF
    description = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Campos:**
- `name`: Nombre del rol (ADMIN, STAFF) - UNIQUE
- `description`: Descripción opcional del rol
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### UserRole Model

Relación many-to-many entre User y Role.

```python
class UserRole(models.Model):
    user = ForeignKey(User, related_name='user_roles')
    role = ForeignKey(Role, related_name='role_users')
    assigned_at = DateTimeField(auto_now_add=True)
    assigned_by = ForeignKey(User, null=True, related_name='roles_assigned')

    class Meta:
        unique_together = ('user', 'role')
```

**Campos:**
- `user`: Usuario al que se asigna el rol
- `role`: Rol asignado
- `assigned_at`: Fecha de asignación
- `assigned_by`: Usuario que asignó el rol (opcional)

**Restricción:** Un usuario no puede tener el mismo rol dos veces (`unique_together`).

---

## 🔧 Métodos Helper en User Model

### `user.has_role(role_name)`

Verifica si un usuario tiene un rol específico.

```python
if user.has_role('ADMIN'):
    print("User is an admin")
```

### `user.get_roles()`

Obtiene lista de nombres de roles del usuario.

```python
roles = user.get_roles()
# Returns: ['ADMIN', 'STAFF'] or []
```

---

## 🔐 Permisos DRF Personalizados

### IsStaffOrAdmin

Requiere que el usuario tenga rol STAFF o ADMIN.

```python
from accounts.permissions import IsStaffOrAdmin
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsStaffOrAdmin])
def staff_only_view(request):
    return Response({"message": "You have STAFF or ADMIN role"})
```

### IsAdmin

Requiere que el usuario tenga rol ADMIN.

```python
from accounts.permissions import IsAdmin

@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_only_view(request):
    return Response({"message": "You are an ADMIN"})
```

### IsStaff

Requiere que el usuario tenga rol STAFF (o ADMIN).

```python
from accounts.permissions import IsStaff

@api_view(['POST'])
@permission_classes([IsStaff])
def staff_view(request):
    return Response({"message": "You have STAFF access"})
```

---

## 🛠️ Management Command

### seed_roles

Crea los roles ADMIN y STAFF si no existen.

```bash
python manage.py seed_roles
```

**Output:**
```
Seeding roles...
✓ Created role: ADMIN
✓ Created role: STAFF

Summary:
  Created: 2
  Already existed: 0
  Total roles: 2

✓ Role seeding complete!
```

**Características:**
- ✅ Idempotente (puede ejecutarse múltiples veces sin errores)
- ✅ Transaction atómica
- ✅ Muestra resumen de operaciones

---

## 📡 Uso en Serializers

Los serializers ahora usan `user.get_roles()` para obtener roles personalizados:

```python
# Response from /api/auth/me
{
  "id": 1,
  "email": "admin@clinic.com",
  "full_name": "Administrator",
  "roles": ["ADMIN", "STAFF"],  # From UserRole model
  "permissions": ["all"],
  "is_staff": true
}
```

**Fallback:**
- Si el usuario no tiene roles en UserRole:
  - Superuser → `['ADMIN']`
  - is_staff → `['STAFF']`
  - Normal user → `['USER']`

---

## 🖥️ Uso en Admin

### Ver Roles en User Admin

- En la lista de usuarios se muestra la columna "Roles"
- Muestra todos los roles del usuario separados por comas

### Admin de Role

- Ver todos los roles definidos
- Ver cuántos usuarios tienen cada rol
- Búsqueda por nombre y descripción

### Admin de UserRole

- Ver todas las asignaciones de roles
- Filtrar por rol y fecha
- Buscar por email de usuario o nombre de rol
- Ver quién asignó el rol y cuándo

---

## 💡 Ejemplos de Uso

### 1. Asignar Rol a Usuario

```python
from accounts.models import User, Role, UserRole

# Obtener usuario y rol
user = User.objects.get(email='staff@clinic.com')
role = Role.objects.get(name='STAFF')

# Asignar rol
UserRole.objects.create(
    user=user,
    role=role,
    assigned_by=request.user  # Opcional
)
```

### 2. Verificar Rol en Vista

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_view(request):
    if request.user.has_role('ADMIN'):
        # Admin logic
        pass
    elif request.user.has_role('STAFF'):
        # Staff logic
        pass
    else:
        return Response(
            {"error": "Insufficient permissions"},
            status=403
        )
```

### 3. Proteger Endpoint

```python
from accounts.permissions import IsStaffOrAdmin

@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def create_order(request):
    # Only STAFF or ADMIN can create orders
    pass
```

### 4. Obtener Usuarios por Rol

```python
# Todos los admins
admins = User.objects.filter(user_roles__role__name='ADMIN')

# Todos los staff
staff = User.objects.filter(user_roles__role__name='STAFF')
```

### 5. Remover Rol

```python
UserRole.objects.filter(
    user=user,
    role__name='STAFF'
).delete()
```

---

## 🔄 Flujo de Trabajo

### Setup Inicial

1. **Ejecutar migraciones:**
   ```bash
   python manage.py makemigrations accounts
   python manage.py migrate
   ```

2. **Crear roles:**
   ```bash
   python manage.py seed_roles
   ```

3. **Asignar roles a usuarios:**
   - Via Django Admin
   - Via código Python
   - Via API (por implementar)

### Desarrollo

1. **Verificar permisos en vistas:**
   ```python
   @permission_classes([IsStaffOrAdmin])
   ```

2. **Verificar roles en lógica:**
   ```python
   if user.has_role('ADMIN'):
       # ...
   ```

3. **Mostrar roles en frontend:**
   ```javascript
   const roles = user.roles;  // ['ADMIN', 'STAFF']
   if (roles.includes('ADMIN')) {
       // Show admin features
   }
   ```

---

## 📊 Comparación: Roles vs Groups

| Feature | Custom Roles | Django Groups |
|---------|--------------|---------------|
| Nombres predefinidos | ✅ ADMIN, STAFF | ❌ Cualquier nombre |
| Unique constraint | ✅ Yes | ❌ No |
| Assigned by tracking | ✅ Yes | ❌ No |
| Assignment date | ✅ Yes | ❌ No |
| Simple API | ✅ `has_role()` | ❌ `groups.filter()` |
| DRF Permissions | ✅ Included | ⚠️ Custom |

---

## 🧪 Testing

### Test Roles

```python
from django.test import TestCase
from accounts.models import User, Role, UserRole

class RoleTestCase(TestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(name='ADMIN')
        self.staff_role = Role.objects.create(name='STAFF')
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123'
        )

    def test_assign_role(self):
        UserRole.objects.create(user=self.user, role=self.admin_role)
        self.assertTrue(self.user.has_role('ADMIN'))

    def test_get_roles(self):
        UserRole.objects.create(user=self.user, role=self.admin_role)
        UserRole.objects.create(user=self.user, role=self.staff_role)
        roles = self.user.get_roles()
        self.assertIn('ADMIN', roles)
        self.assertIn('STAFF', roles)
```

### Test Permissions

```python
from rest_framework.test import APITestCase
from rest_framework import status

class PermissionTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='staff@example.com',
            password='password123'
        )
        self.staff_role = Role.objects.create(name='STAFF')
        UserRole.objects.create(user=self.user, role=self.staff_role)

    def test_staff_access(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/staff-only-endpoint/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

---

## 🔍 Admin Panel

### Acceder a Roles

1. Login: http://127.0.0.1:8000/admin/
2. Sección "ACCOUNTS"
3. Opciones:
   - **Users**: Ver usuarios y sus roles
   - **Roles**: Gestionar roles ADMIN/STAFF
   - **User roles**: Ver todas las asignaciones

### Asignar Rol a Usuario

1. Admin → Accounts → Users
2. Click en un usuario
3. Scroll down a "User roles"
4. Click "Add another User role"
5. Seleccionar Role
6. Save

---

## 📋 Próximos Pasos

### Para aplicar los cambios:

```bash
# 1. Crear migraciones
python manage.py makemigrations accounts

# 2. Aplicar migraciones
python manage.py migrate

# 3. Crear roles por defecto
python manage.py seed_roles

# 4. Asignar roles a usuarios existentes (via admin o shell)
python manage.py shell
>>> from accounts.models import User, Role, UserRole
>>> user = User.objects.get(email='admin@clinic.com')
>>> admin_role = Role.objects.get(name='ADMIN')
>>> UserRole.objects.create(user=user, role=admin_role)
```

---

## 🐛 Troubleshooting

### Error: "Role matching query does not exist"

**Causa:** Los roles no han sido creados.

**Solución:**
```bash
python manage.py seed_roles
```

### Roles no aparecen en serializers

**Causa:** El usuario no tiene roles asignados en UserRole.

**Solución:** Asigna roles via admin o código:
```python
UserRole.objects.create(user=user, role=role)
```

### Permission denied con IsStaffOrAdmin

**Causa:** El usuario no tiene rol STAFF ni ADMIN.

**Verificar:**
```python
python manage.py shell
>>> from accounts.models import User
>>> user = User.objects.get(email='tu-email@example.com')
>>> user.get_roles()
[]  # Si está vacío, asigna un rol
```

---

## ✨ Resumen

✅ **Modelos:** Role, UserRole
✅ **Permisos:** IsStaffOrAdmin, IsAdmin, IsStaff
✅ **Command:** seed_roles
✅ **Admin:** Interfaces completas
✅ **Serializers:** Integrados con roles
✅ **Métodos Helper:** has_role(), get_roles()

El sistema de roles está listo para usar. Ejecuta las migraciones y seed_roles para comenzar.
