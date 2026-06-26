import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_empty_state.dart';

class CertificatesScreen extends ConsumerWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: Replace with actual certificates provider
    const List<Map<String, String>> certs = [];

    return Scaffold(
      appBar: AppBar(title: const Text('My Certificates')),
      body: certs.isEmpty
          ? const AppEmptyState(
              title: 'No Certificates Yet',
              subtitle: 'Complete a course to earn your first certificate.',
              icon: Icons.workspace_premium_outlined,
            )
          : ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: certs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _CertificateCard(cert: certs[index]);
              },
            ),
    );
  }
}

class _CertificateCard extends StatelessWidget {
  final Map<String, String> cert;

  const _CertificateCard({required this.cert});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFFBE6), Color(0xFFFFF3CC)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFFFFD700).withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.workspace_premium_rounded,
                size: 28, color: Color(0xFFB8860B)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(cert['courseTitle'] ?? 'Course',
                    style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 4),
                Text(cert['issuedAt'] ?? '',
                    style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.download_outlined, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
