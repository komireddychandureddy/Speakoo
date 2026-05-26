import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import 'tutor_approval_screen.dart';
import 'user_management_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const _DashboardTab(),
      const UserManagementScreen(),
      const TutorApprovalScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        backgroundColor: Colors.white,
        indicatorColor: AppColors.primaryContainer,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Dashboard'),
          NavigationDestination(
              icon: Icon(Icons.people_outline_rounded),
              selectedIcon: Icon(Icons.people_rounded),
              label: 'Users'),
          NavigationDestination(
              icon: Icon(Icons.how_to_reg_outlined),
              selectedIcon: Icon(Icons.how_to_reg_rounded),
              label: 'Tutors'),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  const _DashboardTab();

  // Mock monthly revenue data (Jan–Jun)
  static const List<FlSpot> _revenueSpots = [
    FlSpot(0, 3200),
    FlSpot(1, 4100),
    FlSpot(2, 3800),
    FlSpot(3, 5200),
    FlSpot(4, 4700),
    FlSpot(5, 6100),
  ];
  static const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            backgroundColor: AppColors.primaryDark,
            automaticallyImplyLeading: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined,
                    color: Colors.white),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                    gradient: AppColors.primaryGradient),
                padding: const EdgeInsets.fromLTRB(20, 56, 20, 16),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text('Admin Panel',
                        style: TextStyle(
                            color: Colors.white70, fontSize: 13)),
                    SizedBox(height: 4),
                    Text('Overview',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // KPI grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.6,
                    children: [
                      const _KpiCard(
                        label: 'Total Users',
                        value: '3,842',
                        icon: Icons.people_rounded,
                        color: Color(0xFF1565C0),
                        trend: '+12%',
                      ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0),
                      const _KpiCard(
                        label: 'Active Tutors',
                        value: '248',
                        icon: Icons.school_rounded,
                        color: AppColors.primaryGreen,
                        trend: '+5%',
                      ).animate(delay: 60.ms).fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0),
                      const _KpiCard(
                        label: 'Sessions Today',
                        value: '134',
                        icon: Icons.video_call_rounded,
                        color: Color(0xFF6A1B9A),
                        trend: '+8%',
                      ).animate(delay: 120.ms).fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0),
                      const _KpiCard(
                        label: 'Revenue (Jun)',
                        value: '\$6,100',
                        icon: Icons.attach_money_rounded,
                        color: AppColors.accent,
                        trend: '+18%',
                      ).animate(delay: 180.ms).fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Revenue line chart
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
                        const Text('Monthly Revenue',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('Jan – Jun 2025',
                            style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 12)),
                        const SizedBox(height: 20),
                        SizedBox(
                          height: 180,
                          child: LineChart(
                            LineChartData(
                              minX: 0,
                              maxX: 5,
                              minY: 2000,
                              maxY: 7000,
                              gridData: FlGridData(
                                show: true,
                                drawVerticalLine: false,
                                getDrawingHorizontalLine: (_) => const FlLine(
                                  color: AppColors.divider,
                                  strokeWidth: 1,
                                ),
                              ),
                              borderData: FlBorderData(show: false),
                              titlesData: FlTitlesData(
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    getTitlesWidget: (value, meta) {
                                      final i = value.toInt();
                                      if (i >= 0 && i < _months.length) {
                                        return Text(_months[i],
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color:
                                                    AppColors.textSecondary));
                                      }
                                      return const SizedBox.shrink();
                                    },
                                  ),
                                ),
                                leftTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    reservedSize: 44,
                                    getTitlesWidget: (value, meta) {
                                      if (value % 2000 == 0) {
                                        return Text(
                                            '\$${(value / 1000).toStringAsFixed(0)}k',
                                            style: const TextStyle(
                                                fontSize: 10,
                                                color: AppColors.textHint));
                                      }
                                      return const SizedBox.shrink();
                                    },
                                  ),
                                ),
                                topTitles: const AxisTitles(
                                    sideTitles:
                                        SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(
                                    sideTitles:
                                        SideTitles(showTitles: false)),
                              ),
                              lineBarsData: [
                                LineChartBarData(
                                  spots: _revenueSpots,
                                  isCurved: true,
                                  color: AppColors.primaryGreen,
                                  barWidth: 3,
                                  dotData: FlDotData(
                                    show: true,
                                    getDotPainter:
                                        (spot, percent, bar, index) =>
                                            FlDotCirclePainter(
                                      radius: 4,
                                      color: Colors.white,
                                      strokeWidth: 2,
                                      strokeColor: AppColors.primaryGreen,
                                    ),
                                  ),
                                  belowBarData: BarAreaData(
                                    show: true,
                                    color: AppColors.primaryGreen
                                        .withValues(alpha: 0.1),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 250.ms).fadeIn(duration: 400.ms),

                  const SizedBox(height: 24),

                  // Recent activity
                  const Text('Recent Activity',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  ...[
                    const _ActivityItem(
                      icon: Icons.how_to_reg_rounded,
                      color: AppColors.primaryGreen,
                      title: 'New tutor application',
                      subtitle: 'Maria Gonzalez — Spanish',
                      time: '5m ago',
                    ),
                    const _ActivityItem(
                      icon: Icons.report_problem_outlined,
                      color: Colors.orange,
                      title: 'Session dispute opened',
                      subtitle: 'Booking #BK-2093',
                      time: '22m ago',
                    ),
                    const _ActivityItem(
                      icon: Icons.person_add_outlined,
                      color: Color(0xFF1565C0),
                      title: 'New learner registered',
                      subtitle: 'James Lee — Seoul, KR',
                      time: '1h ago',
                    ),
                    const _ActivityItem(
                      icon: Icons.payments_outlined,
                      color: AppColors.accent,
                      title: 'Payout processed',
                      subtitle: '\$980 → Carlos Mendez',
                      time: '3h ago',
                    ),
                  ].asMap().entries.map((e) {
                    return _ActivityTile(item: e.value)
                        .animate(delay: (e.key * 80).ms)
                        .fadeIn()
                        .slideX(begin: 0.08, end: 0);
                  }),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
  });
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
              color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(trend,
                    style: const TextStyle(
                        color: AppColors.primaryDark,
                        fontSize: 10,
                        fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 11),
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _ActivityItem {
  const _ActivityItem({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.time,
  });
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String time;
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.item});
  final _ActivityItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
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
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: item.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(item.icon, color: item.color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                Text(item.subtitle,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          Text(item.time,
              style: const TextStyle(
                  color: AppColors.textHint, fontSize: 11)),
        ],
      ),
    );
  }
}
