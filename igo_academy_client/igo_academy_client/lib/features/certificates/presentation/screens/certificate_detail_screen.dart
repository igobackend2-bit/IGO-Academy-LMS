import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class CertificateDetailScreen extends StatelessWidget {
  final String certificateId;

  const CertificateDetailScreen({super.key, required this.certificateId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Certificate'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () => Share.share('Check out my certificate from IGO Academy!'),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFFFBE6), Color(0xFFFFF0B3)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.5), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFFD700).withOpacity(0.2),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.workspace_premium_rounded,
                          size: 72, color: Color(0xFFB8860B)),
                      const SizedBox(height: 16),
                      const Text(
                        'CERTIFICATE OF COMPLETION',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 2,
                          color: Color(0xFF8B6914),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'This certifies that',
                        style: TextStyle(fontFamily: 'Inter', color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Student Name',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontStyle: FontStyle.italic,
                            ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'has successfully completed',
                        style: TextStyle(fontFamily: 'Inter', color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Flutter Development Course',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: AppColors.primary,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      const Divider(color: Color(0xFFFFD700)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            children: [
                              Text('Date', style: Theme.of(context).textTheme.labelSmall),
                              Text('June 19, 2026',
                                  style: Theme.of(context).textTheme.labelMedium),
                            ],
                          ),
                          Column(
                            children: [
                              Text('Certificate #', style: Theme.of(context).textTheme.labelSmall),
                              Text('IGO-2026-0001',
                                  style: Theme.of(context).textTheme.labelMedium),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: AppButton(
                label: 'Download Certificate',
                onPressed: () {},
                prefixIcon: const Icon(Icons.download_rounded, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
