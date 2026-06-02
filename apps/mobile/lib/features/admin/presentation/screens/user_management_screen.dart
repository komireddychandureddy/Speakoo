import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../application/admin_provider.dart';

class UserManagementScreen extends ConsumerStatefulWidget {
  const UserManagementScreen({super.key});

  @override
  ConsumerState<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends ConsumerState<UserManagementScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('User Management'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Learners'),
            Tab(text: 'Tutors'),
            Tab(text: 'Admins'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _UsersByRole(role: 'learner'),
          _UsersByRole(role: 'tutor'),
          _UsersByRole(role: 'admin'),
        ],
      ),
    );
  }
}

class _UsersByRole extends ConsumerWidget {
  final String role;

  const _UsersByRole({required this.role});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(adminUsersProvider(role));

    return usersAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Failed to load users: $e')),
      data: (users) {
        if (users.isEmpty) {
          return const Center(
            child: Text('No users found', style: TextStyle(color: AppColors.textHint)),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: users.length,
          itemBuilder: (context, index) {
            final user = users[index];
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primaryContainer,
                  child: Text((user.displayName ?? user.email).substring(0, 1).toUpperCase()),
                ),
                title: Text(user.displayName ?? user.email),
                subtitle: Text(user.email),
                trailing: Switch(
                  value: user.isSuspended,
                  onChanged: (_) async {
                    await ref.read(adminActionsProvider.notifier).toggleSuspend(user.id, user.isSuspended);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(user.isSuspended ? 'User unsuspended' : 'User suspended'),
                        ),
                      );
                    }
                  },
                ),
              ),
            );
          },
        );
      },
    );
  }
}
