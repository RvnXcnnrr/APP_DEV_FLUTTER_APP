# Motion Detector App

- A complete motion detection system with Flutter mobile application, React web application, Django REST Framework backend, and ESP32 code for motion detection and temperature/humidity monitoring.

## Features

### Flutter App
- **Splash Screen**: Initial loading screen with app logo and progress indicator
- **Authentication**: Login, registration, password recovery with email verification
- **User Profile**: Profile management with photo upload capability
- **Theme Switching**: Toggle between light and dark modes
- **Dashboard**: Real-time display of motion detection events with temperature and humidity data
- **Settings**: App configuration options

### React Web App
- **Responsive Design**: Works on desktop and mobile browsers
- **Authentication**: Login, registration, and password recovery with email verification
- **User Profile**: Profile management with theme preference
- **Dashboard**: Real-time display of motion detection events
- **Dark/Light Mode**: Theme switching in the top navigation bar

### Django Backend
- **User Authentication**: Registration with email verification, login/logout, password reset
- **User Profile Management**: Profile picture upload, theme preference storage
- **Sensor Data API**: Endpoints for ESP32 to send motion detection and sensor data
- **WebSocket Support**: Real-time data transmission
- **API Documentation**: Swagger and ReDoc interfaces
- **PostgreSQL Database**: Production-ready database configuration

### ESP32 Integration
- **Motion Detection**: PIR sensor integration for detecting movement
- **Temperature & Humidity**: DHT22 sensor integration
- **Real-time Data**: Sends data to Django backend via HTTP requests
- **WebSocket Support**: Connects to backend for real-time data transmission
- **NTP Time Synchronization**: Accurate timestamps for sensor readings

## Project Structure

### Flutter App
- `lib/main.dart`: Entry point of the application with route configuration
- `lib/pages/splash_screen.dart`: Initial loading screen that redirects to login
- `lib/pages/auth/`: Authentication-related screens (login, register, forgot password)
- `lib/pages/dashboard_page.dart`: Main screen for displaying motion events
- `lib/pages/profile_page.dart`: User profile management
- `lib/pages/settings_page.dart`: App settings and configuration
- `lib/utils/theme.dart`: Theme configuration for light and dark modes
- `lib/utils/config.dart`: Environment configuration (development/production)
- `lib/providers/`: State management using Provider package
- `lib/services/`: API, authentication, and WebSocket services

### React Web App
- `web_app/motion-detector-react/`: React project root
- `src/components/`: Reusable UI components
- `src/pages/`: Page components including authentication and dashboard
- `src/context/`: React context providers for state management
- `src/utils/`: Utility functions and configuration
- `src/services/`: API and WebSocket service integration

### Django Backend
- `backend/motion_detector_backend/`: Django project root
- `backend/motion_detector_backend/users/`: User authentication and profile management
- `backend/motion_detector_backend/sensors/`: Sensor data and motion event handling
- `backend/templates/`: Email templates for account verification and password reset
- `backend/media/`: Uploaded files (profile pictures)

### ESP32 Code
- `esp32_motion_detector.ino`: Arduino code for ESP32 with PIR and DHT22 sensors
- `ESP32_Production_Template.ino`: Production-ready template for deployment

## Dependencies

### Flutter App
- `flutter`: The Flutter SDK
- `provider` (^6.0.5): State management solution
- `image_picker` (^1.0.4): For selecting images from gallery or camera
- `shared_preferences` (^2.2.2): For persistent local storage
- `table_calendar` (^3.0.9): Calendar widget for date selection
- `http` (^1.1.0): HTTP client for API requests
- `flutter_secure_storage` (^8.0.0): Secure storage for tokens
- `web_socket_channel` (^2.4.0): WebSocket communication

### React Web App
- `react` (^18.2.0): UI library
- `vite` (^5.0.0): Build tool and development server
- `react-router-dom` (^6.20.0): Routing library
- `react-icons` (^4.12.0): Icon library
- `axios` (^1.6.2): HTTP client for API requests

### Django Backend
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

### ESP32
- `WiFi`: WiFi connectivity
- `HTTPClient`: HTTP requests
- `WebSocketsClient`: WebSocket communication
- `ArduinoJson`: JSON parsing and creation
- `DHT`: Temperature and humidity sensor library
- `time.h`: NTP time synchronization

