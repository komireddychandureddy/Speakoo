import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/tutor_dashboard_repository.dart';

final tutorDashboardRepositoryProvider = Provider<TutorDashboardRepository>((ref) {
  return TutorDashboardRepository(ref.read(dioClientProvider));
});

final tutorSlotsProvider = FutureProvider<List<TutorAvailabilitySlot>>((ref) async {
  return ref.read(tutorDashboardRepositoryProvider).getMySlots();
});

final tutorEarningsTransactionsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(tutorDashboardRepositoryProvider).getWalletTransactions();
});

class TutorSlotsActionsNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> createSlot(DateTime start, DateTime end) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(tutorDashboardRepositoryProvider).createSlot(start: start, end: end),
    );
    ref.invalidate(tutorSlotsProvider);
  }
}

final tutorSlotsActionsProvider = AsyncNotifierProvider<TutorSlotsActionsNotifier, void>(
  TutorSlotsActionsNotifier.new,
);

class TutorPayoutNotifier extends AsyncNotifier<String?> {
  @override
  Future<String?> build() async => null;

  Future<String?> createOnboardingUrl() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref.read(tutorDashboardRepositoryProvider).getConnectOnboardingUrl();
      return res['onboardingUrl'] as String?;
    });
    return state.valueOrNull;
  }
}

final tutorPayoutProvider = AsyncNotifierProvider<TutorPayoutNotifier, String?>(
  TutorPayoutNotifier.new,
);
