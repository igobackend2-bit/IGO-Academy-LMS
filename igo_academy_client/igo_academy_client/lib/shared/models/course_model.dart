enum CourseLevel { beginner, intermediate, advanced }

enum CourseStatus { draft, published, archived }

class CourseModel {
  final String id;
  final String title;
  final String? description;
  final String? thumbnailUrl;
  final String? categoryId;
  final String? instructorId;
  final String? instructorName;
  final String? instructorAvatarUrl;
  final CourseLevel level;
  final CourseStatus status;
  final int totalLessons;
  final int totalDurationSeconds;
  final double rating;
  final int enrollmentCount;
  final bool isFeatured;
  final bool isFree;
  final double? price;
  final List<String> tags;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CourseModel({
    required this.id,
    required this.title,
    this.description,
    this.thumbnailUrl,
    this.categoryId,
    this.instructorId,
    this.instructorName,
    this.instructorAvatarUrl,
    this.level = CourseLevel.beginner,
    this.status = CourseStatus.published,
    this.totalLessons = 0,
    this.totalDurationSeconds = 0,
    this.rating = 0.0,
    this.enrollmentCount = 0,
    this.isFeatured = false,
    this.isFree = true,
    this.price,
    this.tags = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      categoryId: json['category_id'] as String?,
      instructorId: json['instructor_id'] as String?,
      instructorName: json['instructor_name'] as String?,
      instructorAvatarUrl: json['instructor_avatar_url'] as String?,
      level: CourseLevel.values.firstWhere(
        (e) => e.name == (json['level'] as String? ?? 'beginner'),
        orElse: () => CourseLevel.beginner,
      ),
      status: CourseStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String? ?? 'published'),
        orElse: () => CourseStatus.published,
      ),
      totalLessons: json['total_lessons'] as int? ?? 0,
      totalDurationSeconds: json['total_duration_seconds'] as int? ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      enrollmentCount: json['enrollment_count'] as int? ?? 0,
      isFeatured: json['is_featured'] as bool? ?? false,
      isFree: json['is_free'] as bool? ?? true,
      price: (json['price'] as num?)?.toDouble(),
      tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'thumbnail_url': thumbnailUrl,
        'category_id': categoryId,
        'instructor_id': instructorId,
        'instructor_name': instructorName,
        'instructor_avatar_url': instructorAvatarUrl,
        'level': level.name,
        'status': status.name,
        'total_lessons': totalLessons,
        'total_duration_seconds': totalDurationSeconds,
        'rating': rating,
        'enrollment_count': enrollmentCount,
        'is_featured': isFeatured,
        'is_free': isFree,
        'price': price,
        'tags': tags,
        'created_at': createdAt?.toIso8601String(),
        'updated_at': updatedAt?.toIso8601String(),
      };
}
