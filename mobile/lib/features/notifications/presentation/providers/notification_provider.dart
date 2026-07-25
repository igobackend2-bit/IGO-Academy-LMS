import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/models/notification_model.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../data/repositories/notification_repository.dart';
import '../../../courses/domain/repositories/course_repository.dart';
import '../../../courses/presentation/providers/course_provider.dart';

final notificationsProvider = StreamProvider.autoDispose<List<NotificationModel>>((ref) async* {
  final authState = ref.watch(authProvider);
  final userId = authState.user?.id;

  if (userId == null) {
    yield [];
    return;
  }

  final repo = ref.watch(notificationRepositoryProvider);
  final courseRepo = ref.watch(courseRepositoryProvider);
  
  // Create a stream controller to combine DB notifications and dynamic ones
  final controller = StreamController<List<NotificationModel>>();
  
  // 1. Fetch active enrollments to generate dynamic progress notifications
  final dynamicNotifications = <NotificationModel>[];
  try {
    final enrollmentResult = await courseRepo.getUserEnrollments();
    if (enrollmentResult.failure == null) {
      for (final enrollment in enrollmentResult.enrollments) {
        if (enrollment.progressPercent > 0 && enrollment.progressPercent < 100) {
          // Fetch course name
          final courseResult = await courseRepo.getCourseById(enrollment.courseId);
          final courseTitle = courseResult.course?.title ?? 'a course';
          
          dynamicNotifications.add(
            NotificationModel(
              id: 'progress_${enrollment.courseId}',
              userId: userId,
              title: 'Course Progress',
              body: 'You have completed ${enrollment.progressPercent.toStringAsFixed(0)}% of $courseTitle. Keep it up!',
              type: NotificationType.courseUpdate,
              targetId: enrollment.courseId,
              isRead: false,
              createdAt: DateTime.now(), // always show on top
            ),
          );
        }
      }
    }
  } catch (e) {
    // Ignore errors for dynamic notifications
  }

  // 2. Listen to the Realtime database notifications
  final sub = repo.watchNotifications(userId).listen((dbNotifications) {
    // Combine dynamic ones with real ones, and sort by date descending
    final combined = [...dynamicNotifications, ...dbNotifications];
    combined.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    controller.add(combined);
  });

  ref.onDispose(() {
    sub.cancel();
    controller.close();
  });

  yield* controller.stream;
});
