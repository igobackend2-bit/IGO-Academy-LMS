import 'package:flutter/material.dart';
import '../../../../core/widgets/app_error.dart';

class LearningHistoryScreen extends StatelessWidget {
  const LearningHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Learning History')),
      body: const AppEmptyState(
        title: 'No History Yet',
        subtitle: 'Your completed lessons will appear here.',
        icon: Icons.history_rounded,
      ),
    );
  }
}
