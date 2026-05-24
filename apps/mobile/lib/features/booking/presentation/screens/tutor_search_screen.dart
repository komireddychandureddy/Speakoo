import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TutorSearchScreen extends StatelessWidget {
  const TutorSearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Find a Tutor')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Filter by language (e.g. English, Spanish)',
                prefixIcon: Icon(Icons.language),
              ),
              onChanged: (_) {
                // TODO: trigger search provider
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: 0,
              itemBuilder: (_, index) => ListTile(
                title: Text('Tutor $index'),
                onTap: () => context.go('/bookings/$index/confirm'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
