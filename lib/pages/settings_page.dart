import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/providers/user_provider.dart';


/// A page that displays app settings
class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Appearance'),
            subtitle: const Text('Customize the app appearance'),
            leading: const Icon(Icons.palette),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navigate to appearance settings
              _showAppearanceSettings(context);
            },
          ),
          ListTile(
            title: const Text('Theme'),
            subtitle: Text('Current: ${_getThemeModeName(userProvider.themeMode)}'),
            leading: Icon(
              userProvider.themeMode == ThemeMode.dark
                  ? Icons.dark_mode
                  : userProvider.themeMode == ThemeMode.light
                      ? Icons.light_mode
                      : Icons.brightness_auto,
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              _showThemeSettings(context, userProvider);
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('Notifications'),
            subtitle: const Text('Configure notification settings'),
            leading: const Icon(Icons.notifications),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navigate to notification settings
              _showNotificationSettings(context);
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('Privacy'),
            subtitle: const Text('Manage your privacy settings'),
            leading: const Icon(Icons.privacy_tip),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navigate to privacy settings
              _showPrivacySettings(context);
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('About'),
            subtitle: const Text('View app information'),
            leading: const Icon(Icons.info),
            onTap: () {
              // Show about dialog
              _showAboutDialog(context);
            },
          ),
        ],
      ),
    );
  }

  /// Shows appearance settings dialog
  void _showAppearanceSettings(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Appearance Settings'),
        content: const Text('Appearance settings will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  /// Shows notification settings dialog
  void _showNotificationSettings(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Notification Settings'),
        content: const Text('Notification settings will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  /// Shows privacy settings dialog
  void _showPrivacySettings(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Privacy Settings'),
        content: const Text('Privacy settings will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  /// Shows theme settings dialog
  void _showThemeSettings(BuildContext context, UserProvider userProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Theme Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: const Text('System'),
              value: ThemeMode.system,
              groupValue: userProvider.themeMode,
              onChanged: (value) {
                if (value != null) {
                  userProvider.setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Light'),
              value: ThemeMode.light,
              groupValue: userProvider.themeMode,
              onChanged: (value) {
                if (value != null) {
                  userProvider.setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Dark'),
              value: ThemeMode.dark,
              groupValue: userProvider.themeMode,
              onChanged: (value) {
                if (value != null) {
                  userProvider.setThemeMode(value);
                  Navigator.pop(context);
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  /// Gets the name of a theme mode
  String _getThemeModeName(ThemeMode themeMode) {
    switch (themeMode) {
      case ThemeMode.system:
        return 'System';
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
    }
  }

  /// Shows about dialog
  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'Motion Detector',
      applicationVersion: '1.0.0',
      applicationIcon: const Icon(Icons.motion_photos_on, size: 48),
      applicationLegalese: '© 2023 Motion Detector',
      children: [
        const SizedBox(height: 16),
        const Text(
          'Motion Detector is an application that detects motion and displays the events in a calendar view.',
        ),
      ],
    );
  }
}
