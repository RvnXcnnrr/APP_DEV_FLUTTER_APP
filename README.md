# Motion Detector App

A complete motion detection system with Flutter mobile application, Django REST Framework backend, and ESP32 code for motion detection and temperature/humidity monitoring.

## Features

### Flutter App
- **Splash Screen**: Initial loading screen with app logo and progress indicator
- **Authentication**: Login, registration, and password recovery
- **User Profile**: Profile management with photo upload capability
- **Theme Switching**: Toggle between light and dark modes
- **Dashboard**: Main interface for motion detection events
- **Settings**: App configuration options

### Django Backend
- **User Authentication**: Registration with email verification, login/logout, password reset
- **User Profile Management**: Profile picture upload, theme preference storage
- **Sensor Data API**: Endpoints for ESP32 to send motion detection and sensor data
- **API Documentation**: Swagger and ReDoc interfaces

### ESP32 Integration
- **Motion Detection**: PIR sensor integration for detecting movement
- **Temperature & Humidity**: DHT22 sensor integration
- **Real-time Data**: Sends data to Django backend via HTTP requests

## Project Structure

### Flutter App
- `lib/main.dart`: Entry point of the application with route configuration
- `lib/pages/splash_screen.dart`: Initial loading screen that redirects to login
- `lib/pages/auth/`: Authentication-related screens (login, register, forgot password)
- `lib/pages/dashboard_page.dart`: Main screen for displaying motion events
- `lib/pages/profile_page.dart`: User profile management
- `lib/pages/settings_page.dart`: App settings and configuration
- `lib/utils/theme.dart`: Theme configuration for light and dark modes
- `lib/providers/user_provider.dart`: State management for user data

### Django Backend
- `motion_detector_backend/`: Django project root
- `motion_detector_backend/users/`: User authentication and profile management
- `motion_detector_backend/sensors/`: Sensor data and motion event handling
- `templates/`: Email templates for account verification and password reset

### ESP32 Code
- `esp32_motion_detector.ino`: Arduino code for ESP32 with PIR and DHT22 sensors

## Dependencies

### Flutter App
- `flutter`: The Flutter SDK
- `provider` (^6.0.5): State management solution
- `image_picker` (^1.0.4): For selecting images from gallery or camera
- `shared_preferences` (^2.2.2): For persistent local storage
- `table_calendar` (^3.0.9): Calendar widget for date selection

### Django Backend
- `Django` (5.0.6): Web framework
- `djangorestframework` (3.14.0): REST API framework
- `django-cors-headers` (4.3.1): CORS support
- `Pillow` (10.1.0): Image processing
- `dj-rest-auth` (5.0.2): Authentication endpoints
- `djangorestframework-simplejwt` (5.3.1): JWT authentication
- `django-allauth` (0.58.2): User registration and authentication
- `drf-yasg` (1.21.7): API documentation

### ESP32
- `WiFi`: WiFi connectivity
- `HTTPClient`: HTTP requests
- `ArduinoJson`: JSON parsing and creation
- `DHT`: Temperature and humidity sensor library

## Installation

### Flutter App
1. Make sure you have Flutter installed. If not, follow the [official installation guide](https://docs.flutter.dev/get-started/install).

2. Install dependencies:
   ```
   flutter pub get
   ```

3. Run the app:
   ```
   flutter run
   ```

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

3. Run the server:
   ```
   run_backend.bat
   ```
   or
   ```
   cd backend
   run_server.bat
   ```

The server will be available at http://192.168.1.9:8000/ (your local IP address)

### ESP32 Setup
1. Open `esp32_motion_detector.ino` in Arduino IDE
2. Update the WiFi credentials if needed
3. The server URL is already configured to use your local IP address (192.168.1.9:8000)
4. Install required libraries through Arduino Library Manager:
   - WiFi (included with ESP32 board)
   - HTTPClient (included with ESP32 board)
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
- `POST /api/auth/registration/`: User registration
- `POST /api/auth/registration/verify-email/`: Verify email

### User Profile
- `GET /api/users/profile/`: Get user profile
- `PUT /api/users/profile/`: Update user profile
- `PATCH /api/users/profile/picture/`: Update profile picture
- `PATCH /api/users/profile/theme/`: Update theme preference

### Sensors
- `GET /api/sensors/devices/`: List user's devices
- `GET /api/sensors/motion-events/`: List motion events
- `GET /api/sensors/sensor-data/`: List sensor data
- `POST /api/sensors/esp32/motion-event/`: Create motion event (for ESP32)
- `POST /api/sensors/esp32/sensor-data/`: Create sensor data (for ESP32)

## Development Notes

- The app uses the Provider package for state management
- User authentication is currently bypassed during development (no hardcoded credentials)
- Motion event displays show temperature and humidity data without room numbers
- Time is displayed in AM/PM format
- The Django backend uses JWT authentication
- ESP32 code sends temperature and humidity data with each motion event
