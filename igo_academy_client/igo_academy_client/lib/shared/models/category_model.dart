class CategoryModel {
  final String id;
  final String name;
  final String? description;
  final String? iconUrl;
  final String? colorHex;
  final int courseCount;
  final DateTime? createdAt;

  const CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.iconUrl,
    this.colorHex,
    this.courseCount = 0,
    this.createdAt,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      iconUrl: json['icon_url'] as String?,
      colorHex: json['color_hex'] as String?,
      courseCount: json['course_count'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'icon_url': iconUrl,
        'color_hex': colorHex,
        'course_count': courseCount,
        'created_at': createdAt?.toIso8601String(),
      };
}
