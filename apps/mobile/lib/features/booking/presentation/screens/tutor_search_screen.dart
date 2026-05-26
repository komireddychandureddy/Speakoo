import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/language_chip.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../../../core/widgets/tutor_card.dart';

const _allLanguages = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic',
  'Portuguese', 'German', 'Japanese', 'Korean', 'Italian',
];

final _allTutors = [
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
  const TutorModel(
    id: '4',
    name: 'Hiroshi Tanaka',
    avatar: '',
    languages: ['Japanese', 'English'],
    rating: 4.7,
    reviewCount: 145,
    hourlyRate: 30,
    headline: 'JLPT N1 certified teacher from Tokyo',
  ),
  const TutorModel(
    id: '5',
    name: 'Layla Hassan',
    avatar: '',
    languages: ['Arabic', 'English'],
    rating: 4.9,
    reviewCount: 67,
    hourlyRate: 22,
    headline: 'Modern Standard & Egyptian Arabic • Cairo native',
    isOnline: true,
  ),
];

class TutorSearchScreen extends StatefulWidget {
  const TutorSearchScreen({super.key});

  @override
  State<TutorSearchScreen> createState() => _TutorSearchScreenState();
}

class _TutorSearchScreenState extends State<TutorSearchScreen> {
  final _searchCtrl = TextEditingController();
  String? _selectedLanguage;
  String _sortBy = 'rating';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<TutorModel> get _filtered {
    var results = _allTutors.where((t) {
      final query = _searchCtrl.text.toLowerCase();
      final matchesSearch = query.isEmpty ||
          t.name.toLowerCase().contains(query) ||
          t.headline.toLowerCase().contains(query) ||
          t.languages.any((l) => l.toLowerCase().contains(query));
      final matchesLang =
          _selectedLanguage == null || t.languages.contains(_selectedLanguage);
      return matchesSearch && matchesLang;
    }).toList();

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
    final tutors = _filtered;

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
              PopupMenuItem(value: 'price_asc', child: Text('Price: Low to High')),
              PopupMenuItem(value: 'price_desc', child: Text('Price: High to Low')),
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
                  selected: _selectedLanguage == lang,
                  onTap: () => setState(
                    () => _selectedLanguage =
                        _selectedLanguage == lang ? null : lang,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  '${tutors.length} tutors found',
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textSecondary),
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
                        Icon(Icons.search_off, size: 64, color: AppColors.textHint),
                        SizedBox(height: 12),
                        Text('No tutors found',
                            style: TextStyle(color: AppColors.textHint)),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: tutors.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => TutorCard(
                      tutor: tutors[i],
                      onTap: () => context.push('/tutors/${tutors[i].id}'),
                      onBook: () => context.push('/tutors/${tutors[i].id}'),
                    )
                        .animate(delay: Duration(milliseconds: i * 60))
                        .fadeIn()
                        .slideY(begin: 0.06),
                  ),
          ),
        ],
      ),
    );
  }
}
