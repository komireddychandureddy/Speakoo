import 'package:dio/dio.dart';

class AdminUser {
  final String id;
  final String email;
  final String role;
  final bool isSuspended;
  final bool? isApprovedTutor;
  final String? displayName;

  const AdminUser({
    required this.id,
    required this.email,
    required this.role,
    required this.isSuspended,
    this.isApprovedTutor,
    this.displayName,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>?;
    final tutorProfile = json['tutorProfile'] as Map<String, dynamic>?;
    return AdminUser(
      id: json['id'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      isSuspended: json['isSuspended'] as bool? ?? false,
      isApprovedTutor: tutorProfile?['isApproved'] as bool?,
      displayName: profile?['displayName'] as String?,
    );
  }
}

class AdminStats {
  final int totalUsers;
  final int tutors;
  final int learners;
  final int totalBookings;
  final int pendingTutors;
  final int totalRevenueCents;

  const AdminStats({
    required this.totalUsers,
    required this.tutors,
    required this.learners,
    required this.totalBookings,
    required this.pendingTutors,
    required this.totalRevenueCents,
  });

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      totalUsers: json['totalUsers'] as int? ?? 0,
      tutors: json['tutors'] as int? ?? 0,
      learners: json['learners'] as int? ?? 0,
      totalBookings: json['totalBookings'] as int? ?? 0,
      pendingTutors: json['pendingTutors'] as int? ?? 0,
      totalRevenueCents: json['totalRevenueCents'] as int? ?? 0,
    );
  }
}

class AdminRepository {
  final Dio _dio;

  AdminRepository(this._dio);

  Future<AdminStats> getStats() async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/stats');
    return AdminStats.fromJson(response.data!);
  }

  Future<List<AdminUser>> listUsers({String? role, int page = 1, int limit = 100}) async {
    final response = await _dio.get<Map<String, dynamic>>('/admin/users', queryParameters: {
      'page': page,
      'limit': limit,
      if (role != null) 'role': role,
    });
    final data = response.data?['data'] as List<dynamic>? ?? [];
    return data.map((e) => AdminUser.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> approveTutor(String userId) async {
    await _dio.patch('/admin/tutors/$userId/approve');
  }

  Future<void> suspendUser(String userId) async {
    await _dio.patch('/admin/users/$userId/suspend');
  }

  Future<void> unsuspendUser(String userId) async {
    await _dio.patch('/admin/users/$userId/unsuspend');
  }
}
