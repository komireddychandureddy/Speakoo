import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/wallet_repository.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepository(ref.read(dioClientProvider));
});

final walletBalanceProvider = FutureProvider<int>((ref) async {
  return ref.read(walletRepositoryProvider).getBalanceCents();
});

final walletTransactionsProvider = FutureProvider<List<WalletTx>>((ref) async {
  return ref.read(walletRepositoryProvider).getTransactions();
});

class WalletTopupNotifier extends AsyncNotifier<String?> {
  @override
  Future<String?> build() async => null;

  Future<String?> topup(int amountCents) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(walletRepositoryProvider).topup(amountCents));
    ref.invalidate(walletBalanceProvider);
    ref.invalidate(walletTransactionsProvider);
    return state.valueOrNull;
  }
}

final walletTopupProvider = AsyncNotifierProvider<WalletTopupNotifier, String?>(
  WalletTopupNotifier.new,
);
