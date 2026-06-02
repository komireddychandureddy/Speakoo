import 'package:dio/dio.dart';

class SessionRepository {
  final Dio _dio;

  SessionRepository(this._dio);

  Future<String> getSessionToken(String bookingId) async {
    final response = await _dio.get<String>('/sessions/$bookingId/token');
    final data = response.data;
    if (data is String) return data;
    return '';
  }

  Future<void> startRecording(String bookingId) async {
    await _dio.post('/sessions/$bookingId/recording/start');
  }

  Future<void> stopRecording(String bookingId, {String? recordingUrl}) async {
    await _dio.post('/sessions/$bookingId/recording/stop', data: {
      if (recordingUrl != null && recordingUrl.isNotEmpty) 'recordingUrl': recordingUrl,
    });
  }

  Future<void> registerDeviceToken(String token) async {
    await _dio.post('/notifications/device-token', data: {'token': token});
  }
}
