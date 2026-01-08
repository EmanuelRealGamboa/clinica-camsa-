# Guía de Pruebas en Django Admin

Esta guía te ayudará a probar y verificar todo lo implementado hasta ahora usando el Django Admin.

## 📋 Preparación

### 1. Ejecutar Migraciones

```bash
# Crear migraciones para los nuevos modelos
python manage.py makemigrations accounts

# Aplicar migraciones
python manage.py migrate

# Crear roles ADMIN y STAFF
python manage.py seed_roles
```

### 2. Iniciar Servidor

```bash
python manage.py runserver
```

### 3. Acceder al Admin

Abre tu navegador y ve a: **http://127.0.0.1:8000/admin/**

Login con el superusuario que creaste anteriormente.

---

## ✅ Qué Puedes Verificar en el Admin

### Sección: ACCOUNTS

Deberías ver 3 modelos:

1. **Users** - Gestionar usuarios
2. **Roles** - Ver roles ADMIN y STAFF
3. **User roles** - Ver asignaciones de roles

---

## 🧪 Pruebas Paso a Paso

### Prueba 1: Verificar Roles Creados

1. **Admin** → **Accounts** → **Roles**
2. Deberías ver:
   - ✅ ADMIN (Administrator role with full access to the system)
   - ✅ STAFF (Staff role for clinic personnel)
3. Click en cada rol para ver:
   - Name
   - Description
   - Users (cuántos usuarios tienen este rol)
   - Created at / Updated at

**Resultado Esperado:**
- 2 roles creados (ADMIN y STAFF)
- Contador de usuarios = 0 (aún no hay asignaciones)

---

### Prueba 2: Ver Tu Usuario

1. **Admin** → **Accounts** → **Users**
2. Deberías ver tu superusuario en la lista
3. Columnas visibles:
   - Email
   - Full name
   - **Roles** (debería mostrar "-" si no has asignado roles)
   - Is staff
   - Is active
   - Date joined

**Resultado Esperado:**
- Tu usuario aparece en la lista
- Columna "Roles" muestra "-" (sin roles asignados aún)

---

### Prueba 3: Asignar Rol a Tu Usuario

1. **Admin** → **Accounts** → **Users**
2. Click en tu usuario (email)
3. Scroll hasta el final de la página
4. Verás una sección: **User roles**
5. Click en "Add another User role"
6. Selecciona:
   - **Role**: ADMIN
   - **Assigned by**: (deja vacío o selecciona tu usuario)
7. Click **Save**

**Resultado Esperado:**
- Usuario guardado exitosamente
- Al volver a la lista de usuarios, la columna "Roles" debe mostrar: "ADMIN"

---

### Prueba 4: Verificar Asignación de Rol

1. **Admin** → **Accounts** → **User roles**
2. Deberías ver una entrada:
   - **User**: tu-email@example.com
   - **Role**: ADMIN
   - **Assigned at**: fecha/hora de asignación
   - **Assigned by**: (vacío o tu usuario)

**Resultado Esperado:**
- Asignación visible en la lista
- Puedes filtrar por Role (ADMIN/STAFF)
- Puedes buscar por email

---

### Prueba 5: Asignar Múltiples Roles

1. **Admin** → **Accounts** → **Users**
2. Click en tu usuario
3. En la sección **User roles**, click "Add another User role"
4. Selecciona **Role**: STAFF
5. Click **Save**

**Resultado Esperado:**
- Usuario ahora tiene 2 roles
- Columna "Roles" debe mostrar: "ADMIN, STAFF"

---

### Prueba 6: Crear Usuario de Prueba con Rol

1. **Admin** → **Accounts** → **Users** → **Add user**
2. Completa el formulario:
   - **Email**: staff@clinic.com
   - **Password**: StaffPass123!
   - **Password confirmation**: StaffPass123!
   - **Full name**: Staff User
   - **Staff status**: ✅ (marcado)
3. Click **Save and continue editing**
4. Scroll hasta **User roles**
5. Click "Add another User role"
6. Selecciona **Role**: STAFF
7. Click **Save**

**Resultado Esperado:**
- Nuevo usuario creado
- Usuario tiene rol STAFF asignado
- Aparece en la lista con "Roles: STAFF"

---

## 🔍 Verificaciones Adicionales

### Verificar Relaciones

#### Desde User → Ver Roles
1. **Admin** → **Accounts** → **Users** → Click en usuario
2. En la página del usuario, verás la sección **User roles** al final
3. Todos los roles asignados aparecen allí

#### Desde Role → Ver Usuarios
1. **Admin** → **Accounts** → **Roles** → Click en ADMIN
2. En la columna "Users" de la lista, verás el contador

#### Desde UserRole → Ver Relación Completa
1. **Admin** → **Accounts** → **User roles**
2. Vista completa de todas las asignaciones
3. Filtros por Role
4. Búsqueda por email

---

## 📊 Dashboard Esperado

Tu Django Admin debería mostrar:

```
ACCOUNTS
  └─ Users (N)           ← Usuarios registrados
  └─ Roles (2)           ← ADMIN, STAFF
  └─ User roles (M)      ← Asignaciones de roles

AUTHENTICATION AND AUTHORIZATION
  └─ Groups
  └─ Permissions
```

