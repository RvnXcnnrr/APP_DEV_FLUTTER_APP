/**
 * User model class
 */
class User {
  /**
   * Creates a new user
   * @param {string} id - Unique identifier for the user
   * @param {string} firstName - First name of the user
   * @param {string} lastName - Last name of the user
   * @param {string} email - Email address of the user
   * @param {string} username - Username of the user (required by Django)
   * @param {string} profileImageUrl - URL to the user's profile image
   * @param {string} theme - User's preferred theme (light, dark, or system)
   * @param {boolean} emailVerified - Whether the user's email is verified
   */
  constructor(
    id = '',
    firstName = '',
    lastName = '',
    email = '',
    username = '',
    profileImageUrl = null,
    theme = 'system',
    emailVerified = false
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.username = username || email; // Default username to email if not provided
    this.profileImageUrl = profileImageUrl;
    this.theme = theme;
    this.emailVerified = emailVerified;
  }

  /**
   * Creates a copy of the user with updated properties
   * @param {Object} props - Properties to update
   * @returns {User} A new user with updated properties
   */
  copyWith({ id, firstName, lastName, email, username, profileImageUrl, theme, emailVerified }) {
    return new User(
      id !== undefined ? id : this.id,
      firstName !== undefined ? firstName : this.firstName,
      lastName !== undefined ? lastName : this.lastName,
      email !== undefined ? email : this.email,
      username !== undefined ? username : this.username,
      profileImageUrl !== undefined ? profileImageUrl : this.profileImageUrl,
      theme !== undefined ? theme : this.theme,
      emailVerified !== undefined ? emailVerified : this.emailVerified
    );
  }

  /**
   * Creates a user from a JSON object
   * @param {Object} json - JSON object
   * @returns {User} A new user
   */
  static fromJson(json) {
    return new User(
      json.id || json.pk || '',
      json.first_name || json.firstName || '',
      json.last_name || json.lastName || '',
      json.email || '',
      json.username || json.email || '',
      json.profile_picture || json.profileImageUrl || null,
      json.theme_preference || json.theme || 'system',
      json.email_verified || json.emailVerified || false
    );
  }

  /**
   * Converts the user to a JSON object
   * @returns {Object} JSON object
   */
  toJson() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      username: this.username,
      profile_picture: this.profileImageUrl,
      theme_preference: this.theme,
      email_verified: this.emailVerified
    };
  }
}

export default User;
