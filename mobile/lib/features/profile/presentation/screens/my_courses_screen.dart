import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_error.dart';
import '../../../../core/widgets/app_loading.dart';
import '../../../courses/presentation/providers/course_provider.dart';
import '../widgets/enrolled_course_side_panel.dart';

class MyCoursesScreen extends ConsumerStatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  ConsumerState<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends ConsumerState<MyCoursesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String? _selectedCourseIdForDrawer;
  String _selectedCourseTitleForDrawer = '';

  void _openSidePanel(String courseId, String courseTitle) {
    setState(() {
      _selectedCourseIdForDrawer = courseId;
      _selectedCourseTitleForDrawer = courseTitle;
    });
    _scaffoldKey.currentState?.openEndDrawer();
  }

  Future<void> _handleRefresh() async {
    ref.invalidate(userEnrollmentsStreamProvider);
    // Add a small delay to show the refresh animation
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Widget build(BuildContext context) {
    final enrollmentsAsync = ref.watch(userEnrollmentsStreamProvider);

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(title: const Text('My Courses')),
      endDrawer: _selectedCourseIdForDrawer != null
          ? EnrolledCourseSidePanel(
              courseId: _selectedCourseIdForDrawer!,
              courseTitle: _selectedCourseTitleForDrawer,
            )
          : null,
      body: enrollmentsAsync.when(
        loading: () => const AppLoading(),
        error: (err, _) => AppError(message: err.toString()),
        data: (enrollments) => RefreshIndicator(
          onRefresh: _handleRefresh,
          child: enrollments.isEmpty
              ? LayoutBuilder(
                  builder: (context, constraints) => ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      Container(
                        constraints: BoxConstraints(minHeight: constraints.maxHeight),
                        child: const AppEmptyState(
                          title: 'No Enrolled Courses',
                          subtitle: 'Browse and enroll in courses to start learning.',
                          icon: Icons.school_outlined,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  itemCount: enrollments.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final e = enrollments[index];
                    return _MyCourseCard(
                      enrollment: e,
                      onOpenPanel: _openSidePanel,
                    );
                  },
                ),
        ),
      ),
    );
  }
}

class _MyCourseCard extends ConsumerWidget {
  final dynamic enrollment;
  final void Function(String courseId, String courseTitle) onOpenPanel;

  const _MyCourseCard({required this.enrollment, required this.onOpenPanel});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(courseDetailProvider(enrollment.courseId));

    return courseAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (err, _) => const SizedBox.shrink(),
      data: (course) {
        // "After approving by the admin only the course should be displayed"
        if (course == null || course.status.name != 'published') {
          return const SizedBox.shrink();
        }

        return GestureDetector(
          onTap: () => context.push('/courses/${enrollment.courseId}'),
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
                      Text(course.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 6),
                      LinearProgressIndicator(
                        value: enrollment.progressPercent / 100,
                        backgroundColor: AppColors.surfaceVariant,
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      const SizedBox(height: 4),
                      Text('${enrollment.progressPercent.toStringAsFixed(0)}% complete',
                          style: Theme.of(context).textTheme.labelSmall),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.menu_book, color: AppColors.primary),
                  onPressed: () => onOpenPanel(enrollment.courseId, course.title),
                  tooltip: 'Course Resources',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

