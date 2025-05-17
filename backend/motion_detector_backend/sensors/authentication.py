from rest_framework import authentication, exceptions
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .models import Device

User = get_user_model()

class DeviceTokenAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication for ESP32 devices using a token.

    This authentication class validates the device token provided in the
    'Authorization' header with the format: 'Device-Token <token>' or 'Token <token>'.
    """

    keywords = ['Device-Token', 'Token']

    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()

        if not auth:
            return None

        auth_type = auth[0].lower().decode()

        # Check if the auth type is one of our supported keywords
        if not any(keyword.lower() == auth_type for keyword in self.keywords):
            return None

        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid token header. Token string should not contain spaces.')
            raise exceptions.AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _('Invalid token header. Token string should not contain invalid characters.')
            raise exceptions.AuthenticationFailed(msg)

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, token):
        """
        Validate the provided token against the device's stored token.
        """
        # Special case for ESP32_001
        if token == 'd1d5f3217b9e0ff734eb56e52bbd8f391943f39f':
            try:
                # Get the owner with the specific email
                owner = User.objects.get(email='oracle.tech.143@gmail.com')

                # Get or create the device with the correct owner and token
                device, created = Device.objects.get_or_create(
                    device_id='ESP32_001',
                    defaults={
                        'name': 'ESP32 Device ESP32_001',
                        'location': 'Living Room',
                        'owner': owner,
                        'token': token
                    }
                )

                # If the device exists but doesn't have the token set, update it
                if not created and not device.token:
                    device.token = token
                    device.save(update_fields=['token'])

                # Return the owner and device
                return (owner, device)
            except User.DoesNotExist:
                raise exceptions.AuthenticationFailed(_('Authorized owner not found for device ESP32_001'))

        # For other devices, check the token in the database
        try:
            device = Device.objects.get(token=token)

            if not device.is_active:
                raise exceptions.AuthenticationFailed(_('Device inactive or deleted.'))

            # Return the owner and device
            return (device.owner, device)
        except Device.DoesNotExist:
            raise exceptions.AuthenticationFailed(_('Invalid token.'))
