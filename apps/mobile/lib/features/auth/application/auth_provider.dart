import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import 'package:dio/dio.dart';

enum UserRole { learner, tutor, admin }

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  needsEmailOtp,
  needsPhoneOtp,
  needsProfileSetup,
  passwordResetSent,
  passwordResetSuccess,
}

class AuthUser {
  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String? avatarUrl;
  final String? phoneNumber;
  final bool profileComplete;

  const AuthUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
    this.phoneNumber,
    this.profileComplete = false,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: _roleFromString(json['role'] as String? ?? 'learner'),
      avatarUrl: json['avatarUrl'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      profileComplete: json['profileComplete'] as bool? ?? false,
    );
  }

  static UserRole _roleFromString(String value) {
    switch (value) {
      case 'tutor':
        return UserRole.tutor;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.learner;
    }
  }
}

class AuthState {
  final AuthStatus status;
  final AuthUser? user;
  final String? errorMessage;
  final String? pendingEmail;
  final String? pendingPhone;
  final String? pendingRole;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
    this.pendingEmail,
    this.pendingPhone,
    this.pendingRole,
  });

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    String? errorMessage,
    String? pendingEmail,
    String? pendingPhone,
    String? pendingRole,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
      pendingEmail: pendingEmail ?? this.pendingEmail,
      pendingPhone: pendingPhone ?? this.pendingPhone,
      pendingRole: pendingRole ?? this.pendingRole,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState(status: AuthStatus.initial);

  Dio get _dio => ref.read(dioClientProvider);

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      final user = AuthUser.fromJson(
        response.data['user'] as Map<String, dynamic>,
      );
      final needsSetup = !user.profileComplete;
      state = AuthState(
        status: needsSetup ? AuthStatus.needsProfileSetup : AuthStatus.authenticated,
        user: user,
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Login failed';
      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
    String? phone,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'fullName': fullName,
        'role': role,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      });
      state = AuthState(
        status: AuthStatus.needsEmailOtp,
        pendingEmail: email,
        pendingRole: role,
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Registration failed';
      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
  }

  Future<void> registerWithPhone({
    required String phone,
    required String fullName,
    required String role,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _dio.post('/auth/register-phone', data: {
        'phone': phone,
        'fullName': fullName,
        'role': role,
      });
      state = AuthState(
        status: AuthStatus.needsPhoneOtp,
        pendingPhone: phone,
        pendingRole: role,
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Registration failed';
      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
  }

  Future<void> verifyEmailOtp({required String email, required String otp}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _dio.post(
        '/auth/verify-email',
        data: {'email': email, 'otp': otp},
      );
      final user = AuthUser.fromJson(response.data['user'] as Map<String, dynamic>);
      state = AuthState(
        status: user.profileComplete ? AuthStatus.authenticated : AuthStatus.needsProfileSetup,
        user: user,
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Verification failed';
      state = state.copyWith(status: AuthStatus.needsEmailOtp, errorMessage: msg);
    }
  }

  Future<void> verifyPhoneOtp({required String phone, required String otp}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _dio.post(
        '/auth/verify-phone',
        data: {'phone': phone, 'otp': otp},
      );
      final user = AuthUser.fromJson(response.data['user'] as Map<String, dynamic>);
      state = AuthState(status: AuthStatus.needsProfileSetup, user: user);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Verification failed';
      state = state.copyWith(status: AuthStatus.needsPhoneOtp, errorMessage: msg);
    }
  }

  Future<void> resendOtp({String? email, String? phone}) async {
    try {
      if (email != null) {
        await _dio.post('/auth/resend-email-otp', data: {'email': email});
      } else if (phone != null) {
        await _dio.post('/auth/resend-phone-otp', data: {'phone': phone});
      }
    } on DioException catch (_) {}
  }

  Future<void> socialLogin({required String provider, required String token}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _dio.post(
        '/auth/social/$provider',
        data: {'token': token},
      );
      final user = AuthUser.fromJson(response.data['user'] as Map<String, dynamic>);
      state = AuthState(
        status: user.profileComplete ? AuthStatus.authenticated : AuthStatus.needsProfileSetup,
        user: user,
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Social login failed';
      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
  }

  Future<void> forgotPassword({required String email}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _dio.post('/auth/forgot-password', data: {'email': email});
      state = AuthState(status: AuthStatus.passwordResetSent, pendingEmail: email);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Failed to send reset email';
      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
  }

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _dio.post('/auth/reset-password', data: {
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      });
      state = const AuthState(status: AuthStatus.passwordResetSuccess);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Password reset failed';
      state = state.copyWith(status: AuthStatus.passwordResetSent, errorMessage: msg);
    }
  }

  Future<void> setupProfile({
    required String country,
    required String language,
    required String timezone,
    String? bio,
    String? address,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _dio.patch('/users/profile/setup', data: {
        'country': country,
        'language': language,
        'timezone': timezone,
        if (bio != null && bio.isNotEmpty) 'bio': bio,
        if (address != null && address.isNotEmpty) 'address': address,
      });
      final user = AuthUser.fromJson(response.data['user'] as Map<String, dynamic>);
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Profile setup failed';
      state = state.copyWith(status: AuthStatus.needsProfileSetup, errorMessage: msg);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {}
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void checkAuth() {
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
