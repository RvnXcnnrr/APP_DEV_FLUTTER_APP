import 'package:flutter/foundation.dart';

/// Configuration for the application
class AppConfig {
  // Automatically detect environment based on platform
  static Environment get currentEnvironment {
    // Check if we're in production mode
    const bool isProduction = bool.fromEnvironment('dart.vm.product');

    if (isProduction) {
      return Environment.production;
    } else if (kIsWeb) {
      return Environment.web;
    } else {
      // You can keep this as the default for non-web platforms
      // or implement more sophisticated detection if needed
      return Environment.emulator;
    }
  }

  /// Base URL for the API
  static String get apiBaseUrl {
    switch (currentEnvironment) {
      case Environment.production:
        // Render deployed backend URL
        return 'https://app-dev-flutter-app.onrender.com';
      case Environment.emulator:
        return 'http://10.0.2.2:8000'; // Use 10.0.2.2 for Android emulator to access localhost
      case Environment.web:
        return 'http://localhost:8000'; // Use for web
      case Environment.ios:
        return 'http://localhost:8000'; // Use for iOS simulator
      case Environment.physical:
        return 'http://192.168.1.9:8000'; // Use your actual IP for physical devices
    }
  }

  /// WebSocket configuration
  static String get wsBaseUrl {
    // Token for device authentication
    const token = 'fe1f6c58646d8942c85cb5fc456990d4a639c1a0';

    // Use the same environment detection as apiBaseUrl
    switch (currentEnvironment) {
      case Environment.production:
        // Render deployed backend URL (using wss for secure WebSocket)
        return 'wss://app-dev-flutter-app.onrender.com/ws/sensors/?token=$token';
      case Environment.emulator:
        return 'ws://10.0.2.2:8000/ws/sensors/?token=$token'; // Use 10.0.2.2 for Android emulator
      case Environment.web:
        return 'ws://localhost:8000/ws/sensors/?token=$token'; // Use for web
      case Environment.ios:
        return 'ws://localhost:8000/ws/sensors/?token=$token'; // Use for iOS simulator
      case Environment.physical:
        return 'ws://192.168.1.9:8000/ws/sensors/?token=$token'; // Use your actual IP for physical devices
    }
  }
}

/// Environment types for configuration
enum Environment {
  /// Android emulator
  emulator,

  /// Web browser
  web,

  /// iOS simulator
  ios,

  /// Physical device
  physical,

  /// Production environment
  production,
}
