/**
 * User model class
 */
class User {
  /**
   * Creates a new user
   * @param {string} firstName - First name of the user
   * @param {string} lastName - Last name of the user
   * @param {string} email - Email address of the user
   * @param {string} profileImageUrl - URL to the user's profile image
   * @param {boolean} isDarkMode - Whether the user prefers dark mode
   */
  constructor(firstName, lastName, email, profileImageUrl = null, isDarkMode = false) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.profileImageUrl = profileImageUrl;
    this.isDarkMode = isDarkMode;
  }

  /**
   * Creates a copy of the user with updated properties
   * @param {Object} props - Properties to update
   * @returns {User} A new user with updated properties
   */
  copyWith({ firstName, lastName, email, profileImageUrl, isDarkMode }) {
    return new User(
      firstName !== undefined ? firstName : this.firstName,
      lastName !== undefined ? lastName : this.lastName,
      email !== undefined ? email : this.email,
      profileImageUrl !== undefined ? profileImageUrl : this.profileImageUrl,
      isDarkMode !== undefined ? isDarkMode : this.isDarkMode
    );
  }
}

export default User;
