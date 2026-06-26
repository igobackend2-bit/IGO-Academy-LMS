import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_error.dart';
import '../../../../core/widgets/app_loading.dart';
import '../../../courses/presentation/providers/course_provider.dart';

class MyCoursesScreen extends ConsumerWidget {
  const MyCoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrollmentsAsync = ref.watch(userEnrollmentsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Courses')),
      body: enrollmentsAsync.when(
        loading: () => const AppLoading(),
        error: (err, _) => AppError(message: err.toString()),
        data: (enrollments) => enrollments.isEmpty
            ? const AppEmptyState(
                title: 'No Enrolled Courses',
                subtitle: 'Browse and enroll in courses to start learning.',
                icon: Icons.school_outlined,
              )
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: enrollments.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final e = enrollments[index];
                  return GestureDetector(
                    onTap: () => context.push('/courses/${e.courseId}'),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.play_circle_outline_rounded,
                                size: 30, color: AppColors.primary),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Course ${e.courseId}',
                                    style: Theme.of(context).textTheme.titleSmall),
                                const SizedBox(height: 6),
                                LinearProgressIndicator(
                                  value: e.progressPercent / 100,
                                  backgroundColor: AppColors.surfaceVariant,
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                const SizedBox(height: 4),
                                Text('${e.progressPercent.toStringAsFixed(0)}% complete',
                                    style: Theme.of(context).textTheme.labelSmall),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
