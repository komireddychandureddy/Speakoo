import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/models/user_profile_model.dart';
import '../data/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>(
  (ref) => ProfileRepository(ref.watch(dioClientProvider)),
);

/// Fetches the current user's full profile from GET /users/me.
/// Kept separate from authProvider so profile edits can be reflected
/// without re-authenticating.
final profileProvider =
    AsyncNotifierProvider<ProfileNotifier, UserProfileModel?>(
  ProfileNotifier.new,
);

class ProfileNotifier extends AsyncNotifier<UserProfileModel?> {
  @override
  Future<UserProfileModel?> build() async {
    return ref.read(profileRepositoryProvider).getMyProfile();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepositoryProvider).getMyProfile(),
    );
  }

  Future<void> updateProfile({
    String? displayName,
    String? avatarUrl,
    String? bio,
    String? countryCode,
    String? timezone,
    String? nativeLanguage,
    String? phoneNumber,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepositoryProvider).updateProfile(
            displayName: displayName,
            avatarUrl: avatarUrl,
            bio: bio,
            countryCode: countryCode,
            timezone: timezone,
            nativeLanguage: nativeLanguage,
            phoneNumber: phoneNumber,
          ),
    );
  }
}
