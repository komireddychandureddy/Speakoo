import 'package:dio/dio.dart';

class SubscriptionPlanModel {
  final String id;
  final String code;
  final String name;
  final String interval;
  final int priceCents;
  final int includedCredits;

  const SubscriptionPlanModel({
    required this.id,
    required this.code,
    required this.name,
    required this.interval,
    required this.priceCents,
    required this.includedCredits,
  });

  factory SubscriptionPlanModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlanModel(
      id: json['id'] as String,
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? 'Plan',
      interval: json['interval'] as String? ?? 'monthly',
      priceCents: json['priceCents'] as int? ?? 0,
      includedCredits: json['includedCredits'] as int? ?? 0,
    );
  }
}

class UserSubscriptionModel {
  final String id;
  final String status;
  final DateTime currentPeriodEnd;
  final SubscriptionPlanModel plan;

  const UserSubscriptionModel({
    required this.id,
    required this.status,
    required this.currentPeriodEnd,
    required this.plan,
  });

  factory UserSubscriptionModel.fromJson(Map<String, dynamic> json) {
    return UserSubscriptionModel(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'active',
      currentPeriodEnd: DateTime.parse(
        json['currentPeriodEnd'] as String? ?? DateTime.now().toIso8601String(),
      ).toLocal(),
      plan: SubscriptionPlanModel.fromJson(
        (json['plan'] as Map<String, dynamic>?) ?? <String, dynamic>{},
      ),
    );
  }
}

class SubscriptionRepository {
  final Dio _dio;

  SubscriptionRepository(this._dio);

  Future<List<SubscriptionPlanModel>> getPlans() async {
    final response = await _dio.get<List<dynamic>>('/payments/subscriptions/plans');
    final rows = response.data ?? <dynamic>[];
    return rows
        .whereType<Map<String, dynamic>>()
        .map(SubscriptionPlanModel.fromJson)
        .toList();
  }

  Future<UserSubscriptionModel?> getMySubscription() async {
    final response = await _dio.get<Map<String, dynamic>>('/payments/subscriptions/me');
    final data = response.data;
    if (data == null || data.isEmpty) return null;
    return UserSubscriptionModel.fromJson(data);
  }

  Future<UserSubscriptionModel> subscribe({
    required String planId,
    required String paymentMethodId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/payments/subscriptions/subscribe',
      data: {
        'planId': planId,
        'paymentMethodId': paymentMethodId,
      },
    );
    return UserSubscriptionModel.fromJson(response.data!);
  }

  Future<UserSubscriptionModel> cancel({String? reason}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/payments/subscriptions/cancel',
      data: {
        if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
      },
    );
    return UserSubscriptionModel.fromJson(response.data!);
  }
}
