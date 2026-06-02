class UserProfileModel {
  final String id;
  final String email;
  final String role;
  final bool profileComplete;
  final String? displayName;
  final String? avatarUrl;
  final String? bio;
  final String? countryCode;
  final String? timezone;
  final String? nativeLanguage;
  final String? targetLanguage;
  final String? learningGoals;
  final int? maxBudgetCents;
  final String? phoneNumber;

  const UserProfileModel({
    required this.id,
    required this.email,
    required this.role,
    required this.profileComplete,
    this.displayName,
    this.avatarUrl,
    this.bio,
    this.countryCode,
    this.timezone,
    this.nativeLanguage,
    this.targetLanguage,
    this.learningGoals,
    this.maxBudgetCents,
    this.phoneNumber,
  });

  String get displayNameOrEmail => displayName ?? email.split('@').first;

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>?;
    return UserProfileModel(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      profileComplete: json['profileComplete'] as bool? ?? false,
      displayName: profile?['displayName'] as String?,
      avatarUrl: profile?['avatarUrl'] as String?,
      bio: profile?['bio'] as String?,
      countryCode: profile?['countryCode'] as String?,
      timezone: profile?['timezone'] as String?,
      nativeLanguage: profile?['nativeLanguage'] as String?,
      targetLanguage: profile?['targetLanguage'] as String?,
      learningGoals: profile?['learningGoals'] as String?,
      maxBudgetCents: profile?['maxBudgetCents'] as int?,
      phoneNumber: json['phoneNumber'] as String?,
    );
  }

  UserProfileModel copyWith({
    String? displayName,
    String? avatarUrl,
    String? bio,
    String? countryCode,
    String? timezone,
    String? nativeLanguage,
    String? targetLanguage,
    String? learningGoals,
    int? maxBudgetCents,
    String? phoneNumber,
  }) {
    return UserProfileModel(
      id: id,
      email: email,
      role: role,
      profileComplete: profileComplete,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      countryCode: countryCode ?? this.countryCode,
      timezone: timezone ?? this.timezone,
      nativeLanguage: nativeLanguage ?? this.nativeLanguage,
      targetLanguage: targetLanguage ?? this.targetLanguage,
      learningGoals: learningGoals ?? this.learningGoals,
      maxBudgetCents: maxBudgetCents ?? this.maxBudgetCents,
      phoneNumber: phoneNumber ?? this.phoneNumber,
    );
  }
}
