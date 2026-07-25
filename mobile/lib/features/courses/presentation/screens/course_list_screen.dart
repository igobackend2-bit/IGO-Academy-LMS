import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_error.dart';
import '../../../../core/widgets/app_loading.dart';
import '../providers/course_provider.dart';
import '../../../../shared/widgets/voice_assistant_bottom_sheet.dart';

class CourseListScreen extends ConsumerStatefulWidget {
  final bool isSearch;
  final String? categoryId;
  final String? categoryName;

  const CourseListScreen({
    super.key,
    this.isSearch = false,
    this.categoryId,
    this.categoryName,
  });

  @override
  ConsumerState<CourseListScreen> createState() => _CourseListScreenState();
}

class _CourseListScreenState extends ConsumerState<CourseListScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 300) {
      ref.read(courseListProvider.notifier).loadCourses(
            categoryId: widget.categoryId,
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(courseListProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName ?? (widget.isSearch ? 'Search' : 'All Courses'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        elevation: 0,
        bottom: widget.isSearch
            ? PreferredSize(
                preferredSize: const Size.fromHeight(60),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                  child: TextField(
                    controller: _searchController,
                    autofocus: widget.isSearch,
                    decoration: InputDecoration(
                      hintText: 'Search courses…',
                      hintStyle: const TextStyle(color: Colors.white70),
                      fillColor: Colors.white.withOpacity(0.15),
                      filled: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                      prefixIcon: const Icon(Icons.search, size: 20, color: Colors.white70),
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_searchController.text.isNotEmpty)
                            IconButton(
                              icon: const Icon(Icons.clear, size: 18, color: Colors.white),
                              onPressed: () {
                                _searchController.clear();
                                ref.read(courseListProvider.notifier).loadCourses(refresh: true);
                              },
                            ),
                          IconButton(
                            icon: const Icon(Icons.mic_rounded, color: Colors.white, size: 20),
                            onPressed: () {
                              VoiceAssistantBottomSheet.show(
                                context,
                                onSearchCommand: (query) {
                                  _searchController.text = query;
                                  ref.read(courseListProvider.notifier).loadCourses(
                                        searchQuery: query,
                                        refresh: true,
                                      );
                                },
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    style: const TextStyle(color: Colors.white),
                    onChanged: (query) {
                      ref.read(courseListProvider.notifier).loadCourses(
                            searchQuery: query,
                            refresh: true,
                          );
                    },
                  ),
                ),
              )
            : null,
      ),
      body: state.isLoading && state.courses.isEmpty
          ? const AppLoading()
          : state.error != null && state.courses.isEmpty
              ? AppError(
                  message: state.error!,
                  onRetry: () => ref.read(courseListProvider.notifier).loadCourses(refresh: true),
                )
              : state.courses.isEmpty
                  ? const AppEmptyState(
                      title: 'No courses found',
                      subtitle: 'Try a different search or category',
                      icon: Icons.school_outlined,
                    )
                  : ListView.separated(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(20),
                      itemCount: state.courses.length + (state.hasMore ? 1 : 0),
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        if (index >= state.courses.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        final course = state.courses[index];
                        return _CourseCard(
                          course: CourseCardData(
                            id: course.id,
                            title: course.title,
                            instructor: course.instructorName ?? 'IGO Instructor',
                            rating: course.rating,
                            totalLessons: course.totalLessons,
                            level: course.level.name,
                            isFree: course.isFree,
                            price: course.price,
                          ),
                        );
                      },
                    ),
    );
  }
}

class CourseCardData {
  final String id;
  final String title;
  final String instructor;
  final double rating;
  final int totalLessons;
  final String level;
  final bool isFree;
  final double? price;

  const CourseCardData({
    required this.id,
    required this.title,
    required this.instructor,
    required this.rating,
    required this.totalLessons,
    required this.level,
    required this.isFree,
    this.price,
  });
}

class _CourseCard extends StatelessWidget {
  final CourseCardData course;

  const _CourseCard({required this.course});

  Color get _levelColor {
    switch (course.level) {
      case 'intermediate': return AppColors.intermediate;
      case 'advanced': return AppColors.advanced;
      default: return AppColors.beginner;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/courses/${course.id}'),
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
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.play_circle_outline_rounded,
                  size: 36, color: AppColors.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: _levelColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          course.level.toUpperCase(),
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: _levelColor,
                          ),
                        ),
                      ),
                      if (course.isFree) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.successLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('FREE',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.success)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(course.title,
                      style: Theme.of(context).textTheme.titleSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text(course.instructor,
                      style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: AppColors.warning, size: 14),
                      const SizedBox(width: 2),
                      Text(course.rating.toStringAsFixed(1),
                          style: Theme.of(context).textTheme.labelSmall),
                      const SizedBox(width: 8),
                      const Icon(Icons.play_lesson_outlined, size: 12, color: AppColors.textTertiary),
                      const SizedBox(width: 2),
                      Text('${course.totalLessons} lessons',
                          style: Theme.of(context).textTheme.labelSmall),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
