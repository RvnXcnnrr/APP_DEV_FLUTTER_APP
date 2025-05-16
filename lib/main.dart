import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/pages/splash_screen.dart';
import 'package:appdev_md/utils/theme.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:appdev_md/pages/auth/login_page.dart';
import 'package:appdev_md/pages/auth/register_page.dart';
import 'package:appdev_md/pages/auth/forgot_password_page.dart';
import 'package:appdev_md/pages/dashboard_page.dart';
import 'package:appdev_md/pages/profile_page.dart';
import 'package:appdev_md/pages/settings_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (context) => UserProvider(),
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
      themeMode: userProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
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
    );
  }
}