## Installation

### Flutter App
1. Make sure you have Flutter installed. If not, follow the [official installation guide](https://docs.flutter.dev/get-started/install).

2. Clone the repository and navigate to the project directory:
   ```
   git clone https://github.com/yourusername/motion-detector-app.git
   cd motion-detector-app
   ```

3. Install dependencies:
   ```
   flutter pub get
   ```

4. Run the app:
   ```
   flutter run
   ```

### React Web App
1. Make sure you have Node.js installed (v14 or later).

2. Navigate to the React app directory:
   ```
   cd web_app/motion-detector-react
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The app will be available at http://localhost:5173/

### Django Backend
1. Run the setup script to create a virtual environment and install dependencies:
   ```
   setup_backend.bat
   ```

2. Initialize the database:
   ```
   cd backend
   init_db.bat
   ```

3. Run the server with WebSocket support:
   ```
   cd backend
   run_server.bat
   ```

The server will be available at http://localhost:8000/

### ESP32 Setup
1. Open `esp32_motion_detector.ino` in Arduino IDE
2. Update the WiFi credentials to match your network
3. Update the server URL to point to your Django backend:
   - For local development: `http://your-local-ip:8000`
   - For production: `https://app-dev-flutter-app.onrender.com`
4. Install required libraries through Arduino Library Manager:
   - WiFi (included with ESP32 board)
   - HTTPClient (included with ESP32 board)
   - WebSocketsClient
   - ArduinoJson
   - DHT sensor library by Adafruit
   - Adafruit Unified Sensor
5. Connect your hardware:
   - PIR motion sensor to pin 27
   - DHT22 temperature/humidity sensor to pin 26
6. Upload the code to your ESP32

## API Endpoints

### Authentication
- `POST /api/auth/login/`: User login
- `POST /api/auth/logout/`: User logout
- `POST /api/auth/password/reset/`: Request password reset
- `POST /api/auth/password/reset/confirm/`: Confirm password reset
- `POST /api/auth/registration/`: User registration
- `POST /api/auth/registration/verify-email/`: Verify email
- `POST /api/users/resend-verification-email/`: Resend verification email

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

- `GET /api/sensors/motion-events/`: List motion events (paginated)
- `GET /api/sensors/motion-events/{id}/`: Get motion event details

- `GET /api/sensors/sensor-data/`: List sensor data (paginated)
- `GET /api/sensors/sensor-data/{id}/`: Get sensor data details

- `POST /api/sensors/esp32/motion-event/`: Create motion event (for ESP32)
- `POST /api/sensors/esp32/sensor-data/`: Create sensor data (for ESP32)

### WebSocket
- `wss://app-dev-flutter-app.onrender.com/ws/sensors/?token=[auth-token]`: WebSocket endpoint for production
- `ws://localhost:8000/ws/sensors/?token=[auth-token]`: WebSocket endpoint for local development

WebSocket messages are JSON objects with the following structure:
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

Message types:
- `motion_event`: Sent when motion is detected
- `sensor_data`: Sent for regular sensor readings
- `sensor_data_received`: Confirmation message

### API Documentation
- `/swagger/`: Swagger UI for API documentation
- `/redoc/`: ReDoc UI for API documentation

## Development Notes

- The app uses the Provider package for state management in Flutter
- Motion event displays show temperature and humidity data without room numbers
- Time is displayed in AM/PM format
- The Django backend uses JWT authentication with token refresh
- Email verification is required for new user registrations
- The backend is configured to use Philippine Time (PHT, UTC+8) for timestamps
- WebSocket connections require authentication tokens
- The server must be run using Daphne for WebSocket support
- The ESP32 code includes NTP time synchronization for accurate timestamps
- The React web app uses Vite as the build tool and development server

## Deployments

The application is deployed on the following platforms:

### Backend
- **Platform**: Render.com
- **URL**: https://app-dev-flutter-app.onrender.com
- **Database**: PostgreSQL on Render

### Web App
- **Platform**: Netlify
- **URL**: https://motiondetectorappdev.netlify.app

For detailed deployment instructions, see the [DEPLOYMENT.md](DEPLOYMENT.md) file.
