enum LessonType { video, pdf, text, quiz }

class LessonModel {
  final String id;
  final String courseId;
  final String title;
  final String? description;
  final LessonType type;
  final int orderIndex;
  final int durationSeconds;
  final String? videoUrl;
  final String? pdfUrl;
  final String? content;
  final bool isPreview;
  final bool isPublished;
  final DateTime? createdAt;

  const LessonModel({
    required this.id,
    required this.courseId,
    required this.title,
    this.description,
    this.type = LessonType.video,
    this.orderIndex = 0,
    this.durationSeconds = 0,
    this.videoUrl,
    this.pdfUrl,
    this.content,
    this.isPreview = false,
    this.isPublished = true,
    this.createdAt,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as String,
      courseId: json['course_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      type: LessonType.values.firstWhere(
        (e) => e.name == (json['type'] as String? ?? 'video'),
        orElse: () => LessonType.video,
      ),
      orderIndex: json['order_index'] as int? ?? 0,
      durationSeconds: json['duration_seconds'] as int? ?? 0,
      videoUrl: json['video_url'] as String?,
      pdfUrl: json['pdf_url'] as String?,
      content: json['content'] as String?,
      isPreview: json['is_preview'] as bool? ?? false,
      isPublished: json['is_published'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'course_id': courseId,
        'title': title,
        'description': description,
        'type': type.name,
        'order_index': orderIndex,
        'duration_seconds': durationSeconds,
        'video_url': videoUrl,
        'pdf_url': pdfUrl,
        'content': content,
        'is_preview': isPreview,
        'is_published': isPublished,
        'created_at': createdAt?.toIso8601String(),
      };
}
