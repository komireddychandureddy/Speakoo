/// Booking model matching the backend Booking schema.
class BookingModel {
  final String id;
  final String tutorId;
  final String learnerId;
  final String slotId;
  final String language;
  final String status; // confirmed | in_session | completed | cancelled
  final int priceCents;
  final int platformFeeCents;
  final String livekitRoom;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String? tutorDisplayName;
  final String? tutorAvatarUrl;

  const BookingModel({
    required this.id,
    required this.tutorId,
    required this.learnerId,
    required this.slotId,
    required this.language,
    required this.status,
    required this.priceCents,
    required this.platformFeeCents,
    required this.livekitRoom,
    required this.scheduledAt,
    required this.durationMinutes,
    this.tutorDisplayName,
    this.tutorAvatarUrl,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final slot = json['slot'] as Map<String, dynamic>?;
    final tutor = json['tutor'] as Map<String, dynamic>?;
    final tutorProfile = tutor?['user']?['profile'] as Map<String, dynamic>?;

    return BookingModel(
      id: json['id'] as String,
      tutorId: json['tutorId'] as String,
      learnerId: json['learnerId'] as String,
      slotId: json['slotId'] as String,
      language: json['language'] as String,
      status: json['status'] as String,
      priceCents: json['priceCents'] as int,
      platformFeeCents: json['platformFeeCents'] as int,
      livekitRoom: json['livekitRoom'] as String? ?? '',
      scheduledAt: DateTime.parse(
        (slot?['startTime'] as String?) ?? json['createdAt'] as String,
      ).toLocal(),
      durationMinutes: (() {
        final start = slot?['startTime'] as String?;
        final end = slot?['endTime'] as String?;
        if (start == null || end == null) return 60;
        final diff =
            DateTime.parse(end).difference(DateTime.parse(start)).inMinutes;
        return diff > 0 ? diff : 60;
      })(),
      tutorDisplayName: tutorProfile?['displayName'] as String?,
      tutorAvatarUrl: tutorProfile?['avatarUrl'] as String?,
    );
  }
}
