/**
 * Service for handling authentication
 */
import User from '../models/User';

class AuthService {
  /**
   * Creates a new authentication service
   * @param {ApiService} apiService - The API service to use
   */
  constructor(apiService) {
    this.apiService = apiService;
  } AC

  /**
   * Logs in a user
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<User>} The logged in user
   */
  async login(email, password) {
    try {
      S
      // Make login request
      const response = await this.apiService.post('api/auth/login/', {
        email,
        password,
      }, false);

      // Store the token
      this.apiService.setToken(response.access_token || response.token);

      // Get the user
      return await this.getCurrentUser();
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  }

  /**
   * Registers a new user
   * @param {string} firstName - The user's first name
   * @param {string} lastName - The user's last name
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<User>} The registered user
   */
  async register(firstName, lastName, email, password) {
    try {
      // Make registration request
      await this.apiService.post('api/auth/registration/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password1: password,
        password2: password, // Confirm password
      }, false);

      // Login with the new credentials
      return await this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
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

  /**
   * Gets the current user
   * @returns {Promise<User>} The current user
   */
  async getCurrentUser() {
    try {
      // Make request to get current user
      const userData = await this.apiService.get('api/auth/user/');

      // Create user object
      return new User(
        userData.first_name || '',
        userData.last_name || '',
        userData.email || '',
        userData.profile_picture || null,
        userData.theme_preference === 'dark'
      );
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get current user');
    }
  }

  /**
   * Sends a password reset email
   * @param {string} email - The user's email
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    try {
      // Make request to send password reset email
      await this.apiService.post('api/auth/password/reset/', {
        email,
      }, false);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email');
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
      // Make request to reset password
      await this.apiService.post('api/auth/password/reset/confirm/', {
        uid,
        token,
        new_password1: newPassword,
        new_password2: newPassword, // Confirm password
      }, false);
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Updates a user's profile
   * @param {User} user - The user to update
   * @param {Object} updates - The updates to apply
   * @returns {Promise<User>} The updated user
   */
  async updateProfile(user, updates) {
    try {
      // Make request to update profile - only include first name and last name
      const userData = await this.apiService.patch('api/auth/user/', {
        first_name: updates.firstName !== undefined ? updates.firstName : user.firstName,
        last_name: updates.lastName !== undefined ? updates.lastName : user.lastName,
        // Don't include email in profile updates
      });

      // Create updated user object
      return new User(
        userData.first_name || '',
        userData.last_name || '',
        userData.email || '',
        userData.profile_picture || user.profileImageUrl,
        user.isDarkMode
      );
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Uploads a profile picture
   * @param {User} user - The user to update
   * @param {File} file - The profile picture file
   * @returns {Promise<string>} The URL of the uploaded image
   */
  async uploadProfilePicture(user, file) {
    try {
      // Upload the file
      const response = await this.apiService.uploadFile(
        'api/auth/user/profile-picture/',
        file,
        'profile_picture'
      );

      return response.profile_picture || '';
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw new Error('Failed to upload profile picture');
    }
  }

  /**
   * Updates a user's theme preference
   * @param {User} user - The user to update
   * @param {boolean} isDarkMode - Whether dark mode is enabled
   * @returns {Promise<User>} The updated user
   */
  async updateThemePreference(user, isDarkMode) {
    try {
      // Make request to update theme preference
      await this.apiService.patch('api/auth/user/', {
        theme_preference: isDarkMode ? 'dark' : 'light',
      });

      // Return updated user
      return user.copyWith({ isDarkMode });
    } catch (error) {
      console.error('Theme preference update error:', error);
      // Return the user with the updated theme preference anyway
      // This allows the UI to update even if the API call fails
      return user.copyWith({ isDarkMode });
    }
  }
}

export default AuthService;
