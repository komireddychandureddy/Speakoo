import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/session_card.dart';
import 'availability_screen.dart';
import 'earnings_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';

class TutorHomeScreen extends ConsumerStatefulWidget {
  const TutorHomeScreen({super.key});

  @override
  ConsumerState<TutorHomeScreen> createState() => _TutorHomeScreenState();
}

class _TutorSessionData {
  final String tutorName;
  final String language;
  final DateTime scheduledAt;
  final int durationMinutes;
  final SessionStatus status;
  const _TutorSessionData({
    required this.tutorName,
    required this.language,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.status,
  });
}

class _TutorHomeScreenState extends ConsumerState<TutorHomeScreen> {
  int _selectedIndex = 0;

  final List<_TutorSessionData> _todaySessions = [
    _TutorSessionData(
      tutorName: 'Liam Johnson',
      language: 'English',
      scheduledAt: DateTime.now(),
      durationMinutes: 60,
      status: SessionStatus.upcoming,
    ),
    _TutorSessionData(
      tutorName: 'Emma Clarkson',
      language: 'French',
      scheduledAt: DateTime.now(),
      durationMinutes: 45,
      status: SessionStatus.upcoming,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      _DashboardTab(todaySessions: _todaySessions),
      const AvailabilityScreen(),
      const EarningsScreen(),
      const ProfileScreen(),
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
              icon: Icon(Icons.calendar_month_outlined),
              selectedIcon: Icon(Icons.calendar_month_rounded),
              label: 'Availability'),
          NavigationDestination(
              icon: Icon(Icons.payments_outlined),
              selectedIcon: Icon(Icons.payments_rounded),
              label: 'Earnings'),
          NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile'),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  const _DashboardTab({required this.todaySessions});
  final List<_TutorSessionData> todaySessions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // App bar
          SliverAppBar(
            expandedHeight: 160,
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
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 16),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text('Welcome back, Tutor!',
                        style: TextStyle(
                            color: Colors.white70, fontSize: 13)),
                    SizedBox(height: 4),
                    Text('Your Dashboard',
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
                  // Earnings summary
                  _EarningsSummary()
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 20),

                  // Today's Sessions
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Today's Sessions",
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: AppColors.textPrimary)),
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All',
                            style:
                                TextStyle(color: AppColors.primaryGreen)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...todaySessions.asMap().entries.map((e) {
                    return SessionCard(
                      tutorName: e.value.tutorName,
                      tutorAvatar: '',
                      language: e.value.language,
                      dateTime: e.value.scheduledAt,
                      durationMinutes: e.value.durationMinutes,
                      status: e.value.status,
                    ).animate(delay: (e.key * 80).ms)
                        .fadeIn()
                        .slideX(begin: 0.08, end: 0);
                  }),

                  const SizedBox(height: 20),

                  // Recent reviews
                  const Text('Recent Reviews',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  ...[
                    const _ReviewData(
                        learner: 'Liam Johnson',
                        comment:
                            'Amazing session! Sofia is very patient and explains things clearly.',
                        rating: 5.0,
                        time: '2h ago'),
                    const _ReviewData(
                        learner: 'Emma Clarkson',
                        comment:
                            'Great pronunciation tips. Already feeling more confident.',
                        rating: 4.5,
                        time: 'Yesterday'),
                  ].asMap().entries.map((e) {
                    return _ReviewCard(review: e.value)
                        .animate(delay: (e.key * 80).ms)
                        .fadeIn()
                        .slideX(begin: 0.08, end: 0);
                  }),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EarningsSummary extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
              color: AppColors.shadow, blurRadius: 12, offset: Offset(0, 4)),
        ],
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Monthly Earnings',
              style: TextStyle(color: Colors.white70, fontSize: 12)),
          SizedBox(height: 4),
          Text('\$1,240.00',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold)),
          SizedBox(height: 16),
          Row(
            children: [
              _EarningStat(label: 'Sessions', value: '28'),
              SizedBox(width: 16),
              _EarningStat(label: 'Hours Taught', value: '34'),
              SizedBox(width: 16),
              _EarningStat(label: 'Avg Rating', value: '4.9 ★'),
            ],
          ),
        ],
      ),
    );
  }
}

class _EarningStat extends StatelessWidget {
  const _EarningStat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        Text(label,
            style:
                const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}

class _ReviewData {
  const _ReviewData({
    required this.learner,
    required this.comment,
    required this.rating,
    required this.time,
  });
  final String learner;
  final String comment;
  final double rating;
  final String time;
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});
  final _ReviewData review;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primaryContainer,
                child: Text(review.learner[0],
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review.learner,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 13)),
                    Text(review.time,
                        style: const TextStyle(
                            color: AppColors.textHint, fontSize: 11)),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.star_rounded,
                      color: AppColors.starFilled, size: 16),
                  const SizedBox(width: 2),
                  Text(review.rating.toString(),
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(review.comment,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}
