# Motion Detector Backend

Django REST Framework backend for the Motion Detector application. This backend provides API endpoints for user authentication, profile management, and sensor data handling with WebSocket support for real-time updates.

## Features

- **User Authentication**: Registration with email verification, login/logout, password reset
- **User Profile Management**: Profile picture upload, theme preference storage
- **Sensor Data API**: Endpoints for ESP32 to send motion detection and sensor data
- **WebSocket Support**: Real-time data transmission for motion events and sensor readings
- **API Documentation**: Swagger and ReDoc interfaces
- **PostgreSQL Database**: Production-ready database configuration
- **CORS Support**: Configured for cross-origin requests from web and mobile clients
- **JWT Authentication**: Secure token-based authentication with refresh capability

## Project Structure

- `motion_detector_backend/`: Django project root
  - `settings.py`: Project settings including database, authentication, and CORS
  - `urls.py`: Main URL configuration
  - `asgi.py`: ASGI configuration for WebSocket support
- `motion_detector_backend/users/`: User authentication and profile management
  - `models.py`: CustomUser and UserProfile models
  - `views.py`: User-related API views
  - `urls.py`: User-related URL patterns
  - `serializers.py`: JSON serializers for user data
  - `adapters.py`: Custom adapters for email verification
- `motion_detector_backend/sensors/`: Sensor data and motion event handling
  - `models.py`: Device, MotionEvent, and SensorData models
  - `views.py`: Sensor-related API views
  - `urls.py`: Sensor-related URL patterns
  - `serializers.py`: JSON serializers for sensor models
  - `consumers.py`: WebSocket consumers for real-time data
  - `routing.py`: WebSocket URL routing
  - `authentication.py`: Custom authentication for ESP32 devices
- `templates/`: Email templates for account verification and password reset
- `media/`: Uploaded files (profile pictures)
- `staticfiles/`: Collected static files for production deployment

## Dependencies

- `Django` (5.0.6): Web framework
- `djangorestframework` (3.14.0): REST API framework
- `django-cors-headers` (4.3.1): CORS support
- `Pillow` (10.2.0): Image processing
- `dj-rest-auth` (5.0.2): Authentication endpoints
- `djangorestframework-simplejwt` (5.3.1): JWT authentication
- `django-allauth` (0.58.2): User registration and authentication
- `drf-yasg` (1.21.7): API documentation
- `channels` (4.0.0): WebSocket support
- `daphne` (4.0.0): ASGI server for WebSocket support
- `python-decouple` (3.8): Environment variable management
- `psycopg2-binary` (2.9.9): PostgreSQL adapter
- `gunicorn` (21.2.0): WSGI HTTP server
- `whitenoise` (6.6.0): Static file serving
- `dj-database-url` (2.1.0): Database URL configuration

## Installation

### Local Development

1. Clone the repository and navigate to the project directory:
   ```
   git clone https://github.com/yourusername/motion-detector-app.git
   cd motion-detector-app
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Apply migrations:
   ```
   cd backend
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run the server with WebSocket support:
   ```
   daphne -b 0.0.0.0 -p 8000 motion_detector_backend.asgi:application
   ```

   Note: Using Django's built-in server (`python manage.py runserver`) will not support WebSockets.

Alternatively, you can use the provided batch files:
- `fix_dependencies.bat`: Install required dependencies
- `init_db.bat`: Initialize the database
- `run_server.bat`: Start the Django server with Daphne

### Production Deployment

The backend is configured for deployment on Render.com:

1. Connect your GitHub repository to Render
2. Create a new Web Service with the following settings:
   - Build Command: `./backend/build.sh`
   - Start Command: `cd backend && daphne motion_detector_backend.asgi:application --port $PORT --bind 0.0.0.0`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `DEBUG`: `False`
     - `SECRET_KEY`: A secure random key
     - `SITE_DOMAIN`: Your domain (e.g., `app-dev-flutter-app.onrender.com`)

For detailed deployment instructions, see the [DEPLOYMENT.md](../DEPLOYMENT.md) file.

## API Endpoints

### Authentication
- `POST /api/auth/login/`: User login with JWT token response
- `POST /api/auth/logout/`: User logout (invalidates token)
- `POST /api/auth/token/refresh/`: Refresh JWT token
- `POST /api/auth/password/reset/`: Request password reset via email
- `POST /api/auth/password/reset/confirm/`: Confirm password reset with token
- `POST /api/auth/registration/`: User registration (creates inactive user)
- `POST /api/auth/registration/verify-email/`: Verify email (activates user)
- `POST /api/users/resend-verification-email/`: Resend verification email

### User Profile
- `GET /api/users/profile/`: Get current user's profile
- `PUT /api/users/profile/`: Update user profile (first_name, last_name, theme_preference)
- `PATCH /api/users/profile/picture/`: Update profile picture (multipart/form-data)
- `PATCH /api/users/profile/theme/`: Update theme preference only

### Sensors
- `GET /api/sensors/devices/`: List user's devices (filtered by ownership)
- `POST /api/sensors/devices/`: Register a new device
- `GET /api/sensors/devices/{id}/`: Get device details
- `PUT /api/sensors/devices/{id}/`: Update device
- `DELETE /api/sensors/devices/{id}/`: Delete device
- `GET /api/sensors/devices/{id}/motion-events/`: Get motion events for a device
- `GET /api/sensors/devices/{id}/sensor-data/`: Get sensor data for a device

