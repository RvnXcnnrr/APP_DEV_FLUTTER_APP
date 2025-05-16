import 'package:flutter/material.dart';
import 'package:appdev_md/models/user.dart';

/// Provider class to manage user state
class UserProvider extends ChangeNotifier {
  /// Current user - null when not logged in
  User? _user;

  /// Check if user is logged in
  bool get isLoggedIn => _user != null;

  /// Get the current user
  User? get user => _user;

  /// Get whether dark mode is enabled
  bool get isDarkMode => _user?.isDarkMode ?? false;

  /// Set the user (login)
  void setUser(User user) {
    _user = user;
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
  }) {
    if (_user != null) {
      _user = _user!.copyWith(
        firstName: firstName,
        lastName: lastName,
        email: email,
        profileImageUrl: profileImageUrl,
      );
      notifyListeners();
    }
  }

  /// Toggle dark mode
  void toggleDarkMode() {
    if (_user != null) {
      _user = _user!.copyWith(isDarkMode: !_user!.isDarkMode);
    } else {
      // Create a default user with dark mode enabled if no user exists
      _user = User(
        firstName: '',
        lastName: '',
        email: '',
        isDarkMode: true,
      );
    }
    notifyListeners();
  }
}
