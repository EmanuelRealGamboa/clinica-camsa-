"""
ASGI config for clinic_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import OriginValidator
from orders.routing import websocket_urlpatterns
from django.conf import settings

# Custom origin validator that uses WS_ALLOWED_ORIGINS from settings
class CustomOriginValidator(OriginValidator):
    def __init__(self, application):
        super().__init__(application, settings.WS_ALLOWED_ORIGINS)

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': CustomOriginValidator(
        URLRouter(websocket_urlpatterns)
    ),
})
