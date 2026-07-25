import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_error.dart';
import '../../../../core/widgets/app_loading.dart';
import '../providers/course_provider.dart';
import '../../../../shared/models/lesson_model.dart';

class CourseDetailScreen extends ConsumerWidget {
  final String courseId;

  const CourseDetailScreen({super.key, required this.courseId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(courseDetailProvider(courseId));
    final lessonsAsync = ref.watch(courseLessonsProvider(courseId));
    final enrollmentAsync = ref.watch(enrollmentProvider(courseId));
    final quizzesAsync = ref.watch(courseQuizzesProvider(courseId));
    final passedQuizIdsAsync = ref.watch(passedQuizIdsProvider);
    final completedLessonIdsAsync = ref.watch(completedLessonIdsProvider);

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (context.canPop()) {
          context.pop();
        } else {
          context.go(RouteNames.home);
        }
      },
      child: Scaffold(
      backgroundColor: AppColors.background,
      body: courseAsync.when(
        loading: () => const AppLoading(),
        error: (err, _) => AppError(message: err.toString()),
        data: (course) {
          if (course == null) return const AppError(message: 'Course not found');
          return CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // Header
              SliverAppBar(
                expandedHeight: 220,
                pinned: true,
                automaticallyImplyLeading: false,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: const BoxDecoration(gradient: AppColors.cardGradient),
                    child: const Center(
                      child: Icon(Icons.play_circle_outline_rounded,
                          size: 72, color: Colors.white54),
                    ),
                  ),
                ),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_rounded, size: 20, color: Colors.white),
                  onPressed: () => context.canPop() ? context.pop() : context.go(RouteNames.home),
                ),
              ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Level & free badge
                      Row(
                        children: [
                          _LevelBadge(level: course.level.name),
                          const SizedBox(width: 8),
                          if (course.isFree)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.successLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text('FREE',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(course.title, style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 8),
                      if (course.description != null)
                        Text(course.description!,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                )),
                      const SizedBox(height: 16),

                      // Stats
                      Row(
                        children: [
                          _Stat(icon: Icons.star_rounded, value: course.rating.toStringAsFixed(1), color: AppColors.warning),
                          const SizedBox(width: 16),
                          _Stat(icon: Icons.people_outlined, value: '${course.enrollmentCount} enrolled'),
                          const SizedBox(width: 16),
                          _Stat(icon: Icons.play_lesson_outlined, value: '${course.totalLessons} lessons'),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Instructor
                      if (course.instructorName != null)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: AppColors.primary.withOpacity(0.15),
                                child: const Icon(Icons.person, color: AppColors.primary),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Instructor', style: Theme.of(context).textTheme.labelSmall),
                                  Text(course.instructorName!,
                                      style: Theme.of(context).textTheme.titleSmall),
                                ],
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 24),

                      // Lessons
                      Text('Course Content', style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),

              // Lesson list
              lessonsAsync.when(
                loading: () => const SliverToBoxAdapter(child: AppLoading()),
                error: (err, _) => SliverToBoxAdapter(child: AppError(message: err.toString())),
                data: (lessons) {
                  final quizzes = quizzesAsync.value ?? [];
                  final passedQuizIds = passedQuizIdsAsync.value ?? [];
                  final completedLessonIds = completedLessonIdsAsync.value ?? [];

                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final lesson = lessons[index];
                        
                        // Video N is unlocked if N == 1 OR Quiz (N-1) is passed.
                        bool isLocked = false;
                        if (index > 0) {
                          if (quizzes.length > index - 1) {
                            final prevQuiz = quizzes[index - 1];
                            isLocked = !passedQuizIds.contains(prevQuiz.id);
                          } else {
                            // Fallback if no quiz exists for previous video
                            final prevLesson = lessons[index - 1];
                            isLocked = !completedLessonIds.contains(prevLesson.id);
                          }
                        }

                        return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                        child: ListTile(
                          tileColor: AppColors.surface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(color: AppColors.border),
                          ),
                          leading: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isLocked ? Colors.grey.withOpacity(0.1) : AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              lesson.type == LessonType.pdf
                                  ? Icons.picture_as_pdf_outlined
                                  : Icons.play_circle_outline_rounded,
                              color: isLocked ? Colors.grey : AppColors.primary,
                              size: 20,
                            ),
                          ),
                          title: Text(lesson.title,
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: isLocked ? Colors.grey : null,
                              )),
                          subtitle: Text('${lesson.durationSeconds ~/ 60} min',
                              style: Theme.of(context).textTheme.bodySmall),
                          trailing: isLocked 
                            ? const Icon(Icons.lock, size: 16, color: Colors.grey)
                            : const Icon(Icons.lock_open, size: 16, color: AppColors.textTertiary),
                          onTap: isLocked
                              ? null
                              : () {
                                  final route = lesson.type == LessonType.pdf
                                      ? '/lesson/${lesson.id}/pdf'
                                      : '/lesson/${lesson.id}/video';
                                  context.push(route);
                                },
                        ),
                      );
                    },
                    childCount: lessons.length,
                  ),
                );
                },
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          );
        },
      ),
      bottomNavigationBar: enrollmentAsync.when(
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
        data: (enrollment) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: enrollment != null
                ? Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: 'Continue',
                          onPressed: () {
                            final lessons = lessonsAsync.value;
                            if (lessons != null && lessons.isNotEmpty) {
                              final first = lessons.first;
                              final route = first.type == LessonType.pdf
                                  ? '/lesson/${first.id}/pdf'
                                  : '/lesson/${first.id}/video';
                              context.push(route);
                            }
                          },
                          prefixIcon: const Icon(Icons.play_arrow_rounded, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 10),
                      courseAsync.when(
                        data: (course) => SizedBox(
                          height: 52,
                          child: OutlinedButton(
                            onPressed: () => context.push(
                              '/assessments/$courseId?title=${Uri.encodeComponent(course?.title ?? '')}',
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                            ),
                            child: const Icon(Icons.quiz_rounded, color: AppColors.primary),
                          ),
                        ),
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
                    ],
                  )
                : AppButton(
                    label: 'Apply for Enrollment',
                    onPressed: () => context.push('/courses/$courseId/enroll'),
                  ),
          ),
        ),
      ),
    )); // PopScope + Scaffold
  }
}

class _LevelBadge extends StatelessWidget {
  final String level;
  const _LevelBadge({required this.level});

  Color get _color {
    switch (level) {
      case 'intermediate': return AppColors.intermediate;
      case 'advanced': return AppColors.advanced;
      default: return AppColors.beginner;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(level.toUpperCase(),
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _color)),
    );
  }
}

class _Stat extends StatelessWidget {
  final IconData icon;
  final String value;
  final Color? color;

  const _Stat({required this.icon, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color ?? AppColors.textSecondary),
        const SizedBox(width: 4),
        Text(value, style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}
