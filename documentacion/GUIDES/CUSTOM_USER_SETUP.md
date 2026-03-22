# Custom User Model - Setup Completo

## ✅ Cambios Realizados

### 1. Custom User Model ([accounts/models.py](accounts/models.py))

Se creó un modelo de usuario personalizado con las siguientes características:

- ✅ **Email como identificador único** (en lugar de username)
- ✅ **Username opcional** (puede ser null/blank)
- ✅ **full_name opcional** (campo adicional)
- ✅ **CustomUserManager** para crear usuarios con email
- ✅ **Métodos get_full_name() y get_short_name()**

#### Campos del modelo:
```python
- email: EmailField (unique=True, required)
- username: CharField (blank=True, null=True)
- full_name: CharField (blank=True)
- + todos los campos de AbstractUser (is_staff, is_active, etc.)
```

### 2. Configuración en Settings ([clinic_service/settings.py](clinic_service/settings.py))

```python
AUTH_USER_MODEL = 'accounts.User'
```

### 3. Admin Personalizado ([accounts/admin.py](accounts/admin.py))

- ✅ Interfaz de admin adaptada para usar email
- ✅ Campos organizados lógicamente
- ✅ Búsqueda por email, full_name, username
- ✅ Filtros por staff, superuser, active

## 📋 Pasos para Aplicar los Cambios

### Paso 1: Crear Migraciones

```bash
python manage.py makemigrations accounts
```

**Resultado esperado:**
```
Migrations for 'accounts':
  accounts\migrations\0001_initial.py
    - Create model User
```

### Paso 2: Aplicar Migraciones

```bash
python manage.py migrate
```

**Resultado esperado:**
```
Operations to perform:
  Apply all migrations: accounts, admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  ...
  Applying accounts.0001_initial... OK
  ...
```

### Paso 3: Crear Superusuario con Email

```bash
python manage.py createsuperuser
```

**Interacción esperada:**
```
Email address: admin@clinic.com
Password:
Password (again):
Superuser created successfully.
```

⚠️ **Importante**: Ya NO te pedirá username, solo email y password.

### Paso 4: Verificar en el Admin

1. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

2. Accede al admin: http://127.0.0.1:8000/admin/

3. Inicia sesión con el email y password que creaste

4. Verás la sección "ACCOUNTS" con el modelo "Users"

## 🔍 Características del Custom User

### Autenticación con Email

Los usuarios ahora se autentican con **email** en lugar de username:

```python
from django.contrib.auth import authenticate

# Login con email
user = authenticate(email='user@example.com', password='password123')
```

### Crear Usuarios Programáticamente

```python
from accounts.models import User

# Crear usuario normal
user = User.objects.create_user(
    email='user@example.com',
    password='password123',
    full_name='John Doe'
)

# Crear superusuario
admin = User.objects.create_superuser(
    email='admin@example.com',
    password='admin123',
    full_name='Admin User'
)
```

### En Django REST Framework

El serializer de usuarios debería usar email:

```python
from rest_framework import serializers
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined']
```

## 🧪 Testing

### Verificar que el modelo funciona correctamente:

```python
# En Django shell: python manage.py shell

from accounts.models import User

# Crear usuario de prueba
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    full_name='Test User'
)

# Verificar campos
print(user.email)  # test@example.com
print(user.get_full_name())  # Test User
print(user.get_short_name())  # test
print(str(user))  # test@example.com

# Verificar autenticación
from django.contrib.auth import authenticate
auth_user = authenticate(email='test@example.com', password='testpass123')
print(auth_user == user)  # True
```

## ⚠️ Notas Importantes

### 1. Migraciones Iniciales

Este custom user model **DEBE** aplicarse ANTES de ejecutar la primera migración del proyecto. Si ya ejecutaste `migrate` antes:

- ❌ Tendrás que recrear la base de datos
- ❌ O hacer migraciones complejas

En este proyecto, estamos aplicando el custom user ANTES de la primera migración, así que no hay problema.

### 2. Username Opcional

Aunque username es opcional, aún existe en el modelo (heredado de AbstractUser) pero:
- Puede ser `null`
- Puede estar `blank`
- NO es único
- NO se usa para autenticación

### 3. Compatibilidad

El modelo es compatible con:
- ✅ Django Admin
- ✅ Django REST Framework
- ✅ Django REST Framework SimpleJWT
- ✅ Todos los permisos y grupos de Django

## 🔄 Integración con JWT (Simple JWT)

En `settings.py`, la configuración de JWT ya está lista:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

Para obtener tokens JWT, los usuarios usarán su **email**:

```bash
# POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}
```

## 📚 Próximos Pasos

1. ✅ Crear migraciones: `python manage.py makemigrations accounts`
2. ✅ Aplicar migraciones: `python manage.py migrate`
3. ✅ Crear superusuario: `python manage.py createsuperuser`
4. ✅ Probar login en admin
5. 🔜 Crear endpoints de autenticación (login, register, etc.)
6. 🔜 Implementar JWT authentication
7. 🔜 Crear serializers para User

## 🐛 Troubleshooting

### Error: "auth.User already exists"

Si ves este error, significa que ya ejecutaste las migraciones de Django antes de configurar el custom user.

**Solución**:
1. Elimina la base de datos
2. Vuelve a crearla vacía
3. Ejecuta las migraciones nuevamente

### Error: "Username already exists"

El modelo custom NO usa username como identificador único, usa email. Asegúrate de autenticar con email.

### Error al crear superusuario con username

Si `createsuperuser` te pide username, verifica que:
1. `AUTH_USER_MODEL = 'accounts.User'` esté en settings.py
2. Las migraciones se hayan aplicado correctamente
3. El servidor esté detenido durante las migraciones

## ✨ Resumen

- ✅ Custom User Model creado
- ✅ Email como identificador único
- ✅ Username opcional
- ✅ full_name opcional
- ✅ AUTH_USER_MODEL configurado
- ✅ Admin personalizado
- 📝 Listo para crear migraciones

Ejecuta los comandos del Paso 1, 2 y 3 para completar el setup.
