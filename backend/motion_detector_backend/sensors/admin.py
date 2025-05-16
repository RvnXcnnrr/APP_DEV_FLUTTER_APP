from django.contrib import admin
from .models import Device, MotionEvent, SensorData

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'location', 'owner', 'is_active', 'created_at')
    list_filter = ('is_active', 'location')
    search_fields = ('name', 'device_id', 'location')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MotionEvent)
class MotionEventAdmin(admin.ModelAdmin):
    list_display = ('device', 'timestamp', 'temperature', 'humidity', 'created_at')
    list_filter = ('device', 'timestamp')
    search_fields = ('device__name', 'device__device_id')
    readonly_fields = ('created_at',)

@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ('device', 'timestamp', 'temperature', 'humidity', 'created_at')
    list_filter = ('device', 'timestamp')
    search_fields = ('device__name', 'device__device_id')
    readonly_fields = ('created_at',)
