import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/language_chip.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../../../core/widgets/tutor_card.dart';
import '../../../tutors/application/tutors_provider.dart';

const _allLanguages = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic',
  'Portuguese', 'German', 'Japanese', 'Korean', 'Italian',
];

class TutorSearchScreen extends ConsumerStatefulWidget {
  const TutorSearchScreen({super.key});

  @override
  ConsumerState<TutorSearchScreen> createState() => _TutorSearchScreenState();
}

class _TutorSearchScreenState extends ConsumerState<TutorSearchScreen> {
  final _searchCtrl = TextEditingController();
  String _sortBy = 'rating';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<TutorModel> _filterAndSort(
      List<TutorPublicProfile> all, String? selectedLang) {
    final query = _searchCtrl.text.toLowerCase();
    var results = all
        .where((t) {
          final matchesSearch = query.isEmpty ||
              t.displayName.toLowerCase().contains(query) ||
              t.bio.toLowerCase().contains(query) ||
              t.languagesTaught
                  .any((l) => l.toLowerCase().contains(query));
          final matchesLang = selectedLang == null ||
              t.languagesTaught.contains(selectedLang);
          return matchesSearch && matchesLang;
        })
        .map((p) => p.toTutorModel())
        .toList();

    switch (_sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.hourlyRate.compareTo(b.hourlyRate));
      case 'price_desc':
        results.sort((a, b) => b.hourlyRate.compareTo(a.hourlyRate));
      default:
        results.sort((a, b) => b.rating.compareTo(a.rating));
    }
    return results;
  }

  @override
  Widget build(BuildContext context) {
    final searchAsync = ref.watch(tutorSearchProvider);
    final params = ref.watch(tutorSearchParamsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Find Tutors'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort_rounded),
            initialValue: _sortBy,
            onSelected: (v) => setState(() => _sortBy = v),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'rating', child: Text('Best Rating')),
              PopupMenuItem(
                  value: 'price_asc', child: Text('Price: Low to High')),
              PopupMenuItem(
                  value: 'price_desc', child: Text('Price: High to Low')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SpeakooTextField(
              label: '',
              hint: 'Search tutors, languages…',
              controller: _searchCtrl,
              prefixIcon: Icons.search,
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _allLanguages.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final lang = _allLanguages[i];
                return LanguageChip(
                  language: lang,
                  selected: params.language == lang,
                  onTap: () {
                    ref.read(tutorSearchParamsProvider.notifier).setLanguage(
                          params.language == lang ? null : lang,
                        );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          searchAsync.when(
            loading: () => const Expanded(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: AppColors.textHint),
                    const SizedBox(height: 12),
                    const Text('Failed to load tutors',
                        style: TextStyle(color: AppColors.textHint)),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => ref.invalidate(tutorSearchProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
            data: (data) {
              final rawList = (data['items'] as List<dynamic>?) ?? [];
              final profiles = rawList
                  .cast<Map<String, dynamic>>()
                  .map(TutorPublicProfile.fromJson)
                  .toList();
              final tutors = _filterAndSort(profiles, params.language);
              return Expanded(
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Text(
                            '${tutors.length} tutors found',
                            style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: tutors.isEmpty
                          ? const Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.search_off,
                                      size: 64, color: AppColors.textHint),
                                  SizedBox(height: 12),
                                  Text('No tutors found',
                                      style: TextStyle(
                                          color: AppColors.textHint)),
                                ],
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16),
                              itemCount: tutors.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (_, i) => TutorCard(
                                tutor: tutors[i],
                                onTap: () => context
                                    .push('/tutors/${tutors[i].id}'),
                                onBook: () => context
                                    .push('/tutors/${tutors[i].id}'),
                              )
                                  .animate(
                                      delay:
                                          Duration(milliseconds: i * 60))
                                  .fadeIn()
                                  .slideY(begin: 0.06),
                            ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
