import 'package:flutter/material.dart';
import 'package:appdev_md/models/user.dart';
import 'package:appdev_md/services/theme_service.dart';

/// Provider class to manage user state
class UserProvider extends ChangeNotifier {
  /// Current user - null when not logged in
  User? _user;

  /// Theme service for managing theme preferences
  final ThemeService _themeService = ThemeService();

  /// Current theme mode
  ThemeMode _themeMode = ThemeMode.system;

  /// Check if user is logged in
  bool get isLoggedIn => _user != null;

  /// Get the current user
  User? get user => _user;

  /// Get the current theme mode
  ThemeMode get themeMode => _themeMode;

  /// Initialize the provider
  Future<void> initialize() async {
    _themeMode = await _themeService.getThemeMode();
    notifyListeners();
  }

  /// Set the user (login)
  void setUser(User user) {
    _user = user;

    // Set theme mode based on user preference
    if (user.theme != 'system') {
      _themeMode = _themeService.getThemeModeFromString(user.theme);
    }

    notifyListeners();
  }

  /// Clear the user (logout)
  void clearUser() {
    _user = null;
    notifyListeners();
  }

  /// Update the user's profile
  void updateUser({
    String? firstName,
    String? lastName,
    String? email,
    String? profileImageUrl,
    String? theme,
  }) {
    if (_user != null) {
      _user = _user!.copyWith(
        firstName: firstName,
        lastName: lastName,
        email: email,
        profileImageUrl: profileImageUrl,
        theme: theme,
      );

      // Update theme mode if theme was changed
      if (theme != null) {
        _themeMode = _themeService.getThemeModeFromString(theme);
        _themeService.setThemeMode(_themeMode);
      }

      notifyListeners();
    }
  }

  /// Set the theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;

    // Update user theme preference if logged in
    if (_user != null) {
      final themeString = _themeService.getThemeString(mode);
      _user = _user!.copyWith(theme: themeString);
    }

    // Save theme preference
    await _themeService.setThemeMode(mode);

    notifyListeners();
  }
}
