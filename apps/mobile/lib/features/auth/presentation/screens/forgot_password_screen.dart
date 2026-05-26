import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../application/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref
        .read(authProvider.notifier)
        .forgotPassword(email: _emailCtrl.text.trim());
    if (!mounted) return;
    final st = ref.read(authProvider);
    if (st.status == AuthStatus.passwordResetSent) {
      setState(() => _sent = true);
    } else if (st.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(st.errorMessage!),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading =
        ref.watch(authProvider).status == AuthStatus.loading;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        leading: BackButton(onPressed: () => context.go('/login')),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
          child: _sent ? _SuccessView(email: _emailCtrl.text.trim()) : _FormView(
            formKey: _formKey,
            emailCtrl: _emailCtrl,
            loading: loading,
            onSubmit: _submit,
          ),
        ),
      ),
    );
  }
}

class _FormView extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailCtrl;
  final bool loading;
  final VoidCallback onSubmit;

  const _FormView({
    required this.formKey,
    required this.emailCtrl,
    required this.loading,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              color: AppColors.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock_reset_outlined,
              size: 36,
              color: AppColors.primaryGreen,
            ),
          ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.7, 0.7)),
          const SizedBox(height: 28),
          const Text(
            'Forgot Password?',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ).animate(delay: 100.ms).fadeIn().slideX(begin: -0.1),
          const SizedBox(height: 8),
          const Text(
            'Enter your email and we\'ll send a reset link.',
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
          ).animate(delay: 200.ms).fadeIn(),
          const SizedBox(height: 36),
          SpeakooTextField(
            label: 'Email Address',
            hint: 'you@example.com',
            controller: emailCtrl,
            prefixIcon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Email is required';
              final emailRx = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
              if (!emailRx.hasMatch(v.trim())) return 'Enter a valid email';
              return null;
            },
          ).animate(delay: 300.ms).fadeIn().slideY(begin: 0.1),
          const SizedBox(height: 32),
          PrimaryButton(
            label: 'Send Reset Link',
            loading: loading,
            onPressed: onSubmit,
          ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.1),
          const SizedBox(height: 20),
          Center(
            child: TextButton(
              onPressed: () => context.go('/login'),
              child: const Text.rich(
                TextSpan(
                  text: 'Remember your password? ',
                  style: TextStyle(color: AppColors.textSecondary),
                  children: [
                    TextSpan(
                      text: 'Sign In',
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
    );
  }
}

class _SuccessView extends StatelessWidget {
  final String email;
  const _SuccessView({required this.email});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 60),
        const Icon(
          Icons.check_circle_outline,
          size: 80,
          color: AppColors.primaryGreen,
        ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.5, 0.5)),
        const SizedBox(height: 24),
        const Text(
          'Check Your Email',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          textAlign: TextAlign.center,
        ).animate(delay: 200.ms).fadeIn(),
        const SizedBox(height: 12),
        Text(
          'We sent a password reset link to\n$email',
          style: const TextStyle(
            fontSize: 15,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ).animate(delay: 300.ms).fadeIn(),
        const SizedBox(height: 48),
        SizedBox(
          width: double.infinity,
          child: PrimaryButton(
            label: 'Back to Sign In',
            onPressed: () => context.go('/login'),
          ),
        ).animate(delay: 400.ms).fadeIn(),
      ],
    );
  }
}
