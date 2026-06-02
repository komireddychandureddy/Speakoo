import 'package:dio/dio.dart';

class TutorAvailabilitySlot {
  final String id;
  final DateTime startTime;
  final DateTime endTime;
  final String status;

  const TutorAvailabilitySlot({
    required this.id,
    required this.startTime,
    required this.endTime,
    required this.status,
  });

  factory TutorAvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return TutorAvailabilitySlot(
      id: json['id'] as String,
      startTime: DateTime.parse(json['startTime'] as String).toLocal(),
      endTime: DateTime.parse(json['endTime'] as String).toLocal(),
      status: json['status'] as String? ?? 'available',
    );
  }
}

class TutorDashboardRepository {
  final Dio _dio;

  TutorDashboardRepository(this._dio);

  Future<List<TutorAvailabilitySlot>> getMySlots() async {
    final response = await _dio.get<List<dynamic>>('/tutors/slots');
    return (response.data ?? [])
        .map((e) => TutorAvailabilitySlot.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TutorAvailabilitySlot> createSlot({
    required DateTime start,
    required DateTime end,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>('/tutors/slots', data: {
      'startTime': start.toUtc().toIso8601String(),
      'endTime': end.toUtc().toIso8601String(),
    });
    return TutorAvailabilitySlot.fromJson(response.data!);
  }

  Future<Map<String, dynamic>> getWalletTransactions() async {
    final response = await _dio.get<Map<String, dynamic>>('/payments/wallet/transactions');
    return response.data ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> getConnectOnboardingUrl() async {
    final response = await _dio.post<Map<String, dynamic>>('/payments/connect/onboard');
    return response.data ?? <String, dynamic>{};
  }
}
