import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:appdev_md/providers/motion_event_provider.dart';
import 'package:appdev_md/utils/logger.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    // Check if user is logged in and navigate accordingly
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    // Get providers
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    final userProvider = Provider.of<UserProvider>(context, listen: false);

    if (userProvider.isLoggedIn) {
      // User is already logged in, fetch historical motion events
      Logger.info('User already logged in, fetching historical motion events');

      try {
        final motionEventProvider = Provider.of<MotionEventProvider>(context, listen: false);

        // Clear any existing events first
        motionEventProvider.clearEvents();

        // Fetch historical motion events with detailed logging
        await motionEventProvider.fetchHistoricalEvents();

        Logger.info('Successfully fetched historical motion events on app start');
      } catch (e) {
        Logger.error('Error fetching historical motion events on app start: $e');
      }

      // Navigate to dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } else {
      // User is not logged in, navigate to login screen
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App logo or icon
            const Icon(Icons.motion_photos_on, size: 80),
            const SizedBox(height: 24),
            Text(
              'Motion Detector',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
