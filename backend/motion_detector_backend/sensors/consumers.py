import json
import datetime
import jwt
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import Device, MotionEvent, SensorData

User = get_user_model()

class SensorConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for sensor data
    """
    @database_sync_to_async
    def get_user_from_token(self, token_key):
        """
        Get a user from a token key.
        """
        # First try to get user from JWT token
        try:
            # Try to decode JWT token
            decoded_token = AccessToken(token_key)
            user_id = decoded_token['user_id']
            return User.objects.get(id=user_id)
        except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
            # If JWT token is invalid, try auth token
            try:
                token = Token.objects.get(key=token_key)
                return token.user
            except Token.DoesNotExist:
                # Check if it's a device token
                try:
                    device = Device.objects.get(token=token_key)
                    if device.is_active:
                        return device.owner
                except Device.DoesNotExist:
                    pass

                # If it's the hardcoded device token for ESP32_001, only allow the specific owner
                if token_key == '54836780fc03bcdff737d0eadbe16156f461342f':
                    try:
                        # Only allow oracle.tech.143@gmail.com to use this token
                        return User.objects.get(email='oracle.tech.143@gmail.com')
                    except User.DoesNotExist:
                        return AnonymousUser()
                return AnonymousUser()

    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection
        """
        # Get the token from the query string
        query_string = self.scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)

        token_key = query_params.get('token', [None])[0]

        if token_key:
            # Get the user from the token
            self.user = await self.get_user_from_token(token_key)

            # If we couldn't authenticate the user and it's not the device token
            if self.user.is_anonymous and token_key != '54836780fc03bcdff737d0eadbe16156f461342f':
                # Close the connection if authentication failed
                await self.close(code=4003)  # 4003 is a custom code for authentication failure
                return
        else:
            # Close the connection if no token is provided
            await self.close(code=4003)  # 4003 is a custom code for authentication failure
            return

        # Add the client to the sensor_data group
        await self.channel_layer.group_add(
            "sensor_data",
            self.channel_name
        )

        # Accept the connection
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to WebSocket server with token authentication'
        }))

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason
        """
        # Remove the client from the sensor_data group
        await self.channel_layer.group_discard(
            "sensor_data",
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Called when we receive a message from the client
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            if message_type == 'motion_event':
                await self.process_motion_event(data)
            elif message_type == 'sensor_data':
                await self.process_sensor_data(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    @database_sync_to_async
    def get_or_create_device(self, device_id):
        """
        Get a device by its ID, or create it if it doesn't exist
        """
        try:
            # For ESP32_001, enforce specific owner access control
            if device_id == 'ESP32_001':
                try:
                    # Get the device
                    device = Device.objects.get(device_id=device_id)

                    # Check if the user is the correct owner (oracle.tech.143@gmail.com)
                    if self.user.email != 'oracle.tech.143@gmail.com':
                        print(f"Access denied: User {self.user.email} is not authorized to access device {device_id}")
                        return None

                    # Set the token if it's not already set
                    if not device.token:
                        device.token = '54836780fc03bcdff737d0eadbe16156f461342f'
                        device.save(update_fields=['token'])

                    return device
                except Device.DoesNotExist:
                    # Only create the device if the user is oracle.tech.143@gmail.com
                    if self.user.email == 'oracle.tech.143@gmail.com':
                        device = Device.objects.create(
                            device_id=device_id,
                            name=f"ESP32 Device {device_id}",
                            location="Living Room",
                            owner=self.user,
                            token='54836780fc03bcdff737d0eadbe16156f461342f'
                        )
                        return device
                    else:
                        print(f"Access denied: User {self.user.email} is not authorized to create device {device_id}")
                        return None
            else:
                # For other devices, use the standard logic
                try:
                    device = Device.objects.get(device_id=device_id)
                    # If the device exists but doesn't belong to the user and the user is authenticated,
                    # update the owner to the current user
                    if device.owner != self.user and not self.user.is_anonymous:
                        device.owner = self.user
                        device.save()
                    return device
                except Device.DoesNotExist:
                    # Create a new device if it doesn't exist
                    device = Device.objects.create(
                        device_id=device_id,
                        name=f"ESP32 Device {device_id}",
                        location="Unknown",
                        owner=self.user
                    )
                    return device
        except Exception as e:
            print(f"Error getting or creating device: {e}")
            return None

    @database_sync_to_async
    def create_motion_event(self, device, timestamp_str, temperature, humidity):
        """
        Create a new motion event in the database
        """
        try:
            # Parse the timestamp or use current time
            timestamp = timezone.now()
            if timestamp_str and timestamp_str.startswith('DEVICE_UPTIME:'):
                # For device uptime timestamps, we use the current time
                pass
            else:
                try:
                    # Try to parse as ISO format
                    timestamp = datetime.datetime.fromisoformat(timestamp_str)
                except (ValueError, TypeError):
                    # If parsing fails, use current time
                    pass

            # Create and save the motion event
            event = MotionEvent.objects.create(
                device=device,
                timestamp=timestamp,
                temperature=temperature,
                humidity=humidity
            )
            return event
        except Exception as e:
            print(f"Error creating motion event: {e}")
            return None

    async def process_motion_event(self, data):
        """
        Process motion event data
        """
        device_id = data.get('device_id')
        timestamp = data.get('timestamp')
        temperature = data.get('temperature')
        humidity = data.get('humidity')

        # Get or create the device
        device = await self.get_or_create_device(device_id)
        if not device:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Device not found or not authorized'
            }))
            return

        # Save to database
        event = await self.create_motion_event(device, timestamp, temperature, humidity)
        if not event:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to create motion event'
            }))
            return

        # Broadcast to all clients
        await self.channel_layer.group_send(
            "sensor_data",
            {
                'type': 'broadcast_motion_event',
                'device_id': device_id,
                'timestamp': timestamp,
                'temperature': temperature,
                'humidity': humidity
            }
        )

        # Confirm receipt
        await self.send(text_data=json.dumps({
            'type': 'motion_event_received',
            'message': 'Motion event received and saved'
        }))

    @database_sync_to_async
    def create_sensor_data(self, device, timestamp_str, temperature, humidity):
        """
        Create new sensor data in the database
        """
        try:
            # Parse the timestamp or use current time
            timestamp = timezone.now()
            if timestamp_str and timestamp_str.startswith('DEVICE_UPTIME:'):
                # For device uptime timestamps, we use the current time
                pass
            else:
                try:
                    # Try to parse as ISO format
                    timestamp = datetime.datetime.fromisoformat(timestamp_str)
                except (ValueError, TypeError):
                    # If parsing fails, use current time
                    pass

            # Create and save the sensor data
            sensor_data = SensorData.objects.create(
                device=device,
                timestamp=timestamp,
                temperature=temperature,
                humidity=humidity
            )
            return sensor_data
        except Exception as e:
            print(f"Error creating sensor data: {e}")
            return None

    async def process_sensor_data(self, data):
        """
        Process sensor data
        """
        device_id = data.get('device_id')
        timestamp = data.get('timestamp')
        temperature = data.get('temperature')
        humidity = data.get('humidity')

        # Get or create the device
        device = await self.get_or_create_device(device_id)
        if not device:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Device not found or not authorized'
            }))
            return

        # Save to database
        sensor_data = await self.create_sensor_data(device, timestamp, temperature, humidity)
        if not sensor_data:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to create sensor data'
            }))
            return

        # Broadcast to all clients
        await self.channel_layer.group_send(
            "sensor_data",
            {
                'type': 'broadcast_sensor_data',
                'device_id': device_id,
                'timestamp': timestamp,
                'temperature': temperature,
                'humidity': humidity
            }
        )

        # Confirm receipt
        await self.send(text_data=json.dumps({
            'type': 'sensor_data_received',
            'message': 'Sensor data received and saved'
        }))

    async def broadcast_motion_event(self, event):
        """
        Broadcast motion event to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'motion_event',
            'device_id': event['device_id'],
            'timestamp': event['timestamp'],
            'temperature': event['temperature'],
            'humidity': event['humidity']
        }))

    async def broadcast_sensor_data(self, event):
        """
        Broadcast sensor data to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'sensor_data',
            'device_id': event['device_id'],
            'timestamp': event['timestamp'],
            'temperature': event['temperature'],
            'humidity': event['humidity']
        }))
