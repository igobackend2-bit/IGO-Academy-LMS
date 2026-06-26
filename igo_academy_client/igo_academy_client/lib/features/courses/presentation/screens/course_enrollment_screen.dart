import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../providers/course_provider.dart';

class CourseEnrollmentScreen extends ConsumerStatefulWidget {
  final String courseId;

  const CourseEnrollmentScreen({super.key, required this.courseId});

  @override
  ConsumerState<CourseEnrollmentScreen> createState() => _CourseEnrollmentScreenState();
}

class _CourseEnrollmentScreenState extends ConsumerState<CourseEnrollmentScreen> {
  bool _isEnrolling = false;

  Future<void> _enroll() async {
    setState(() => _isEnrolling = true);
    final repo = ref.read(courseRepositoryProvider);
    final result = await repo.enrollInCourse(widget.courseId);
    setState(() => _isEnrolling = false);
    if (result.enrollment != null && mounted) {
      context.go(RouteNames.home);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Enrolled successfully! Start learning now.'),
          backgroundColor: AppColors.success,
        ),
      );
    } else if (result.failure != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.failure!.message),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final courseAsync = ref.watch(courseDetailProvider(widget.courseId));

    return Scaffold(
      backgroundColor: AppColors.primary,
      appBar: AppBar(
        title: const Text('Enroll in Course'),
        backgroundColor: Colors.transparent,
      ),
      body: courseAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text(err.toString())),
        data: (course) {
          if (course == null) return const Center(child: Text('Course not found'));
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  height: 160,
                  decoration: BoxDecoration(
                    gradient: AppColors.cardGradient,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(
                    child: Icon(Icons.school_rounded, size: 72, color: Colors.white54),
                  ),
                ),
                const SizedBox(height: 24),
                Text(course.title, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                if (course.instructorName != null)
                  Text('By ${course.instructorName}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                          )),
                const SizedBox(height: 24),
                _InfoRow(icon: Icons.play_lesson_outlined, label: '${course.totalLessons} Lessons'),
                const SizedBox(height: 8),
                _InfoRow(icon: Icons.bar_chart_rounded, label: course.level.name.toUpperCase()),
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.attach_money_rounded,
                  label: course.isFree ? 'Free' : 'Paid — \$${course.price?.toStringAsFixed(2)}',
                  color: course.isFree ? AppColors.success : AppColors.textPrimary,
                ),
                const Spacer(),
                AppButton(
                  label: course.isFree ? 'Enroll for Free' : 'Enroll Now',
                  onPressed: _enroll,
                  isLoading: _isEnrolling,
                ),
                const SizedBox(height: 12),
                AppButton(
                  label: 'Cancel',
                  variant: AppButtonVariant.ghost,
                  onPressed: () => context.pop(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;

  const _InfoRow({required this.icon, required this.label, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: color ?? AppColors.textSecondary),
        const SizedBox(width: 10),
        Text(label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: color)),
      ],
    );
  }
}
