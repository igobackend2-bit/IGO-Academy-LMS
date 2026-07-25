import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class QuizResultScreen extends StatelessWidget {
  final String quizId;

  const QuizResultScreen({super.key, required this.quizId});

  @override
  Widget build(BuildContext context) {
    // Mock data — replace with actual attempt result from provider
    const score = 2;
    const total = 3;
    const percent = score / total;
    const passed = percent >= 0.6;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              // Result icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: passed ? AppColors.successLight : AppColors.errorLight,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  passed ? Icons.emoji_events_rounded : Icons.sentiment_dissatisfied_rounded,
                  size: 60,
                  color: passed ? AppColors.success : AppColors.error,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                passed ? 'Congratulations!' : 'Keep Trying!',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 8),
              Text(
                passed
                    ? 'You passed the quiz successfully.'
                    : 'You didn\'t reach the passing score. Review and try again.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Score card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    Text(
                      '$score/$total',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            color: passed ? AppColors.success : AppColors.error,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text('Correct Answers', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 16),
                    LinearProgressIndicator(
                      value: percent,
                      backgroundColor: AppColors.border,
                      color: passed ? AppColors.success : AppColors.error,
                      borderRadius: BorderRadius.circular(4),
                      minHeight: 8,
                    ),
                    const SizedBox(height: 8),
                    Text('${(percent * 100).toStringAsFixed(0)}%',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: passed ? AppColors.success : AppColors.error,
                            )),
                  ],
                ),
              ),
              const Spacer(),

              if (passed)
                AppButton(
                  label: 'View Certificate',
                  onPressed: () => context.go(RouteNames.certificates),
                  prefixIcon: const Icon(Icons.workspace_premium_rounded, color: Colors.white),
                ),
              if (!passed)
                AppButton(
                  label: 'Retry Quiz',
                  onPressed: () => context.go('/quiz/$quizId'),
                ),
              const SizedBox(height: 12),
              AppButton(
                label: 'Back to Course',
                variant: AppButtonVariant.outline,
                onPressed: () => context.go(RouteNames.home),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}
