/**
 * Service for handling authentication
 */

class AuthService {
  /**
   * Creates a new authentication service
   * @param {ApiService} apiService - The API service to use
   */
  constructor(apiService) {
    this.apiService = apiService;
  }

  /**
   * Registers a new user
   * @param {string} firstName - The user's first name
   * @param {string} lastName - The user's last name
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<void>} Promise that resolves when registration is complete
   */
  async register(firstName, lastName, email, password) {
    try {
      console.info('Sending registration request to API...');
      console.debug('Registration data:', { firstName, lastName, email });
      console.debug('API URL:', `${this.apiService.baseUrl}/api/auth/registration/`);

      // Start time for performance tracking
      const startTime = new Date();
      console.debug('Registration request started at:', startTime.toISOString());

      // Make registration request to Django dj-rest-auth registration endpoint
      await this.apiService.post('api/auth/registration/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password1: password, // Django AllAuth expects password1 and password2
        password2: password, // Confirmation password
        username: email, // Use email as username
      }, false); // No authentication required for registration

      // End time for performance tracking
      const endTime = new Date();
      const duration = endTime - startTime;
      console.debug('Registration request completed at:', endTime.toISOString());
      console.debug('Registration request duration:', duration, 'ms');

      // Don't try to login after registration - email verification is required
      console.info('Registration successful. Email verification required.');

      // Return void - the caller should show a message about email verification
      return;
    } catch (error) {
      console.error('Registration error:', error);

      // Parse the error message
      let errorMessage = 'Registration failed. Please try again.';

      if (error.message) {
        // Check for common error patterns
        if (error.message.includes('email') &&
            (error.message.includes('already registered') ||
             error.message.includes('already exists'))) {
          errorMessage = 'Email already exists. Please use a different email or try to login.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password is too weak. Use at least 8 characters with numbers and letters.';
        } else if (error.message.includes('verification e-mail')) {
          // This is actually a success case - handle it as such
          console.info('Registration successful. Email verification required.');
          return;
        } else if (error.message.includes('Network error')) {
          errorMessage = `${error.message} Please check your internet connection and try again.`;
        } else {
          // Use the error message from the API
          errorMessage = error.message;
        }
      }

      // Log detailed error information
      console.error('Registration error details:', {
        message: errorMessage,
        originalError: error.message,
        apiUrl: `${this.apiService.baseUrl}/api/auth/registration/`,
        timestamp: new Date().toISOString()
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Logs in a user
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<User>} The logged in user
   */
  async login(email, password) {
    try {
      console.info('Attempting login for email:', email);
      console.debug('Login endpoint:', `${this.apiService.baseUrl}/api/auth/login/`);

      // Start time for performance tracking
      const startTime = new Date();
      console.debug('Login request started at:', startTime.toISOString());

      // Make login request
      const response = await this.apiService.post('api/auth/login/', {
        email,
        password,
        username: email, // Some backends might require username
      }, false); // No authentication required for login

      // End time for performance tracking
      const endTime = new Date();
      const duration = endTime - startTime;
      console.debug('Login request completed at:', endTime.toISOString());
      console.debug('Login request duration:', duration, 'ms');

      console.debug('Login response:', response);

      // Extract token from response - check multiple possible token field names
      let token = null;

      // Check for different token field names used by different backends
      if (response && response.key) {
        token = response.key;
      } else if (response && response.token) {
        token = response.token;
      } else if (response && response.access_token) {
        token = response.access_token;
      } else if (response && response.access) {
        token = response.access;
      }

      // Log all response keys to help diagnose token field name
      console.debug('Response keys:', response ? Object.keys(response) : 'No response');

      if (token) {
        this.apiService.setToken(token);
        console.info('Token saved:', token);
      } else {
        console.warn('No token found in login response');
        console.warn('Response data:', response);
        throw new Error('Authentication failed. Please try again.');
      }

      // Get user data
      const userData = response.user || {};

      // Check if email is verified
      if (userData.email_verified === false) {
        console.warn('Email not verified for user:', email);
        throw new Error('Your email is not verified. Please check your inbox for the verification email or request a new one.');
      }

      // Return user data
      return {
        id: userData.pk || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || email,
        username: userData.username || email,
        profileImageUrl: userData.profile_picture || null,
        theme: userData.theme_preference || 'system',
        emailVerified: userData.email_verified || false
      };
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error cases
      let errorMessage = 'Login failed. Please try again.';

      if (error.message.includes('400') || error.message.includes('401') ||
          error.message.includes('Unable to log in')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('verified')) {
        errorMessage = 'Your email is not verified. Please check your inbox for the verification email or request a new one.';
      } else if (error.message.includes('Network error')) {
        errorMessage = `${error.message} Please check your internet connection and try again.`;
      } else if (error.message.includes('Authentication failed')) {
        // This is our custom error for missing token
        errorMessage = 'Authentication failed. The server response did not contain a valid token.';

        // Log more detailed information to help diagnose the issue
        console.error('Authentication failed details:', {
          endpoint: `${this.apiService.baseUrl}/api/auth/login/`,
          requestData: { email, username: email },
          timestamp: new Date().toISOString()
        });
      } else {
        // Use the error message from the API
        errorMessage = error.message;
      }

      // Log detailed error information
      console.error('Login error details:', {
        message: errorMessage,
        originalError: error.message,
        apiUrl: `${this.apiService.baseUrl}/api/auth/login/`,
        timestamp: new Date().toISOString()
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Resends the verification email
   * @param {string} email - The user's email
   * @returns {Promise<void>}
   */
  async resendVerificationEmail(email) {
    try {
      console.info('Resending verification email to:', email);

      // First try the dj-rest-auth endpoint
      try {
        await this.apiService.post('api/auth/registration/resend-email/', {
          email,
        }, false);
        console.info('Verification email resent successfully using dj-rest-auth endpoint');
        return;
      } catch (error) {
        console.warn('Failed to resend verification email using dj-rest-auth endpoint:', error);
        console.info('Trying custom endpoint...');

        // If that fails, try the custom endpoint
        await this.apiService.post('api/users/resend-verification-email/', {
          email,
        }, false);
        console.info('Verification email resent successfully using custom endpoint');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw new Error('Failed to resend verification email. Please try again later.');
    }
  }

  /**
   * Sends a password reset email
   * @param {string} email - The user's email
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    try {
      console.info('Sending password reset email to:', email);
      console.debug('Using dj-rest-auth password reset endpoint');

      // Make request to send password reset email
      await this.apiService.post('api/auth/password/reset/', {
        email,
      }, false);

      console.info('Password reset email sent successfully');
    } catch (error) {
      console.error('Password reset error:', error);

      // Log more detailed information about the error
      console.error('Password reset error details:', {
        message: error.message,
        email: email,
        timestamp: new Date().toISOString()
      });

      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  /**
   * Resets a user's password
   * @param {string} uid - The user's ID
   * @param {string} token - The reset token
   * @param {string} newPassword - The new password
   * @returns {Promise<void>}
   */
  async resetPassword(uid, token, newPassword) {
    try {
      console.info('Resetting password for user ID:', uid);

      // Make request to reset password
      await this.apiService.post('api/auth/password/reset/confirm/', {
        uid,
        token,
        new_password1: newPassword,
        new_password2: newPassword, // Confirm password
      }, false);

      console.info('Password reset successful');
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw new Error('Failed to reset password. The link may have expired or is invalid.');
    }
  }

  /**
   * Gets the current user's profile
   * @returns {Promise<Object>} The user profile
   */
  async getCurrentUser() {
    try {
      console.info('Getting current user profile');

      // Make request to get user profile
      const response = await this.apiService.get('api/users/profile/', true);

      console.debug('User profile response:', response);

      // Return user data
      return {
        id: response.pk || response.id || '',
        firstName: response.first_name || '',
        lastName: response.last_name || '',
        email: response.email || '',
        username: response.username || response.email || '',
        profileImageUrl: response.profile_picture || null,
        theme: response.theme_preference || 'system',
        emailVerified: response.email_verified || false
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile. Please try again later.');
    }
  }

  /**
   * Updates the user's profile
   * @param {Object} user - The user object with updated fields
   * @returns {Promise<Object>} The updated user profile
   */
  async updateProfile(user) {
    try {
      console.info('Updating user profile:', user.firstName, user.lastName);

      // Create a map with ONLY the fields we want to update
      // Explicitly exclude username and email to avoid validation errors
      const userData = {
        first_name: user.firstName,
        last_name: user.lastName,
        theme_preference: user.theme,
        // Don't include email or username fields
      };

      console.debug('User data being sent to backend:', userData);

      // First try the dj-rest-auth endpoint with PATCH (partial update)
      try {
        const response = await this.apiService.patch('api/auth/user/', userData);

        console.info('Profile updated successfully with dj-rest-auth endpoint');
        console.debug('Response from server:', response);

        // Return user data
        return {
          id: response.pk || response.id || user.id,
          firstName: response.first_name || user.firstName,
          lastName: response.last_name || user.lastName,
          email: response.email || user.email,
          username: response.username || user.email,
          profileImageUrl: response.profile_picture || user.profileImageUrl,
          theme: response.theme_preference || user.theme,
          emailVerified: response.email_verified !== undefined ? response.email_verified : user.emailVerified
        };
      } catch (error) {
        // If that fails, try the custom endpoint with PATCH
        console.warn('Failed to update profile with dj-rest-auth endpoint:', error);
        console.info('Trying custom endpoint...');

        const response = await this.apiService.patch('api/users/profile/', userData);

        console.info('Profile updated successfully with custom endpoint');
        console.debug('Response from server:', response);

        // Return user data
        return {
          id: response.pk || response.id || user.id,
          firstName: response.first_name || user.firstName,
          lastName: response.last_name || user.lastName,
          email: response.email || user.email,
          username: response.username || user.email,
          profileImageUrl: response.profile_picture || user.profileImageUrl,
          theme: response.theme_preference || user.theme,
          emailVerified: response.email_verified !== undefined ? response.email_verified : user.emailVerified
        };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile. Please try again later.');
    }
  }

  /**
   * Updates the user's theme preference
   * @param {Object} user - The user object
   * @param {string} theme - The new theme preference
   * @returns {Promise<Object>} The updated user profile
   */
  async updateThemePreference(user, theme) {
    try {
      console.info('Updating theme preference to:', theme);

      // Try the custom endpoint first with PATCH
      try {
        const response = await this.apiService.patch('api/users/profile/theme/', {
          theme_preference: theme,
        });

        console.info('Theme preference updated successfully');
        console.debug('Response from server:', response);

        // Return user data
        return {
          id: response.pk || response.id || user.id,
          firstName: response.first_name || user.firstName,
          lastName: response.last_name || user.lastName,
          email: response.email || user.email,
          username: response.username || user.email,
          profileImageUrl: response.profile_picture || user.profileImageUrl,
          theme: response.theme_preference || theme,
          emailVerified: response.email_verified !== undefined ? response.email_verified : user.emailVerified
        };
      } catch (error) {
        // If that fails, try updating the whole profile with PATCH
        console.warn('Failed to update theme with custom endpoint:', error);
        console.info('Trying to update full profile...');

        // Create a map with ONLY the fields we want to update
        const userData = {
          theme_preference: theme,
        };

        console.debug('User data being sent to backend:', userData);

        const response = await this.apiService.patch('api/users/profile/', userData);

        console.info('Theme preference updated successfully with full profile update');
        console.debug('Response from server:', response);

        // Return user data
        return {
          id: response.pk || response.id || user.id,
          firstName: response.first_name || user.firstName,
          lastName: response.last_name || user.lastName,
          email: response.email || user.email,
          username: response.username || user.email,
          profileImageUrl: response.profile_picture || user.profileImageUrl,
          theme: response.theme_preference || theme,
          emailVerified: response.email_verified !== undefined ? response.email_verified : user.emailVerified
        };
      }
    } catch (error) {
      console.error('Error updating theme preference:', error);
      throw new Error('Failed to update theme preference. Please try again later.');
    }
  }

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    // First, check if we have a token
    const token = this.apiService.getToken();

    if (!token) {
      console.info('No token found, skipping server logout request');
      return;
    }

    try {
      // Make logout request, but don't wait for it to complete
      // This way, even if it fails, we still clear the local token
      this.apiService.post('api/auth/logout/', {})
        .then(() => {
          console.info('Server logout successful');
        })
        .catch((error) => {
          // Just log the error, but don't prevent the local logout
          console.warn('Server logout failed, but proceeding with local logout:', error.message);
        });
    } catch (error) {
      console.error('Error initiating logout request:', error);
    } finally {
      // Always clear the local token
      console.info('Clearing local authentication token');
      this.apiService.clearToken();
    }
  }
}

export default AuthService;
