import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/providers/theme_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          _SectionHeader(title: 'Appearance'),
          SwitchListTile(
            secondary: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.dark_mode_outlined, color: AppColors.primary, size: 20),
            ),
            title: const Text('Dark Mode'),
            subtitle: Text(isDark ? 'Dark theme enabled' : 'Light theme enabled'),
            value: isDark,
            onChanged: (_) => ref.read(themeModeProvider.notifier).toggle(),
          ),
          const Divider(indent: 72),

          _SectionHeader(title: 'Language'),
          ListTile(
            leading: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.language_rounded, color: AppColors.secondary, size: 20),
            ),
            title: const Text('App Language'),
            subtitle: const Text('English'),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
            onTap: () {},
          ),

          _SectionHeader(title: 'Notifications'),
          SwitchListTile(
            secondary: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.notifications_outlined, color: AppColors.warning, size: 20),
            ),
            title: const Text('Push Notifications'),
            subtitle: const Text('Course updates & announcements'),
            value: true,
            onChanged: (val) {},
          ),

          _SectionHeader(title: 'About'),
          ListTile(
            leading: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.info.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.info_outline_rounded, color: AppColors.info, size: 20),
            ),
            title: const Text('App Version'),
            subtitle: const Text('1.0.0'),
          ),
          const Divider(indent: 72),
          ListTile(
            leading: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.privacy_tip_outlined, color: AppColors.primary, size: 20),
            ),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
            onTap: () {},
          ),
          const Divider(indent: 72),
          ListTile(
            leading: Container(
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.description_outlined, color: AppColors.primary, size: 20),
            ),
            title: const Text('Terms of Service'),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
      child: Text(title, style: Theme.of(context).textTheme.labelMedium),
    );
  }
}
