import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/application/auth_provider.dart';
import '../../application/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final profileAsync = ref.watch(profileProvider);

    // Derive display values — prefer profileProvider data, fall back to authState
    final profile = profileAsync.valueOrNull;
    final displayName = profile?.displayNameOrEmail ?? authState.user?.fullName ?? 'Guest';
    final email = profile?.email ?? authState.user?.email ?? '';
    final avatarUrl = profile?.avatarUrl ?? authState.user?.avatarUrl;
    final initials = displayName.trim().split(' ').map((w) => w[0]).take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.primaryDark,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 48),
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        CircleAvatar(
                          radius: 44,
                          backgroundColor: Colors.white.withValues(alpha: 0.25),
                          backgroundImage: avatarUrl != null
                              ? NetworkImage(avatarUrl)
                              : null,
                          child: avatarUrl == null
                              ? Text(initials,
                                  style: const TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white))
                              : null,
                        ),
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.edit,
                              size: 14, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      displayName,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18),
                    ),
                    Text(
                      email,
                      style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 16),

                // Stats row
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      _StatCard(label: 'Sessions', value: '24'),
                      SizedBox(width: 12),
                      _StatCard(label: 'Hours', value: '18'),
                      SizedBox(width: 12),
                      _StatCard(label: 'Languages', value: '3'),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Wallet card
                _SectionCard(
                  child: ListTile(
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.account_balance_wallet_rounded,
                          color: Colors.white, size: 22),
                    ),
                    title: const Text('My Wallet',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('\$42.50 available'),
                    trailing: const Icon(Icons.chevron_right_rounded,
                        color: AppColors.textHint),
                    onTap: () => context.push('/wallet'),
                  ),
                ),

                const SizedBox(height: 8),

                // Settings section
                _SectionCard(
                  child: Column(
                    children: [
                      _SettingsTile(
                        icon: Icons.notifications_outlined,
                        label: 'Notifications',
                        trailing: Switch(
                          value: true,
                          onChanged: (_) {},
                          activeThumbColor: AppColors.primaryGreen,
                        ),
                      ),
                      const Divider(height: 1, indent: 56),
                      _SettingsTile(
                        icon: Icons.school_outlined,
                        label: 'Learning Preferences',
                        onTap: () => context.push('/preferences'),
                      ),
                      const Divider(height: 1, indent: 56),
                      _SettingsTile(
                        icon: Icons.workspace_premium_outlined,
                        label: 'Subscription',
                        onTap: () => context.push('/subscription'),
                      ),
                      const Divider(height: 1, indent: 56),
                      _SettingsTile(
                        icon: Icons.help_outline_rounded,
                        label: 'Help & Support',
                        onTap: () {},
                      ),
                      const Divider(height: 1, indent: 56),
                      _SettingsTile(
                        icon: Icons.privacy_tip_outlined,
                        label: 'Privacy Policy',
                        onTap: () {},
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Logout
                _SectionCard(
                  child: _SettingsTile(
                    icon: Icons.logout_rounded,
                    label: 'Sign Out',
                    labelColor: Colors.red,
                    iconColor: Colors.red,
                    onTap: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go('/onboarding');
                    },
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(color: AppColors.shadow, blurRadius: 6, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          children: [
            Text(value,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 22,
                    color: AppColors.primaryDark)),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        clipBehavior: Clip.antiAlias,
        elevation: 1,
        shadowColor: AppColors.shadow,
        child: child,
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.label,
    this.trailing,
    this.onTap,
    this.labelColor,
    this.iconColor,
  });

  final IconData icon;
  final String label;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? labelColor;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.primaryGreen, size: 22),
      title: Text(label,
          style: TextStyle(
              fontWeight: FontWeight.w500,
              color: labelColor ?? AppColors.textPrimary)),
      trailing: trailing ??
          (onTap != null
              ? const Icon(Icons.chevron_right_rounded,
                  color: AppColors.textHint)
              : null),
      onTap: onTap,
    );
  }
}
