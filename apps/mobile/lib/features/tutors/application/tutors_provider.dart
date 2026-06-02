import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/tutor_card.dart';

// ---------------------------------------------------------------------------
// Tutor profile model (public — from GET /tutors/:id)
// ---------------------------------------------------------------------------
class TutorPublicProfile {
  final String id; // TutorProfile.id
  final String userId; // User.id (the :id param in URL)
  final String displayName;
  final String avatarUrl;
  final String bio;
  final String countryCode;
  final List<String> languagesTaught;
  final int hourlyRateCents;
  final bool isApproved;

  const TutorPublicProfile({
    required this.id,
    required this.userId,
    required this.displayName,
    required this.avatarUrl,
    required this.bio,
    required this.countryCode,
    required this.languagesTaught,
    required this.hourlyRateCents,
    required this.isApproved,
  });

  factory TutorPublicProfile.fromJson(Map<String, dynamic> json) {
    final userProfile =
        (json['user'] as Map<String, dynamic>?)?['profile'] as Map<String, dynamic>?;
    return TutorPublicProfile(
      id: json['id'] as String,
      userId: (json['user'] as Map<String, dynamic>?)?['id'] as String? ?? '',
      displayName: userProfile?['displayName'] as String? ?? 'Tutor',
      avatarUrl: userProfile?['avatarUrl'] as String? ?? '',
      bio: userProfile?['bio'] as String? ?? '',
      countryCode: userProfile?['countryCode'] as String? ?? '',
      languagesTaught: (json['languagesTaught'] as List<dynamic>?)
              ?.cast<String>() ??
          [],
      hourlyRateCents: json['hourlyRateCents'] as int? ?? 0,
      isApproved: json['isApproved'] as bool? ?? false,
    );
  }

  /// Convert to [TutorModel] used by [TutorCard] widget.
  TutorModel toTutorModel() {
    return TutorModel(
      id: userId,
      name: displayName,
      avatar: avatarUrl,
      languages: languagesTaught,
      rating: 0,
      reviewCount: 0,
      hourlyRate: hourlyRateCents / 100,
      headline: bio,
    );
  }
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------
class TutorsRepository {
  final Dio _dio;
  TutorsRepository(this._dio);

  Future<Map<String, dynamic>> searchTutors({
    String? language,
    int? minCents,
    int? maxCents,
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _dio.get('/tutors', queryParameters: {
      if (language != null) 'language': language,
      if (minCents != null) 'minCents': minCents,
      if (maxCents != null) 'maxCents': maxCents,
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<TutorPublicProfile> getTutorProfile(String userId) async {
    final response = await _dio.get('/tutors/$userId');
    return TutorPublicProfile.fromJson(
        response.data as Map<String, dynamic>);
  }

  Future<List<TutorPublicProfile>> getRecommendedTutors({
    String? language,
    int? maxCents,
    int limit = 6,
  }) async {
    final response = await _dio.get<List<dynamic>>(
      '/tutors/recommendations/me',
      queryParameters: {
        if (language != null) 'language': language,
        if (maxCents != null) 'maxCents': maxCents,
        'limit': limit,
      },
    );

    final rows = response.data ?? <dynamic>[];
    return rows
        .whereType<Map<String, dynamic>>()
        .map(TutorPublicProfile.fromJson)
        .toList();
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
final tutorsRepositoryProvider = Provider<TutorsRepository>((ref) {
  return TutorsRepository(ref.read(dioClientProvider));
});

// Search params state
class TutorSearchParams {
  final String? language;
  final int? minCents;
  final int? maxCents;
  final int page;
  const TutorSearchParams({
    this.language,
    this.minCents,
    this.maxCents,
    this.page = 1,
  });

  TutorSearchParams copyWith({
    String? language,
    int? minCents,
    int? maxCents,
    int? page,
    bool clearLanguage = false,
  }) {
    return TutorSearchParams(
      language: clearLanguage ? null : language ?? this.language,
      minCents: minCents ?? this.minCents,
      maxCents: maxCents ?? this.maxCents,
      page: page ?? this.page,
    );
  }
}

class TutorSearchParamsNotifier extends Notifier<TutorSearchParams> {
  @override
  TutorSearchParams build() => const TutorSearchParams();

  void setLanguage(String? language) =>
      state = state.copyWith(language: language, clearLanguage: language == null);

  void reset() => state = const TutorSearchParams();
}

final tutorSearchParamsProvider =
    NotifierProvider<TutorSearchParamsNotifier, TutorSearchParams>(
  TutorSearchParamsNotifier.new,
);

final tutorSearchProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final params = ref.watch(tutorSearchParamsProvider);
  return ref.read(tutorsRepositoryProvider).searchTutors(
        language: params.language,
        minCents: params.minCents,
        maxCents: params.maxCents,
        page: params.page,
      );
});

final tutorPublicProfileProvider =
    FutureProvider.family<TutorPublicProfile, String>((ref, userId) async {
  return ref.read(tutorsRepositoryProvider).getTutorProfile(userId);
});

final recommendedTutorsProvider =
    FutureProvider.family<List<TutorPublicProfile>, String?>((ref, language) async {
  return ref.read(tutorsRepositoryProvider).getRecommendedTutors(
        language: language,
        limit: 6,
      );
});
