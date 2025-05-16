import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

class SensorConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for sensor data
    """
    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection
        """
        # Add the client to the sensor_data group
        await self.channel_layer.group_add(
            "sensor_data",
            self.channel_name
        )

        # Accept the connection
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to WebSocket server'
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

    async def process_motion_event(self, data):
        """
        Process motion event data
        """
        device_id = data.get('device_id')
        timestamp = data.get('timestamp')
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        
        # Save to database (in a real implementation)
        # await self.save_motion_event(device_id, timestamp, temperature, humidity)
        
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
            'message': 'Motion event received'
        }))

    async def process_sensor_data(self, data):
        """
        Process sensor data
        """
        device_id = data.get('device_id')
        timestamp = data.get('timestamp')
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        
        # Save to database (in a real implementation)
        # await self.save_sensor_data(device_id, timestamp, temperature, humidity)
        
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
            'message': 'Sensor data received'
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