---

## 🧪 Probar Endpoints JWT desde Admin

Aunque el admin no prueba directamente los endpoints JWT, puedes verificar que los usuarios existen y tienen roles asignados, lo que es necesario para los endpoints funcionen.

### Preparación para pruebas de API:

1. **Crea usuarios de prueba:**
   - Admin: admin@clinic.com (Rol: ADMIN)
   - Staff: staff@clinic.com (Rol: STAFF)
   - User: user@clinic.com (Sin rol)

2. **Verifica en la lista de Users** que la columna "Roles" muestre correctamente:
   - admin@clinic.com → "ADMIN"
   - staff@clinic.com → "STAFF"
   - user@clinic.com → "-"

3. **Usa estos usuarios para probar los endpoints:**
   ```bash
   # Login como admin
   curl -X POST http://127.0.0.1:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@clinic.com", "password": "tu-password"}'
   ```

---

## 🎨 Características del Admin

### User Admin
- ✅ Lista muestra roles en columna separada
- ✅ Búsqueda por email, full name, username
- ✅ Filtros por is_staff, is_superuser, is_active
- ✅ Inline para asignar roles directamente
- ✅ Ordenado por fecha de registro (más reciente primero)

### Role Admin
- ✅ Lista muestra nombre, descripción, conteo de usuarios
- ✅ Búsqueda por nombre y descripción
- ✅ Ordenado alfabéticamente

### UserRole Admin
- ✅ Lista muestra usuario, rol, fecha, asignador
- ✅ Filtros por rol y fecha de asignación
- ✅ Búsqueda por email y nombre de rol
- ✅ Jerarquía de fechas para navegación temporal
- ✅ Autocompletar para usuario y asignador

---

## ⚠️ Troubleshooting

### No veo la sección "User roles" en User admin

**Causa:** Las migraciones no se aplicaron.

**Solución:**
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### Los roles no aparecen en "Add another User role"

**Causa:** Los roles no fueron creados.

**Solución:**
```bash
python manage.py seed_roles
```

### Error al guardar: "unique constraint"

**Causa:** Intentaste asignar el mismo rol dos veces al mismo usuario.

**Solución:** Cada usuario solo puede tener un rol una vez. Verifica que no esté duplicado.

### La columna "Roles" siempre muestra "-"

**Causa:** No has asignado roles via UserRole.

**Solución:**
1. Edita el usuario
2. Scroll hasta "User roles"
3. Agrega un rol

### Error: "autocomplete_fields" not working

**Causa:** Los modelos necesitan search_fields configurado.

**Esto ya está implementado:**
- User: search_fields = ('email', 'full_name', 'username')
- Role: search_fields = ('name', 'description')

---

## 📸 Capturas Esperadas

### Lista de Usuarios
```
Email                 | Full name      | Roles        | Staff | Active | Date joined
admin@clinic.com      | Administrator  | ADMIN, STAFF | ✓     | ✓      | Dec 17, 2024
staff@clinic.com      | Staff User     | STAFF        | ✓     | ✓      | Dec 17, 2024
user@clinic.com       | Regular User   | -            | ✗     | ✓      | Dec 17, 2024
```

### Lista de Roles
```
Name   | Description                                      | Users | Created at
ADMIN  | Administrator role with full access...          | 1     | Dec 17, 2024
STAFF  | Staff role for clinic personnel                 | 2     | Dec 17, 2024
```

### Lista de User Roles
```
User                 | Role  | Assigned at          | Assigned by
admin@clinic.com     | ADMIN | Dec 17, 2024 10:30  | admin@clinic.com
admin@clinic.com     | STAFF | Dec 17, 2024 10:31  | admin@clinic.com
staff@clinic.com     | STAFF | Dec 17, 2024 10:32  | admin@clinic.com
```

---

## ✅ Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] Roles ADMIN y STAFF creados con seed_roles
- [ ] Puedo ver la lista de Users con columna "Roles"
- [ ] Puedo crear un nuevo usuario desde el admin
- [ ] Puedo asignar un rol a un usuario existente
- [ ] La columna "Roles" muestra los roles correctamente
- [ ] Puedo ver la lista de User roles
- [ ] Puedo filtrar User roles por role
- [ ] Puedo buscar User roles por email
- [ ] Los contadores de usuarios en Roles son correctos
- [ ] Puedo editar un usuario y ver sus roles en la sección inline

---

## 🚀 Siguiente Paso

Una vez que hayas verificado todo en el admin, puedes probar los endpoints JWT:

```bash
# 1. Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@clinic.com", "password": "tu-password"}'

# 2. Verificar que el response incluya roles
# Debería mostrar: "roles": ["ADMIN", "STAFF"]
```

Ver [JWT_AUTH_GUIDE.md](JWT_AUTH_GUIDE.md) para más detalles sobre testing de API.

---

## 📚 Recursos

- [ROLES_SYSTEM.md](ROLES_SYSTEM.md) - Documentación completa del sistema de roles
- [JWT_AUTH_GUIDE.md](JWT_AUTH_GUIDE.md) - Guía de autenticación JWT
- [CUSTOM_USER_SETUP.md](CUSTOM_USER_SETUP.md) - Configuración del custom user model
