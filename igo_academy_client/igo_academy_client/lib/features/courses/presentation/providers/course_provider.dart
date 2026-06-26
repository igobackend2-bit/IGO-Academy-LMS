import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/course_remote_datasource.dart';
import '../../data/repositories/course_repository_impl.dart';
import '../../domain/repositories/course_repository.dart';
import '../../../../shared/models/course_model.dart';
import '../../../../shared/models/lesson_model.dart';

final courseRemoteDataSourceProvider = Provider<CourseRemoteDataSource>(
  (_) => CourseRemoteDataSourceImpl(),
);

final courseRepositoryProvider = Provider<CourseRepository>((ref) {
  return CourseRepositoryImpl(ref.watch(courseRemoteDataSourceProvider));
});

// -- Course List State --

class CourseListState {
  final List<CourseModel> courses;
  final bool isLoading;
  final String? error;
  final bool hasMore;

  const CourseListState({
    this.courses = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
  });

  CourseListState copyWith({
    List<CourseModel>? courses,
    bool? isLoading,
    String? error,
    bool? hasMore,
    bool clearError = false,
  }) {
    return CourseListState(
      courses: courses ?? this.courses,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

class CourseListNotifier extends StateNotifier<CourseListState> {
  final CourseRepository _repository;
  int _currentPage = 0;

  CourseListNotifier(this._repository) : super(const CourseListState()) {
    loadCourses();
  }

  Future<void> loadCourses({
    String? categoryId,
    String? searchQuery,
    CourseLevel? level,
    bool refresh = false,
  }) async {
    if (refresh) {
      _currentPage = 0;
      state = state.copyWith(courses: [], hasMore: true, clearError: true);
    }

    if (!state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoading: true);

    final result = await _repository.getCourses(
      categoryId: categoryId,
      searchQuery: searchQuery,
      level: level,
      page: _currentPage,
    );

    if (result.failure != null) {
      state = state.copyWith(isLoading: false, error: result.failure!.message);
      return;
    }

    _currentPage++;
    state = state.copyWith(
      isLoading: false,
      courses: refresh ? result.courses : [...state.courses, ...result.courses],
      hasMore: result.courses.length >= 10,
    );
  }
}

final courseListProvider = StateNotifierProvider<CourseListNotifier, CourseListState>((ref) {
  return CourseListNotifier(ref.watch(courseRepositoryProvider));
});

// -- Single course --
final courseDetailProvider = FutureProvider.family<CourseModel?, String>((ref, courseId) async {
  final repo = ref.watch(courseRepositoryProvider);
  final result = await repo.getCourseById(courseId);
  return result.course;
});

// -- Course lessons --
final courseLessonsProvider = FutureProvider.family<List<LessonModel>, String>((ref, courseId) async {
  final repo = ref.watch(courseRepositoryProvider);
  final result = await repo.getLessonsByCourse(courseId);
  return result.lessons;
});

// -- Enrollment --
final enrollmentProvider = FutureProvider.family((ref, String courseId) async {
  final repo = ref.watch(courseRepositoryProvider);
  final result = await repo.getEnrollment(courseId);
  return result.enrollment;
});

// -- User enrollments --
final userEnrollmentsProvider = FutureProvider((ref) async {
  final repo = ref.watch(courseRepositoryProvider);
  final result = await repo.getUserEnrollments();
  return result.enrollments;
});
