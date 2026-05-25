import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum SessionStatus { upcoming, inSession, completed, cancelled }

class SessionCard extends StatelessWidget {
  final String tutorName;
  final String tutorAvatar;
  final String language;
  final DateTime dateTime;
  final int durationMinutes;
  final SessionStatus status;
  final VoidCallback? onJoin;
  final VoidCallback? onReview;

  const SessionCard({
    super.key,
    required this.tutorName,
    required this.tutorAvatar,
    required this.language,
    required this.dateTime,
    required this.durationMinutes,
    required this.status,
    this.onJoin,
    this.onReview,
  });

  String get _initials =>
      tutorName.split(' ').take(2).map((s) => s[0]).join();

  Color get _statusColor {
    switch (status) {
      case SessionStatus.upcoming:
        return AppColors.info;
      case SessionStatus.inSession:
        return AppColors.primaryGreen;
      case SessionStatus.completed:
        return AppColors.textSecondary;
      case SessionStatus.cancelled:
        return AppColors.error;
    }
  }

  String get _statusLabel {
    switch (status) {
      case SessionStatus.upcoming:
        return 'Upcoming';
      case SessionStatus.inSession:
        return 'Live Now';
      case SessionStatus.completed:
        return 'Completed';
      case SessionStatus.cancelled:
        return 'Cancelled';
    }
  }

  String _formatDate() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final h = dateTime.hour.toString().padLeft(2, '0');
    final m = dateTime.minute.toString().padLeft(2, '0');
    return '${months[dateTime.month - 1]} ${dateTime.day} • $h:$m';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: const [
          BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 2))
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primaryContainer,
                child: Text(_initials,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryDark,
                        fontSize: 16)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tutorName,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: AppColors.textPrimary)),
                    const SizedBox(height: 2),
                    Text(language,
                        style: const TextStyle(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w600,
                            fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(_formatDate(),
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textSecondary)),
                    Text('$durationMinutes min',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _statusColor.withValues(alpha: 0.4)),
                ),
                child: Text(_statusLabel,
                    style: TextStyle(
                        color: _statusColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 11)),
              ),
            ],
          ),
          if (status == SessionStatus.upcoming || status == SessionStatus.completed) ...[
            const SizedBox(height: 12),
            const Divider(color: AppColors.divider, height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (status == SessionStatus.upcoming && onJoin != null)
                  FilledButton.icon(
                    onPressed: onJoin,
                    icon: const Icon(Icons.videocam_outlined, size: 16),
                    label: const Text('Join Session'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      textStyle: const TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                if (status == SessionStatus.completed && onReview != null)
                  OutlinedButton.icon(
                    onPressed: onReview,
                    icon: const Icon(Icons.star_outline, size: 16),
                    label: const Text('Leave Review'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryGreen,
                      side: const BorderSide(color: AppColors.primaryGreen),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      textStyle: const TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
