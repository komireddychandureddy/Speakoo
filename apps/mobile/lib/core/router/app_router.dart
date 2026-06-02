import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/auth/application/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/otp_verify_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/reset_password_screen.dart';
import '../../features/tutor_dashboard/presentation/screens/tutor_home_screen.dart';
import '../../features/admin/presentation/screens/admin_dashboard_screen.dart';
import '../../features/home/presentation/screens/learner_home_screen.dart';
import '../../features/booking/presentation/screens/tutor_search_screen.dart';
import '../../features/booking/presentation/screens/booking_confirm_screen.dart';
import '../../features/booking/presentation/screens/my_bookings_screen.dart';
import '../../features/session/presentation/screens/session_room_screen.dart';
import '../../features/session/presentation/screens/session_complete_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/profile_setup_screen.dart';
import '../../features/profile/presentation/screens/wallet_screen.dart';
import '../../features/tutors/presentation/screens/tutor_profile_screen.dart';
import '../../features/notifications/presentation/screens/notification_center_screen.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(AppRouterRef ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isSplash = state.matchedLocation == '/splash';
      final isOnboarding = state.matchedLocation == '/onboarding';
      final isAuth = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/forgot-password' ||
          state.matchedLocation.startsWith('/reset-password') ||
          state.matchedLocation.startsWith('/verify-otp');

      if (authState.status == AuthStatus.initial || isSplash) {
        return isSplash ? null : '/splash';
      }

      if (authState.status == AuthStatus.unauthenticated) {
        if (isAuth || isOnboarding) return null;
        return '/onboarding';
      }

      // Authenticated — send away from auth screens to role-appropriate home
      if (isAuth || isOnboarding || isSplash) {
        final role = authState.user?.role;
        if (role == UserRole.tutor) return '/tutor-home';
        if (role == UserRole.admin) return '/admin';
        return '/home';
      }

      final role = authState.user?.role;
      final isTutorArea = state.matchedLocation.startsWith('/tutor-home');
      final isAdminArea = state.matchedLocation.startsWith('/admin');

      if (isTutorArea && role != UserRole.tutor && role != UserRole.admin) {
        return '/home';
      }

      if (isAdminArea && role != UserRole.admin) {
        return role == UserRole.tutor ? '/tutor-home' : '/home';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
        path: '/verify-otp',
        builder: (_, state) => OtpVerifyScreen(
          email: state.uri.queryParameters['email'],
        ),
      ),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password',
        builder: (_, state) => ResetPasswordScreen(
          email: state.uri.queryParameters['email'],
        ),
      ),
      GoRoute(path: '/profile-setup', builder: (_, __) => const ProfileSetupScreen()),

      // Learner routes
      GoRoute(path: '/home', builder: (_, __) => const LearnerHomeScreen()),
      GoRoute(path: '/tutors', builder: (_, __) => const TutorSearchScreen()),
      GoRoute(
        path: '/tutors/:tutorId',
        builder: (_, state) => TutorProfileScreen(
          tutorId: state.pathParameters['tutorId']!,
        ),
      ),
      GoRoute(
        path: '/bookings/confirm',
        builder: (_, state) => BookingConfirmScreen(
          tutorId: state.uri.queryParameters['tutorId'],
        ),
      ),
      GoRoute(path: '/my-bookings', builder: (_, __) => const MyBookingsScreen()),
      GoRoute(
        path: '/sessions/:bookingId',
        builder: (_, state) => SessionRoomScreen(
          bookingId: state.pathParameters['bookingId']!,
        ),
      ),
      GoRoute(
        path: '/session-complete/:bookingId',
        builder: (_, state) => SessionCompleteScreen(
          bookingId: state.pathParameters['bookingId']!,
        ),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationCenterScreen()),

      // Tutor routes
      GoRoute(path: '/tutor-home', builder: (_, __) => const TutorHomeScreen()),

      // Admin routes
      GoRoute(path: '/admin', builder: (_, __) => const AdminDashboardScreen()),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.uri}')),
    ),
  );
}
