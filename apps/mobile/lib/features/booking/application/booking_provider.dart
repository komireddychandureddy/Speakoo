import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/booking_repository.dart';
import '../data/models/booking_model.dart';

// ---------------------------------------------------------------------------
// Repository provider
// ---------------------------------------------------------------------------
final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepository(ref.read(dioClientProvider));
});

// ---------------------------------------------------------------------------
// My bookings — fetches all bookings for the current user
// ---------------------------------------------------------------------------
final myBookingsProvider = FutureProvider<List<BookingModel>>((ref) async {
  return ref.read(bookingRepositoryProvider).getMyBookings();
});

// ---------------------------------------------------------------------------
// Single booking — used in session room
// ---------------------------------------------------------------------------
final bookingByIdProvider =
    FutureProvider.family<BookingModel, String>((ref, bookingId) async {
  return ref.read(bookingRepositoryProvider).getBooking(bookingId);
});

// ---------------------------------------------------------------------------
// Booking creation notifier
// ---------------------------------------------------------------------------
class BookingCreationNotifier
    extends AsyncNotifier<BookingModel?> {
  @override
  Future<BookingModel?> build() async => null;

  Future<BookingModel?> createBooking({
    required String slotId,
    required String tutorId,
    required String language,
  }) async {
    state = const AsyncLoading();
    final repo = ref.read(bookingRepositoryProvider);
    state = await AsyncValue.guard(
      () => repo.createBooking(
        slotId: slotId,
        tutorId: tutorId,
        language: language,
      ),
    );
    // Invalidate list so MyBookingsScreen refreshes
    ref.invalidate(myBookingsProvider);
    return state.valueOrNull;
  }
}

final bookingCreationProvider =
    AsyncNotifierProvider<BookingCreationNotifier, BookingModel?>(
  BookingCreationNotifier.new,
);

// ---------------------------------------------------------------------------
// Cancellation notifier
// ---------------------------------------------------------------------------
class BookingCancellationNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> cancel(String bookingId) async {
    state = const AsyncLoading();
    final repo = ref.read(bookingRepositoryProvider);
    state = await AsyncValue.guard(() => repo.cancelBooking(bookingId));
    ref.invalidate(myBookingsProvider);
  }
}

final bookingCancellationProvider =
    AsyncNotifierProvider<BookingCancellationNotifier, void>(
  BookingCancellationNotifier.new,
);
