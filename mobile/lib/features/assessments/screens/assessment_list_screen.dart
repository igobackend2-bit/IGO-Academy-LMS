import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/assessment_provider.dart';

class AssessmentListScreen extends ConsumerWidget {
  final String courseId;
  final String courseTitle;

  const AssessmentListScreen({
    super.key,
    required this.courseId,
    required this.courseTitle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assessmentsAsync = ref.watch(assessmentsProvider(courseId));

    return Scaffold(
      backgroundColor: const Color(0xFF0C2014),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.arrow_back_ios_rounded, size: 16, color: Colors.white),
          ),
          onPressed: () => context.pop(),
        ),
        title: const Text('Assessments', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
        centerTitle: true,
      ),
      body: assessmentsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text(e.toString(), style: const TextStyle(color: Colors.white))),
        data: (assessments) {
          if (assessments.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.quiz_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
                  const SizedBox(height: 16),
                  Text('No assessments yet', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 16)),
                  const SizedBox(height: 8),
                  Text('Check back after your next lesson', style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 13)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: assessments.length,
            itemBuilder: (context, i) {
              final a = assessments[i];
              final submissionAsync = ref.watch(mySubmissionProvider(a.id));

              return submissionAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (submission) {
                  final isCompleted = submission != null;
                  final score = submission?['score'] as num?;
                  final passed = submission?['passed'] as bool?;

                  return GestureDetector(
                    onTap: () => context.push('/assessment-quiz', extra: a),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.07),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.quiz_rounded, color: AppColors.primary, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(a.title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${a.questions.length} questions · Pass ${a.passScore}%${a.timerMins != null ? ' · ⏱ ${a.timerMins} min' : ''}',
                                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                              if (isCompleted)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: passed == true
                                        ? const Color(0xFF166534).withOpacity(0.4)
                                        : const Color(0xFF7F1D1D).withOpacity(0.4),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    passed == true ? '✓ ${score?.toStringAsFixed(0)}%' : '✗ ${score?.toStringAsFixed(0)}%',
                                    style: TextStyle(
                                      color: passed == true ? const Color(0xFF4ADE80) : const Color(0xFFF87171),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                )
                              else
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text('Start', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                            ],
                          ),
                          if (isCompleted) ...[
                            const SizedBox(height: 12),
                            LinearProgressIndicator(
                              value: (score ?? 0) / 100,
                              backgroundColor: Colors.white.withOpacity(0.1),
                              color: passed == true ? const Color(0xFF4ADE80) : const Color(0xFFF87171),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              isCompleted && a.maxAttempts > 1 ? 'Tap to retake' : 'Completed',
                              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
