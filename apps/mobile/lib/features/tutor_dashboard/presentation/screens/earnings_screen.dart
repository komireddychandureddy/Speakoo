import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/tutor_dashboard_provider.dart';
import 'payout_onboarding_webview_screen.dart';

class EarningsScreen extends ConsumerWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txAsync = ref.watch(tutorEarningsTransactionsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Earnings'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: () async {
              final url = await ref.read(tutorPayoutProvider.notifier).createOnboardingUrl();
              if (!context.mounted) return;
              if (url != null && url.isNotEmpty) {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => PayoutOnboardingWebViewScreen(url: url),
                  ),
                );
              }
            },
            child: const Text('Set up payouts', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: txAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load earnings: $e')),
        data: (payload) {
          final items = (payload['items'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
          final payouts = items.where((e) => e['type'] == 'payout').toList();
          final totalCents = payouts.fold<int>(0, (sum, e) => sum + (e['amountCents'] as int? ?? 0));

          return Column(
            children: [
              Container(
                width: double.infinity,
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Paid Out', style: TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(height: 4),
                    Text('\$${(totalCents / 100).toStringAsFixed(2)}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final tx = items[index];
                    final amountCents = tx['amountCents'] as int? ?? 0;
                    final date = DateTime.tryParse(tx['createdAt'] as String? ?? '');
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.account_balance_wallet_outlined),
                        title: Text((tx['type'] as String? ?? 'transaction').toUpperCase()),
                        subtitle: Text(date?.toLocal().toString() ?? ''),
                        trailing: Text('\$${(amountCents / 100).toStringAsFixed(2)}'),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
