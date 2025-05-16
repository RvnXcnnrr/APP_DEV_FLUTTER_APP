from django.db import models
from django.conf import settings

class Device(models.Model):
    """
    Model for ESP32 devices
    """
    name = models.CharField(max_length=100)
    device_id = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='devices')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.device_id})"

class MotionEvent(models.Model):
    """
    Model for motion detection events
    """
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='motion_events')
    timestamp = models.DateTimeField()
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    image = models.ImageField(upload_to='motion_events/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Motion detected by {self.device.name} at {self.timestamp}"

class SensorData(models.Model):
    """
    Model for regular sensor data (temperature, humidity)
    """
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='sensor_data')
    timestamp = models.DateTimeField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Sensor data from {self.device.name} at {self.timestamp}"
