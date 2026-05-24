import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/booking/presentation/screens/tutor_search_screen.dart';
import '../../features/booking/presentation/screens/booking_confirm_screen.dart';
import '../../features/session/presentation/screens/session_room_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(AppRouterRef ref) {
  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      // TODO: check auth state from Riverpod provider
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/tutors', builder: (_, __) => const TutorSearchScreen()),
      GoRoute(
        path: '/bookings/:bookingId/confirm',
        builder: (_, state) => BookingConfirmScreen(
          bookingId: state.pathParameters['bookingId']!,
        ),
      ),
      GoRoute(
        path: '/sessions/:bookingId',
        builder: (_, state) => SessionRoomScreen(
          bookingId: state.pathParameters['bookingId']!,
        ),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.uri}')),
    ),
  );
}
