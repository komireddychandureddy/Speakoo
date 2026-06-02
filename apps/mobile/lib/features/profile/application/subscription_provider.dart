import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/subscription_repository.dart';

final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  return SubscriptionRepository(ref.watch(dioClientProvider));
});

final subscriptionPlansProvider = FutureProvider<List<SubscriptionPlanModel>>((ref) async {
  return ref.read(subscriptionRepositoryProvider).getPlans();
});

final mySubscriptionProvider = FutureProvider<UserSubscriptionModel?>((ref) async {
  return ref.read(subscriptionRepositoryProvider).getMySubscription();
});

class SubscribeNotifier extends AsyncNotifier<UserSubscriptionModel?> {
  @override
  Future<UserSubscriptionModel?> build() async => null;

  Future<void> subscribe({required String planId, required String paymentMethodId}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(subscriptionRepositoryProvider).subscribe(
            planId: planId,
            paymentMethodId: paymentMethodId,
          ),
    );
    ref.invalidate(mySubscriptionProvider);
  }

  Future<void> cancel({String? reason}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(subscriptionRepositoryProvider).cancel(reason: reason),
    );
    ref.invalidate(mySubscriptionProvider);
  }
}

final subscriptionActionProvider =
    AsyncNotifierProvider<SubscribeNotifier, UserSubscriptionModel?>(
  SubscribeNotifier.new,
);
