import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/admin_repository.dart';

final adminRepositoryProvider = Provider<AdminRepository>((ref) {
  return AdminRepository(ref.read(dioClientProvider));
});

final adminStatsProvider = FutureProvider<AdminStats>((ref) async {
  return ref.read(adminRepositoryProvider).getStats();
});

final adminUsersProvider = FutureProvider.family<List<AdminUser>, String?>((ref, role) async {
  return ref.read(adminRepositoryProvider).listUsers(role: role);
});

class AdminActionsNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> approveTutor(String userId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(adminRepositoryProvider).approveTutor(userId));
    ref.invalidate(adminUsersProvider('tutor'));
    ref.invalidate(adminStatsProvider);
  }

  Future<void> toggleSuspend(String userId, bool suspended) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(adminRepositoryProvider);
      if (suspended) {
        await repo.unsuspendUser(userId);
      } else {
        await repo.suspendUser(userId);
      }
    });
    ref.invalidate(adminUsersProvider('learner'));
    ref.invalidate(adminUsersProvider('tutor'));
    ref.invalidate(adminUsersProvider('admin'));
  }
}

final adminActionsProvider = AsyncNotifierProvider<AdminActionsNotifier, void>(
  AdminActionsNotifier.new,
);
