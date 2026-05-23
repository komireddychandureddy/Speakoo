import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SessionRoomScreen extends StatelessWidget {
  final String bookingId;

  const SessionRoomScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('Session — $bookingId'),
        actions: [
          TextButton(
            onPressed: () => context.go('/home'),
            child: const Text('Leave', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.videocam, color: Colors.white, size: 64),
            SizedBox(height: 16),
            Text(
              'Connecting to session...',
              style: TextStyle(color: Colors.white),
            ),
            SizedBox(height: 8),
            Text(
              'LiveKit integration — wire up livekit_client SDK here',
              style: TextStyle(color: Colors.grey, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(icon: const Icon(Icons.mic, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.videocam, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.screen_share, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.chat, color: Colors.white), onPressed: () {}),
              IconButton(icon: const Icon(Icons.brush, color: Colors.white), onPressed: () {}),
            ],
          ),
        ),
      ),
    );
  }
}
