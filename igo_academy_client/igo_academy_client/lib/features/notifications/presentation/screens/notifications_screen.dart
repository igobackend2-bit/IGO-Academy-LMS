import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_error.dart';
import '../../../../shared/models/notification_model.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: Replace with actual notifications provider
    final List<NotificationModel> notifications = [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        elevation: 0,
        actions: [
          if (notifications.isNotEmpty)
            TextButton(
              onPressed: () {},
              child: const Text('Mark all read', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? const AppEmptyState(
              title: 'No Notifications',
              subtitle: 'You\'re all caught up! Notifications will appear here.',
              icon: Icons.notifications_none_rounded,
            )
          : ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
              itemBuilder: (context, index) {
                return _NotificationTile(notification: notifications[index]);
              },
            ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;

  const _NotificationTile({required this.notification});

  IconData get _icon {
    switch (notification.type) {
      case NotificationType.newLesson: return Icons.play_circle_outline_rounded;
      case NotificationType.quiz: return Icons.quiz_outlined;
      case NotificationType.certificate: return Icons.workspace_premium_outlined;
      case NotificationType.courseUpdate: return Icons.update_rounded;
      default: return Icons.campaign_outlined;
    }
  }

  Color get _iconColor {
    switch (notification.type) {
      case NotificationType.newLesson: return AppColors.primary;
      case NotificationType.quiz: return AppColors.warning;
      case NotificationType.certificate: return const Color(0xFFB8860B);
      case NotificationType.courseUpdate: return AppColors.info;
      default: return AppColors.secondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      tileColor: notification.isRead ? null : AppColors.primary.withOpacity(0.04),
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: _iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(_icon, color: _iconColor, size: 22),
      ),
      title: Text(notification.title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: notification.isRead ? FontWeight.w400 : FontWeight.w600,
              )),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 2),
          Text(notification.body,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Text(notification.createdAt.toLocal().toString().substring(0, 16),
              style: Theme.of(context).textTheme.labelSmall),
        ],
      ),
      isThreeLine: true,
      trailing: notification.isRead
          ? null
          : Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
    );
  }
}
