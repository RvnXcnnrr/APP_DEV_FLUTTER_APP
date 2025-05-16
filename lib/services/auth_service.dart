
import 'dart:io';
import 'package:appdev_md/models/user.dart';
import 'package:appdev_md/services/api_service.dart';
import 'package:appdev_md/utils/logger.dart';

/// Service for handling authentication
class AuthService {
  /// API service for making requests
  final ApiService _apiService;

  /// Creates a new authentication service
  AuthService({required ApiService apiService}) : _apiService = apiService;

  /// Logs in a user with email and password
  Future<User> login(String email, String password) async {
    try {
      Logger.info('Attempting login for email: $email');

      final response = await _apiService.post(
        'api/auth/login/',
        {
          'email': email,
          'password': password,
          'username': email, // Some backends might require username
        },
        requiresAuth: false,
      );

      Logger.debug('Login response: $response');

      // Parse the response to get user data
      Map<String, dynamic> userData;
      if (response is Map && response.containsKey('user')) {
        userData = response['user'];
      } else {
        userData = response;
      }

      Logger.debug('User data from response: $userData');

      // Save the token - handle different token formats
      String? token;
      if (response is Map) {
        // Check for different token formats
        if (response.containsKey('token')) {
          token = response['token'];
        } else if (response.containsKey('access_token')) {
          token = response['access_token'];
        } else if (response.containsKey('key')) {
          token = response['key'];
        } else if (response.containsKey('access')) {
          // DRF JWT format
          token = response['access'];
        }

        if (token == null || token.isEmpty) {
          Logger.warning('No token found in standard fields, checking cookies or headers');

          // For debugging purposes, log all keys in the response
          Logger.debug('Response keys: ${response.keys.join(', ')}');

          // If we still don't have a token, we'll continue anyway since we have the user data
          // This allows login to work even if token extraction fails
          if (token == null || token.isEmpty) {
            Logger.warning('Proceeding without token - user may need to log in again');
          }
        }

        // Only store the token if we found one
        if (token != null && token.isNotEmpty) {
          Logger.debug('Found token in response: ${token.substring(0, token.length > 10 ? 10 : token.length)}...');
          await _apiService.setToken(token);
        }
      } else {
        Logger.error('Response is not a Map: $response');
        throw ApiException(
          statusCode: 500,
          message: 'Invalid response format',
        );
      }

      // Create user object from response
      final user = User.fromJson(userData);

      // Ensure username is not empty
      String username = user.username;
      User userWithValidUsername = user;

      if (username.isEmpty) {
        username = user.email;
        Logger.warning('Username is empty after login, using email as username: $username');
        userWithValidUsername = user.copyWith(username: username);
      }

      Logger.debug('Created user object: $userWithValidUsername');
      Logger.debug('Email verified status: ${userWithValidUsername.emailVerified}');

      // Check if email is verified
      if (!userWithValidUsername.emailVerified) {
        Logger.warning('Email not verified for user: ${userWithValidUsername.email}');

        // Try to get user details to double-check verification status
        try {
          final userDetailsResponse = await _apiService.get('api/users/profile/');
          Logger.debug('User details response: $userDetailsResponse');

          if (userDetailsResponse is Map && userDetailsResponse.containsKey('email_verified')) {
            bool emailVerified = userDetailsResponse['email_verified'] == true;

            if (emailVerified) {
              // Update the user object with the correct verification status
              return userWithValidUsername.copyWith(emailVerified: true);
            }
          }
        } catch (detailsError) {
          Logger.error('Error getting user details', detailsError);
        }

        // If we get here, the email is definitely not verified
        throw ApiException(
          statusCode: 403,
          message: 'Email not verified. Please check your email for verification link.',
        );
      }

      Logger.info('Email verified for user: ${userWithValidUsername.email}');

      // Return the user with valid username
      return userWithValidUsername;
    } catch (e) {
      // Log error
      Logger.error('Login error', e);
      rethrow;
    }
  }

