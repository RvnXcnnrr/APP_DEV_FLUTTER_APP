# Motion Detector Backend

Django REST Framework backend for the Motion Detector application. This backend provides API endpoints for user authentication, profile management, and sensor data handling.

## Features

- **User Authentication**: Registration with email verification, login/logout, password reset
- **User Profile Management**: Profile picture upload, theme preference storage
- **Sensor Data API**: Endpoints for ESP32 to send motion detection and sensor data
- **API Documentation**: Swagger and ReDoc interfaces

## Project Structure

- `motion_detector_backend/`: Django project root
  - `settings.py`: Project settings
  - `urls.py`: Main URL configuration
- `motion_detector_backend/users/`: User authentication and profile management
  - `models.py`: User profile models
  - `views.py`: User-related API views
  - `urls.py`: User-related URL patterns
- `motion_detector_backend/sensors/`: Sensor data and motion event handling
  - `models.py`: Device, MotionEvent, and SensorData models
  - `views.py`: Sensor-related API views
  - `urls.py`: Sensor-related URL patterns
  - `serializers.py`: JSON serializers for sensor models
- `templates/`: Email templates for account verification and password reset
- `media/`: Uploaded files (profile pictures, motion event images)

## Dependencies

- `Django` (5.0.6): Web framework
- `djangorestframework` (3.14.0): REST API framework
- `django-cors-headers` (4.3.1): CORS support
- `Pillow` (10.1.0): Image processing
- `dj-rest-auth` (5.0.2): Authentication endpoints
- `djangorestframework-simplejwt` (5.3.1): JWT authentication
- `django-allauth` (0.58.2): User registration and authentication
- `drf-yasg` (1.21.7): API documentation

## Installation

1. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Run the server:
   ```
   python manage.py runserver 0.0.0.0:8000
   ```

Alternatively, you can use the provided batch files:
- `fix_dependencies.bat`: Install required dependencies
- `init_db.bat`: Initialize the database
- `run_server.bat`: Start the Django server

## API Endpoints

### Authentication
- `POST /api/auth/login/`: User login
- `POST /api/auth/logout/`: User logout
- `POST /api/auth/password/reset/`: Request password reset
- `POST /api/auth/registration/`: User registration
- `POST /api/auth/registration/verify-email/`: Verify email

### User Profile
- `GET /api/users/profile/`: Get user profile
- `PUT /api/users/profile/`: Update user profile
- `PATCH /api/users/profile/picture/`: Update profile picture
- `PATCH /api/users/profile/theme/`: Update theme preference

### Sensors
- `GET /api/sensors/devices/`: List user's devices
- `POST /api/sensors/devices/`: Register a new device
- `GET /api/sensors/devices/{id}/`: Get device details
- `PUT /api/sensors/devices/{id}/`: Update device
- `DELETE /api/sensors/devices/{id}/`: Delete device
- `GET /api/sensors/devices/{id}/motion-events/`: Get motion events for a device
- `GET /api/sensors/devices/{id}/sensor-data/`: Get sensor data for a device

- `GET /api/sensors/motion-events/`: List motion events
- `GET /api/sensors/motion-events/{id}/`: Get motion event details

- `GET /api/sensors/sensor-data/`: List sensor data
- `GET /api/sensors/sensor-data/{id}/`: Get sensor data details

- `POST /api/sensors/esp32/motion-event/`: Create motion event (for ESP32)
- `POST /api/sensors/esp32/sensor-data/`: Create sensor data (for ESP32)

## ESP32 Integration

The backend provides two special endpoints for ESP32 devices:

1. `/api/sensors/esp32/motion-event/`: For sending motion detection events
   - Required fields: `device_id`, `timestamp`, `temperature`, `humidity`
   - Optional fields: `image`

2. `/api/sensors/esp32/sensor-data/`: For sending regular sensor readings
   - Required fields: `device_id`, `timestamp`, `temperature`, `humidity`

Example JSON payload:
```json
{
  "device_id": "ESP32_001",
  "timestamp": "2025-05-16T12:34:56",
  "temperature": 25.5,
  "humidity": 60.2
}
```

## Device Registration

Before an ESP32 device can send data, it must be registered in the system. You can register a device:

1. Through the Django admin interface
2. Using the API endpoint: `POST /api/sensors/devices/`
3. Using the ESP32's `registerDevice()` function (requires authentication)

## Documentation

API documentation is available at:
- Swagger UI: `/swagger/`
- ReDoc: `/redoc/`

## Development Notes

- The backend uses JWT authentication
- ESP32 endpoints (`/api/sensors/esp32/...`) allow anonymous access
- Other endpoints require authentication
- Image uploads are stored in the `media/` directory
