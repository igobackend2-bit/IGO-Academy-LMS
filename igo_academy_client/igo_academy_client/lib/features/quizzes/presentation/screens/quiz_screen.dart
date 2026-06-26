import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class QuizScreen extends StatefulWidget {
  final String quizId;

  const QuizScreen({super.key, required this.quizId});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentQuestion = 0;
  int? _selectedOption;
  final Map<int, int> _answers = {};
  late Timer _timer;
  int _remainingSeconds = 30 * 60; // 30 minutes

  // Mock data — replace with actual provider
  final List<Map<String, dynamic>> _questions = [
    {
      'question': 'What is the primary purpose of Riverpod in Flutter?',
      'options': ['State management', 'Navigation', 'Networking', 'UI rendering'],
      'correct': 0,
    },
    {
      'question': 'Which widget is the entry point for Riverpod?',
      'options': ['StatefulWidget', 'ConsumerWidget', 'ProviderScope', 'InheritedWidget'],
      'correct': 2,
    },
    {
      'question': 'GoRouter is used for which purpose?',
      'options': ['State management', 'Database operations', 'Declarative routing', 'HTTP requests'],
      'correct': 2,
    },
  ];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds <= 0) {
        timer.cancel();
        _submitQuiz();
      } else {
        setState(() => _remainingSeconds--);
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _selectOption(int index) => setState(() => _selectedOption = index);

  void _nextQuestion() {
    if (_selectedOption == null) return;
    _answers[_currentQuestion] = _selectedOption!;
    if (_currentQuestion < _questions.length - 1) {
      setState(() {
        _currentQuestion++;
        _selectedOption = null;
      });
    } else {
      _submitQuiz();
    }
  }

  void _submitQuiz() {
    _timer.cancel();
    context.go('/quiz/${widget.quizId}/result');
  }

  String get _formattedTime {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestion];
    final options = question['options'] as List;
    final progress = (_currentQuestion + 1) / _questions.length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${_currentQuestion + 1}/${_questions.length}'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _remainingSeconds < 60 ? AppColors.errorLight : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.timer_outlined,
                    size: 16,
                    color: _remainingSeconds < 60 ? AppColors.error : AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(_formattedTime,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w600,
                      color: _remainingSeconds < 60 ? AppColors.error : AppColors.textPrimary,
                    )),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress bar
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.surfaceVariant,
            color: AppColors.primary,
            minHeight: 4,
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withOpacity(0.15)),
                    ),
                    child: Text(
                      question['question'] as String,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ...List.generate(options.length, (index) {
                    final isSelected = _selectedOption == index;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GestureDetector(
                        onTap: () => _selectOption(index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withOpacity(0.08)
                                : AppColors.surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.border,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.surfaceVariant,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: isSelected
                                      ? const Icon(Icons.check_rounded,
                                          color: Colors.white, size: 16)
                                      : Text(
                                          String.fromCharCode(65 + index),
                                          style: TextStyle(
                                            fontFamily: 'Inter',
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(options[index] as String,
                                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                          fontWeight: isSelected
                                              ? FontWeight.w600
                                              : FontWeight.w400,
                                          color: isSelected
                                              ? AppColors.primary
                                              : AppColors.textPrimary,
                                        )),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: AppButton(
                label: _currentQuestion < _questions.length - 1 ? 'Next Question' : 'Submit Quiz',
                onPressed: _selectedOption != null ? _nextQuestion : null,
                suffixIcon: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
