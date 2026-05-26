import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'dio_client.g.dart';

const _baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:3000/api/v1');
const _accessTokenKey = 'access_token';

@riverpod
Dio dioClient(DioClientRef ref) {
  const storage = FlutterSecureStorage();
  final cookieJar = CookieJar();
  final dio = Dio(BaseOptions(baseUrl: _baseUrl));
  dio.interceptors.add(CookieManager(cookieJar));

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: _accessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 &&
            error.requestOptions.extra['retryAttempted'] != true) {
          try {
            final refreshDio = Dio(BaseOptions(baseUrl: _baseUrl));
            refreshDio.interceptors.add(CookieManager(cookieJar));
            final response = await refreshDio.post('/auth/refresh');

            final newToken = response.data['accessToken'] as String;
            await storage.write(key: _accessTokenKey, value: newToken);

            error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
            error.requestOptions.extra['retryAttempted'] = true;
            final retryResponse = await dio.fetch(error.requestOptions);
            handler.resolve(retryResponse);
            return;
          } catch (_) {
            await storage.delete(key: _accessTokenKey);
          }
        }
        handler.next(error);
      },
    ),
  );

  return dio;
}
