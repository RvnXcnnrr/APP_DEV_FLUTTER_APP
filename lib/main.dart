import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/pages/splash_screen.dart';
import 'package:appdev_md/utils/theme.dart';
import 'package:appdev_md/utils/config.dart';
import 'package:appdev_md/utils/logger.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:appdev_md/providers/motion_event_provider.dart';
import 'package:appdev_md/providers/sensor_data_provider.dart';
import 'package:appdev_md/pages/auth/login_page.dart';
import 'package:appdev_md/pages/auth/register_page.dart';
import 'package:appdev_md/pages/auth/forgot_password_page.dart';
import 'package:appdev_md/pages/auth/reset_password_confirm_page.dart';
import 'package:appdev_md/pages/dashboard_page.dart';
import 'package:appdev_md/pages/profile_page.dart';
import 'package:appdev_md/pages/settings_page.dart';
import 'package:appdev_md/services/api_service.dart';
import 'package:appdev_md/services/auth_service.dart';
import 'package:appdev_md/services/websocket_service.dart';

// Global services for easy access
final apiService = ApiService(baseUrl: AppConfig.apiBaseUrl);
final authService = AuthService(apiService: apiService);
final webSocketService = WebSocketService(serverUrl: AppConfig.wsBaseUrl);

// Log API configuration for debugging
void logApiConfig() {
  Logger.info('Current environment: ${AppConfig.currentEnvironment}');
  Logger.info('API Base URL: ${AppConfig.apiBaseUrl}');
  Logger.info('WebSocket URL: ${AppConfig.wsBaseUrl}');
  Logger.debug('Using API service: $apiService');
  Logger.debug('Using auth service: $authService');
  Logger.debug('Using WebSocket service: $webSocketService');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Log API configuration for debugging
  logApiConfig();

  // Create user provider
  final userProvider = UserProvider();

  // Initialize theme and check for existing user
  await userProvider.initialize();

  // Check if we have a stored token
  final token = await apiService.getToken();
  if (token != null) {
    Logger.info('Found stored token, attempting to get current user');
    try {
      final user = await authService.getCurrentUser();
      if (user != null) {
        Logger.info('Successfully retrieved current user: ${user.email}');
        userProvider.setUser(user);
      }
    } catch (e) {
      Logger.error('Error getting current user', e);
      // Clear token if it's invalid
      await apiService.clearToken();
    }
  }

  // Create motion event provider
  final motionEventProvider = MotionEventProvider(
    webSocketService: webSocketService,
    apiService: apiService,
  );

  // Create sensor data provider
  final sensorDataProvider = SensorDataProvider(
    webSocketService: webSocketService,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: userProvider),
        ChangeNotifierProvider.value(value: motionEventProvider),
        ChangeNotifierProvider.value(value: sensorDataProvider),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return MaterialApp(
      title: 'Motion Detector',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: userProvider.themeMode,
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/forgot-password': (context) => const ForgotPasswordPage(),
        '/dashboard': (context) => const DashboardPage(),
        '/profile': (context) => const ProfilePage(),
        '/settings': (context) => const SettingsPage(),
      },
      // Handle dynamic routes for password reset
      onGenerateRoute: (settings) {
        // Handle reset-password/confirm/:uid/:token route
        if (settings.name?.startsWith('/reset-password/confirm/') ?? false) {
          final uri = Uri.parse(settings.name!);
          final pathSegments = uri.pathSegments;

          // Extract uid and token from URL
          if (pathSegments.length >= 4) {
            final uid = pathSegments[2];
            final token = pathSegments[3];

            return MaterialPageRoute(
              builder:
                  (context) => ResetPasswordConfirmPage(uid: uid, token: token),
            );
          }
        }

        // Return null to let the routes above handle known routes
        return null;
      },
    );
  }
}
