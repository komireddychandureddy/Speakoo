import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/speakoo_logo.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../application/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late TabController _tabCtrl;

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  bool _obscure = true;
  bool _obscureConfirm = true;
  String _role = 'learner';
  String _countryCode = '+1';

  static const _countryCodes = [
    '+1', '+44', '+91', '+61', '+33', '+49', '+81', '+86', '+55', '+52',
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_tabCtrl.index == 0) {
      // Email tab - can optionally include phone number
      final phoneInput = _phoneCtrl.text.trim();
      final fullPhone = phoneInput.isNotEmpty ? '$_countryCode$phoneInput' : null;
      
      await ref.read(authProvider.notifier).register(
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
            fullName: _nameCtrl.text.trim(),
            phoneNumber: fullPhone,
          );
    } else {
      await ref.read(authProvider.notifier).registerWithPhone(
            phone: '$_countryCode${_phoneCtrl.text.trim()}',
            fullName: _nameCtrl.text.trim(),
            role: _role,
          );
    }
    if (!mounted) return;
    final st = ref.read(authProvider);
    if (st.status == AuthStatus.needsEmailOtp ||
        st.status == AuthStatus.needsPhoneOtp) {
      context.go('/otp-verify');
    } else if (st.errorMessage != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(st.errorMessage!)));
    }
  }

  Future<void> _socialLogin(String provider) async {
    // Call the auth provider to attempt social login
    // The provider will return the backend error message
    await ref.read(authProvider.notifier).socialLogin(
      provider: provider,
      token: 'temp_token_pending_oauth_sdk',
    );
    final state = ref.read(authProvider);
    if (state.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.errorMessage!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = ref.watch(authProvider).status == AuthStatus.loading;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Center(
                  child: const SpeakooLogo(size: 56, showText: true)
                      .animate()
                      .fadeIn(duration: 500.ms),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ).animate(delay: 100.ms).fadeIn().slideX(begin: -0.1),
                const SizedBox(height: 4),
                const Text(
                  'Join millions of language learners worldwide',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ).animate(delay: 150.ms).fadeIn(),
                const SizedBox(height: 20),
                const Text('I want to',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _RoleChip(
                      label: '📖 Learn',
                      selected: _role == 'learner',
                      onTap: () => setState(() => _role = 'learner'),
                    ),
                    const SizedBox(width: 12),
                    _RoleChip(
                      label: '🎓 Teach',
                      selected: _role == 'tutor',
                      onTap: () => setState(() => _role = 'tutor'),
                    ),
                  ],
                ).animate(delay: 200.ms).fadeIn(),
                const SizedBox(height: 20),
                SpeakooTextField(
                  label: 'Full Name',
                  hint: 'John Doe',
                  controller: _nameCtrl,
                  prefixIcon: Icons.person_outline,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                ).animate(delay: 250.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabCtrl,
                    indicatorSize: TabBarIndicatorSize.tab,
                    indicator: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: AppColors.textSecondary,
                    dividerColor: Colors.transparent,
                    tabs: const [
                      Tab(text: 'Email'),
                      Tab(text: 'Phone Number'),
                    ],
                  ),
                ).animate(delay: 300.ms).fadeIn(),
                const SizedBox(height: 16),
                SizedBox(
                  height: 420,
                  child: TabBarView(
                    controller: _tabCtrl,
                    children: [
                      _EmailFields(
                        emailCtrl: _emailCtrl,
                        passwordCtrl: _passwordCtrl,
                        confirmCtrl: _confirmCtrl,
                        phoneCtrl: _phoneCtrl,
                        countryCode: _countryCode,
                        countryCodes: _countryCodes,
                        obscure: _obscure,
                        obscureConfirm: _obscureConfirm,
                        onToggleObscure: () =>
                            setState(() => _obscure = !_obscure),
                        onToggleConfirm: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                        onCodeChanged: (c) => setState(() => _countryCode = c!),
                      ),
                      _PhoneFields(
                        phoneCtrl: _phoneCtrl,
                        countryCode: _countryCode,
                        countryCodes: _countryCodes,
                        onCodeChanged: (c) => setState(() => _countryCode = c!),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                PrimaryButton(
                  label: 'Create Account',
                  loading: loading,
                  onPressed: _submit,
                ).animate(delay: 400.ms).fadeIn(),
                const SizedBox(height: 20),
                const _OrDivider(),
                const SizedBox(height: 16),
                _SocialRow(onTap: _socialLogin),
                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text.rich(TextSpan(
                      text: 'Already have an account? ',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 13),
                      children: [
                        TextSpan(
                          text: 'Sign In',
                          style: TextStyle(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    )),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Helper Widgets ────────────────────────────────────────────────────────────

class _ETextEditingController phoneCtrl;
  final String countryCode;
  final List<String> countryCodes;
  final bool obscure;
  final bool obscureConfirm;
  final VoidCallback onToggleObscure;
  final VoidCallback onToggleConfirm;
  final ValueChanged<String?> onCodeChanged;

  const _EmailFields({
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.confirmCtrl,
    required this.phoneCtrl,
    required this.countryCode,
    required this.countryCodes,
    required this.obscure,
    required this.obscureConfirm,
    required this.onToggleObscure,
    required this.onToggleConfirm,
    required this.onCodeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SpeakooTextField(
          label: 'Email Address',
          hint: 'you@example.com',
          controller: emailCtrl,
          prefixIcon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
          validator: (v) {
            if (v == null || v.trim().isEmpty) return 'Email is required';
            if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(v.trim())) {
              return 'Enter a valid email';
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        const Text('Phone Number (Optional)',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 54,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.divider),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: countryCode,
                  items: countryCodes
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: onCodeChanged,
                  style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w500),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: SpeakooTextField(
                label: '',
                hint: '555 123 4567',
                controller: phoneCtrl,
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (v) {
                  // Optional field - only validate if not empty
                  if (v != null && v.trim().isNotEmpty && v.trim().length < 7) {
                    return 'Enter a valid number';
                  }
                  return null;
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12
            return null;
          },
        ),
        const SizedBox(height: 10),
        SpeakooTextField(
          label: 'Password',
          hint: 'Min. 8 characters',
          controller: passwordCtrl,
          obscureText: obscure,
          prefixIcon: Icons.lock_outline,
          suffix: IconButton(
            icon: Icon(
                obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 20),
            onPressed: onToggleObscure,
          ),
          validator: (v) {
            if (v == null || v.isEmpty) return 'Password is required';
            if (v.length < 8) return 'Minimum 8 characters';
            return null;
          },
        ),
        const SizedBox(height: 10),
        SpeakooTextField(
          label: 'Confirm Password',
          hint: 'Re-enter password',
          controller: confirmCtrl,
          obscureText: obscureConfirm,
          prefixIcon: Icons.lock_outline,
          suffix: IconButton(
            icon: Icon(
                obscureConfirm
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20),
            onPressed: onToggleConfirm,
          ),
          validator: (v) {
            if (v == null || v.isEmpty) return 'Please confirm password';
            if (v != passwordCtrl.text) return 'Passwords do not match';
            return null;
          },
        ),
      ],
    );
  }
}

class _PhoneFields extends StatelessWidget {
  final TextEditingController phoneCtrl;
  final String countryCode;
  final List<String> countryCodes;
  final ValueChanged<String?> onCodeChanged;

  const _PhoneFields({
    required this.phoneCtrl,
    required this.countryCode,
    required this.countryCodes,
    required this.onCodeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Phone Number',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary)),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 54,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.divider),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: countryCode,
                  items: countryCodes
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: onCodeChanged,
                  style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w500),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: SpeakooTextField(
                label: '',
                hint: '555 123 4567',
                controller: phoneCtrl,
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Phone is required';
                  if (v.trim().length < 7) return 'Enter a valid number';
                  return null;
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primaryContainer,
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: AppColors.primaryGreen),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'We will send a verification code to this number.',
                  style: TextStyle(fontSize: 12, color: AppColors.primaryDark),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SocialRow extends StatelessWidget {
  final void Function(String) onTap;

  const _SocialRow({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: _SocialBtn(
                label: 'Google',
                letter: 'G',
                color: const Color(0xFFDB4437),
                onTap: () => onTap('google'))),
        const SizedBox(width: 8),
        Expanded(
            child: _SocialBtn(
                label: 'Apple',
                iconData: Icons.apple,
                color: Colors.black87,
                onTap: () => onTap('apple'))),
        const SizedBox(width: 8),
        Expanded(
            child: _SocialBtn(
                label: 'Facebook',
                letter: 'f',
                color: const Color(0xFF1877F2),
                onTap: () => onTap('facebook'))),
      ],
    );
  }
}

class _SocialBtn extends StatelessWidget {
  final String label;
  final String? letter;
  final IconData? iconData;
  final Color color;
  final VoidCallback onTap;

  const _SocialBtn({
    required this.label,
    required this.color,
    required this.onTap,
    this.letter,
    this.iconData,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 10),
        side: const BorderSide(color: AppColors.divider),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          iconData != null
              ? Icon(iconData, size: 20, color: color)
              : Text(letter!,
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryGreen : AppColors.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: selected ? AppColors.primaryGreen : AppColors.divider,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            color: selected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Expanded(child: Divider(color: AppColors.divider)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text('or sign up with',
              style: TextStyle(fontSize: 12, color: AppColors.textHint)),
        ),
        Expanded(child: Divider(color: AppColors.divider)),
      ],
    );
  }
}
