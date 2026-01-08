from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'clinic'

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'devices', views.DeviceViewSet, basename='device')
router.register(r'patient-assignments', views.PatientAssignmentViewSet, basename='patient-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