  /// Registers a new user
  Future<void> register(String firstName, String lastName, String email, String password) async {
    try {
      Logger.info('Sending registration request to API...');
      Logger.debug('API URL: ${_apiService.baseUrl}/api/auth/registration/');
      Logger.debug('Registration data: firstName=$firstName, lastName=$lastName, email=$email');

      // Use the correct registration endpoint
      final response = await _apiService.post(
        'api/auth/registration/',  // Django dj-rest-auth registration endpoint
        {
          'first_name': firstName,
          'last_name': lastName,
          'email': email,
          'password1': password, // Django AllAuth expects password1 and password2
          'password2': password, // Confirmation password
          'username': email,     // Use email as username
        },
        requiresAuth: false,
      );

      Logger.debug('Registration API response: $response');

      // Check if the response contains a user or detail field
      if (response is Map) {
        if (response.containsKey('user')) {
          Logger.info('User created successfully: ${response['user']}');
        } else if (response.containsKey('detail')) {
          Logger.info('Registration detail: ${response['detail']}');
        }
      }

      // Return successfully even if there's no response data
      return;
    } catch (e) {
      Logger.warning('Registration error in auth_service: $e');

      // Add more detailed error logging
      if (e is ApiException) {
        Logger.debug('API Exception status code: ${e.statusCode}');
        Logger.debug('API Exception message: ${e.message}');

        // Check for specific error messages
        if (e.message.contains('verification e-mail')) {
          // This is actually a success case - the user was created but needs to verify email
          Logger.info('User created successfully, verification email sent');
          return; // Return without throwing an error
        }
      }

      rethrow;
    }
  }

  /// Sends a password reset email
  Future<void> forgotPassword(String email) async {
    try {
      Logger.info('Sending password reset email to: $email');
      Logger.debug('Using correct dj-rest-auth password reset endpoint');

      await _apiService.post(
        'api/auth/password/reset/',
        {
          'email': email,
        },
        requiresAuth: false,
      );

      Logger.info('Password reset email sent successfully');
    } catch (e) {
      Logger.error('Error sending password reset email', e);
      // Rethrow the error so it can be handled by the caller
      rethrow;
    }
  }

  /// Confirms password reset with new password
  Future<void> confirmPasswordReset(String uid, String token, String password1, String password2) async {
    try {
      Logger.info('Confirming password reset');

      await _apiService.post(
        'api/auth/password/reset/confirm/',
        {
          'uid': uid,
          'token': token,
          'new_password1': password1,
          'new_password2': password2,
        },
        requiresAuth: false,
      );

      Logger.info('Password reset confirmed successfully');
    } catch (e) {
      Logger.error('Error confirming password reset', e);
      rethrow;
    }
  }

  /// Resends the email verification link
  Future<void> resendVerificationEmail(String email) async {
    try {
      Logger.info('Resending verification email to: $email');

      await _apiService.post(
        'api/users/resend-verification-email/',
        {
          'email': email,
        },
        requiresAuth: false,
      );

      Logger.info('Verification email resent successfully');
    } catch (e) {
      Logger.error('Error resending verification email', e);
      rethrow;
    }
  }

  /// Logs out the current user
  Future<void> logout() async {
    try {
      await _apiService.post('api/auth/logout/', {});
    } catch (e) {
      // Ignore errors during logout
    } finally {
      // Always clear the token
      await _apiService.clearToken();
    }
  }

  /// Gets the current user
  Future<User?> getCurrentUser() async {
    try {
      final token = await _apiService.getToken();
      if (token == null) {
        return null;
      }

      final response = await _apiService.get('api/auth/user/');
      return User.fromJson(response);
    } catch (e) {
      // Return null if there's an error
      return null;
    }
  }

