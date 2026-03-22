from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()


class SecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_init_db_endpoint_removed(self):
        """El endpoint init-db no debe existir"""
        response = self.client.get('/api/auth/init-db/')
        self.assertIn(response.status_code, [404, 405])
        response = self.client.post('/api/auth/init-db/')
        self.assertIn(response.status_code, [404, 405])

    def test_rate_limiting_configured(self):
        """Verificar que rate limiting esta en settings"""
        from django.conf import settings
        rf = settings.REST_FRAMEWORK
        self.assertIn('DEFAULT_THROTTLE_CLASSES', rf)
        self.assertIn('DEFAULT_THROTTLE_RATES', rf)
        # Verificar que las clases de throttling estan configuradas
        throttle_classes = rf['DEFAULT_THROTTLE_CLASSES']
        self.assertTrue(len(throttle_classes) > 0)
        # Verificar que los rates estan definidos
        throttle_rates = rf['DEFAULT_THROTTLE_RATES']
        self.assertIn('anon', throttle_rates)
        self.assertIn('user', throttle_rates)

    def test_jwt_authentication_configured(self):
        """Verificar que JWT esta configurado como autenticacion por defecto"""
        from django.conf import settings
        rf = settings.REST_FRAMEWORK
        self.assertIn('DEFAULT_AUTHENTICATION_CLASSES', rf)
        auth_classes = rf['DEFAULT_AUTHENTICATION_CLASSES']
        self.assertTrue(
            any('JWT' in cls or 'jwt' in cls.lower() for cls in auth_classes),
            'JWT authentication should be configured'
        )

    def test_default_permission_is_authenticated(self):
        """Verificar que por defecto se requiere autenticacion"""
        from django.conf import settings
        rf = settings.REST_FRAMEWORK
        self.assertIn('DEFAULT_PERMISSION_CLASSES', rf)
        perm_classes = rf['DEFAULT_PERMISSION_CLASSES']
        self.assertTrue(
            any('IsAuthenticated' in cls for cls in perm_classes),
            'IsAuthenticated should be a default permission class'
        )

    def test_unauthenticated_access_to_protected_endpoint(self):
        """Endpoints protegidos deben rechazar peticiones sin token"""
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 401)


@override_settings(
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': [
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ],
        'DEFAULT_PERMISSION_CLASSES': [
            'rest_framework.permissions.IsAuthenticated',
        ],
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'PAGE_SIZE': 50,
        'DEFAULT_THROTTLE_CLASSES': [],
        'DEFAULT_THROTTLE_RATES': {},
    }
)
class PermissionTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@test.com', password='admin123', full_name='Admin'
        )
        self.staff = User.objects.create_user(
            email='staff@test.com', password='staff123',
            full_name='Staff', is_staff=True
        )
        # Asignar rol STAFF al usuario staff
        staff_role, _ = Role.objects.get_or_create(name='STAFF')
        UserRole.objects.create(user=self.staff, role=staff_role)

        self.client = APIClient()

    def test_staff_cannot_access_admin_user_management(self):
        """Staff no puede acceder a endpoints de gestion de usuarios (solo superadmin)"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/auth/admin/users/')
        self.assertIn(response.status_code, [403, 401])

    def test_admin_can_access_user_management(self):
        """Superadmin puede acceder a gestion de usuarios"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/admin/users/')
        self.assertEqual(response.status_code, 200)

    def test_staff_can_access_me_endpoint(self):
        """Staff autenticado puede acceder a /api/auth/me/"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 200)

    def test_staff_cannot_create_users(self):
        """Staff no puede crear usuarios"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.post('/api/auth/admin/users/', {
            'email': 'new@test.com',
            'password': 'newpass123',
            'full_name': 'New User'
        }, format='json')
        self.assertIn(response.status_code, [403, 401])

    def test_unauthenticated_cannot_access_orders_management(self):
        """Sin autenticacion no se puede acceder a la gestion de ordenes"""
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 401)

    def test_staff_can_access_orders(self):
        """Staff autenticado puede acceder a ordenes"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
