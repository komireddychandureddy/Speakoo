import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../tutors/application/tutors_provider.dart';
import '../../application/booking_provider.dart';

enum _PayMethod { wallet, card }

enum _Duration { min25, min50 }

class BookingConfirmScreen extends ConsumerStatefulWidget {
  final String? tutorId;
  const BookingConfirmScreen({super.key, this.tutorId});

  @override
  ConsumerState<BookingConfirmScreen> createState() =>
      _BookingConfirmScreenState();
}

class _BookingConfirmScreenState extends ConsumerState<BookingConfirmScreen> {
  _PayMethod _method = _PayMethod.wallet;
  _Duration _duration = _Duration.min25;
  bool _loading = false;

  double _sessionFee(double hourlyRate) {
    final fraction = _duration == _Duration.min25 ? 25.0 / 60 : 50.0 / 60;
    return hourlyRate * fraction;
  }

  double _platformFee(double hourlyRate) => _sessionFee(hourlyRate) * 0.05;
  double _total(double hourlyRate) =>
      _sessionFee(hourlyRate) + _platformFee(hourlyRate);

  String get _durationLabel =>
      _duration == _Duration.min25 ? '25 min' : '50 min';

  Future<void> _confirmPay(String tutorUserId, double hourlyRate) async {
    final creation = ref.read(bookingCreationProvider.notifier);
    // NOTE: slotId must come from a slot selection screen.
    // TODO: add slot selection step before booking confirm.
    const slotId = 'placeholder-slot-id';
    if (slotId == 'placeholder-slot-id') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a time slot first.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _loading = true);
    final booking = await creation.createBooking(
      slotId: slotId,
      tutorId: tutorUserId,
      language: 'English',
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (booking != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Booking confirmed! Check your email.'),
          backgroundColor: AppColors.primaryGreen,
        ),
      );
      context.go('/my-bookings');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Booking failed. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tutorId == null) {
      return const Scaffold(
        body: Center(child: Text('No tutor selected')),
      );
    }

    final tutorAsync =
        ref.watch(tutorPublicProfileProvider(widget.tutorId!));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Confirm Booking'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: tutorAsync.when(
        loading: () =>
            const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text('Failed to load tutor: $e',
                  style:
                      const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(
                    tutorPublicProfileProvider(widget.tutorId!)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (tutor) {
          final hourlyRate = tutor.hourlyRateCents / 100;
          final initials = tutor.displayName
              .split(' ')
              .take(2)
              .map((s) => s[0])
              .join();
          final language = tutor.languagesTaught.isNotEmpty
              ? tutor.languagesTaught.first
              : 'English';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            _SummaryCard(
              initials: initials,
              name: tutor.displayName,
              language: language,
              slot: 'Select a slot',
              duration: _durationLabel,
            ).animate().fadeIn(delay: 50.ms),
            const SizedBox(height: 16),
            // Duration selector
            const Text(
              'Session Duration',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary),
            ).animate().fadeIn(delay: 100.ms),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _DurationChip(
                    label: '25 min',
                    price:
                        '\$${(hourlyRate * 25 / 60).toStringAsFixed(2)}',
                    selected: _duration == _Duration.min25,
                    onTap: () =>
                        setState(() => _duration = _Duration.min25),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _DurationChip(
                    label: '50 min',
                    price:
                        '\$${(hourlyRate * 50 / 60).toStringAsFixed(2)}',
                    selected: _duration == _Duration.min50,
                    onTap: () =>
                        setState(() => _duration = _Duration.min50),
                  ),
                ),
              ],
            ).animate().fadeIn(delay: 120.ms),
            const SizedBox(height: 20),
            _PriceCard(
              sessionFee: _sessionFee(hourlyRate),
              platformFee: _platformFee(hourlyRate),
              total: _total(hourlyRate),
              durationLabel: _durationLabel,
            ).animate().fadeIn(delay: 150.ms),
            const SizedBox(height: 20),
            const Text(
              'Payment Method',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary),
            ).animate().fadeIn(delay: 200.ms),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _MethodChip(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'Wallet',
                    selected: _method == _PayMethod.wallet,
                    onTap: () =>
                        setState(() => _method = _PayMethod.wallet),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MethodChip(
                    icon: Icons.credit_card_outlined,
                    label: 'Credit Card',
                    selected: _method == _PayMethod.card,
                    onTap: () =>
                        setState(() => _method = _PayMethod.card),
                  ),
                ),
              ],
            ).animate().fadeIn(delay: 250.ms),
            const SizedBox(height: 32),
            PrimaryButton(
              label:
                  'Confirm & Pay  \$${_total(hourlyRate).toStringAsFixed(2)}',
              loading: _loading,
              onPressed: () =>
                  _confirmPay(tutor.userId, hourlyRate),
            ).animate().fadeIn(delay: 300.ms),
            const SizedBox(height: 12),
            const Center(
              child: Text(
                'By confirming you agree to our cancellation policy.',
                style:
                    TextStyle(fontSize: 12, color: AppColors.textHint),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        );
        },
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String initials;
  final String name;
  final String language;
  final String slot;
  final String duration;

  const _SummaryCard({
    required this.initials,
    required this.name,
    required this.language,
    required this.slot,
    required this.duration,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: const [
          BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppColors.primaryContainer,
            child: Text(initials,
                style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryDark,
                    fontSize: 18)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(language,
                    style: const TextStyle(
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w600,
                        fontSize: 13)),
                const SizedBox(height: 6),
                Row(children: [
                  const Icon(Icons.access_time,
                      size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(slot,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary)),
                ]),
                const SizedBox(height: 2),
                Row(children: [
                  const Icon(Icons.hourglass_bottom,
                      size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(duration,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary)),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DurationChip extends StatelessWidget {
  final String label;
  final String price;
  final bool selected;
  final VoidCallback onTap;

  const _DurationChip({
    required this.label,
    required this.price,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryContainer : AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.primaryGreen : AppColors.divider,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                  color: selected ? AppColors.primaryGreen : AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 15),
            ),
            const SizedBox(height: 4),
            Text(
              price,
              style: TextStyle(
                  color: selected
                      ? AppColors.primaryGreen
                      : AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceCard extends StatelessWidget {
  final double sessionFee;
  final double platformFee;
  final double total;
  final String durationLabel;

  const _PriceCard({
    required this.sessionFee,
    required this.platformFee,
    required this.total,
    required this.durationLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Price Breakdown',
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  fontSize: 15)),
          const SizedBox(height: 12),
          _PriceRow(label: 'Session Fee ($durationLabel)', amount: sessionFee),
          _PriceRow(label: 'Platform Fee (5%)', amount: platformFee),
          const Divider(color: AppColors.divider, height: 20),
          _PriceRow(label: 'Total', amount: total, bold: true),
        ],
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final double amount;
  final bool bold;

  const _PriceRow({
    required this.label,
    required this.amount,
    this.bold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  color: bold ? AppColors.textPrimary : AppColors.textSecondary,
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
                  fontSize: bold ? 15 : 14)),
          Text(
              '\$${amount.toStringAsFixed(2)}',
              style: TextStyle(
                  color: bold
                          ? AppColors.primaryGreen
                          : AppColors.textPrimary,
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                  fontSize: bold ? 15 : 14)),
        ],
      ),
    );
  }
}

class _MethodChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MethodChip({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryContainer : AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.primaryGreen : AppColors.divider,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon,
                color: selected ? AppColors.primaryGreen : AppColors.textSecondary,
                size: 24),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    color: selected
                        ? AppColors.primaryGreen
                        : AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
