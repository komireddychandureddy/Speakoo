import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/session_repository.dart';

final sessionRepositoryProvider = Provider<SessionRepository>((ref) {
  return SessionRepository(ref.read(dioClientProvider));
});

final sessionTokenProvider = FutureProvider.family<String, String>((ref, bookingId) async {
  return ref.read(sessionRepositoryProvider).getSessionToken(bookingId);
});

class SessionRecordingNotifier extends AsyncNotifier<bool> {
  @override
  Future<bool> build() async => false;

  Future<void> start(String bookingId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(sessionRepositoryProvider).startRecording(bookingId);
      return true;
    });
  }

  Future<void> stop(String bookingId, {String? recordingUrl}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(sessionRepositoryProvider).stopRecording(bookingId, recordingUrl: recordingUrl);
      return false;
    });
  }
}

final sessionRecordingProvider = AsyncNotifierProvider<SessionRecordingNotifier, bool>(
  SessionRecordingNotifier.new,
);
