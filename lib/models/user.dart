/// Model class representing a user
class User {
  /// First name of the user
  final String firstName;
  
  /// Last name of the user
  final String lastName;
  
  /// Email address of the user
  final String email;
  
  /// URL to the user's profile image
  final String? profileImageUrl;
  
  /// Whether the user prefers dark mode
  final bool isDarkMode;
  
  /// Creates a new user
  const User({
    required this.firstName,
    required this.lastName,
    required this.email,
    this.profileImageUrl,
    this.isDarkMode = false,
  });
  
  /// Creates a copy of this user with the given fields replaced with the new values
  User copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? profileImageUrl,
    bool? isDarkMode,
  }) {
    return User(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      isDarkMode: isDarkMode ?? this.isDarkMode,
    );
  }
  
  /// Returns the full name of the user
  String get fullName => '$firstName $lastName';
}
