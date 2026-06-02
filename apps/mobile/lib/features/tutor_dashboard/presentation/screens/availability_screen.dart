import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/tutor_dashboard_provider.dart';

class AvailabilityScreen extends ConsumerWidget {
  const AvailabilityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slotsAsync = ref.watch(tutorSlotsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Availability'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primaryGreen,
        onPressed: () async {
          final now = DateTime.now();
          final start = DateTime(now.year, now.month, now.day + 1, 10, 0);
          final end = start.add(const Duration(minutes: 60));
          await ref.read(tutorSlotsActionsProvider.notifier).createSlot(start, end);
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Added 1-hour slot for tomorrow 10:00')), 
            );
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Add Slot'),
      ),
      body: slotsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load slots: $e')),
        data: (slots) {
          if (slots.isEmpty) {
            return const Center(
              child: Text('No availability slots yet', style: TextStyle(color: AppColors.textHint)),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: slots.length,
            itemBuilder: (context, index) {
              final slot = slots[index];
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.schedule),
                  title: Text('${slot.startTime}'),
                  subtitle: Text('Ends: ${slot.endTime}'),
                  trailing: Text(slot.status),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
