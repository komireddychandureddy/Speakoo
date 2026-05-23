import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const CircleAvatar(radius: 48, child: Icon(Icons.person, size: 48)),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Display Name')),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Timezone')),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Bio'), maxLines: 3),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Save Profile'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.go('/login'),
              child: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }
}
