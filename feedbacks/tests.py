from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from clinic.models import Room, Device, Patient, PatientAssignment
from catalog.models import Product, ProductCategory
from inventory.models import InventoryBalance
from orders.models import Order, OrderItem
from feedbacks.models import Feedback

User = get_user_model()


def create_feedback_test_data():
    """Helper para crear datos necesarios para tests de feedback"""
    staff_user = User.objects.create_user(
        email='staff@test.com', password='testpass123',
        full_name='Staff Test', is_staff=True
    )
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
    assignment = PatientAssignment.objects.create(
        patient=patient,
        staff=staff_user,
        room=room,
        device=device,
        is_active=True,
        can_patient_order=True,
        survey_enabled=True
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

    # Crear una orden DELIVERED para que el feedback sea valido
    order = Order.objects.create(
        assignment=device,
        patient_assignment=assignment,
        patient=patient,
        room=room,
        status='DELIVERED'
    )
    OrderItem.objects.create(
        order=order,
        product=product,
        quantity=1,
        unit_label='vaso'
    )

    return {
        'staff_user': staff_user,
        'room': room,
        'device': device,
        'patient': patient,
        'assignment': assignment,
        'category': category,
        'product': product,
        'order': order,
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
class FeedbackFlowTests(TestCase):
    def setUp(self):
        data = create_feedback_test_data()
        self.staff_user = data['staff_user']
        self.room = data['room']
        self.device = data['device']
        self.patient = data['patient']
        self.assignment = data['assignment']
        self.category = data['category']
        self.product = data['product']
        self.order = data['order']
        self.client = APIClient()

    def _build_feedback_payload(self):
        """Helper para construir un payload valido de feedback"""
        return {
            'patient_assignment_id': self.assignment.id,
            'product_ratings': {
                str(self.order.id): {
                    str(self.product.id): 5
                }
            },
            'staff_rating': 4,
            'stay_rating': 5,
            'comment': 'Excelente servicio'
        }

    def test_create_feedback_success(self):
        """Se puede crear feedback exitosamente"""
        payload = self._build_feedback_payload()
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data.get('success'))
        self.assertEqual(Feedback.objects.count(), 1)

    def test_feedback_requires_survey_enabled(self):
        """No se puede enviar feedback sin survey_enabled"""
        self.assignment.survey_enabled = False
        self.assignment.save()
        payload = self._build_feedback_payload()
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        # Con survey_enabled=False, la validacion del serializer pasa pero
        # la vista retorna 400 porque survey is not enabled
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_feedback_requires_active_assignment(self):
        """No se puede enviar feedback si assignment esta inactivo"""
        self.assignment.is_active = False
        self.assignment.save()
        payload = self._build_feedback_payload()
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        # Serializer valida que el assignment sea activo, retorna 400
        self.assertIn(response.status_code, [400, 404])

    def test_feedback_ends_session_automatically(self):
        """Despues de enviar feedback, la sesion se cierra automaticamente"""
        payload = self._build_feedback_payload()
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assignment.refresh_from_db()
        self.assertFalse(self.assignment.is_active)
        self.assertIsNotNone(self.assignment.ended_at)

    def test_feedback_cannot_be_submitted_twice(self):
        """No se puede enviar feedback dos veces para la misma asignacion"""
        payload = self._build_feedback_payload()
        # Primer feedback
        response1 = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response1.status_code, 201)

        # Reactivar asignacion para intentar segundo feedback
        self.assignment.is_active = True
        self.assignment.survey_enabled = True
        self.assignment.save()

        # Segundo feedback
        response2 = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response2.status_code, 400)
        self.assertEqual(Feedback.objects.count(), 1)

    def test_feedback_requires_delivered_orders(self):
        """No se puede enviar feedback si no hay ordenes entregadas"""
        # Cambiar el status de la orden a algo que no sea DELIVERED
        self.order.status = 'PLACED'
        self.order.save()
        payload = self._build_feedback_payload()
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_feedback_saves_ratings_correctly(self):
        """El feedback guarda correctamente los ratings"""
        payload = self._build_feedback_payload()
        self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        feedback = Feedback.objects.first()
        self.assertEqual(feedback.staff_rating, 4)
        self.assertEqual(feedback.stay_rating, 5)
        self.assertEqual(feedback.comment, 'Excelente servicio')
        self.assertEqual(feedback.patient_assignment, self.assignment)
        self.assertEqual(feedback.room, self.room)
        self.assertEqual(feedback.patient, self.patient)
        self.assertEqual(feedback.staff, self.staff_user)

    def test_feedback_missing_order_ratings_fails(self):
        """Feedback falla si no incluye ratings para todas las ordenes entregadas"""
        payload = {
            'patient_assignment_id': self.assignment.id,
            'product_ratings': {},  # Sin ratings para la orden
            'staff_rating': 4,
            'stay_rating': 5,
        }
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_feedback_invalid_rating_values(self):
        """Feedback con valores de rating invalidos falla"""
        payload = {
            'patient_assignment_id': self.assignment.id,
            'product_ratings': {
                str(self.order.id): {
                    str(self.product.id): 10  # Invalido, max es 5
                }
            },
            'staff_rating': 4,
            'stay_rating': 5,
        }
        response = self.client.post(
            '/api/public/feedbacks/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
