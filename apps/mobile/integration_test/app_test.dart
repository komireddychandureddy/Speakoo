import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:speakoo/app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Speakoo Web — Chrome smoke tests', () {
    testWidgets('app launches and renders home screen', (WidgetTester tester) async {
      await tester.pumpWidget(const ProviderScope(child: SpeakooApp()));
      await tester.pumpAndSettle();

      // Root MaterialApp.router is present.
      expect(find.byType(MaterialApp), findsOneWidget);

      // HomeScreen AppBar title is visible.
      expect(find.text('Speakoo'), findsWidgets);
    });

    testWidgets('home screen shows Browse Tutors button', (WidgetTester tester) async {
      await tester.pumpWidget(const ProviderScope(child: SpeakooApp()));
      await tester.pumpAndSettle();

      expect(find.text('Browse Tutors'), findsOneWidget);
    });

    testWidgets('tapping Browse Tutors navigates to tutor search', (WidgetTester tester) async {
      await tester.pumpWidget(const ProviderScope(child: SpeakooApp()));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Browse Tutors'));
      await tester.pumpAndSettle();

      expect(find.text('Find a Tutor'), findsOneWidget);
    });
  });
}
