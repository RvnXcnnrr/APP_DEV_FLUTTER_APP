/// Model class representing a user
class User {
  /// Unique identifier for the user
  final String id;

  /// First name of the user
  final String firstName;

  /// Last name of the user
  final String lastName;

  /// Email address of the user
  final String email;

  /// URL to the user's profile image
  final String? profileImageUrl;

  /// User's preferred theme (light, dark, or system)
  final String theme;

  /// Whether the user's email is verified
  final bool emailVerified;

  /// Creates a new user
  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.profileImageUrl,
    this.theme = 'system',
    this.emailVerified = false,
  });

  /// Creates a user from JSON data
  factory User.fromJson(Map<String, dynamic> json) {
    // We'll just check for verification fields but not use them
    // since we're always treating users as verified for now

    // For Django users, we might get pk instead of id
    String userId = '';
    if (json.containsKey('id')) {
      userId = json['id']?.toString() ?? '';
    } else if (json.containsKey('pk')) {
      userId = json['pk']?.toString() ?? '';
    }

    // Handle theme preference with different possible field names
    String themePreference = 'system';
    if (json.containsKey('theme')) {
      themePreference = json['theme'] ?? 'system';
    } else if (json.containsKey('theme_preference')) {
      themePreference = json['theme_preference'] ?? 'system';
    }

    // Check for email verification status in different possible fields
    bool isVerified = false;
    if (json.containsKey('email_verified')) {
      isVerified = json['email_verified'] == true;
    } else if (json.containsKey('is_verified')) {
      isVerified = json['is_verified'] == true;
    } else if (json.containsKey('verified')) {
      isVerified = json['verified'] == true;
    }

    return User(
      id: userId,
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      email: json['email'] ?? '',
      profileImageUrl: json['profile_picture'],
      theme: themePreference,
      // Use the actual verification status from the backend
      emailVerified: isVerified,
    );
  }

  /// Converts the user to JSON data
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'profile_picture': profileImageUrl,
      'theme': theme,
      'email_verified': emailVerified,
    };
  }

  /// Creates a copy of this user with the given fields replaced with the new values
  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? profileImageUrl,
    String? theme,
    bool? emailVerified,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      theme: theme ?? this.theme,
      emailVerified: emailVerified ?? this.emailVerified,
    );
  }

  /// Returns the full name of the user
  String get fullName => '$firstName $lastName';

  /// Converts the user to a string
  @override
  String toString() {
    return 'User{id: $id, firstName: $firstName, lastName: $lastName, email: $email, theme: $theme, emailVerified: $emailVerified}';
  }
}
