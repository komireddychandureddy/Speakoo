import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../application/auth_provider.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  /// Either [email] or [phone] must be provided (not both).
  final String? email;
  final String? phone;

  const OtpVerifyScreen({super.key, this.email, this.phone})
      : assert(email != null || phone != null,
            'OtpVerifyScreen requires email or phone');

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  static const _otpLength = 6;
  final List<TextEditingController> _ctrlList =
      List.generate(_otpLength, (_) => TextEditingController());
  final List<FocusNode> _focusList =
      List.generate(_otpLength, (_) => FocusNode());

  int _resendSeconds = 60;
  Timer? _timer;

  bool get _isEmail => widget.email != null;
  String get _target => _isEmail ? widget.email! : widget.phone!;
  String get _masked {
    if (_isEmail) {
      final parts = _target.split('@');
      if (parts.length != 2) return _target;
      final local = parts[0];
      final masked =
          local.length > 2 ? '${local[0]}***${local[local.length - 1]}' : local;
      return '$masked@${parts[1]}';
    }
    // Phone: show last 4 digits
    return '****${_target.substring(_target.length > 4 ? _target.length - 4 : 0)}';
  }

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _ctrlList) {
      c.dispose();
    }
    for (final f in _focusList) {
      f.dispose();
    }
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _resendSeconds = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendSeconds <= 1) {
        t.cancel();
        setState(() => _resendSeconds = 0);
      } else {
        setState(() => _resendSeconds--);
      }
    });
  }

  String get _otp => _ctrlList.map((c) => c.text).join();

  void _onDigitInput(int index, String value) {
    if (value.isEmpty) {
      if (index > 0) _focusList[index - 1].requestFocus();
      return;
    }
    if (index < _otpLength - 1) {
      _focusList[index + 1].requestFocus();
    } else {
      _focusList[index].unfocus();
    }
    setState(() {});
  }

  Future<void> _submit() async {
    if (_otp.length < _otpLength) return;
    final notifier = ref.read(authProvider.notifier);
    if (_isEmail) {
      await notifier.verifyEmailOtp(email: _target, otp: _otp);
    } else {
      await notifier.verifyPhoneOtp(phone: _target, otp: _otp);
    }
    if (!mounted) return;
    final st = ref.read(authProvider);
    if (st.status == AuthStatus.needsProfileSetup) {
      context.go('/profile-setup');
    } else if (st.isAuthenticated) {
      switch (st.user?.role) {
        case UserRole.tutor:
          context.go('/tutor-home');
        case UserRole.admin:
          context.go('/admin');
        default:
          context.go('/home');
      }
    } else if (st.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(st.errorMessage!),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _resend() async {
    if (_resendSeconds > 0) return;
    final notifier = ref.read(authProvider.notifier);
    await notifier.resendOtp(
      email: _isEmail ? _target : null,
      phone: _isEmail ? null : _target,
    );
    _startTimer();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification code resent')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final loading = authState.status == AuthStatus.loading;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        leading: BackButton(onPressed: () => context.go('/register')),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 24),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.mark_email_unread_outlined,
                  size: 40,
                  color: AppColors.primaryGreen,
                ),
              )
                  .animate()
                  .fadeIn(duration: 500.ms)
                  .scale(begin: const Offset(0.7, 0.7)),
              const SizedBox(height: 28),
              Text(
                'Verify Your ${_isEmail ? 'Email' : 'Phone'}',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ).animate(delay: 100.ms).fadeIn().slideY(begin: 0.1),
              const SizedBox(height: 10),
              Text(
                'We sent a 6-digit code to\n$_masked',
                style: const TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ).animate(delay: 200.ms).fadeIn(),
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_otpLength, (i) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 5),
                    child: SizedBox(
                      width: 46,
                      height: 56,
                      child: TextFormField(
                        controller: _ctrlList[i],
                        focusNode: _focusList[i],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 1,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        onChanged: (v) => _onDigitInput(i, v),
                        decoration: InputDecoration(
                          counterText: '',
                          filled: true,
                          fillColor: AppColors.surface,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                const BorderSide(color: AppColors.divider),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                const BorderSide(color: AppColors.divider),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                                color: AppColors.primaryGreen, width: 2),
                          ),
                        ),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  );
                }),
              ).animate(delay: 300.ms).fadeIn().slideY(begin: 0.1),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  label: 'Verify',
                  loading: loading,
                  onPressed: _otp.length == _otpLength ? _submit : null,
                ),
              ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.1),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Didn't receive the code? ",
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  if (_resendSeconds > 0)
                    Text(
                      'Resend in ${_resendSeconds}s',
                      style: const TextStyle(color: AppColors.textHint),
                    )
                  else
                    GestureDetector(
                      onTap: _resend,
                      child: const Text(
                        'Resend',
                        style: TextStyle(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ).animate(delay: 500.ms).fadeIn(),
            ],
          ),
        ),
      ),
    );
  }
}
