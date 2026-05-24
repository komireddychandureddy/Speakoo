import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:speakoo/app.dart';

void main() {
  testWidgets('SpeakooApp renders on Chrome', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SpeakooApp()));
    await tester.pumpAndSettle();

    // Verify the root MaterialApp.router widget is present.
    expect(find.byType(MaterialApp), findsOneWidget);

    // The initial route (/home) renders the HomeScreen with the app title.
    expect(find.text('Speakoo'), findsWidgets);
  });
}
