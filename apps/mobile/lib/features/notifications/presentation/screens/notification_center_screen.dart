import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/notifications_provider.dart';

enum _NotifType { booking, reminder, payment, system }

class _NotifItem {
  final String title;
  final String body;
  final DateTime time;
  final _NotifType type;
  bool read;

  _NotifItem({
    required this.title,
    required this.body,
    required this.time,
    required this.type,
    this.read = false,
  });
}

class NotificationCenterScreen extends ConsumerStatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  ConsumerState<NotificationCenterScreen> createState() =>
      _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends ConsumerState<NotificationCenterScreen> {
  // Stub notifications — real data would come from a provider
  final List<_NotifItem> _items = [
    _NotifItem(
      title: 'Booking Confirmed',
      body: 'Your session with Maria García is confirmed for tomorrow at 10:00 AM.',
      time: DateTime.now().subtract(const Duration(minutes: 5)),
      type: _NotifType.booking,
    ),
    _NotifItem(
      title: 'Session Reminder',
      body: 'Your session starts in 60 minutes. Get ready!',
      time: DateTime.now().subtract(const Duration(hours: 1)),
      type: _NotifType.reminder,
      read: true,
    ),
    _NotifItem(
      title: 'Payment Successful',
      body: 'Payment of \$28.00 for your English session was processed.',
      time: DateTime.now().subtract(const Duration(hours: 3)),
      type: _NotifType.payment,
      read: true,
    ),
    _NotifItem(
      title: 'New Tutor Match',
      body: 'We found 3 new tutors for your Spanish learning goal.',
      time: DateTime.now().subtract(const Duration(days: 1)),
      type: _NotifType.system,
    ),
    _NotifItem(
      title: 'Session Reminder',
      body: 'Your session with James Lee starts in 10 minutes!',
      time: DateTime.now().subtract(const Duration(days: 2)),
      type: _NotifType.reminder,
      read: true,
    ),
  ];

  int get _unreadCount => _items.where((n) => !n.read).length;

  void _markAllRead() {
    setState(() {
      for (final item in _items) {
        item.read = true;
      }
    });
  }

  void _markRead(int index) {
    setState(() => _items[index].read = true);
  }

  IconData _iconFor(_NotifType type) {
    switch (type) {
      case _NotifType.booking:
        return Icons.calendar_today_outlined;
      case _NotifType.reminder:
        return Icons.alarm_outlined;
      case _NotifType.payment:
        return Icons.payment_outlined;
      case _NotifType.system:
        return Icons.notifications_outlined;
    }
  }

  Color _colorFor(_NotifType type) {
    switch (type) {
      case _NotifType.booking:
        return AppColors.primaryGreen;
      case _NotifType.reminder:
        return const Color(0xFFFF9800);
      case _NotifType.payment:
        return const Color(0xFF2196F3);
      case _NotifType.system:
        return AppColors.textSecondary;
    }
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsProvider);

    if (notificationsAsync.hasValue && _items.length <= 5) {
      final fromApi = notificationsAsync.value ?? [];
      if (fromApi.isNotEmpty) {
        _items
          ..clear()
          ..addAll(
            fromApi.map(
              (n) => _NotifItem(
                title: n.type.replaceAll('_', ' ').toUpperCase(),
                body: 'Channel: ${n.channel}',
                time: n.sentAt,
                type: _NotifType.system,
              ),
            ),
          );
      }
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        leading: BackButton(onPressed: () => context.go('/home')),
        title: Row(
          children: [
            const Text(
              'Notifications',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 18,
                color: AppColors.textPrimary,
              ),
            ),
            if (_unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$_unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text(
                'Mark all read',
                style: TextStyle(
                  color: AppColors.primaryGreen,
                  fontSize: 13,
                ),
              ),
            ),
        ],
      ),
      body: _items.isEmpty
          ? _EmptyState()
          : ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _items.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, color: AppColors.divider),
              itemBuilder: (context, index) {
                final item = _items[index];
                return _NotifTile(
                  item: item,
                  icon: _iconFor(item.type),
                  color: _colorFor(item.type),
                  timeLabel: _timeAgo(item.time),
                  onTap: () => _markRead(index),
                ).animate(delay: Duration(milliseconds: index * 50)).fadeIn().slideX(begin: 0.05);
              },
            ),
    );
  }
}

class _NotifTile extends StatelessWidget {
  final _NotifItem item;
  final IconData icon;
  final Color color;
  final String timeLabel;
  final VoidCallback onTap;

  const _NotifTile({
    required this.item,
    required this.icon,
    required this.color,
    required this.timeLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        color: item.read ? Colors.transparent : AppColors.primaryContainer.withOpacity(0.5),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 22, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: item.read
                                ? FontWeight.w500
                                : FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        timeLabel,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textHint,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.body,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (!item.read)
              Padding(
                padding: const EdgeInsets.only(left: 8, top: 4),
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.notifications_none_outlined,
            size: 64,
            color: AppColors.textHint,
          ),
          const SizedBox(height: 16),
          const Text(
            'No notifications yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "You're all caught up!",
            style: TextStyle(fontSize: 14, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}
