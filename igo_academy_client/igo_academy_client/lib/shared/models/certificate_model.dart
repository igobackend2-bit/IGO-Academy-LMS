class CertificateModel {
  final String id;
  final String userId;
  final String courseId;
  final String courseTitle;
  final String? userName;
  final String? certificateUrl;
  final String certificateNumber;
  final DateTime issuedAt;

  const CertificateModel({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.courseTitle,
    this.userName,
    this.certificateUrl,
    required this.certificateNumber,
    required this.issuedAt,
  });

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    return CertificateModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      courseId: json['course_id'] as String,
      courseTitle: json['course_title'] as String,
      userName: json['user_name'] as String?,
      certificateUrl: json['certificate_url'] as String?,
      certificateNumber: json['certificate_number'] as String,
      issuedAt: DateTime.parse(json['issued_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'course_id': courseId,
        'course_title': courseTitle,
        'user_name': userName,
        'certificate_url': certificateUrl,
        'certificate_number': certificateNumber,
        'issued_at': issuedAt.toIso8601String(),
      };
}
