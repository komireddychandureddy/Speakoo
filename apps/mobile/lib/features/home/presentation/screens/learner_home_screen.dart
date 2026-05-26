import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/language_chip.dart';
import '../../../../core/widgets/tutor_card.dart';
import '../../../auth/application/auth_provider.dart';

const _featuredLanguages = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Portuguese',
];

final _mockTutors = [
  const TutorModel(
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
  const TutorModel(
    id: '2',
    name: 'Liang Wei',
    avatar: '',
    languages: ['Mandarin', 'English'],
    rating: 4.8,
    reviewCount: 204,
    hourlyRate: 24,
    headline: 'HSK examiner • Business Mandarin specialist',
    isOnline: false,
  ),
  const TutorModel(
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

class LearnerHomeScreen extends ConsumerStatefulWidget {
  const LearnerHomeScreen({super.key});

  @override
  ConsumerState<LearnerHomeScreen> createState() => _LearnerHomeScreenState();
}

class _LearnerHomeScreenState extends ConsumerState<LearnerHomeScreen> {
  int _tabIndex = 0;
  String? _selectedLanguage;

  static const _navItems = [
    BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
    BottomNavigationBarItem(icon: Icon(Icons.search_outlined), activeIcon: Icon(Icons.search), label: 'Search'),
    BottomNavigationBarItem(icon: Icon(Icons.calendar_today_outlined), activeIcon: Icon(Icons.calendar_today), label: 'Bookings'),
    BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final firstName = user?.fullName.split(' ').first ?? 'there';

    return Scaffold(
      backgroundColor: AppColors.background,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tabIndex,
        onTap: (i) {
          setState(() => _tabIndex = i);
          if (i == 1) context.push('/search');
          if (i == 2) context.push('/my-bookings');
          if (i == 3) context.push('/profile');
        },
        items: _navItems,
      ),
      body: IndexedStack(
        index: 0,
        children: [_HomeTab(firstName: firstName, selectedLanguage: _selectedLanguage, onLanguageTap: (l) => setState(() => _selectedLanguage = _selectedLanguage == l ? null : l))],
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  final String firstName;
  final String? selectedLanguage;
  final void Function(String) onLanguageTap;

  const _HomeTab({
    required this.firstName,
    required this.selectedLanguage,
    required this.onLanguageTap,
  });

  @override
  Widget build(BuildContext context) {
    final filtered = selectedLanguage == null
        ? _mockTutors
        : _mockTutors.where((t) => t.languages.contains(selectedLanguage)).toList();

    return CustomScrollView(
      slivers: [
        // Header
        SliverToBoxAdapter(
          child: Container(
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
            ),
            padding: const EdgeInsets.fromLTRB(24, 52, 24, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hi $firstName 👋',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ).animate().fadeIn(duration: 600.ms),
                          const SizedBox(height: 4),
                          const Text(
                            'What language will you learn today?',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                      onPressed: () {},
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Search bar
                GestureDetector(
                  onTap: () => context.push('/search'),
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: const Row(
                      children: [
                        Icon(Icons.search, color: AppColors.textHint, size: 20),
                        SizedBox(width: 10),
                        Text(
                          'Search tutors, languages…',
                          style: TextStyle(color: AppColors.textHint, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Language chips
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 0, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Browse by Language',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _featuredLanguages.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final lang = _featuredLanguages[i];
                      return LanguageChip(
                        language: lang,
                        selected: selectedLanguage == lang,
                        onTap: () => onLanguageTap(lang),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),

        // Featured tutors
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Top Tutors',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary),
                ),
                TextButton(
                  onPressed: () => context.push('/search'),
                  child: const Text('See all'),
                ),
              ],
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: TutorCard(
                  tutor: filtered[i],
                  onTap: () => context.push('/tutors/${filtered[i].id}'),
                  onBook: () => context.push('/tutors/${filtered[i].id}'),
                )
                    .animate(delay: Duration(milliseconds: i * 80))
                    .fadeIn()
                    .slideY(begin: 0.08),
              ),
              childCount: filtered.length,
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 28)),
      ],
    );
  }
}

// Shimmer placeholder for tutor cards
class TutorCardShimmer extends StatelessWidget {
  const TutorCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE0E0E0),
      highlightColor: const Color(0xFFF5F5F5),
      child: Container(
        height: 140,
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
