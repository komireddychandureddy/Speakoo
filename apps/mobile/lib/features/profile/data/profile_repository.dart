import 'package:dio/dio.dart';
import '../models/user_profile_model.dart';

class ProfileRepository {
  ProfileRepository(this._dio);

  final Dio _dio;

  /// GET /users/me — returns full user + profile
  Future<UserProfileModel> getMyProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/users/me');
    return UserProfileModel.fromJson(response.data!);
  }

  /// PATCH /users/me/profile — updates mutable profile fields
  Future<UserProfileModel> updateProfile({
    String? displayName,
    String? avatarUrl,
    String? bio,
    String? countryCode,
    String? timezone,
    String? nativeLanguage,
    String? phoneNumber,
  }) async {
    final body = <String, dynamic>{
      if (displayName != null) 'displayName': displayName,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      if (bio != null) 'bio': bio,
      if (countryCode != null) 'countryCode': countryCode,
      if (timezone != null) 'timezone': timezone,
      if (nativeLanguage != null) 'nativeLanguage': nativeLanguage,
      if (phoneNumber != null) 'phoneNumber': phoneNumber,
    };
    final response =
        await _dio.patch<Map<String, dynamic>>('/users/me/profile', data: body);
    return UserProfileModel.fromJson(response.data!);
  }
}
