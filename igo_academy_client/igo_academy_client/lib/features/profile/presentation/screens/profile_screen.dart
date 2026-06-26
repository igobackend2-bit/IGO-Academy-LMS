import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../features/authentication/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Colorful Header
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: double.infinity,
                  height: 250,
                  decoration: const BoxDecoration(
                    gradient: AppColors.cardGradient,
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                  ),
                  child: SafeArea(
                    bottom: false,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        children: [
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              // Avatar Container with White Border
                              Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 3),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.15),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: CircleAvatar(
                                  radius: 38,
                                  backgroundColor: Colors.white24,
                                  backgroundImage: user?.avatarUrl?.isNotEmpty == true
                                      ? NetworkImage(user!.avatarUrl!)
                                      : null,
                                  child: user?.avatarUrl?.isNotEmpty != true
                                      ? Text(
                                          (user?.name?.isNotEmpty == true ? user!.name![0] : 'U').toUpperCase(),
                                          style: const TextStyle(
                                            fontFamily: 'Inter',
                                            fontSize: 32,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.white,
                                          ),
                                        )
                                      : null,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user?.name ?? 'IGO Learner',
                                      style: const TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      user?.phone ?? user?.email ?? '',
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 14,
                                        color: Colors.white.withOpacity(0.85),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Floating Edit Profile Button
                              IconButton(
                                icon: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 28),
                                onPressed: () => context.push(RouteNames.editProfile),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Floating Glassmorphic Stats Card
                Positioned(
                  left: 20,
                  right: 20,
                  bottom: -45,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.12),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        const _StatChip(
                          label: 'Courses',
                          value: '3',
                          iconColor: Color(0xFF6366F1),
                          icon: Icons.book_rounded,
                        ),
                        Container(width: 1, height: 40, color: AppColors.border),
                        const _StatChip(
                          label: 'Completed',
                          value: '1',
                          iconColor: Color(0xFF10B981),
                          icon: Icons.check_circle_rounded,
                        ),
                        Container(width: 1, height: 40, color: AppColors.border),
                        const _StatChip(
                          label: 'Certificates',
                          value: '1',
                          iconColor: Color(0xFFF59E0B),
                          icon: Icons.workspace_premium_rounded,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 65),

            // Menu sections
            _MenuSection(
              title: 'Learning Tracker',
              items: [
                _MenuItem(
                  icon: Icons.school_rounded,
                  label: 'My Courses',
                  color: const Color(0xFF6366F1), // Indigo
                  onTap: () => context.push(RouteNames.myCourses),
                ),
                _MenuItem(
                  icon: Icons.workspace_premium_rounded,
                  label: 'My Certificates',
                  color: const Color(0xFFF59E0B), // Amber
                  onTap: () => context.push(RouteNames.certificates),
                ),
                _MenuItem(
                  icon: Icons.history_rounded,
                  label: 'Learning History',
                  color: const Color(0xFF10B981), // Emerald
                  onTap: () => context.push(RouteNames.learningHistory),
                ),
              ],
            ),

            const SizedBox(height: 8),

            _MenuSection(
              title: 'Account Settings',
              items: [
                _MenuItem(
                  icon: Icons.person_rounded,
                  label: 'Edit Profile',
                  color: const Color(0xFF3B82F6), // Blue
                  onTap: () => context.push(RouteNames.editProfile),
                ),
                _MenuItem(
                  icon: Icons.settings_rounded,
                  label: 'Preferences',
                  color: const Color(0xFF8B5CF6), // Purple
                  onTap: () => context.push(RouteNames.settings),
                ),
                _MenuItem(
                  icon: Icons.help_center_rounded,
                  label: 'Help & Support',
                  color: const Color(0xFFEC4899), // Pink
                  onTap: () {},
                ),
              ],
            ),

            const SizedBox(height: 8),

            _MenuSection(
              items: [
                _MenuItem(
                  icon: Icons.logout_rounded,
                  label: 'Sign Out',
                  color: AppColors.error,
                  onTap: () async {
                    await ref.read(authProvider.notifier).signOut();
                    if (context.mounted) context.go(RouteNames.login);
                  },
                ),
              ],
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color iconColor;

  const _StatChip({
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: iconColor),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String? title;
  final List<_MenuItem> items;

  const _MenuSection({this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            child: Text(
              title!,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textSecondary,
                letterSpacing: 0.5,
              ),
            ),
          ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: List.generate(items.length, (index) {
              final item = items[index];
              return Column(
                children: [
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: item.color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(item.icon, size: 20, color: item.color),
                    ),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: item.color == AppColors.error ? AppColors.error : AppColors.textPrimary,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.textTertiary,
                      size: 22,
                    ),
                    onTap: item.onTap,
                  ),
                  if (index < items.length - 1)
                    Divider(
                      height: 1,
                      indent: 72,
                      endIndent: 20,
                      color: AppColors.border.withOpacity(0.5),
                    ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
}
