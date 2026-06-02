import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/admin_provider.dart';

class TutorApprovalScreen extends ConsumerWidget {
  const TutorApprovalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tutorsAsync = ref.watch(adminUsersProvider('tutor'));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tutor Applications'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: tutorsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load tutors: $e')),
        data: (users) {
          final pending = users.where((u) => u.isApprovedTutor == false).toList();
          if (pending.isEmpty) {
            return const Center(
              child: Text('No pending tutor applications', style: TextStyle(color: AppColors.textHint)),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: pending.length,
            itemBuilder: (context, index) {
              final user = pending[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primaryContainer,
                    child: Text((user.displayName ?? user.email).substring(0, 1).toUpperCase()),
                  ),
                  title: Text(user.displayName ?? user.email),
                  subtitle: Text(user.email),
                  trailing: TextButton(
                    onPressed: () async {
                      await ref.read(adminActionsProvider.notifier).approveTutor(user.id);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Tutor approved'), backgroundColor: AppColors.primaryGreen),
                        );
                      }
                    },
                    child: const Text('Approve'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
