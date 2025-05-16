"""
WebSocket authentication middleware for the sensors app.
"""
import re
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from motion_detector_backend.sensors.models import Device

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    """
    Get a user from a token key.
    """
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()

@database_sync_to_async
def get_device_for_user(device_id, user):
    """
    Get a device for a user.
    """
    try:
        return Device.objects.get(device_id=device_id, owner=user)
    except Device.DoesNotExist:
        return None

class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Get the token from the query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)

        token_key = query_params.get('token', [None])[0]

        if token_key:
            # Get the user from the token
            scope['user'] = await get_user_from_token(token_key)
        else:
            scope['user'] = AnonymousUser()

        # Continue processing
        return await super().__call__(scope, receive, send)

def TokenAuthMiddlewareStack(inner):
    """
    Wrapper for the TokenAuthMiddleware.
    """
    return TokenAuthMiddleware(inner)
