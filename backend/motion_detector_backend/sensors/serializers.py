from rest_framework import serializers
from .models import Device, MotionEvent, SensorData

class DeviceSerializer(serializers.ModelSerializer):
    """
    Serializer for Device model
    """
    class Meta:
        model = Device
        fields = ['id', 'name', 'device_id', 'location', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class MotionEventSerializer(serializers.ModelSerializer):
    """
    Serializer for MotionEvent model
    """
    device_name = serializers.CharField(source='device.name', read_only=True)
    device_location = serializers.CharField(source='device.location', read_only=True)
    
    class Meta:
        model = MotionEvent
        fields = ['id', 'device', 'device_name', 'device_location', 'timestamp', 
                  'temperature', 'humidity', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

class SensorDataSerializer(serializers.ModelSerializer):
    """
    Serializer for SensorData model
    """
    device_name = serializers.CharField(source='device.name', read_only=True)
    device_location = serializers.CharField(source='device.location', read_only=True)
    
    class Meta:
        model = SensorData
        fields = ['id', 'device', 'device_name', 'device_location', 'timestamp', 
                  'temperature', 'humidity', 'created_at']
        read_only_fields = ['id', 'created_at']

class MotionEventCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating MotionEvent with device_id instead of device
    """
    device_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = MotionEvent
        fields = ['device_id', 'timestamp', 'temperature', 'humidity', 'image']
    
    def create(self, validated_data):
        device_id = validated_data.pop('device_id')
        try:
            device = Device.objects.get(device_id=device_id)
            return MotionEvent.objects.create(device=device, **validated_data)
        except Device.DoesNotExist:
            raise serializers.ValidationError({"device_id": "Device with this ID does not exist"})

class SensorDataCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating SensorData with device_id instead of device
    """
    device_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = SensorData
        fields = ['device_id', 'timestamp', 'temperature', 'humidity']
    
    def create(self, validated_data):
        device_id = validated_data.pop('device_id')
        try:
            device = Device.objects.get(device_id=device_id)
            return SensorData.objects.create(device=device, **validated_data)
        except Device.DoesNotExist:
            raise serializers.ValidationError({"device_id": "Device with this ID does not exist"})
