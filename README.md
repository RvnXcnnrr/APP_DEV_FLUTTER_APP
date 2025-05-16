# Motion Detector App

A Flutter application for motion detection with user authentication, profile management, and theme customization.

## Features

- **Splash Screen**: Initial loading screen with app logo and progress indicator
- **Authentication**: Login, registration, and password recovery
- **User Profile**: Profile management with photo upload capability
- **Theme Switching**: Toggle between light and dark modes
- **Dashboard**: Main interface for motion detection events
- **Settings**: App configuration options

## Project Structure

### Key Files

- `lib/main.dart`: Entry point of the application with route configuration
- `lib/pages/splash_screen.dart`: Initial loading screen that redirects to login
- `lib/pages/auth/`: Authentication-related screens (login, register, forgot password)
- `lib/pages/dashboard_page.dart`: Main screen for displaying motion events
- `lib/pages/profile_page.dart`: User profile management
- `lib/pages/settings_page.dart`: App settings and configuration
- `lib/utils/theme.dart`: Theme configuration for light and dark modes
- `lib/providers/user_provider.dart`: State management for user data

## Dependencies

The app uses the following dependencies:

- `flutter`: The Flutter SDK
- `provider` (^6.0.5): State management solution
- `image_picker` (^1.0.4): For selecting images from gallery or camera
- `shared_preferences` (^2.2.2): For persistent local storage
- `table_calendar` (^3.0.9): Calendar widget for date selection

## Installation

1. Make sure you have Flutter installed. If not, follow the [official installation guide](https://docs.flutter.dev/get-started/install).

2. Clone the repository:
   ```
   git clone <repository-url>
   cd appdev_md
   ```

3. Install dependencies:
   ```
   flutter pub get
   ```

4. Run the app:
   ```
   flutter run
   ```

## Dependency Installation Commands

To add each dependency individually:

```bash
# Add provider package
flutter pub add provider

# Add image_picker package
flutter pub add image_picker

# Add shared_preferences package
flutter pub add shared_preferences

# Add table_calendar package
flutter pub add table_calendar
```

## Development Notes

- The app uses the Provider package for state management
- User authentication is currently bypassed during development (no hardcoded credentials)
- Motion event displays show temperature and humidity data without room numbers
- Time is displayed in AM/PM format
