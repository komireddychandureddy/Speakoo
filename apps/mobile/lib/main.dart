import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const dsn = String.fromEnvironment('SENTRY_DSN');
  if (dsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = dsn;
        options.tracesSampleRate = 0.2;
      },
      appRunner: () => runApp(
        const ProviderScope(child: SpeakooApp()),
      ),
    );
  } else {
    runApp(const ProviderScope(child: SpeakooApp()));
  }
}
