import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Speakoo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.go('/profile'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Find your tutor',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => context.go('/tutors'),
              icon: const Icon(Icons.search),
              label: const Text('Browse Tutors'),
            ),
            const SizedBox(height: 32),
            Text('Upcoming Sessions', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Expanded(
              child: Center(child: Text('No upcoming sessions')),
            ),
          ],
        ),
      ),
    );
  }
}
