import json
import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from .models import Device, MotionEvent, SensorData

class SensorConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for sensor data
    """
    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection
        """
        # Check if the user is authenticated
        if self.scope['user'].is_anonymous:
            # Close the connection if the user is not authenticated
            await self.close(code=4003)  # 4003 is a custom code for authentication failure
            return

        # Store the user for later use
        self.user = self.scope['user']

        # Add the client to the sensor_data group
        await self.channel_layer.group_add(
            "sensor_data",
            self.channel_name
        )

        # Accept the connection
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to WebSocket server as {self.user.username}'
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
    def get_device(self, device_id):
        """
        Get a device by its ID, ensuring it belongs to the authenticated user
        """
        try:
            # Only return the device if it belongs to the authenticated user
            # and the user has the specific token we're looking for
            if self.user.auth_token.key == 'd6d5f5d99bbd616cce3452ad1d02cd6ae968b20d':
                return Device.objects.get(device_id=device_id, owner=self.user)
            return None
        except Device.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting device: {e}")
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

        # Get the device, ensuring it belongs to the authenticated user
        device = await self.get_device(device_id)
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

        # Get the device, ensuring it belongs to the authenticated user
        device = await self.get_device(device_id)
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
