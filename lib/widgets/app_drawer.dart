import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:appdev_md/pages/profile_page.dart';
import 'package:appdev_md/pages/settings_page.dart';

import 'package:appdev_md/utils/navigation_helper.dart';
import 'package:image_picker/image_picker.dart';

/// A drawer widget that displays user information and navigation options
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

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
              userProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
            ),
            value: userProvider.isDarkMode,
            onChanged: (value) {
              userProvider.toggleDarkMode();
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
              // Clear the user data
              Provider.of<UserProvider>(context, listen: false).clearUser();
              Navigator.pop(context); // Close the dialog
              // Navigate to login page
              NavigationHelper.navigateAndReplaceNamed(context, '/login');
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
              onTap: () async {
                Navigator.pop(context);
                final picker = ImagePicker();
                final pickedFile = await picker.pickImage(source: ImageSource.camera);
                if (pickedFile != null) {
                  // In a real app, you would upload this file to a server
                  // and get back a URL. For now, we'll just use a placeholder.
                  userProvider.updateUser(
                    profileImageUrl: 'https://example.com/profile.jpg',
                  );
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from gallery'),
              onTap: () async {
                Navigator.pop(context);
                final picker = ImagePicker();
                final pickedFile = await picker.pickImage(source: ImageSource.gallery);
                if (pickedFile != null) {
                  // In a real app, you would upload this file to a server
                  // and get back a URL. For now, we'll just use a placeholder.
                  userProvider.updateUser(
                    profileImageUrl: 'https://example.com/profile.jpg',
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