- `GET /api/sensors/motion-events/`: List motion events (paginated)
- `GET /api/sensors/motion-events/{id}/`: Get motion event details

- `GET /api/sensors/sensor-data/`: List sensor data (paginated)
- `GET /api/sensors/sensor-data/{id}/`: Get sensor data details

- `POST /api/sensors/esp32/motion-event/`: Create motion event (for ESP32)
- `POST /api/sensors/esp32/sensor-data/`: Create sensor data (for ESP32)

## ESP32 Integration

The backend provides two special endpoints for ESP32 devices:

1. `/api/sensors/esp32/motion-event/`: For sending motion detection events
   - Required fields: `device_id`, `timestamp`, `temperature`, `humidity`
   - Optional fields: `image`
   - Authentication: Device token in Authorization header

2. `/api/sensors/esp32/sensor-data/`: For sending regular sensor readings
   - Required fields: `device_id`, `timestamp`, `temperature`, `humidity`
   - Authentication: Device token in Authorization header

Example JSON payload:
```json
{
  "device_id": "ESP32_001",
  "timestamp": "2023-05-16T12:34:56",
  "temperature": 25.5,
  "humidity": 60.2
}
```

Example HTTP request:
```
POST /api/sensors/esp32/motion-event/ HTTP/1.1
Host: app-dev-flutter-app.onrender.com
Content-Type: application/json
Authorization: Token fe1f6c58646d8942c85cb5fc456990d4a639c1a0

{
  "device_id": "ESP32_001",
  "timestamp": "2023-05-16T12:34:56",
  "temperature": 25.5,
  "humidity": 60.2
}
```

## Device Registration

Before an ESP32 device can send data, it must be registered in the system. You can register a device:

1. Through the Django admin interface
2. Using the API endpoint: `POST /api/sensors/devices/` (requires user authentication)
3. Using the ESP32's `registerDevice()` function (requires device token)

Each device must be associated with a user account (owner) to enable proper access control.

## WebSocket Support

The backend provides WebSocket endpoints for real-time communication:

- Production: `wss://app-dev-flutter-app.onrender.com/ws/sensors/?token=[auth-token]`
- Development: `ws://localhost:8000/ws/sensors/?token=[auth-token]`

### Authentication

WebSocket connections require authentication using a token parameter in the URL:
- JWT token from user login (for web/mobile clients)
- Device token for ESP32 devices
- Example token: `fe1f6c58646d8942c85cb5fc456990d4a639c1a0` for the ESP32_001 device

### Message Format

The WebSocket sends and receives JSON messages with the following format:

```json
{
  "type": "motion_event",
  "data": {
    "device_id": "ESP32_001",
    "timestamp": "2023-05-16T12:34:56",
    "temperature": 25.5,
    "humidity": 60.2
  }
}
```

### Message Types

- `motion_event`: Sent when motion is detected
  - Contains device ID, timestamp, temperature, and humidity
  - Sent from ESP32 to backend, and from backend to connected clients

- `sensor_data`: Sent for regular sensor readings
  - Contains device ID, timestamp, temperature, and humidity
  - Sent from ESP32 to backend, and from backend to connected clients

- `sensor_data_received`: Confirmation message
  - Sent from backend to ESP32 to acknowledge receipt
  - Contains status and message

### WebSocket Client Example

```javascript
// JavaScript example (browser or Node.js)
const socket = new WebSocket('wss://app-dev-flutter-app.onrender.com/ws/sensors/?token=your-jwt-token');

socket.onopen = () => {
  console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  if (data.type === 'motion_event') {
    // Handle motion event
    updateMotionEvents(data.data);
  } else if (data.type === 'sensor_data') {
    // Handle sensor data
    updateSensorReadings(data.data);
  }
};
```

## Documentation

API documentation is available at:
- Swagger UI: `/swagger/` - Interactive API documentation
- ReDoc: `/redoc/` - Alternative API documentation format

Both documentation interfaces provide:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## Security

- JWT authentication with token refresh for web and mobile clients
- Device token authentication for ESP32 devices
- Email verification required for new user registrations
- Password reset functionality with secure tokens
- CORS configuration for secure cross-origin requests
- CSRF protection for form submissions

## Development Notes

- The backend uses JWT authentication with token refresh
- ESP32 endpoints (`/api/sensors/esp32/...`) require device token authentication
- User endpoints require JWT authentication
- Image uploads are stored in the `media/` directory
- WebSocket connections require token authentication
- The server must be run using Daphne for WebSocket support
- The backend uses Philippine Time (PHT, UTC+8) for timestamps
- Motion events and sensor data are paginated in API responses
- Device ownership is enforced for all sensor data access
- Email settings are configured for Gmail SMTP

## Troubleshooting

- If WebSockets aren't working, ensure you're running the server with Daphne
- For CORS issues, check the CORS_ALLOWED_ORIGINS setting in settings.py
- For authentication issues, verify that tokens are being sent correctly
- For database issues, check the DATABASE_URL environment variable
- For email issues, verify the EMAIL_HOST_USER and EMAIL_HOST_PASSWORD settings
