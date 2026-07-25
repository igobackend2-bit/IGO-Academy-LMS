import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/supabase_service.dart';
import '../../../../core/utils/failure.dart';
import '../../../../shared/models/course_model.dart';
import '../../../../shared/models/lesson_model.dart';
import '../../../../shared/models/enrollment_model.dart';

abstract class CourseRemoteDataSource {
  Future<List<CourseModel>> getCourses({String? categoryId, String? searchQuery, String? level, int page, int limit});
  Future<List<CourseModel>> getFeaturedCourses();
  Future<CourseModel?> getCourseById(String courseId);
  Future<List<LessonModel>> getLessonsByCourse(String courseId);
  Future<LessonModel?> getLessonById(String lessonId);
  Future<EnrollmentModel> enrollInCourse(String courseId);
  Future<EnrollmentModel?> getEnrollment(String courseId);
  Future<List<EnrollmentModel>> getUserEnrollments();
  Future<void> markLessonComplete(String lessonId);
  Future<double> getCourseProgress(String courseId);
}

class CourseRemoteDataSourceImpl implements CourseRemoteDataSource {
  final SupabaseClient _client = SupabaseService.client;

  @override
  Future<List<CourseModel>> getCourses({
    String? categoryId,
    String? searchQuery,
    String? level,
    int page = 0,
    int limit = 10,
  }) async {
    var query = _client
        .from(ApiConstants.coursesTable)
        .select()
        .eq('status', 'published');

    if (categoryId != null) query = query.eq('category_id', categoryId) as dynamic;
    if (level != null) query = query.eq('level', level) as dynamic;
    if (searchQuery != null && searchQuery.isNotEmpty) {
      query = query.ilike('title', '%$searchQuery%') as dynamic;
    }

    final response = await query
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', ascending: false);

    return (response as List).map((e) => CourseModel.fromJson(e)).toList();
  }

  @override
  Future<List<CourseModel>> getFeaturedCourses() async {
    final response = await _client
        .from(ApiConstants.coursesTable)
        .select()
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(10);
    return (response as List).map((e) => CourseModel.fromJson(e)).toList();
  }

  @override
  Future<CourseModel?> getCourseById(String courseId) async {
    final response = await _client
        .from(ApiConstants.coursesTable)
        .select()
        .eq('id', courseId)
        .maybeSingle();
    if (response == null) return null;
    return CourseModel.fromJson(response);
  }

  @override
  Future<List<LessonModel>> getLessonsByCourse(String courseId) async {
    final response = await _client
        .from(ApiConstants.lessonsTable)
        .select()
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index');
    return (response as List).map((e) => LessonModel.fromJson(e)).toList();
  }

  @override
  Future<LessonModel?> getLessonById(String lessonId) async {
    final response = await _client
        .from(ApiConstants.lessonsTable)
        .select()
        .eq('id', lessonId)
        .maybeSingle();
    if (response == null) return null;
    return LessonModel.fromJson(response);
  }

  @override
  Future<EnrollmentModel> enrollInCourse(String courseId) async {
    final userId = SupabaseService.currentUser!.id;
    final response = await _client
        .from(ApiConstants.enrollmentsTable)
        .upsert({
          'user_id': userId,
          'course_id': courseId,
          'status': 'active',
          'enrolled_at': DateTime.now().toIso8601String(),
        })
        .select()
        .single();
    return EnrollmentModel.fromJson(response);
  }

  @override
  Future<EnrollmentModel?> getEnrollment(String courseId) async {
    final userId = SupabaseService.currentUser!.id;
    final response = await _client
        .from(ApiConstants.enrollmentsTable)
        .select()
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
    if (response == null) return null;
    return EnrollmentModel.fromJson(response);
  }

  @override
  Future<List<EnrollmentModel>> getUserEnrollments() async {
    final userId = SupabaseService.currentUser!.id;
    final response = await _client
        .from(ApiConstants.enrollmentsTable)
        .select()
        .eq('user_id', userId)
        .order('last_accessed_at', ascending: false);
    return (response as List).map((e) => EnrollmentModel.fromJson(e)).toList();
  }

  @override
  Future<void> markLessonComplete(String lessonId) async {
    final userId = SupabaseService.currentUser!.id;
    await _client.from(ApiConstants.progressTable).upsert({
      'user_id': userId,
      'lesson_id': lessonId,
      'completed_at': DateTime.now().toIso8601String(),
    });
  }

  @override
  Future<double> getCourseProgress(String courseId) async {
    // TODO: compute from progress table via RPC or client logic
    return 0.0;
  }
}
