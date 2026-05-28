import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/speakoo_logo.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../application/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierCtrl = TextEditingController(); // Email or Phone
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _identifierCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  bool _isPhoneNumber(String value) {
    // Simple check: starts with + and contains only digits after
    return RegExp(r'^\+[1-9]\d{7,14}$').hasMatch(value);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final identifier = _identifierCtrl.text.trim();
    final isPhone = _isPhoneNumber(identifier);
    
    await ref.read(authProvider.notifier).login(
          email: isPhone ? null : identifier,
          phone: isPhone ? identifier : null,
          password: _passwordCtrl.text,
        );
    if (!mounted) return;
    final state = ref.read(authProvider);
    if (state.status == AuthStatus.needsProfileSetup) {
      context.go('/profile-setup');
    } else if (state.isAuthenticated) {
      switch (state.user?.role) {
        case UserRole.tutor:
          context.go('/tutor-home');
        case UserRole.admin:
          context.go('/admin');
        default:
          context.go('/home');
      }
    } else if (state.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.errorMessage!)),
      );
    }
  }

  Future<void> _socialLogin(String provider) async {
    // TODO: Integrate proper OAuth SDKs (google_sign_in, sign_in_with_apple, flutter_facebook_sdk)
    // For now, show the backend error message
    await ref.read(authProvider.notifier).socialLogin(
      provider: provider,
      token: 'temp_token_pending_oauth_sdk',
    );
    if (!mounted) return;
    final state = ref.read(authProvider);
    if (state.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.errorMessage!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final loading = authState.status == AuthStatus.loading;

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
                const SizedBox(height: 24),
                Center(
                  child: const SpeakooLogo(size: 72, showText: true)
                      .animate()
                      .fadeIn(duration: 600.ms)
                      .scale(begin: const Offset(0.85, 0.85)),
                ),
                const SizedBox(height: 40),
                const Text(
                  'Welcome back! 👋',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ).animate(delay: 200.ms).fadeIn().slideX(begin: -0.1),
                const SizedBox(height: 6),
                const Text(
                  'Sign in to continue your language journey',
                  style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
                ).animate(delay: 300.ms).fadeIn(),
                const SizedBox(height: 36),
                SpeakooTextField(
                  label: 'Email or Phone Number',
                  hint: 'you@example.com or +12025550100',
                  controller: _identifierCtrl,
                  prefixIcon: Icons.person_outline,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Email or phone number is required';
                    }
                    final trimmed = v.trim();
                    // Check if it's a phone number format
                    final phoneRx = RegExp(r'^\+[1-9]\d{7,14}$');
                    final emailRx = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
                    
                    if (!phoneRx.hasMatch(trimmed) && !emailRx.hasMatch(trimmed)) {
                      return 'Enter a valid email or phone (E.164 format: +12025550100)';
                    }
                    return null;
                  },
                ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 18),
                SpeakooTextField(
                  label: 'Password',
                  hint: '••••••••',
                  controller: _passwordCtrl,
                  obscureText: _obscure,
                  prefixIcon: Icons.lock_outline,
                  suffix: IconButton(
                    icon: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password is required';
                    if (v.length < 6) return 'Minimum 6 characters';
                    return null;
                  },
                ).animate(delay: 500.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.go('/forgot-password'),
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(color: AppColors.primaryGreen),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Sign In',
                  loading: loading,
                  onPressed: _submit,
                ).animate(delay: 600.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 24),
                const _OrDivider(),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlineButton(
                        label: 'Google',
                        icon: const Text('G',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                                color: AppColors.error)),
                        onPressed: () => _socialLogin('google'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlineButton(
                        label: 'Apple',
                        icon: const Icon(Icons.apple, size: 18,
                            color: AppColors.textPrimary),
                        onPressed: () => _socialLogin('apple'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Center(
                  child: TextButton(
                    onPressed: () => context.go('/register'),
                    child: const Text.rich(
                      TextSpan(
                        text: "Don't have an account? ",
                        style: TextStyle(color: AppColors.textSecondary),
                        children: [
                          TextSpan(
                            text: 'Sign Up',
                            style: TextStyle(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
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

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.divider)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'or',
            style: TextStyle(color: AppColors.textHint, fontSize: 13),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.divider)),
      ],
    );
  }
}

