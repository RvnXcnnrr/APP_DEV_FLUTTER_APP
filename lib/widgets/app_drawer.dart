import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:appdev_md/providers/motion_event_provider.dart';
import 'package:appdev_md/pages/profile_page.dart';
import 'package:appdev_md/pages/settings_page.dart';
import 'package:appdev_md/utils/navigation_helper.dart';
import 'package:appdev_md/utils/logger.dart';
import 'package:appdev_md/services/api_service.dart';
import 'package:appdev_md/services/auth_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:appdev_md/main.dart';

/// A drawer widget that displays user information and navigation options
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  /// Performs the logout operation
  void _performLogout(BuildContext context, UserProvider userProvider) {
    // Clear the motion events
    final motionEventProvider = Provider.of<MotionEventProvider>(context, listen: false);
    motionEventProvider.clearEvents();

    // Clear the user data to ensure UI updates
    userProvider.clearUser();

    // Navigate to login page
    NavigationHelper.navigateAndReplaceNamed(context, '/login');

    // Then perform the actual logout in the background
    _logoutFromServer();
  }

  /// Logs out from the server
  Future<void> _logoutFromServer() async {
    try {
      // Use the global API service from main.dart
      // This ensures we're using the same instance that has the correct token
      await authService.logout();

      Logger.info('Successfully logged out from server');
    } catch (e) {
      // Log the error but continue with the logout process
      Logger.error('Error during server logout: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.user;

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: Text(user?.fullName ?? 'Guest User'),
            accountEmail: Text(user?.email ?? 'No email'),
            currentAccountPicture: GestureDetector(
              onTap: () => _selectProfileImage(context),
              child: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.secondary,
                backgroundImage: user?.profileImageUrl != null
                    ? NetworkImage(user!.profileImageUrl!)
                    : null,
                child: user?.profileImageUrl == null
                    ? Text(
                        user == null || user.firstName.isEmpty || user.lastName.isEmpty
                            ? '?'
                            : '${user.firstName[0]}${user.lastName[0]}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      )
                    : null,
              ),
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            onTap: () {
              Navigator.pop(context); // Close the drawer
              // If we're not already on the dashboard, navigate to it
              if (!(ModalRoute.of(context)?.settings.name == '/dashboard')) {
                NavigationHelper.navigateToNamed(context, '/dashboard');
              }
            },
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Profile'),
            onTap: () {
              Navigator.pop(context); // Close the drawer
              NavigationHelper.navigateTo(
                context,
                const ProfilePage(),
                routeName: '/profile'
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings'),
            onTap: () {
              Navigator.pop(context); // Close the drawer
              NavigationHelper.navigateTo(
                context,
                const SettingsPage(),
                routeName: '/settings'
              );
            },
          ),
          const Divider(),
          SwitchListTile(
            title: const Text('Dark Mode'),
            secondary: Icon(
              userProvider.themeMode == ThemeMode.dark ? Icons.dark_mode : Icons.light_mode,
            ),
            value: userProvider.themeMode == ThemeMode.dark,
            onChanged: (value) {
              userProvider.setThemeMode(value ? ThemeMode.dark : ThemeMode.light);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: () {
              Navigator.pop(context); // Close the drawer
              _showLogoutConfirmation(context);
            },
          ),
        ],
      ),
    );
  }

  /// Shows a dialog to confirm logout
  void _showLogoutConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Get the user provider
              final userProvider = Provider.of<UserProvider>(context, listen: false);

              // Close the dialog first
              Navigator.pop(context);

              // Then perform the logout
              _performLogout(context, userProvider);
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  /// Shows a dialog to select a profile image
  void _selectProfileImage(BuildContext context) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Take a photo'),
              onTap: () {
                Navigator.pop(context);
                _pickAndUploadImage(context, userProvider, ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickAndUploadImage(context, userProvider, ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Picks and uploads a profile image
  Future<void> _pickAndUploadImage(BuildContext context, UserProvider userProvider, ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: source);

      if (pickedFile != null) {
        // Create API service
        final apiService = ApiService(baseUrl: 'http://localhost:8000');
        final authService = AuthService(apiService: apiService);

        // Get the current user
        final user = userProvider.user;

        if (user != null) {
          // Upload the image
          try {
            final file = File(pickedFile.path);
            await authService.uploadProfilePicture(user, file);

            // Update the user with a placeholder URL for now
            userProvider.updateUser(
              profileImageUrl: 'https://example.com/profile.jpg',
            );
          } catch (e) {
            // If upload fails, still update with a placeholder
            userProvider.updateUser(
              profileImageUrl: 'https://example.com/profile.jpg',
            );
          }
        }
      }
    } catch (e) {
      // Ignore errors during image picking
    }
  }
}
