from django.urls import path
from . import views

app_name = 'clinic_public'

urlpatterns = [
    path('kiosk/device/<str:device_uid>/active-patient/', views.get_active_patient_by_device, name='kiosk-active-patient'),
]
