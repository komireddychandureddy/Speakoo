import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/profile_provider.dart';

class PreferencesScreen extends ConsumerStatefulWidget {
  const PreferencesScreen({super.key});

  @override
  ConsumerState<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends ConsumerState<PreferencesScreen> {
  final _targetLanguageCtrl = TextEditingController();
  final _learningGoalsCtrl = TextEditingController();
  final _maxBudgetCtrl = TextEditingController();

  @override
  void dispose() {
    _targetLanguageCtrl.dispose();
    _learningGoalsCtrl.dispose();
    _maxBudgetCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(profileProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Learning Preferences')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Could not load preferences.')),
        data: (profile) {
          if (profile != null && _targetLanguageCtrl.text.isEmpty) {
            _targetLanguageCtrl.text = profile.targetLanguage ?? '';
            _learningGoalsCtrl.text = profile.learningGoals ?? '';
            _maxBudgetCtrl.text = profile.maxBudgetCents?.toString() ?? '';
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              TextField(
                controller: _targetLanguageCtrl,
                decoration: const InputDecoration(
                  labelText: 'Target Language',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _learningGoalsCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Learning Goals',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _maxBudgetCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Max Budget (Cents)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () async {
                  final maxBudget = int.tryParse(_maxBudgetCtrl.text.trim());
                  await ref.read(profileProvider.notifier).updateProfile(
                        targetLanguage: _targetLanguageCtrl.text.trim(),
                        learningGoals: _learningGoalsCtrl.text.trim(),
                        maxBudgetCents: maxBudget,
                      );

                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Preferences saved')),
                  );
                },
                child: const Text('Save Preferences'),
              ),
            ],
          );
        },
      ),
    );
  }
}
