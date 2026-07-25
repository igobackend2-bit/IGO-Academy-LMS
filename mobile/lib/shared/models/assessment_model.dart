class AssessmentQuestion {
  final String id;
  final String text;
  final List<String> options;
  final String correctAnswer;
  final int points;

  const AssessmentQuestion({
    required this.id,
    required this.text,
    required this.options,
    required this.correctAnswer,
    this.points = 1,
  });

  factory AssessmentQuestion.fromJson(Map<String, dynamic> json) {
    return AssessmentQuestion(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      options: (json['options'] as List<dynamic>?)?.cast<String>() ?? [],
      correctAnswer: json['correct_answer'] as String? ?? '',
      points: json['points'] as int? ?? 1,
    );
  }
}

class AssessmentModel {
  final String id;
  final String courseId;
  final String title;
  final List<AssessmentQuestion> questions;
  final int maxScore;
  final int passScore;
  final int maxAttempts;
  final int? timerMins;

  const AssessmentModel({
    required this.id,
    required this.courseId,
    required this.title,
    required this.questions,
    this.maxScore = 100,
    this.passScore = 60,
    this.maxAttempts = 1,
    this.timerMins,
  });

  factory AssessmentModel.fromJson(Map<String, dynamic> json) {
    final rawQ = json['questions'];
    List<AssessmentQuestion> questions = [];
    if (rawQ is List) {
      questions = rawQ
          .map((q) => AssessmentQuestion.fromJson(q as Map<String, dynamic>))
          .toList();
    }
    return AssessmentModel(
      id: json['id'] as String,
      courseId: json['course_id'] as String,
      title: json['title'] as String,
      questions: questions,
      maxScore: json['max_score'] as int? ?? 100,
      passScore: json['pass_score'] as int? ?? 60,
      maxAttempts: json['max_attempts'] as int? ?? 1,
      timerMins: json['timer_mins'] as int?,
    );
  }
}

class AssessmentResult {
  final int totalQuestions;
  final int correctCount;
  final double scorePercent;
  final bool passed;
  final int passScore;
  final Map<String, String> selectedAnswers; // questionId → selected
  final Map<String, String> correctAnswers;  // questionId → correct

  const AssessmentResult({
    required this.totalQuestions,
    required this.correctCount,
    required this.scorePercent,
    required this.passed,
    required this.passScore,
    required this.selectedAnswers,
    required this.correctAnswers,
  });
}
