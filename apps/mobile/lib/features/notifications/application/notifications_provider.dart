import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class NotificationItem {
  final String id;
  final String type;
  final String channel;
  final DateTime sentAt;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.channel,
    required this.sentAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'system',
      channel: json['channel'] as String? ?? 'email',
      sentAt: DateTime.parse(json['sentAt'] as String).toLocal(),
    );
  }
}

final notificationsProvider = FutureProvider<List<NotificationItem>>((ref) async {
  final dio = ref.read(dioClientProvider);
  final response = await dio.get<List<dynamic>>('/notifications/me');
  return (response.data ?? [])
      .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
      .toList();
});
