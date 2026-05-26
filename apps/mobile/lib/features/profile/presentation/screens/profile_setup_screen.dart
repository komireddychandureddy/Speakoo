import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../../auth/application/auth_provider.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _displayNameCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _hourlyRateCtrl = TextEditingController();
  final _learningGoalCtrl = TextEditingController();

  String? _nativeLanguage;
  String? _targetLanguage;
  final List<String> _teachLanguages = [];
  bool _loading = false;

  static const List<String> _languages = [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic',
    'Portuguese', 'Japanese', 'Korean', 'Italian', 'Russian', 'Hindi',
    'Turkish', 'Dutch', 'Polish', 'Swedish',
  ];

  UserRole? get _role => ref.read(authProvider).user?.role
      ?? _pendingRole;

  UserRole? get _pendingRole {
    final pending = ref.read(authProvider).pendingRole;
    if (pending == null) return null;
    return UserRole.values.firstWhere(
      (r) => r.name == pending,
      orElse: () => UserRole.learner,
    );
  }

  bool get _isTutor => _role == UserRole.tutor;

  @override
  void dispose() {
    _displayNameCtrl.dispose();
    _bioCtrl.dispose();
    _hourlyRateCtrl.dispose();
    _learningGoalCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isTutor && _teachLanguages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one language you teach.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _loading = true);
    // TODO: call profile update API via provider
    await Future<void>.delayed(const Duration(milliseconds: 800));
    setState(() => _loading = false);
    if (!mounted) return;
    final role = _role;
    if (role == UserRole.tutor) {
      context.go('/tutor-home');
    } else {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                // Progress indicator
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                Text(
                  _isTutor ? 'Set Up Your Tutor Profile' : 'Set Up Your Profile',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ).animate().fadeIn().slideX(begin: -0.1),
                const SizedBox(height: 8),
                Text(
                  _isTutor
                      ? 'Help learners find you by completing your profile.'
                      : 'Tell us about your learning goals.',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ).animate(delay: 100.ms).fadeIn(),
                const SizedBox(height: 32),
                // Avatar placeholder
                Center(
                  child: Stack(
                    children: [
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: AppColors.primaryGreen, width: 2),
                        ),
                        child: const Icon(
                          Icons.person_outline,
                          size: 48,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppColors.primaryGreen,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate(delay: 150.ms).fadeIn().scale(begin: const Offset(0.8, 0.8)),
                const SizedBox(height: 32),
                SpeakooTextField(
                  label: 'Display Name',
                  hint: 'How you appear on Speakoo',
                  controller: _displayNameCtrl,
                  prefixIcon: Icons.badge_outlined,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Display name is required';
                    }
                    return null;
                  },
                ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.1),
                if (_isTutor) ...[
                  const SizedBox(height: 20),
                  SpeakooTextField(
                    label: 'Bio',
                    hint: 'Tell learners about your experience…',
                    controller: _bioCtrl,
                    prefixIcon: Icons.info_outline,
                    maxLines: 4,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Bio is required';
                      if (v.trim().length < 20) {
                        return 'Bio should be at least 20 characters';
                      }
                      return null;
                    },
                  ).animate(delay: 250.ms).fadeIn().slideY(begin: 0.1),
                  const SizedBox(height: 20),
                  // Languages taught
                  const Text(
                    'Languages You Teach',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ).animate(delay: 300.ms).fadeIn(),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _languages.map((lang) {
                      final selected = _teachLanguages.contains(lang);
                      return FilterChip(
                        label: Text(lang),
                        selected: selected,
                        onSelected: (v) {
                          setState(() {
                            if (v) {
                              _teachLanguages.add(lang);
                            } else {
                              _teachLanguages.remove(lang);
                            }
                          });
                        },
                        selectedColor: AppColors.primaryContainer,
                        checkmarkColor: AppColors.primaryGreen,
                        labelStyle: TextStyle(
                          color: selected
                              ? AppColors.primaryGreen
                              : AppColors.textSecondary,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.normal,
                        ),
                        backgroundColor: AppColors.surface,
                        side: BorderSide(
                          color: selected
                              ? AppColors.primaryGreen
                              : AppColors.divider,
                        ),
                      );
                    }).toList(),
                  ).animate(delay: 300.ms).fadeIn(),
                  const SizedBox(height: 20),
                  SpeakooTextField(
                    label: 'Hourly Rate (USD)',
                    hint: 'e.g. 25',
                    controller: _hourlyRateCtrl,
                    prefixIcon: Icons.attach_money,
                    keyboardType: TextInputType.number,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return 'Hourly rate is required';
                      }
                      final rate = double.tryParse(v.trim());
                      if (rate == null || rate <= 0) {
                        return 'Enter a valid rate';
                      }
                      return null;
                    },
                  ).animate(delay: 350.ms).fadeIn().slideY(begin: 0.1),
                ] else ...[
                  // Learner fields
                  const SizedBox(height: 20),
                  _LanguageDropdown(
                    label: 'Native Language',
                    value: _nativeLanguage,
                    languages: _languages,
                    onChanged: (v) => setState(() => _nativeLanguage = v),
                  ).animate(delay: 250.ms).fadeIn().slideY(begin: 0.1),
                  const SizedBox(height: 20),
                  _LanguageDropdown(
                    label: 'Language I Want to Learn',
                    value: _targetLanguage,
                    languages: _languages,
                    onChanged: (v) => setState(() => _targetLanguage = v),
                  ).animate(delay: 300.ms).fadeIn().slideY(begin: 0.1),
                  const SizedBox(height: 20),
                  SpeakooTextField(
                    label: 'Learning Goal',
                    hint: 'e.g. Travel, Business, Academic…',
                    controller: _learningGoalCtrl,
                    prefixIcon: Icons.flag_outlined,
                    maxLines: 3,
                  ).animate(delay: 350.ms).fadeIn().slideY(begin: 0.1),
                ],
                const SizedBox(height: 40),
                PrimaryButton(
                  label: 'Complete Profile',
                  loading: _loading,
                  onPressed: _submit,
                ).animate(delay: 450.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () {
                      final role = _role;
                      if (role == UserRole.tutor) {
                        context.go('/tutor-home');
                      } else {
                        context.go('/home');
                      }
                    },
                    child: const Text(
                      'Skip for now',
                      style: TextStyle(color: AppColors.textHint),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LanguageDropdown extends StatelessWidget {
  final String label;
  final String? value;
  final List<String> languages;
  final ValueChanged<String?> onChanged;

  const _LanguageDropdown({
    required this.label,
    required this.value,
    required this.languages,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          hint: const Text('Select language',
              style: TextStyle(color: AppColors.textHint)),
          items: languages
              .map((l) => DropdownMenuItem(value: l, child: Text(l)))
              .toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.surface,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: AppColors.primaryGreen, width: 2),
            ),
          ),
          dropdownColor: AppColors.surface,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 15),
          icon: const Icon(Icons.keyboard_arrow_down,
              color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
