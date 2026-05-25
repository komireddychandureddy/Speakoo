import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';

enum _UserRole { learner, tutor, admin }

class _UserItem {
  const _UserItem({
    required this.name,
    required this.email,
    required this.role,
    required this.joinedAt,
    this.isBanned = false,
  });
  final String name;
  final String email;
  final _UserRole role;
  final String joinedAt;
  final bool isBanned;
}

final _mockUsers = [
  const _UserItem(
      name: 'Liam Johnson',
      email: 'liam@example.com',
      role: _UserRole.learner,
      joinedAt: 'Jun 10, 2025'),
  const _UserItem(
      name: 'Sofia Martinez',
      email: 'sofia@speakoo.io',
      role: _UserRole.tutor,
      joinedAt: 'May 2, 2025'),
  const _UserItem(
      name: 'Emma Clarkson',
      email: 'emma@example.com',
      role: _UserRole.learner,
      joinedAt: 'Apr 18, 2025'),
  const _UserItem(
      name: 'Liang Wei',
      email: 'liang@speakoo.io',
      role: _UserRole.tutor,
      joinedAt: 'Mar 30, 2025'),
  const _UserItem(
      name: 'James Lee',
      email: 'james@example.com',
      role: _UserRole.learner,
      joinedAt: 'Jun 14, 2025'),
  const _UserItem(
      name: 'Carlos Mendez',
      email: 'carlos@speakoo.io',
      role: _UserRole.tutor,
      joinedAt: 'Feb 12, 2025',
      isBanned: true),
  const _UserItem(
      name: 'Admin User',
      email: 'admin@speakoo.io',
      role: _UserRole.admin,
      joinedAt: 'Jan 1, 2025'),
];

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final TextEditingController _search = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _search.dispose();
    super.dispose();
  }

  List<_UserItem> _filtered(_UserRole role) {
    return _mockUsers.where((u) {
      final matchRole = u.role == role;
      final matchQuery = _query.isEmpty ||
          u.name.toLowerCase().contains(_query.toLowerCase()) ||
          u.email.toLowerCase().contains(_query.toLowerCase());
      return matchRole && matchQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('User Management'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'Learners'),
            Tab(text: 'Tutors'),
            Tab(text: 'Admins'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: TextField(
              controller: _search,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Search by name or email…',
                prefixIcon:
                    const Icon(Icons.search_rounded, color: AppColors.textHint),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
            ),
          ),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _UserList(users: _filtered(_UserRole.learner)),
                _UserList(users: _filtered(_UserRole.tutor)),
                _UserList(users: _filtered(_UserRole.admin)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _UserList extends StatelessWidget {
  const _UserList({required this.users});
  final List<_UserItem> users;

  @override
  Widget build(BuildContext context) {
    if (users.isEmpty) {
      return const Center(
        child: Text('No users found',
            style: TextStyle(color: AppColors.textHint)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: users.length,
      itemBuilder: (context, i) {
        return _UserTile(user: users[i])
            .animate(delay: (i * 60).ms)
            .fadeIn()
            .slideX(begin: 0.06, end: 0);
      },
    );
  }
}

class _UserTile extends StatelessWidget {
  const _UserTile({required this.user});
  final _UserItem user;

  Color get _roleColor {
    switch (user.role) {
      case _UserRole.admin:
        return const Color(0xFF6A1B9A);
      case _UserRole.tutor:
        return AppColors.primaryGreen;
      case _UserRole.learner:
        return const Color(0xFF1565C0);
    }
  }

  String get _roleLabel {
    switch (user.role) {
      case _UserRole.admin:
        return 'Admin';
      case _UserRole.tutor:
        return 'Tutor';
      case _UserRole.learner:
        return 'Learner';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      elevation: 1,
      shadowColor: AppColors.shadow,
      child: Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: user.isBanned
            ? Border.all(color: Colors.red.withValues(alpha: 0.4))
            : null,
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: CircleAvatar(
          radius: 20,
          backgroundColor: _roleColor.withValues(alpha: 0.15),
          child: Text(user.name[0],
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: _roleColor)),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(user.name,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 13),
                  overflow: TextOverflow.ellipsis),
            ),
            if (user.isBanned)
              Container(
                margin: const EdgeInsets.only(left: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Banned',
                    style: TextStyle(
                        color: Colors.red,
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.email,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 11),
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: _roleColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(_roleLabel,
                      style: TextStyle(
                          color: _roleColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w600)),
                ),
                const SizedBox(width: 8),
                Text('Joined ${user.joinedAt}',
                    style: const TextStyle(
                        color: AppColors.textHint, fontSize: 10)),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert_rounded,
              color: AppColors.textHint, size: 20),
          onSelected: (value) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('$value for ${user.name}'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'View', child: Text('View Profile')),
            const PopupMenuItem(value: 'Edit', child: Text('Edit')),
            PopupMenuItem(
              value: user.isBanned ? 'Unban' : 'Ban',
              child: Text(user.isBanned ? 'Unban User' : 'Ban User',
                  style: const TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }
}
