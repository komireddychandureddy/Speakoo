import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';

enum _TxType { credit, debit }

class _Transaction {
  const _Transaction({
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.type,
    required this.date,
  });
  final String title;
  final String subtitle;
  final double amount;
  final _TxType type;
  final String date;
}

const _mockTransactions = [
  _Transaction(
    title: 'Session with Sofia Martinez',
    subtitle: 'Spanish · 60 min',
    amount: 45.00,
    type: _TxType.debit,
    date: 'Today, 10:00 AM',
  ),
  _Transaction(
    title: 'Wallet Top-up',
    subtitle: 'Visa •••• 4242',
    amount: 100.00,
    type: _TxType.credit,
    date: 'Yesterday, 3:14 PM',
  ),
  _Transaction(
    title: 'Session with Liang Wei',
    subtitle: 'Mandarin · 45 min',
    amount: 37.50,
    type: _TxType.debit,
    date: 'Jun 10, 9:00 AM',
  ),
  _Transaction(
    title: 'Refund — Cancelled Session',
    subtitle: 'Amélie Dubois · French',
    amount: 50.00,
    type: _TxType.credit,
    date: 'Jun 8, 6:22 PM',
  ),
  _Transaction(
    title: 'Wallet Top-up',
    subtitle: 'Visa •••• 4242',
    amount: 50.00,
    type: _TxType.credit,
    date: 'Jun 5, 11:00 AM',
  ),
  _Transaction(
    title: 'Session with Sofia Martinez',
    subtitle: 'Spanish · 30 min',
    amount: 22.50,
    type: _TxType.debit,
    date: 'Jun 3, 4:00 PM',
  ),
];

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Wallet'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Balance card
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Available Balance',
                    style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 6),
                const Text('\$42.50',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 42,
                        fontWeight: FontWeight.bold))
                    .animate()
                    .fadeIn(duration: 500.ms)
                    .slideY(begin: 0.3, end: 0),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: PrimaryButton(
                        label: 'Add Funds',
                        onPressed: () => _showAddFundsSheet(context),
                        icon: const Icon(Icons.add_rounded),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlineButton(
                        label: 'Withdraw',
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Quick stats
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                _QuickStat(
                  label: 'Spent this month',
                  value: '\$105.00',
                  icon: Icons.arrow_upward_rounded,
                  iconColor: Colors.red,
                ),
                SizedBox(width: 12),
                _QuickStat(
                  label: 'Added this month',
                  value: '\$150.00',
                  icon: Icons.arrow_downward_rounded,
                  iconColor: AppColors.primaryGreen,
                ),
              ],
            ),
          ),

          // Transactions header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Transactions',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.textPrimary)),
                TextButton(
                  onPressed: () {},
                  child: const Text('See All',
                      style: TextStyle(color: AppColors.primaryGreen)),
                ),
              ],
            ),
          ),

          // Transaction list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _mockTransactions.length,
              itemBuilder: (context, i) {
                return _TransactionTile(tx: _mockTransactions[i])
                    .animate(delay: (i * 60).ms)
                    .fadeIn()
                    .slideX(begin: 0.08, end: 0);
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showAddFundsSheet(BuildContext context) {
    final controller = TextEditingController(text: '50');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 32,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Add Funds',
                style:
                    TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Enter amount to add to your wallet',
                style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: '\$ ',
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                      color: AppColors.primaryGreen, width: 2),
                ),
                labelText: 'Amount (USD)',
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: ['20', '50', '100', '200'].map((amt) {
                return ActionChip(
                  label: Text('\$$amt'),
                  onPressed: () => controller.text = amt,
                  backgroundColor: AppColors.primaryContainer,
                  labelStyle:
                      const TextStyle(color: AppColors.primaryDark),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              label: 'Proceed to Payment',
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.lock_rounded),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickStat extends StatelessWidget {
  const _QuickStat({
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
  });
  final String label;
  final String value;
  final IconData icon;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
                color: AppColors.shadow, blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(value,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: AppColors.textPrimary)),
                  Text(label,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 11),
                      overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.tx});
  final _Transaction tx;

  @override
  Widget build(BuildContext context) {
    final isCredit = tx.type == _TxType.credit;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      elevation: 1,
      shadowColor: AppColors.shadow,
      child: Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: isCredit
                ? AppColors.primaryGreen.withValues(alpha: 0.1)
                : Colors.red.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            isCredit
                ? Icons.arrow_downward_rounded
                : Icons.arrow_upward_rounded,
            color: isCredit ? AppColors.primaryGreen : Colors.red,
            size: 20,
          ),
        ),
        title: Text(tx.title,
            style: const TextStyle(
                fontWeight: FontWeight.w600, fontSize: 13)),
        subtitle: Text(tx.subtitle,
            style: const TextStyle(
                color: AppColors.textSecondary, fontSize: 11)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isCredit ? '+' : '-'}\$${tx.amount.toStringAsFixed(2)}',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: isCredit ? AppColors.primaryGreen : Colors.red),
            ),
            const SizedBox(height: 2),
            Text(tx.date,
                style: const TextStyle(
                    color: AppColors.textHint, fontSize: 10)),
          ],
        ),
      ),
      ),
    );
  }
}
