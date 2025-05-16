import 'package:flutter/material.dart';

/// Helper class for navigation
class NavigationHelper {
  /// Navigate to a page while maintaining the navigation stack
  static void navigateTo(BuildContext context, Widget page, {String? routeName}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        settings: routeName != null ? RouteSettings(name: routeName) : null,
        builder: (context) => page,
      ),
    );
  }

  /// Navigate to a named route while maintaining the navigation stack
  static void navigateToNamed(BuildContext context, String routeName) {
    Navigator.pushNamed(context, routeName);
  }

  /// Navigate to a page and replace the current page
  static void navigateAndReplace(BuildContext context, Widget page, {String? routeName}) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        settings: routeName != null ? RouteSettings(name: routeName) : null,
        builder: (context) => page,
      ),
    );
  }

  /// Navigate to a named route and replace the current page
  static void navigateAndReplaceNamed(BuildContext context, String routeName) {
    Navigator.pushReplacementNamed(context, routeName);
  }

  /// Navigate back to the previous page
  static void goBack(BuildContext context) {
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  /// Check if we can navigate back
  static bool canGoBack(BuildContext context) {
    return Navigator.canPop(context);
  }

  /// Handle back button press with double-tap to exit (for WillPopScope)
  static Future<bool> handleBackPress(BuildContext context, DateTime? lastBackPressTime, Function(DateTime) setLastBackPressTime) async {
    final now = DateTime.now();
    if (lastBackPressTime == null ||
        now.difference(lastBackPressTime) > const Duration(seconds: 2)) {
      setLastBackPressTime(now);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Press back again to exit'),
          duration: Duration(seconds: 2),
        ),
      );
      return false;
    }
    return true;
  }

  /// Handle back button press with double-tap to exit (for PopScope)
  static bool handlePopInvoked(BuildContext context, bool didPop, DateTime? lastBackPressTime, Function(DateTime) setLastBackPressTime) {
    if (didPop) return true;

    final now = DateTime.now();
    if (lastBackPressTime == null ||
        now.difference(lastBackPressTime) > const Duration(seconds: 2)) {
      setLastBackPressTime(now);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Press back again to exit'),
          duration: Duration(seconds: 2),
        ),
      );
      return false;
    }
    return true;
  }
}
