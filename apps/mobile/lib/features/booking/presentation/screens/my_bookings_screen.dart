import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/session_card.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  static final _upcoming = [
    SessionCard(
      tutorName: 'Sofia Martinez',
      tutorAvatar: '',
      language: 'Spanish',
      dateTime: DateTime.now().add(const Duration(hours: 2)),
      durationMinutes: 60,
      status: SessionStatus.upcoming,
      onJoin: () {},
    ),
    SessionCard(
      tutorName: 'Liang Wei',
      tutorAvatar: '',
      language: 'Mandarin',
      dateTime: DateTime.now().add(const Duration(days: 1, hours: 3)),
      durationMinutes: 60,
      status: SessionStatus.upcoming,
      onJoin: () {},
    ),
  ];

  static final _past = [
    SessionCard(
      tutorName: 'Amélie Dubois',
      tutorAvatar: '',
      language: 'French',
      dateTime: DateTime.now().subtract(const Duration(days: 3)),
      durationMinutes: 60,
      status: SessionStatus.completed,
      onReview: () {},
    ),
    SessionCard(
      tutorName: 'Sofia Martinez',
      tutorAvatar: '',
      language: 'Spanish',
      dateTime: DateTime.now().subtract(const Duration(days: 7)),
      durationMinutes: 60,
      status: SessionStatus.completed,
      onReview: () {},
    ),
    SessionCard(
      tutorName: 'Hiroshi Tanaka',
      tutorAvatar: '',
      language: 'Japanese',
      dateTime: DateTime.now().subtract(const Duration(days: 14)),
      durationMinutes: 45,
      status: SessionStatus.cancelled,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Bookings'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryGreen,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primaryGreen,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Past'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BookingList(sessions: _upcoming, emptyLabel: 'No upcoming sessions'),
          _BookingList(sessions: _past, emptyLabel: 'No past sessions'),
        ],
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final List<SessionCard> sessions;
  final String emptyLabel;

  const _BookingList({required this.sessions, required this.emptyLabel});

  @override
  Widget build(BuildContext context) {
    if (sessions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.calendar_today_outlined,
                size: 64, color: AppColors.textHint),
            const SizedBox(height: 16),
            Text(emptyLabel,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 15)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: sessions.length,
      itemBuilder: (context, i) =>
          sessions[i].animate().fadeIn(delay: (50 * i).ms).slideY(begin: 0.1),
    );
  }
}
