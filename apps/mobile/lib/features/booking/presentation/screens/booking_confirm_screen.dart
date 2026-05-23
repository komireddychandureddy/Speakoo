import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BookingConfirmScreen extends StatelessWidget {
  final String bookingId;

  const BookingConfirmScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Confirm Booking')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Booking ID: $bookingId'),
            const Spacer(),
            ElevatedButton(
              onPressed: () => context.go('/sessions/$bookingId'),
              child: const Text('Confirm & Pay'),
            ),
          ],
        ),
      ),
    );
  }
}
