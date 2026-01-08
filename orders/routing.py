from django.urls import path
from .consumers import StaffOrderConsumer, KioskOrderConsumer

websocket_urlpatterns = [
    path('ws/staff/orders/', StaffOrderConsumer.as_asgi()),
    path('ws/kiosk/orders/', KioskOrderConsumer.as_asgi()),
]
