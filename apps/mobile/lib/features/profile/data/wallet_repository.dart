import 'package:dio/dio.dart';

class WalletTx {
  final String id;
  final String type;
  final int amountCents;
  final int balanceAfter;
  final String? referenceId;
  final DateTime createdAt;

  const WalletTx({
    required this.id,
    required this.type,
    required this.amountCents,
    required this.balanceAfter,
    required this.referenceId,
    required this.createdAt,
  });

  factory WalletTx.fromJson(Map<String, dynamic> json) {
    return WalletTx(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'credit',
      amountCents: json['amountCents'] as int? ?? 0,
      balanceAfter: json['balanceAfter'] as int? ?? 0,
      referenceId: json['referenceId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String).toLocal(),
    );
  }
}

class WalletRepository {
  final Dio _dio;

  WalletRepository(this._dio);

  Future<int> getBalanceCents() async {
    final response = await _dio.get<Map<String, dynamic>>('/payments/wallet');
    return response.data?['balanceCents'] as int? ?? 0;
  }

  Future<List<WalletTx>> getTransactions() async {
    final response = await _dio.get<Map<String, dynamic>>('/payments/wallet/transactions');
    final items = response.data?['items'] as List<dynamic>? ?? [];
    return items.map((e) => WalletTx.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<String> topup(int amountCents) async {
    final response = await _dio.post<Map<String, dynamic>>('/payments/wallet/topup', data: {
      'amountCents': amountCents,
    });
    return response.data?['clientSecret'] as String? ?? '';
  }
}
