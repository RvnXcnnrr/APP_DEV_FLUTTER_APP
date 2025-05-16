"""
ASGI config for motion_detector_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import importlib.util
import django

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from motion_detector_backend.sensors.routing import websocket_urlpatterns

# Import the TokenAuthMiddlewareStack dynamically
spec = importlib.util.spec_from_file_location(
    "middleware",
    os.path.join(os.path.dirname(__file__), "sensors", "middleware.py")
)
if spec is not None:
    middleware = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(middleware)
    TokenAuthMiddlewareStack = middleware.TokenAuthMiddlewareStack
else:
    # Fallback to using AuthMiddlewareStack if middleware.py cannot be found
    from channels.auth import AuthMiddlewareStack
    TokenAuthMiddlewareStack = AuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
