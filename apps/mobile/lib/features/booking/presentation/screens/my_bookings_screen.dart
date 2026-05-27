import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/session_card.dart';
import '../../application/booking_provider.dart';
import '../../data/models/booking_model.dart';

class MyBookingsScreen extends ConsumerStatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  ConsumerState<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends ConsumerState<MyBookingsScreen>
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

  SessionStatus _toStatus(String status) {
    switch (status) {
      case 'in_session':
        return SessionStatus.inSession;
      case 'completed':
        return SessionStatus.completed;
      case 'cancelled':
        return SessionStatus.cancelled;
      default:
        return SessionStatus.upcoming;
    }
  }

  bool _isUpcoming(BookingModel b) =>
      b.status == 'confirmed' || b.status == 'in_session';

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(myBookingsProvider);

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
      body: bookingsAsync.when(
        loading: () =>
            const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text('Failed to load bookings',
                  style: const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(myBookingsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (bookings) {
          final upcoming =
              bookings.where(_isUpcoming).toList();
          final past =
              bookings.where((b) => !_isUpcoming(b)).toList();

          return TabBarView(
            controller: _tabController,
            children: [
              _BookingList(
                bookings: upcoming,
                emptyLabel: 'No upcoming sessions',
                toStatus: _toStatus,
                onJoin: (b) =>
                    context.push('/sessions/${b.id}'),
              ),
              _BookingList(
                bookings: past,
                emptyLabel: 'No past sessions',
                toStatus: _toStatus,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final List<BookingModel> bookings;
  final String emptyLabel;
  final SessionStatus Function(String) toStatus;
  final void Function(BookingModel)? onJoin;

  const _BookingList({
    required this.bookings,
    required this.emptyLabel,
    required this.toStatus,
    this.onJoin,
  });

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
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
      itemCount: bookings.length,
      itemBuilder: (context, i) {
        final b = bookings[i];
        return SessionCard(
          tutorName: b.tutorDisplayName ?? 'Tutor',
          tutorAvatar: b.tutorAvatarUrl ?? '',
          language: b.language,
          dateTime: b.scheduledAt,
          durationMinutes: b.durationMinutes,
          status: toStatus(b.status),
          onJoin: onJoin != null ? () => onJoin!(b) : null,
        ).animate().fadeIn(delay: (50 * i).ms).slideY(begin: 0.1);
      },
    );
  }
}
