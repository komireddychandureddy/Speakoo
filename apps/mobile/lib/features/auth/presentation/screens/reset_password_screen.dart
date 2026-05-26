import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/speakoo_text_field.dart';
import '../../application/auth_provider.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String? email;

  const ResetPasswordScreen({super.key, this.email});

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _otpCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final email = widget.email ??
        ref.read(authProvider).pendingEmail ??
        '';
    await ref.read(authProvider.notifier).resetPassword(
          email: email,
          otp: _otpCtrl.text.trim(),
          newPassword: _passwordCtrl.text,
        );
    if (!mounted) return;
    final st = ref.read(authProvider);
    if (st.status == AuthStatus.passwordResetSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password reset successfully!'),
          backgroundColor: AppColors.primaryGreen,
        ),
      );
      context.go('/login');
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
        leading: BackButton(onPressed: () => context.go('/forgot-password')),
        title: const Text(
          'Reset Password',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enter the code we sent to ${widget.email ?? 'your email'} '
                  'and choose a new password.',
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                ).animate().fadeIn(),
                const SizedBox(height: 32),
                // OTP field
                SpeakooTextField(
                  label: '6-digit Code',
                  hint: '123456',
                  controller: _otpCtrl,
                  prefixIcon: Icons.pin_outlined,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Code is required';
                    if (v.trim().length < 6) return 'Enter the full 6-digit code';
                    return null;
                  },
                ).animate(delay: 100.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 20),
                // New password
                SpeakooTextField(
                  label: 'New Password',
                  hint: '8+ characters',
                  controller: _passwordCtrl,
                  prefixIcon: Icons.lock_outline,
                  obscureText: _obscureNew,
                  suffix: IconButton(
                    icon: Icon(
                      _obscureNew ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.textHint,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscureNew = !_obscureNew),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password is required';
                    if (v.length < 8) return 'Minimum 8 characters';
                    return null;
                  },
                ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 20),
                // Confirm password
                SpeakooTextField(
                  label: 'Confirm Password',
                  hint: 'Same as above',
                  controller: _confirmCtrl,
                  prefixIcon: Icons.lock_outline,
                  obscureText: _obscureConfirm,
                  suffix: IconButton(
                    icon: Icon(
                      _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.textHint,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Please confirm your password';
                    if (v != _passwordCtrl.text) return 'Passwords do not match';
                    return null;
                  },
                ).animate(delay: 300.ms).fadeIn().slideY(begin: 0.1),
                const SizedBox(height: 40),
                PrimaryButton(
                  label: 'Reset Password',
                  loading: loading,
                  onPressed: _submit,
                ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.1),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
