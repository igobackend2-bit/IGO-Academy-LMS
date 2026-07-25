import '../../../../core/utils/failure.dart';
import '../../../../shared/models/course_model.dart';
import '../../../../shared/models/lesson_model.dart';
import '../../../../shared/models/enrollment_model.dart';

abstract class CourseRepository {
  Future<({List<CourseModel> courses, Failure? failure})> getCourses({
    String? categoryId,
    String? searchQuery,
    CourseLevel? level,
    int page,
    int limit,
  });

  Future<({List<CourseModel> courses, Failure? failure})> getFeaturedCourses();
  Future<({CourseModel? course, Failure? failure})> getCourseById(String courseId);
  Future<({List<LessonModel> lessons, Failure? failure})> getLessonsByCourse(String courseId);
  Future<({LessonModel? lesson, Failure? failure})> getLessonById(String lessonId);
  Future<({EnrollmentModel? enrollment, Failure? failure})> enrollInCourse(String courseId);
  Future<({EnrollmentModel? enrollment, Failure? failure})> getEnrollment(String courseId);
  Future<({List<EnrollmentModel> enrollments, Failure? failure})> getUserEnrollments();
  Future<({bool success, Failure? failure})> markLessonComplete(String lessonId);
  Future<({double progress, Failure? failure})> getCourseProgress(String courseId);
}
