import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../shared/models/assessment_model.dart';

final _client = Supabase.instance.client;

// Assessments for a course
final assessmentsProvider =
    FutureProvider.family<List<AssessmentModel>, String>((ref, courseId) async {
  final response = await _client
      .from('assessments')
      .select()
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('created_at');
  return (response as List)
      .map((e) => AssessmentModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// Previous submission for an assessment
final mySubmissionProvider =
    FutureProvider.family<Map<String, dynamic>?, String>((ref, assessmentId) async {
  final userId = _client.auth.currentUser?.id;
  if (userId == null) return null;
  final response = await _client
      .from('assessment_submissions')
      .select()
      .eq('assessment_id', assessmentId)
      .eq('user_id', userId)
      .order('submitted_at', ascending: false)
      .limit(1)
      .maybeSingle();
  return response as Map<String, dynamic>?;
});

// Submit quiz answers
Future<AssessmentResult> submitAssessment({
  required AssessmentModel assessment,
  required Map<String, String> selectedAnswers, // questionId → selected option
}) async {
  final userId = _client.auth.currentUser?.id;
  if (userId == null) throw Exception('Not logged in');

  // Grade locally
  int correct = 0;
  final Map<String, String> correctAnswers = {};
  for (final q in assessment.questions) {
    correctAnswers[q.id] = q.correctAnswer;
    if (selectedAnswers[q.id] == q.correctAnswer) correct++;
  }

  final total = assessment.questions.length;
  final scorePercent = total > 0 ? (correct / total) * 100 : 0.0;
  final passed = scorePercent >= assessment.passScore;

  // Save to Supabase
  await _client.from('assessment_submissions').insert({
    'assessment_id': assessment.id,
    'user_id': userId,
    'answers': selectedAnswers,
    'score': scorePercent,
    'passed': passed,
  });

  return AssessmentResult(
    totalQuestions: total,
    correctCount: correct,
    scorePercent: scorePercent,
    passed: passed,
    passScore: assessment.passScore,
    selectedAnswers: selectedAnswers,
    correctAnswers: correctAnswers,
  );
}
