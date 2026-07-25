enum ResourceCategory { information, notes }

class ResourceModel {
  final String id;
  final String courseId;
  final String title;
  final String? description;
  final String fileUrl;
  final String fileType; // e.g., pdf, pptx, docx
  final ResourceCategory category;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ResourceModel({
    required this.id,
    required this.courseId,
    required this.title,
    this.description,
    required this.fileUrl,
    required this.fileType,
    this.category = ResourceCategory.information,
    this.createdAt,
    this.updatedAt,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    return ResourceModel(
      id: json['id'] as String,
      courseId: json['course_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      fileUrl: json['file_url'] as String,
      fileType: json['file_type'] as String? ?? 'pdf',
      category: ResourceCategory.values.firstWhere(
        (e) => e.name == (json['category'] as String? ?? 'information'),
        orElse: () => ResourceCategory.information,
      ),
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
        'course_id': courseId,
        'title': title,
        'description': description,
        'file_url': fileUrl,
        'file_type': fileType,
        'category': category.name,
        'created_at': createdAt?.toIso8601String(),
        'updated_at': updatedAt?.toIso8601String(),
      };
}
