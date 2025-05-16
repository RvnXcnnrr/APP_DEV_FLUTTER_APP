from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Device, MotionEvent, SensorData
from .serializers import (
    DeviceSerializer,
    MotionEventSerializer,
    SensorDataSerializer,
    MotionEventCreateSerializer,
    SensorDataCreateSerializer
)
from .permissions import IsOwnerOrReadOnly

class DeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Device model
    """
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Device.objects.filter(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def motion_events(self, request, pk=None):
        """
        Get all motion events for a specific device
        """
        device = self.get_object()
        events = MotionEvent.objects.filter(device=device)
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                events = events.filter(timestamp__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = end_date + timedelta(days=1)  # Include the end date
                events = events.filter(timestamp__lt=end_date)
            except ValueError:
                pass
        
        serializer = MotionEventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def sensor_data(self, request, pk=None):
        """
        Get all sensor data for a specific device
        """
        device = self.get_object()
        data = SensorData.objects.filter(device=device)
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                data = data.filter(timestamp__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = end_date + timedelta(days=1)  # Include the end date
                data = data.filter(timestamp__lt=end_date)
            except ValueError:
                pass
        
        serializer = SensorDataSerializer(data, many=True)
        return Response(serializer.data)

class MotionEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for MotionEvent model (read-only)
    """
    serializer_class = MotionEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MotionEvent.objects.filter(device__owner=self.request.user)

class SensorDataViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for SensorData model (read-only)
    """
    serializer_class = SensorDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SensorData.objects.filter(device__owner=self.request.user)

class MotionEventCreateView(generics.CreateAPIView):
    """
    View for creating motion events from ESP32
    """
    serializer_class = MotionEventCreateSerializer
    permission_classes = [permissions.AllowAny]  # Allow ESP32 to send data without authentication
    parser_classes = [MultiPartParser, FormParser]

class SensorDataCreateView(generics.CreateAPIView):
    """
    View for creating sensor data from ESP32
    """
    serializer_class = SensorDataCreateSerializer
    permission_classes = [permissions.AllowAny]  # Allow ESP32 to send data without authentication
