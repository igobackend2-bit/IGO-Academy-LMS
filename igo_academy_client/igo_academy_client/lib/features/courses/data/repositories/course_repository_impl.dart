import '../../../../core/utils/failure.dart';
import '../../../../shared/models/course_model.dart';
import '../../../../shared/models/lesson_model.dart';
import '../../../../shared/models/enrollment_model.dart';
import '../../domain/repositories/course_repository.dart';
import '../datasources/course_remote_datasource.dart';

class CourseRepositoryImpl implements CourseRepository {
  final CourseRemoteDataSource _remote;

  const CourseRepositoryImpl(this._remote);

  @override
  Future<({List<CourseModel> courses, Failure? failure})> getCourses({
    String? categoryId,
    String? searchQuery,
    CourseLevel? level,
    int page = 0,
    int limit = 10,
  }) async {
    try {
      final courses = await _remote.getCourses(
        categoryId: categoryId,
        searchQuery: searchQuery,
        level: level?.name,
        page: page,
        limit: limit,
      );
      return (courses: courses, failure: null);
    } catch (e) {
      return (courses: <CourseModel>[], failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({List<CourseModel> courses, Failure? failure})> getFeaturedCourses() async {
    try {
      final courses = await _remote.getFeaturedCourses();
      return (courses: courses, failure: null);
    } catch (e) {
      return (courses: <CourseModel>[], failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({CourseModel? course, Failure? failure})> getCourseById(String courseId) async {
    try {
      final course = await _remote.getCourseById(courseId);
      if (course == null) return (course: null, failure: const NotFoundFailure());
      return (course: course, failure: null);
    } catch (e) {
      return (course: null, failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({List<LessonModel> lessons, Failure? failure})> getLessonsByCourse(String courseId) async {
    try {
      final lessons = await _remote.getLessonsByCourse(courseId);
      return (lessons: lessons, failure: null);
    } catch (e) {
      return (lessons: <LessonModel>[], failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({LessonModel? lesson, Failure? failure})> getLessonById(String lessonId) async {
    try {
      final lesson = await _remote.getLessonById(lessonId);
      if (lesson == null) return (lesson: null, failure: const NotFoundFailure());
      return (lesson: lesson, failure: null);
    } catch (e) {
      return (lesson: null, failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({EnrollmentModel? enrollment, Failure? failure})> enrollInCourse(String courseId) async {
    try {
      final enrollment = await _remote.enrollInCourse(courseId);
      return (enrollment: enrollment, failure: null);
    } catch (e) {
      return (enrollment: null, failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({EnrollmentModel? enrollment, Failure? failure})> getEnrollment(String courseId) async {
    try {
      final enrollment = await _remote.getEnrollment(courseId);
      return (enrollment: enrollment, failure: null);
    } catch (e) {
      return (enrollment: null, failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({List<EnrollmentModel> enrollments, Failure? failure})> getUserEnrollments() async {
    try {
      final enrollments = await _remote.getUserEnrollments();
      return (enrollments: enrollments, failure: null);
    } catch (e) {
      return (enrollments: <EnrollmentModel>[], failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({bool success, Failure? failure})> markLessonComplete(String lessonId) async {
    try {
      await _remote.markLessonComplete(lessonId);
      return (success: true, failure: null);
    } catch (e) {
      return (success: false, failure: ServerFailure(e.toString()));
    }
  }

  @override
  Future<({double progress, Failure? failure})> getCourseProgress(String courseId) async {
    try {
      final progress = await _remote.getCourseProgress(courseId);
      return (progress: progress, failure: null);
    } catch (e) {
      return (progress: 0.0, failure: ServerFailure(e.toString()));
    }
  }
}
