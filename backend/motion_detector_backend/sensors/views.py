from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser, AnonymousUser
from typing import Any, Dict, Union, TypeVar, Type
from .models import Device, MotionEvent, SensorData
from .serializers import (
    DeviceSerializer,
    MotionEventSerializer,
    SensorDataSerializer,
    MotionEventCreateSerializer,
    SensorDataCreateSerializer
)
from .permissions import IsOwnerOrReadOnly

# Import the authentication class
# The file exists but Pylance can't find it, so we'll use a type ignore comment
from .authentication import DeviceTokenAuthentication  # type: ignore

# Type definitions for better type checking
User = get_user_model()
UserType = TypeVar('UserType', bound=Union[Type[AbstractUser], Type[AnonymousUser]])
RequestData = Dict[str, Any]

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
    authentication_classes = [DeviceTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]  # Require authentication
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Get device_id from serializer's validated_data instead of request.data
        # This avoids type checking issues with request.data
        device_id = serializer.validated_data.get('device_id')

        # For ESP32_001, enforce specific owner access control
        if device_id == 'ESP32_001':
            # Only allow the user with email oracle.tech.143@gmail.com
            user_email = getattr(self.request.user, 'email', None)
            if user_email != 'oracle.tech.143@gmail.com':
                raise permissions.exceptions.PermissionDenied(
                    "You are not authorized to access device ESP32_001"
                )

            try:
                # Get or create the device with the correct owner
                device, _ = Device.objects.get_or_create(
                    device_id=device_id,
                    defaults={
                        'name': f"ESP32 Device {device_id}",
                        'location': "Living Room",
                        'owner': self.request.user,
                        'token': 'd6d5f5d99bbd616cce3452ad1d02cd6ae968b20d'
                    }
                )

                # If the device exists but doesn't have the token set, update it
                if not device.token:
                    device.token = 'd6d5f5d99bbd616cce3452ad1d02cd6ae968b20d'
                    device.save(update_fields=['token'])

                # Save the motion event with the device
                serializer.save(device=device)
            except Exception as e:
                raise permissions.exceptions.APIException(
                    f"Error processing request: {str(e)}"
                )
        else:
            # For other devices, use standard logic
            try:
                device = Device.objects.get(device_id=device_id)

                # Ensure the device belongs to the authenticated user
                if device.owner != self.request.user:
                    raise permissions.exceptions.PermissionDenied(
                        "You do not have permission to access this device"
                    )

                # Save the motion event with the device
                serializer.save(device=device)
            except Device.DoesNotExist:
                # Create a new device for the user
                device = Device.objects.create(
                    device_id=device_id,
                    name=f"ESP32 Device {device_id}",
                    location="Unknown",
                    owner=self.request.user
                )
                serializer.save(device=device)

class SensorDataCreateView(generics.CreateAPIView):
    """
    View for creating sensor data from ESP32
    """
    serializer_class = SensorDataCreateSerializer
    authentication_classes = [DeviceTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    def perform_create(self, serializer):
        # Get device_id from serializer's validated_data instead of request.data
        # This avoids type checking issues with request.data
        device_id = serializer.validated_data.get('device_id')

        # For ESP32_001, enforce specific owner access control
        if device_id == 'ESP32_001':
            # Only allow the user with email oracle.tech.143@gmail.com
            user_email = getattr(self.request.user, 'email', None)
            if user_email != 'oracle.tech.143@gmail.com':
                raise permissions.exceptions.PermissionDenied(
                    "You are not authorized to access device ESP32_001"
                )

            try:
                # Get or create the device with the correct owner
                device, _ = Device.objects.get_or_create(
                    device_id=device_id,
                    defaults={
                        'name': f"ESP32 Device {device_id}",
                        'location': "Living Room",
                        'owner': self.request.user,
                        'token': 'd6d5f5d99bbd616cce3452ad1d02cd6ae968b20d'
                    }
                )

                # If the device exists but doesn't have the token set, update it
                if not device.token:
                    device.token = 'd6d5f5d99bbd616cce3452ad1d02cd6ae968b20d'
                    device.save(update_fields=['token'])

                # Save the sensor data with the device
                serializer.save(device=device)
            except Exception as e:
                raise permissions.exceptions.APIException(
                    f"Error processing request: {str(e)}"
                )
        else:
            # For other devices, use standard logic
            try:
                device = Device.objects.get(device_id=device_id)

                # Ensure the device belongs to the authenticated user
                if device.owner != self.request.user:
                    raise permissions.exceptions.PermissionDenied(
                        "You do not have permission to access this device"
                    )

                # Save the sensor data with the device
                serializer.save(device=device)
            except Device.DoesNotExist:
                # Create a new device for the user
                device = Device.objects.create(
                    device_id=device_id,
                    name=f"ESP32 Device {device_id}",
                    location="Unknown",
                    owner=self.request.user
                )
                serializer.save(device=device)
