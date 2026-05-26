import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  int _touchedIndex = -1;

  // Mock weekly earnings data (Mon–Sun, USD)
  final List<double> _weeklyEarnings = [60, 110, 80, 130, 95, 45, 0];
  final List<String> _weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  Widget build(BuildContext context) {
    final total = _weeklyEarnings.reduce((a, b) => a + b);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Earnings'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary cards row
            Row(
              children: [
                Expanded(
                  child: _SummaryCard(
                    label: 'This Week',
                    value: '\$${total.toStringAsFixed(0)}',
                    icon: Icons.calendar_today_outlined,
                    iconColor: AppColors.primaryGreen,
                  ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.2, end: 0),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: const _SummaryCard(
                    label: 'This Month',
                    value: '\$1,240',
                    icon: Icons.monetization_on_outlined,
                    iconColor: AppColors.accent,
                  ).animate(delay: 80.ms).fadeIn(duration: 350.ms).slideY(begin: 0.2, end: 0),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: const _SummaryCard(
                    label: 'Pending',
                    value: '\$320',
                    icon: Icons.pending_actions_outlined,
                    iconColor: Colors.orange,
                  ).animate(delay: 160.ms).fadeIn(duration: 350.ms).slideY(begin: 0.2, end: 0),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Bar chart
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: const [
                  BoxShadow(
                      color: AppColors.shadow,
                      blurRadius: 10,
                      offset: Offset(0, 3)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Weekly Breakdown',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  const Text('Earnings per day this week',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 200,
                    child: BarChart(
                      BarChartData(
                        maxY: 150,
                        barTouchData: BarTouchData(
                          touchTooltipData: BarTouchTooltipData(
                            getTooltipItem: (group, groupIndex, rod, rodIndex) {
                              return BarTooltipItem(
                                '\$${rod.toY.toStringAsFixed(0)}',
                                const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13),
                              );
                            },
                          ),
                          touchCallback: (event, response) {
                            setState(() {
                              _touchedIndex =
                                  response?.spot?.touchedBarGroupIndex ?? -1;
                            });
                          },
                        ),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final i = value.toInt();
                                if (i >= 0 && i < _weekDays.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(_weekDays[i],
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textSecondary)),
                                  );
                                }
                                return const SizedBox.shrink();
                              },
                            ),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 40,
                              getTitlesWidget: (value, meta) {
                                if (value % 50 == 0) {
                                  return Text('\$${value.toInt()}',
                                      style: const TextStyle(
                                          fontSize: 10,
                                          color: AppColors.textHint));
                                }
                                return const SizedBox.shrink();
                              },
                            ),
                          ),
                          topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                        ),
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          getDrawingHorizontalLine: (value) => const FlLine(
                            color: AppColors.divider,
                            strokeWidth: 1,
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        barGroups: _weeklyEarnings.asMap().entries.map((e) {
                          final isTouched = e.key == _touchedIndex;
                          return BarChartGroupData(
                            x: e.key,
                            barRods: [
                              BarChartRodData(
                                toY: e.value,
                                color: isTouched
                                    ? AppColors.primaryDark
                                    : AppColors.primaryGreen,
                                width: 22,
                                borderRadius: const BorderRadius.vertical(
                                    top: Radius.circular(6)),
                                backDrawRodData: BackgroundBarChartRodData(
                                  show: true,
                                  toY: 150,
                                  color: AppColors.primaryContainer,
                                ),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
            ).animate(delay: 200.ms).fadeIn(duration: 400.ms),

            const SizedBox(height: 24),

            // Payout section
            const Text('Payout History',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            ...[
              const _PayoutData(amount: 980.0, date: 'Jun 1, 2025', status: 'Completed'),
              const _PayoutData(amount: 860.0, date: 'May 1, 2025', status: 'Completed'),
              const _PayoutData(amount: 1100.0, date: 'Apr 1, 2025', status: 'Completed'),
            ].asMap().entries.map((e) {
              return _PayoutTile(payout: e.value)
                  .animate(delay: (e.key * 80).ms)
                  .fadeIn()
                  .slideX(begin: 0.08, end: 0);
            }),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
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
    return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
                color: AppColors.shadow, blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(height: 8),
            Text(value,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 10),
                overflow: TextOverflow.ellipsis),
          ],
        ),
    );
  }
}

class _PayoutData {
  const _PayoutData({
    required this.amount,
    required this.date,
    required this.status,
  });
  final double amount;
  final String date;
  final String status;
}

class _PayoutTile extends StatelessWidget {
  const _PayoutTile({required this.payout});
  final _PayoutData payout;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
              color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 1)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.savings_outlined,
                color: AppColors.primaryGreen, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Payout — ${payout.date}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                Text(payout.status,
                    style: const TextStyle(
                        color: AppColors.primaryGreen, fontSize: 11)),
              ],
            ),
          ),
          Text('\$${payout.amount.toStringAsFixed(2)}',
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
