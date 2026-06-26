import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/router/route_names.dart';
import '../../data/models/training_category_model.dart';

class CategoryDetailScreen extends StatelessWidget {
  final String categoryId;

  const CategoryDetailScreen({super.key, required this.categoryId});

  @override
  Widget build(BuildContext context) {
    final category = mockTrainingCategories.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => mockTrainingCategories.first,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Header
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                category.imagePath,
                width: double.infinity,
                height: 220,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),

            // Tags: Duration & Level
            Row(
              children: [
                _buildTag(Icons.access_time_rounded, category.duration),
                const SizedBox(width: 12),
                _buildTag(null, category.level, isHighlighted: true),
              ],
            ),
            const SizedBox(height: 24),

            // Title
            Text(
              category.title,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
            ),
            const SizedBox(height: 16),

            // Description
            Text(
              category.description,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.textTertiary,
                    height: 1.5,
                  ),
            ),
            const SizedBox(height: 24),

            // Learning Points
            ...category.learningPoints.map((point) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.check_circle_outline_rounded,
                        color: AppColors.textPrimary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          point,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                                height: 1.4,
                              ),
                        ),
                      ),
                    ],
                  ),
                )),

            const SizedBox(height: 40),

            // Enquire Button
            AppButton(
              label: 'ENQUIRE ABOUT THIS COURSE',
              onPressed: () {
                context.push(RouteNames.courseEnquiry.replaceFirst(':categoryId', category.id));
              },
              suffixIcon: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(IconData? icon, String text, {bool isHighlighted = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isHighlighted ? AppColors.warningLight : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isHighlighted ? AppColors.warning : AppColors.border,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 16, color: AppColors.textPrimary),
            const SizedBox(width: 6),
          ],
          Text(
            text,
            style: AppTextStyles.labelSmall.copyWith(
              color: isHighlighted ? AppColors.warning : AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
