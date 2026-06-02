import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/subscription_provider.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  final _paymentMethodCtrl = TextEditingController(text: 'pm_card_visa');

  @override
  void dispose() {
    _paymentMethodCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final plansAsync = ref.watch(subscriptionPlansProvider);
    final currentAsync = ref.watch(mySubscriptionProvider);
    final actionState = ref.watch(subscriptionActionProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Subscription'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          currentAsync.when(
            data: (sub) {
              if (sub == null) {
                return const _InfoCard(
                  title: 'No Active Plan',
                  subtitle: 'Choose a plan below to unlock recurring credits.',
                );
              }
              return _InfoCard(
                title: 'Current Plan: ${sub.plan.name}',
                subtitle:
                    'Status: ${sub.status.toUpperCase()}\nRenews until: ${sub.currentPeriodEnd.toLocal()}',
              );
            },
            loading: () => const _InfoCard(title: 'Loading current subscription...'),
            error: (_, __) => const _InfoCard(
              title: 'Could not fetch current subscription',
              subtitle: 'Try again shortly.',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _paymentMethodCtrl,
            decoration: const InputDecoration(
              labelText: 'Payment Method Id',
              helperText: 'Use Stripe test id, e.g. pm_card_visa in sandbox',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          if (actionState.hasError)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                'Action failed: ${actionState.error}',
                style: const TextStyle(color: Colors.red),
              ),
            ),
          plansAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const Center(
              child: Text('Unable to load plans', style: TextStyle(color: AppColors.textHint)),
            ),
            data: (plans) {
              if (plans.isEmpty) {
                return const Center(
                  child: Text('No plans available right now.'),
                );
              }
              return Column(
                children: plans.map((plan) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(plan.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text('\$${(plan.priceCents / 100).toStringAsFixed(2)} / ${plan.interval}'),
                          const SizedBox(height: 2),
                          Text('${plan.includedCredits} included credits',
                              style: const TextStyle(color: AppColors.textSecondary)),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: actionState.isLoading
                                  ? null
                                  : () async {
                                      await ref
                                          .read(subscriptionActionProvider.notifier)
                                          .subscribe(
                                            planId: plan.id,
                                            paymentMethodId: _paymentMethodCtrl.text.trim(),
                                          );
                                      if (!mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Subscription updated')),
                                      );
                                    },
                              child: const Text('Subscribe'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: actionState.isLoading
                ? null
                : () async {
                    await ref.read(subscriptionActionProvider.notifier).cancel();
                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Subscription cancelled')),
                    );
                  },
            child: const Text('Cancel Active Subscription'),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final String? subtitle;

  const _InfoCard({required this.title, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!, style: const TextStyle(color: AppColors.textSecondary)),
            ],
          ],
        ),
      ),
    );
  }
}
