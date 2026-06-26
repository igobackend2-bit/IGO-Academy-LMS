enum EnrollmentStatus { active, completed, dropped }

class EnrollmentModel {
  final String id;
  final String userId;
  final String courseId;
  final EnrollmentStatus status;
  final double progressPercent;
  final int completedLessons;
  final DateTime enrolledAt;
  final DateTime? completedAt;
  final DateTime? lastAccessedAt;

  const EnrollmentModel({
    required this.id,
    required this.userId,
    required this.courseId,
    this.status = EnrollmentStatus.active,
    this.progressPercent = 0.0,
    this.completedLessons = 0,
    required this.enrolledAt,
    this.completedAt,
    this.lastAccessedAt,
  });

  factory EnrollmentModel.fromJson(Map<String, dynamic> json) {
    return EnrollmentModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      courseId: json['course_id'] as String,
      status: EnrollmentStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String? ?? 'active'),
        orElse: () => EnrollmentStatus.active,
      ),
      progressPercent: (json['progress_percent'] as num?)?.toDouble() ?? 0.0,
      completedLessons: json['completed_lessons'] as int? ?? 0,
      enrolledAt: DateTime.parse(json['enrolled_at'] as String),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      lastAccessedAt: json['last_accessed_at'] != null
          ? DateTime.parse(json['last_accessed_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'course_id': courseId,
        'status': status.name,
        'progress_percent': progressPercent,
        'completed_lessons': completedLessons,
        'enrolled_at': enrolledAt.toIso8601String(),
        'completed_at': completedAt?.toIso8601String(),
        'last_accessed_at': lastAccessedAt?.toIso8601String(),
      };
}
