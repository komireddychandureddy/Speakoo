import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/language_chip.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/star_rating.dart';
import '../../../../core/widgets/tutor_card.dart';

class TutorProfileScreen extends StatelessWidget {
  final String tutorId;

  const TutorProfileScreen({super.key, required this.tutorId});

  // Find mock tutor or generate a placeholder
  TutorModel _tutor() {
    const tutors = [
      TutorModel(
        id: '1',
        name: 'Sofia Martinez',
        avatar: '',
        languages: ['Spanish', 'English'],
        rating: 4.9,
        reviewCount: 312,
        hourlyRate: 28,
        headline: 'Native Spanish tutor from Madrid • 7 yrs exp',
        isOnline: true,
      ),
      TutorModel(
        id: '2',
        name: 'Liang Wei',
        avatar: '',
        languages: ['Mandarin', 'English'],
        rating: 4.8,
        reviewCount: 204,
        hourlyRate: 24,
        headline: 'HSK examiner • Business Mandarin specialist',
      ),
      TutorModel(
        id: '3',
        name: 'Amélie Dubois',
        avatar: '',
        languages: ['French', 'English'],
        rating: 5.0,
        reviewCount: 98,
        hourlyRate: 32,
        headline: 'DELF/DALF certified • Paris native',
        isOnline: true,
      ),
    ];
    return tutors.firstWhere(
      (t) => t.id == tutorId,
      orElse: () => const TutorModel(
        id: '?',
        name: 'Unknown Tutor',
        avatar: '',
        languages: ['English'],
        rating: 4.5,
        reviewCount: 0,
        hourlyRate: 25,
        headline: 'Language tutor',
      ),
    );
  }

  static const _bio =
      'I am a passionate language educator with over 7 years of experience '
      'helping students achieve fluency. My lessons are tailored to your goals '
      '— whether you need conversational practice, grammar foundations, exam '
      'preparation, or business language skills. I believe every learner can '
      'succeed with the right guidance and consistent practice.';

  static const _slots = [
    _SlotData('Mon', ['09:00', '11:00', '15:00']),
    _SlotData('Tue', ['10:00', '14:00']),
    _SlotData('Wed', ['09:00', '13:00', '17:00']),
    _SlotData('Thu', ['11:00', '16:00']),
    _SlotData('Fri', ['09:00', '12:00']),
  ];

  @override
  Widget build(BuildContext context) {
    final tutor = _tutor();
    final initials = tutor.name.split(' ').take(2).map((s) => s[0]).join();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Hero header
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.heroGradient,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Avatar
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 52,
                          backgroundColor: Colors.white24,
                          child: Text(
                            initials,
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        if (tutor.isOnline)
                          Positioned(
                            bottom: 4,
                            right: 4,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: BoxDecoration(
                                color: const Color(0xFF4CAF50),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      tutor.name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tutor.headline,
                      style: const TextStyle(
                          color: Colors.white70, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Stats row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _StatCard(
                          icon: Icons.star_rounded,
                          value: tutor.rating.toStringAsFixed(1),
                          label: 'Rating'),
                      _StatCard(
                          icon: Icons.rate_review_outlined,
                          value: '${tutor.reviewCount}',
                          label: 'Reviews'),
                      _StatCard(
                          icon: Icons.attach_money_rounded,
                          value: '\$${tutor.hourlyRate}',
                          label: 'Per Hour'),
                    ],
                  ).animate().fadeIn(delay: 100.ms),
                  const SizedBox(height: 24),

                  // Languages
                  const Text('Languages',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: tutor.languages
                        .map((l) => LanguageChip(language: l, selected: true))
                        .toList(),
                  ),
                  const SizedBox(height: 24),

                  // About
                  const Text('About',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  const Text(
                    _bio,
                    style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        height: 1.6),
                  ),
                  const SizedBox(height: 24),

                  // Available slots
                  const Text('Available Slots',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  ..._slots.map((s) => _SlotRow(slot: s)),
                  const SizedBox(height: 24),

                  // Rating breakdown
                  Row(
                    children: [
                      StarRating(rating: tutor.rating, size: 20, showValue: true),
                      const SizedBox(width: 8),
                      Text(
                        '(${tutor.reviewCount} reviews)',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: PrimaryButton(
            label: 'Book a Session — \$${_tutor().hourlyRate}/hr',
            onPressed: () => context.push('/bookings/confirm?tutorId=$tutorId'),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primaryGreen, size: 26),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
        Text(label,
            style: const TextStyle(
                fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _SlotData {
  final String day;
  final List<String> times;
  const _SlotData(this.day, this.times);
}

class _SlotRow extends StatelessWidget {
  final _SlotData slot;
  const _SlotRow({required this.slot});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Text(slot.day,
                style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    fontSize: 13)),
          ),
          const SizedBox(width: 12),
          Wrap(
            spacing: 8,
            children: slot.times
                .map(
                  (t) => Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primaryLight),
                    ),
                    child: Text(t,
                        style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.primaryDark,
                            fontWeight: FontWeight.w600)),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}
