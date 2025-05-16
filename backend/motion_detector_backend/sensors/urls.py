from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeviceViewSet,
    MotionEventViewSet,
    SensorDataViewSet,
    MotionEventCreateView,
    SensorDataCreateView
)

router = DefaultRouter()
router.register(r'devices', DeviceViewSet, basename='device')
router.register(r'motion-events', MotionEventViewSet, basename='motion-event')
router.register(r'sensor-data', SensorDataViewSet, basename='sensor-data')

urlpatterns = [
    path('', include(router.urls)),
    path('esp32/motion-event/', MotionEventCreateView.as_view(), name='esp32-motion-event'),
    path('esp32/sensor-data/', SensorDataCreateView.as_view(), name='esp32-sensor-data'),
]
