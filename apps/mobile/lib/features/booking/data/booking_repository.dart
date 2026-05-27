import 'package:dio/dio.dart';
import '../models/booking_model.dart';

class BookingRepository {
  final Dio _dio;
  BookingRepository(this._dio);

  /// Returns all bookings for the current learner.
  Future<List<BookingModel>> getMyBookings() async {
    final response = await _dio.get('/bookings');
    final list = response.data as List<dynamic>;
    return list
        .map((e) => BookingModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Returns a single booking by ID (for the session room).
  Future<BookingModel> getBooking(String bookingId) async {
    final response = await _dio.get('/bookings/$bookingId');
    return BookingModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Creates a booking for a given slot.
  /// [tutorId] and [language] are sent to the backend.
  Future<BookingModel> createBooking({
    required String slotId,
    required String tutorId,
    required String language,
  }) async {
    final response = await _dio.post('/bookings', data: {
      'slotId': slotId,
      'tutorId': tutorId,
      'language': language,
    });
    return BookingModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Cancels a booking by ID.
  Future<void> cancelBooking(String bookingId) async {
    await _dio.delete('/bookings/$bookingId/cancel');
  }
}
