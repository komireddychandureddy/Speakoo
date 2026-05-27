import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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

  static UserRole roleFromString(String value) {
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
  static const _accessTokenKey = 'access_token';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  AuthState build() => const AuthState(status: AuthStatus.initial);

  Dio get _dio => ref.read(dioClientProvider);

  Future<void> _storeAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  Future<void> _clearAccessToken() async {
    await _storage.delete(key: _accessTokenKey);
  }

  String _extractErrorMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String && message.isNotEmpty) return message;
      if (message is List && message.isNotEmpty && message.first is String) {
        return message.first as String;
      }
    }
    return fallback;
  }

  Future<AuthUser> _fetchCurrentUser() async {
    final response = await _dio.get('/users/me');
    final data = Map<String, dynamic>.from(response.data as Map);
    final profileRaw = data['profile'];
    final profile =
        profileRaw is Map ? Map<String, dynamic>.from(profileRaw) : null;

    final displayName = (profile?['displayName'] as String?)?.trim();
    final email = (data['email'] as String?)?.trim() ?? '';
    final fullName =
        (displayName != null && displayName.isNotEmpty) ? displayName : email;

    return AuthUser(
      id: data['id'] as String,
      email: email,
      fullName: fullName,
      role: AuthUser.roleFromString(data['role'] as String? ?? 'learner'),
      avatarUrl: profile?['avatarUrl'] as String?,
      phoneNumber: data['phoneNumber'] as String?,
      profileComplete: displayName != null && displayName.isNotEmpty,
    );
  }

  Future<void> _authenticateFromTokenResponse(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'];
    if (accessToken is! String || accessToken.isEmpty) {
      throw const FormatException('Missing access token in auth response');
    }

    await _storeAccessToken(accessToken);

    final user = await _fetchCurrentUser();
    final needsSetup = !user.profileComplete;
    state = AuthState(
      status: needsSetup ? AuthStatus.needsProfileSetup : AuthStatus.authenticated,
      user: user,
    );
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      await _authenticateFromTokenResponse(
        Map<String, dynamic>.from(response.data as Map),
      );
    } on DioException catch (e) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _extractErrorMessage(e, 'Login failed'),
      );
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    final hasPhoneInput = phone != null && phone.isNotEmpty;
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'displayName': fullName,
      });

      final responseData = Map<String, dynamic>.from(response.data as Map);
      final accessToken = responseData['accessToken'] as String?;
      if (accessToken != null && accessToken.isNotEmpty) {
        await _storeAccessToken(accessToken);
      }

      state = AuthState(
        status: AuthStatus.needsEmailOtp,
        pendingEmail: email,
        pendingRole: 'learner',
        pendingPhone: hasPhoneInput ? phone : null,
      );
    } on DioException catch (e) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _extractErrorMessage(e, 'Registration failed'),
      );
    }
  }

  Future<void> registerWithPhone({
    required String phone,
    required String fullName,
    required String role,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
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
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _extractErrorMessage(e, 'Phone registration failed'),
      );
    }
  }

  Future<void> verifyEmailOtp({required String email, required String otp}) async {
    final normalizedEmail = email.trim().toLowerCase();
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _dio.post('/auth/verify-email', data: {'code': otp});
      final user = await _fetchCurrentUser();
      state = AuthState(
        status: user.profileComplete ? AuthStatus.authenticated : AuthStatus.needsProfileSetup,
        user: user,
        pendingEmail: normalizedEmail,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        status: AuthStatus.needsEmailOtp,
        errorMessage: _extractErrorMessage(e, 'Verification failed'),
      );
    }
  }

  Future<void> verifyPhoneOtp({required String phone, required String otp}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _dio.post(
        '/auth/verify-phone',
        data: {'phone': phone, 'otp': otp},
      );
      await _authenticateFromTokenResponse(
        Map<String, dynamic>.from(response.data as Map),
      );
    } on DioException catch (e) {
      state = state.copyWith(
        status: AuthStatus.needsPhoneOtp,
        errorMessage: _extractErrorMessage(e, 'Verification failed'),
      );
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
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _dio.post(
        '/auth/social/${provider.toLowerCase()}',
        data: {'token': token},
      );
      await _authenticateFromTokenResponse(
        Map<String, dynamic>.from(response.data as Map),
      );
    } on DioException catch (e) {
      final msg = _extractErrorMessage(e, 'Social login not yet available');
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: msg,
      );
    }
  }

  Future<void> forgotPassword({required String email}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _dio.post('/auth/forgot-password', data: {'email': email});
      state = AuthState(status: AuthStatus.passwordResetSent, pendingEmail: email);
    } on DioException catch (e) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _extractErrorMessage(e, 'Failed to send reset email'),
      );
    }
  }

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _dio.post('/auth/reset-password', data: {
        'email': email,
        'code': otp,
        'newPassword': newPassword,
      });
      state = const AuthState(status: AuthStatus.passwordResetSuccess);
    } on DioException catch (e) {
      state = state.copyWith(
        status: AuthStatus.passwordResetSent,
        errorMessage: _extractErrorMessage(e, 'Password reset failed'),
      );
    }
  }

  Future<void> setupProfile({
    required String country,
    required String language,
    required String timezone,
    String? bio,
    String? address,
  }) async {
    final normalizedBio = (bio != null && bio.isNotEmpty)
        ? bio
        : (address != null && address.isNotEmpty ? address : null);
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _dio.patch('/users/me/profile', data: {
        'countryCode': country,
        'nativeLanguage': language,
        'timezone': timezone,
        if (normalizedBio != null) 'bio': normalizedBio,
      });
      final user = await _fetchCurrentUser();
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } on DioException catch (e) {
      state = state.copyWith(
        status: AuthStatus.needsProfileSetup,
        errorMessage: _extractErrorMessage(e, 'Profile setup failed'),
      );
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {}
    await _clearAccessToken();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void checkAuth() {
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
