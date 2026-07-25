class QuizModel {
  final String id;
  final String courseId;
  final String? lessonId;
  final String title;
  final String? description;
  final int totalQuestions;
  final int passingScore; // percentage
  final int timeLimitMinutes;
  final bool isRequired;
  final DateTime? createdAt;

  const QuizModel({
    required this.id,
    required this.courseId,
    this.lessonId,
    required this.title,
    this.description,
    this.totalQuestions = 0,
    this.passingScore = 60,
    this.timeLimitMinutes = 30,
    this.isRequired = false,
    this.createdAt,
  });

  factory QuizModel.fromJson(Map<String, dynamic> json) {
    return QuizModel(
      id: json['id'] as String,
      courseId: json['course_id'] as String,
      lessonId: json['lesson_id'] as String?,
      title: json['title'] as String,
      description: json['description'] as String?,
      totalQuestions: json['total_questions'] as int? ?? 0,
      passingScore: json['passing_score'] as int? ?? 60,
      timeLimitMinutes: json['time_limit_minutes'] as int? ?? 30,
      isRequired: json['is_required'] as bool? ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'course_id': courseId,
        'lesson_id': lessonId,
        'title': title,
        'description': description,
        'total_questions': totalQuestions,
        'passing_score': passingScore,
        'time_limit_minutes': timeLimitMinutes,
        'is_required': isRequired,
        'created_at': createdAt?.toIso8601String(),
      };
}

class QuizQuestionModel {
  final String id;
  final String quizId;
  final String question;
  final List<String> options;
  final int correctOptionIndex;
  final String? explanation;
  final int orderIndex;
  final int points;

  const QuizQuestionModel({
    required this.id,
    required this.quizId,
    required this.question,
    required this.options,
    required this.correctOptionIndex,
    this.explanation,
    this.orderIndex = 0,
    this.points = 1,
  });

  factory QuizQuestionModel.fromJson(Map<String, dynamic> json) {
    return QuizQuestionModel(
      id: json['id'] as String,
      quizId: json['quiz_id'] as String,
      question: json['question'] as String,
      options: (json['options'] as List<dynamic>).cast<String>(),
      correctOptionIndex: json['correct_option_index'] as int,
      explanation: json['explanation'] as String?,
      orderIndex: json['order_index'] as int? ?? 0,
      points: json['points'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'quiz_id': quizId,
        'question': question,
        'options': options,
        'correct_option_index': correctOptionIndex,
        'explanation': explanation,
        'order_index': orderIndex,
        'points': points,
      };
}

class QuizAttemptModel {
  final String id;
  final String userId;
  final String quizId;
  final int score;
  final int totalPoints;
  final bool isPassed;
  final Map<String, int> answers; // questionId -> selectedOptionIndex
  final DateTime attemptedAt;
  final int timeTakenSeconds;

  const QuizAttemptModel({
    required this.id,
    required this.userId,
    required this.quizId,
    required this.score,
    required this.totalPoints,
    required this.isPassed,
    this.answers = const {},
    required this.attemptedAt,
    this.timeTakenSeconds = 0,
  });

  double get percentage => totalPoints > 0 ? score / totalPoints : 0;

  factory QuizAttemptModel.fromJson(Map<String, dynamic> json) {
    return QuizAttemptModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      quizId: json['quiz_id'] as String,
      score: json['score'] as int,
      totalPoints: json['total_points'] as int,
      isPassed: json['is_passed'] as bool,
      answers: Map<String, int>.from(json['answers'] as Map? ?? {}),
      attemptedAt: DateTime.parse(json['attempted_at'] as String),
      timeTakenSeconds: json['time_taken_seconds'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'quiz_id': quizId,
        'score': score,
        'total_points': totalPoints,
        'is_passed': isPassed,
        'answers': answers,
        'attempted_at': attemptedAt.toIso8601String(),
        'time_taken_seconds': timeTakenSeconds,
      };
}
