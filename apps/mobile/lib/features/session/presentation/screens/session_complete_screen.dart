import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';

class SessionCompleteScreen extends StatefulWidget {
  final String bookingId;

  const SessionCompleteScreen({super.key, required this.bookingId});

  @override
  State<SessionCompleteScreen> createState() => _SessionCompleteScreenState();
}

class _SessionCompleteScreenState extends State<SessionCompleteScreen> {
  int _rating = 0;
  final _commentCtrl = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please give a star rating before submitting.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _submitting = true);
    // TODO: call feedback API with bookingId, rating, comment
    await Future<void>.delayed(const Duration(milliseconds: 700));
    setState(() {
      _submitting = false;
      _submitted = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 1200));
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: _submitted ? _ThankYouView() : _ReviewView(
          rating: _rating,
          commentCtrl: _commentCtrl,
          submitting: _submitting,
          onRatingChanged: (r) => setState(() => _rating = r),
          onSubmit: _submitReview,
          onSkip: () => context.go('/home'),
        ),
      ),
    );
  }
}

class _ReviewView extends StatelessWidget {
  final int rating;
  final TextEditingController commentCtrl;
  final bool submitting;
  final ValueChanged<int> onRatingChanged;
  final VoidCallback onSubmit;
  final VoidCallback onSkip;

  const _ReviewView({
    required this.rating,
    required this.commentCtrl,
    required this.submitting,
    required this.onRatingChanged,
    required this.onSubmit,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(
              color: AppColors.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.celebration_outlined,
              size: 44,
              color: AppColors.primaryGreen,
            ),
          )
              .animate()
              .fadeIn(duration: 500.ms)
              .scale(begin: const Offset(0.6, 0.6)),
          const SizedBox(height: 24),
          const Text(
            'Session Complete!',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.1),
          const SizedBox(height: 8),
          const Text(
            'Great job! How was your session?',
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ).animate(delay: 300.ms).fadeIn(),
          const SizedBox(height: 40),
          // Star rating
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              final starIndex = i + 1;
              return GestureDetector(
                onTap: () => onRatingChanged(starIndex),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    starIndex <= rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: 44,
                    color: starIndex <= rating
                        ? const Color(0xFFFFC107)
                        : AppColors.divider,
                  ),
                ),
              );
            }),
          ).animate(delay: 400.ms).fadeIn().scale(begin: const Offset(0.8, 0.8)),
          const SizedBox(height: 8),
          AnimatedOpacity(
            opacity: rating > 0 ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 200),
            child: Text(
              _ratingLabel(rating),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.primaryGreen,
              ),
            ),
          ),
          const SizedBox(height: 28),
          // Comment field
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider),
            ),
            child: TextField(
              controller: commentCtrl,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Share your experience (optional)…',
                hintStyle: TextStyle(color: AppColors.textHint, fontSize: 14),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                border: InputBorder.none,
              ),
              style: const TextStyle(
                  color: AppColors.textPrimary, fontSize: 15),
            ),
          ).animate(delay: 500.ms).fadeIn(),
          const SizedBox(height: 36),
          PrimaryButton(
            label: 'Submit Review',
            loading: submitting,
            onPressed: onSubmit,
          ).animate(delay: 600.ms).fadeIn().slideY(begin: 0.1),
          const SizedBox(height: 16),
          TextButton(
            onPressed: onSkip,
            child: const Text(
              'Skip',
              style: TextStyle(color: AppColors.textHint),
            ),
          ),
        ],
      ),
    );
  }

  String _ratingLabel(int r) {
    switch (r) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Great';
      case 5:
        return 'Excellent!';
      default:
        return '';
    }
  }
}

class _ThankYouView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.check_circle_rounded,
            size: 80,
            color: AppColors.primaryGreen,
          ).animate().fadeIn().scale(begin: const Offset(0.5, 0.5)),
          const SizedBox(height: 20),
          const Text(
            'Thank you for your\nfeedback!',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ).animate(delay: 200.ms).fadeIn(),
        ],
      ),
    );
  }
}
