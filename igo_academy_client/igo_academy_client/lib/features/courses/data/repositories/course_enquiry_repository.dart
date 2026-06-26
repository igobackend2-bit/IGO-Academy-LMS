import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CourseEnquiryRepository {
  final SupabaseClient _supabase;

  CourseEnquiryRepository(this._supabase);

  Future<void> submitEnquiry({
    required String name,
    required String email,
    required String phone,
    String? altPhone,
    required String courseId,
    String? additionalDetails,
  }) async {
    try {
      await _supabase.from('course_enquiries').insert({
        'name': name,
        'email': email,
        'phone': phone,
        'alt_phone': altPhone,
        'course_id': courseId,
        'additional_details': additionalDetails,
      });
    } catch (e) {
      throw Exception('Failed to submit enquiry: $e');
    }
  }
}

final courseEnquiryRepositoryProvider = Provider<CourseEnquiryRepository>((ref) {
  return CourseEnquiryRepository(Supabase.instance.client);
});

class CourseEnquiryNotifier extends StateNotifier<AsyncValue<void>> {
  final CourseEnquiryRepository _repository;

  CourseEnquiryNotifier(this._repository) : super(const AsyncData(null));

  Future<void> submit({
    required String name,
    required String email,
    required String phone,
    String? altPhone,
    required String courseId,
    String? additionalDetails,
  }) async {
    state = const AsyncLoading();
    try {
      await _repository.submitEnquiry(
        name: name,
        email: email,
        phone: phone,
        altPhone: altPhone,
        courseId: courseId,
        additionalDetails: additionalDetails,
      );
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}

final courseEnquiryNotifierProvider = StateNotifierProvider<CourseEnquiryNotifier, AsyncValue<void>>((ref) {
  final repository = ref.watch(courseEnquiryRepositoryProvider);
  return CourseEnquiryNotifier(repository);
});
