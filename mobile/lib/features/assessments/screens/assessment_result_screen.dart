import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/assessment_model.dart';

class AssessmentResultScreen extends StatelessWidget {
  final AssessmentResult result;

  const AssessmentResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final passed = result.passed;
    final scoreColor = passed ? const Color(0xFF4ADE80) : const Color(0xFFF87171);

    return Scaffold(
      backgroundColor: const Color(0xFF0C2014),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 24),

              // Score circle
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: scoreColor, width: 4),
                  color: scoreColor.withOpacity(0.1),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${result.scorePercent.toStringAsFixed(0)}%',
                      style: TextStyle(color: scoreColor, fontSize: 34, fontWeight: FontWeight.w900),
                    ),
                    Text(
                      passed ? 'PASSED' : 'FAILED',
                      style: TextStyle(color: scoreColor, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Text(
                passed ? '🎉 Well done!' : '📚 Keep studying!',
                style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                '${result.correctCount}/${result.totalQuestions} correct · Pass mark: ${result.passScore}%',
                style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 14),
              ),
              const SizedBox(height: 32),

              // Per-question review
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ANSWER REVIEW', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
                    const SizedBox(height: 16),
                    ...result.correctAnswers.entries.toList().asMap().entries.map((entry) {
                      final qi = entry.key;
                      final questionId = entry.value.key;
                      final correct = entry.value.value;
                      final selected = result.selectedAnswers[questionId];
                      final isCorrect = selected == correct;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isCorrect
                              ? const Color(0xFF166534).withOpacity(0.3)
                              : const Color(0xFF7F1D1D).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isCorrect
                                ? const Color(0xFF4ADE80).withOpacity(0.4)
                                : const Color(0xFFF87171).withOpacity(0.4),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                              color: isCorrect ? const Color(0xFF4ADE80) : const Color(0xFFF87171),
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Q${qi + 1}',
                                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w700),
                                  ),
                                  if (!isCorrect) ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text('Your answer: ', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                                        Expanded(child: Text(selected ?? 'Not answered', style: const TextStyle(color: Color(0xFFF87171), fontSize: 12, fontWeight: FontWeight.w600))),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Text('Correct: ', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                                        Expanded(child: Text(correct, style: const TextStyle(color: Color(0xFF4ADE80), fontSize: 12, fontWeight: FontWeight.w600))),
                                      ],
                                    ),
                                  ] else ...[
                                    const SizedBox(height: 4),
                                    Text(correct, style: const TextStyle(color: Color(0xFF4ADE80), fontSize: 12, fontWeight: FontWeight.w600)),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/home'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
