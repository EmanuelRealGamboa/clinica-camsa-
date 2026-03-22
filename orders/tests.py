from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from clinic.models import Room, Device, Patient, PatientAssignment
from catalog.models import Product, ProductCategory
from inventory.models import InventoryBalance
from orders.models import Order, OrderItem
from accounts.models import Role, UserRole

User = get_user_model()


def create_test_data(order_limits=None):
    """Helper para crear los objetos necesarios para tests de ordenes"""
    staff_user = User.objects.create_user(
        email='staff@test.com', password='testpass123',
        full_name='Staff Test', is_staff=True
    )
    # Assign STAFF role so IsStaffOrAdmin permission passes
    staff_role, _ = Role.objects.get_or_create(name='STAFF')
    UserRole.objects.create(user=staff_user, role=staff_role)

    room = Room.objects.create(code='R101', is_active=True)
    device = Device.objects.create(
        device_uid='test-device-001',
        device_type='IPAD',
        room=room,
        is_active=True
    )
    patient = Patient.objects.create(
        full_name='Paciente Test',
        phone_e164='+1234567890'
    )
    if order_limits is None:
        order_limits = {'DRINK': 5, 'SNACK': 5}
    assignment = PatientAssignment.objects.create(
        patient=patient,
        staff=staff_user,
        room=room,
        device=device,
        is_active=True,
        can_patient_order=True,
        order_limits=order_limits
    )
    category = ProductCategory.objects.create(
        name='Bebidas',
        category_type='DRINK',
        is_active=True
    )
    product = Product.objects.create(
        name='Jugo de Naranja',
        category=category,
        is_active=True,
        unit_label='vaso'
    )
    # Signal auto-creates InventoryBalance on Product creation, so update it
    balance = InventoryBalance.objects.get(product=product)
    balance.on_hand = 10
    balance.reserved = 0
    balance.save()
    return {
        'staff_user': staff_user,
        'room': room,
        'device': device,
        'patient': patient,
        'assignment': assignment,
        'category': category,
        'product': product,
    }


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
class OrderFlowTests(TestCase):
    def setUp(self):
        data = create_test_data()
        self.staff_user = data['staff_user']
        self.room = data['room']
        self.device = data['device']
        self.patient = data['patient']
        self.assignment = data['assignment']
        self.category = data['category']
        self.product = data['product']
        self.client = APIClient()

    def test_create_order_public(self):
        """Crear orden desde endpoint publico con device_uid"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data.get('success'))
        self.assertIn('order', response.data)

    def test_order_creates_order_item(self):
        """Al crear orden, se crean los items correspondientes"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 2}]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        order = Order.objects.first()
        self.assertIsNotNone(order)
        self.assertEqual(order.items.count(), 1)
        item = order.items.first()
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.unit_label, 'vaso')

    def test_order_reserves_inventory(self):
        """Al crear orden, se reserva inventario"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 2}]
        }, format='json')
        self.assertEqual(response.status_code, 201)
        balance = InventoryBalance.objects.get(product=self.product)
        self.assertEqual(balance.reserved, 2)
        self.assertEqual(balance.on_hand, 10)  # on_hand no cambia al reservar

    def test_order_exceeds_inventory_fails(self):
        """No se puede ordenar mas de lo disponible"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 999}]
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_order_initial_status_is_placed(self):
        """La orden se crea con status PLACED"""
        self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        order = Order.objects.first()
        self.assertEqual(order.status, 'PLACED')

    def test_order_linked_to_patient_assignment(self):
        """La orden se vincula al patient_assignment activo"""
        self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        order = Order.objects.first()
        self.assertEqual(order.patient_assignment, self.assignment)
        self.assertEqual(order.patient, self.patient)
        self.assertEqual(order.room, self.room)

    def test_order_without_active_assignment_fails(self):
        """No se puede crear orden sin asignacion activa"""
        self.assignment.is_active = False
        self.assignment.save()
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_order_with_invalid_device_fails(self):
        """No se puede crear orden con device_uid invalido"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': 'nonexistent-device',
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertIn(response.status_code, [400, 404])

    def test_order_with_inactive_product_fails(self):
        """No se puede crear orden con producto inactivo"""
        self.product.is_active = False
        self.product.save()
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertIn(response.status_code, [400, 404])

    def test_order_respects_category_limits(self):
        """La orden respeta los limites por categoria"""
        # Establecer limite estricto de 1 para DRINK
        self.assignment.order_limits = {'DRINK': 1, 'SNACK': 1}
        self.assignment.save()
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 5}]
        }, format='json')
        # El producto es DRINK y el limite es 1, pedir 5 debe fallar
        self.assertEqual(response.status_code, 400)

    def test_order_blocked_when_can_patient_order_false(self):
        """No se puede crear orden si can_patient_order es False"""
        self.assignment.can_patient_order = False
        self.assignment.save()
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_empty_items_fails(self):
        """No se puede crear orden sin items"""
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': []
        }, format='json')
        self.assertEqual(response.status_code, 400)


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
class OrderStatusFlowTests(TestCase):
    """Tests para el flujo de cambio de estado de ordenes"""

    def setUp(self):
        data = create_test_data()
        self.staff_user = data['staff_user']
        self.room = data['room']
        self.device = data['device']
        self.patient = data['patient']
        self.assignment = data['assignment']
        self.category = data['category']
        self.product = data['product']
        self.client = APIClient()

        # Crear una orden para las pruebas de status
        response = self.client.post('/api/public/orders/create', {
            'device_uid': self.device.device_uid,
            'items': [{'product_id': self.product.id, 'quantity': 1}]
        }, format='json')
        self.assertEqual(response.status_code, 201, f"Order creation failed: {response.data}")
        self.order = Order.objects.first()

        # Autenticar como staff para endpoints protegidos
        self.client.force_authenticate(user=self.staff_user)

    def test_status_transition_placed_to_preparing(self):
        """Se puede cambiar de PLACED a PREPARING"""
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status/',
            {'to_status': 'PREPARING'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'PREPARING')

    def test_status_transition_to_delivered_consumes_inventory(self):
        """Al entregar una orden, se consume el inventario"""
        self.client.patch(
            f'/api/orders/{self.order.id}/status/',
            {'to_status': 'PREPARING'}, format='json'
        )
        self.client.patch(
            f'/api/orders/{self.order.id}/status/',
            {'to_status': 'READY'}, format='json'
        )
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status/',
            {'to_status': 'DELIVERED'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        balance = InventoryBalance.objects.get(product=self.product)
        # on_hand baja de 10 a 9, reserved vuelve a 0
        self.assertEqual(balance.on_hand, 9)
        self.assertEqual(balance.reserved, 0)

    def test_cancel_order_releases_inventory(self):
        """Al cancelar una orden, se libera el inventario reservado"""
        # Verify inventory is reserved first
        balance = InventoryBalance.objects.get(product=self.product)
        self.assertEqual(balance.reserved, 1)

        response = self.client.post(
            f'/api/orders/{self.order.id}/cancel/',
            {'note': 'Test cancellation'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        balance.refresh_from_db()
        self.assertEqual(balance.reserved, 0)
        self.assertEqual(balance.on_hand, 10)  # on_hand no cambia al cancelar

    def test_cannot_change_status_of_delivered_order(self):
        """No se puede cambiar el status de una orden entregada"""
        # Move through full lifecycle first
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'PREPARING'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'READY'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'DELIVERED'}, format='json')
        response = self.client.patch(
            f'/api/orders/{self.order.id}/status/',
            {'to_status': 'PREPARING'}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_cancel_delivered_order(self):
        """No se puede cancelar una orden ya entregada"""
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'PREPARING'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'READY'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'DELIVERED'}, format='json')
        response = self.client.post(
            f'/api/orders/{self.order.id}/cancel/',
            {'note': 'Too late'}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_delivered_order_blocks_patient_ordering(self):
        """Al entregar una orden, se bloquea al paciente de crear nuevas ordenes"""
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'PREPARING'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'READY'}, format='json')
        self.client.patch(f'/api/orders/{self.order.id}/status/', {'to_status': 'DELIVERED'}, format='json')
        self.assignment.refresh_from_db()
        self.assertFalse(self.assignment.can_patient_order)
