import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/providers/user_provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:appdev_md/main.dart'; // Import to access global authService
import 'package:appdev_md/models/user.dart'; // Import User model

/// A page that displays and allows editing of user profile information
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  final _formKey = GlobalKey<FormState>();
  bool _isEditing = false;
  bool _isLoading = false;
  File? _imageFile;

  @override
  void initState() {
    super.initState();
    final user = Provider.of<UserProvider>(context, listen: false).user;
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.save : Icons.edit),
            onPressed: _isLoading ? null : () {
              if (_isEditing) {
                _saveProfile(userProvider);
              } else {
                setState(() {
                  _isEditing = true;
                });
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: _isEditing ? () => _selectProfileImage(context) : null,
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 60,
                            backgroundColor: Theme.of(context).colorScheme.secondary,
                            backgroundImage: _imageFile != null
                                ? FileImage(_imageFile!)
                                : (user?.profileImageUrl != null
                                    ? NetworkImage(user!.profileImageUrl!)
                                    : null) as ImageProvider?,
                            child: user?.profileImageUrl == null && _imageFile == null
                                ? Text(
                                    user == null || user.firstName.isEmpty || user.lastName.isEmpty
                                        ? '?'
                                        : '${user.firstName[0]}${user.lastName[0]}',
                                    style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
                                  )
                                : null,
                          ),
                          if (_isEditing)
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).colorScheme.primary,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _firstNameController,
                      decoration: const InputDecoration(
                        labelText: 'First Name',
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your first name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _lastNameController,
                      decoration: const InputDecoration(
                        labelText: 'Last Name',
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your last name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),
                    // Theme selection
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Theme',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 16),
                            RadioListTile<ThemeMode>(
                              title: const Text('System'),
                              value: ThemeMode.system,
                              groupValue: userProvider.themeMode,
                              onChanged: _isEditing || !_isEditing ? (value) {
                                if (value != null) {
                                  userProvider.setThemeMode(value);

                                  // If we're in edit mode, also update the user's theme preference
                                  if (_isEditing && userProvider.user != null) {
                                    userProvider.updateUser(
                                      theme: 'system',
                                    );

                                    // Also update the theme on the server
                                    _updateThemeOnServer(userProvider.user!, 'system');
                                  }
                                }
                              } : null,
                            ),
                            RadioListTile<ThemeMode>(
                              title: const Text('Light'),
                              value: ThemeMode.light,
                              groupValue: userProvider.themeMode,
                              onChanged: _isEditing || !_isEditing ? (value) {
                                if (value != null) {
                                  userProvider.setThemeMode(value);

                                  // If we're in edit mode, also update the user's theme preference
                                  if (_isEditing && userProvider.user != null) {
                                    userProvider.updateUser(
                                      theme: 'light',
                                    );

                                    // Also update the theme on the server
                                    _updateThemeOnServer(userProvider.user!, 'light');
                                  }
                                }
                              } : null,
                            ),
                            RadioListTile<ThemeMode>(
                              title: const Text('Dark'),
                              value: ThemeMode.dark,
                              groupValue: userProvider.themeMode,
                              onChanged: _isEditing || !_isEditing ? (value) {
                                if (value != null) {
                                  userProvider.setThemeMode(value);

                                  // If we're in edit mode, also update the user's theme preference
                                  if (_isEditing && userProvider.user != null) {
                                    userProvider.updateUser(
                                      theme: 'dark',
                                    );

                                    // Also update the theme on the server
                                    _updateThemeOnServer(userProvider.user!, 'dark');
                                  }
                                }
                              } : null,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  /// Saves the profile
  Future<void> _saveProfile(UserProvider userProvider) async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      try {
        final user = userProvider.user;

        if (user != null) {
          // Use the global authService from main.dart
          // Import it at the top of the file

          // First update the user profile (name, email, and theme)
          final updatedUser = user.copyWith(
            firstName: _firstNameController.text,
            lastName: _lastNameController.text,
            email: _emailController.text,
            // Keep the current theme preference
            theme: user.theme,
          );

          // Call the API to update the profile
          await authService.updateProfile(updatedUser);

          // Update user in provider
          userProvider.updateUser(
            firstName: _firstNameController.text,
            lastName: _lastNameController.text,
            email: _emailController.text,
          );

          // Upload profile picture if selected
          if (_imageFile != null) {
            try {
              // Upload the profile picture
              final userWithPicture = await authService.uploadProfilePicture(updatedUser, _imageFile!);

              // Update the user in the provider with the new profile picture URL
              if (userWithPicture.profileImageUrl != null) {
                userProvider.updateUser(
                  profileImageUrl: userWithPicture.profileImageUrl,
                );
              }
            } catch (e) {
              // Show error for profile picture upload
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error uploading profile picture: $e')),
                );
              }
            }
          }

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile updated successfully')),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error updating profile: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isEditing = false;
          });
        }
      }
    }
  }

  /// Updates the theme preference on the server
  Future<void> _updateThemeOnServer(User user, String theme) async {
    try {
      // Call the API to update the theme
      await authService.updateThemePreference(user, theme);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating theme: $e')),
        );
      }
    }
  }

  /// Shows a dialog to select a profile image
  void _selectProfileImage(BuildContext context) async {
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
                  setState(() {
                    _imageFile = File(pickedFile.path);
                  });
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
                  setState(() {
                    _imageFile = File(pickedFile.path);
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
