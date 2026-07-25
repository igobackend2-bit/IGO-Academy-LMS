import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      appBar: AppBar(
        title: const Text('Help & Support'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.asset(
                    'assets/logo/IGO Academy.jpg',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Center(
              child: Text(
                'IGO Academy',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                'Version 1.0.0',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ),
            const SizedBox(height: 32),
            _buildSectionTitle('About Us', context),
            const SizedBox(height: 12),
            _buildText(
              'IGO Academy is a premier learning platform dedicated to providing high-quality, practical training in agriculture, agribusiness, and modern farming techniques like hydroponics and vertical farming. We empower individuals and entrepreneurs to build sustainable and profitable farming businesses.',
              context,
            ),
            const SizedBox(height: 24),
            _buildSectionTitle('Contact Us', context),
            const SizedBox(height: 12),
            _buildContactRow(Icons.email_outlined, 'support@igoacademy.com', context),
            const SizedBox(height: 12),
            _buildContactRow(Icons.phone_outlined, '+91 98765 43210', context),
            const SizedBox(height: 12),
            _buildContactRow(Icons.location_on_outlined, 'IGO Academy Headquarters, Tech Park, City, Country', context),
            const SizedBox(height: 32),
            _buildSectionTitle('Frequently Asked Questions', context),
            const SizedBox(height: 12),
            _buildFAQ('How do I enroll in a course?', 'You can enroll in a course by visiting the Courses tab, selecting a program of your interest, and tapping the "ENROLL IN THIS COURSE" button to fill out the enquiry form.', context),
            _buildFAQ('Are the courses certified?', 'Yes, all our major programs provide a certificate of completion upon successfully passing the assessments and fulfilling attendance criteria.', context),
            _buildFAQ('Can I access materials offline?', 'Currently, offline access is available for selected PDF notes and reading materials. Videos require an active internet connection.', context),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: 0.5,
          ),
    );
  }

  Widget _buildText(String text, BuildContext context) {
    return Text(
      text,
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
            height: 1.5,
          ),
    );
  }

  Widget _buildContactRow(IconData icon, String text, BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.textTertiary),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textPrimary,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildFAQ(String question, String answer, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Q: $question',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'A: $answer',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
          ),
        ],
      ),
    );
  }
}
