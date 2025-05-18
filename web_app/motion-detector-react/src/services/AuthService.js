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
   * Logs out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Make logout request
      await this.apiService.post('api/auth/logout/', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear the token regardless of whether the request succeeded
      this.apiService.clearToken();
    }
  }
}

export default AuthService;