  /// Updates the user's profile
  Future<User> updateProfile(User user) async {
    try {
      Logger.info('Updating user profile: ${user.firstName} ${user.lastName}');

      // Create a map with ONLY the fields we want to update
      // Explicitly exclude username to avoid validation errors
      final userData = {
        'first_name': user.firstName,
        'last_name': user.lastName,
        'theme_preference': user.theme,
        // Removed username field completely
      };

      Logger.debug('User data being sent to backend: $userData');

      // First try the dj-rest-auth endpoint with PATCH (partial update)
      try {
        final response = await _apiService.patch(
          'api/auth/user/',
          userData,
        );

        Logger.info('Profile updated successfully with dj-rest-auth endpoint');
        Logger.debug('Response from server: $response');
        return User.fromJson(response);
      } catch (e) {
        // If that fails, try the custom endpoint with PATCH
        Logger.warning('Failed to update profile with dj-rest-auth endpoint: $e');
        Logger.info('Trying custom endpoint...');

        final response = await _apiService.patch(
          'api/users/profile/',
          userData,
        );

        Logger.info('Profile updated successfully with custom endpoint');
        Logger.debug('Response from server: $response');
        return User.fromJson(response);
      }
    } catch (e) {
      Logger.error('Error updating profile', e);
      // Rethrow the error so it can be handled by the caller
      rethrow;
    }
  }

  /// Updates the user's password
  Future<void> updatePassword(String currentPassword, String newPassword) async {
    await _apiService.post(
      'api/auth/change-password/',
      {
        'current_password': currentPassword,
        'new_password': newPassword,
      },
    );
  }

  /// Updates the user's theme preference
  Future<User> updateThemePreference(User user, String theme) async {
    try {
      Logger.info('Updating theme preference to: $theme');

      // Try the custom endpoint first with PATCH
      try {
        final response = await _apiService.patch(
          'api/users/profile/theme/',
          {
            'theme_preference': theme,
            // Removed username field completely
          },
        );

        Logger.info('Theme preference updated successfully');
        Logger.debug('Response from server: $response');
        return User.fromJson(response);
      } catch (e) {
        // If that fails, try updating the whole profile with PATCH
        Logger.warning('Failed to update theme with custom endpoint: $e');
        Logger.info('Trying to update full profile...');

        // Create a map with ONLY the fields we want to update
        final userData = {
          'theme_preference': theme,
          // Removed username field completely
        };

        Logger.debug('User data being sent to backend: $userData');

        final response = await _apiService.patch(
          'api/users/profile/',
          userData,
        );

        Logger.info('Theme preference updated successfully with full profile update');
        Logger.debug('Response from server: $response');
        return User.fromJson(response);
      }
    } catch (e) {
      Logger.error('Error updating theme preference', e);
      // Rethrow the error so it can be handled by the caller
      rethrow;
    }
  }

  /// Uploads a profile picture
  Future<User> uploadProfilePicture(User user, File image) async {
    try {
      Logger.info('Uploading profile picture for user: ${user.email}');

      // First try the dj-rest-auth endpoint
      try {
        // No additional fields needed for profile picture upload
        final response = await _apiService.uploadFile(
          'api/auth/profile-picture/',
          image,
          'image',
          // Use POST for dj-rest-auth endpoint (default)
        );

        Logger.info('Profile picture uploaded successfully');
        return User.fromJson(response);
      } catch (e) {
        // If that fails, try the custom endpoint
        Logger.warning('Failed to upload profile picture with dj-rest-auth endpoint: $e');
        Logger.info('Trying custom endpoint...');

        // For the custom endpoint, use PUT method since it's an UpdateAPIView
        final response = await _apiService.uploadFile(
          'api/users/profile/picture/',
          image,
          'profile_picture',
          method: 'PUT', // Use PUT for UpdateAPIView
        );

        Logger.info('Profile picture uploaded successfully with custom endpoint');
        return User.fromJson(response);
      }
    } catch (e) {
      Logger.error('Error uploading profile picture', e);
      // Rethrow the error so it can be handled by the caller
      rethrow;
    }
  }
}

