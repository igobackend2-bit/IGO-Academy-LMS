class RouteNames {
  RouteNames._();

  // Auth
  static const String splash = '/';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String otp = '/otp';

  // Main shell
  static const String home = '/home';
  static const String categories = '/categories';
  static const String categoryDetail = '/categories/:categoryId';
  static const String courseEnquiry = '/enquiry/:categoryId';
  static const String search = '/search';
  static const String notifications = '/notifications';
  static const String profile = '/profile';

  // Courses
  static const String courseList = '/courses';
  static const String courseDetail = '/courses/:courseId';
  static const String courseEnrollment = '/courses/:courseId/enroll';

  // Learning
  static const String lessonVideo = '/lesson/:lessonId/video';
  static const String lessonPdf = '/lesson/:lessonId/pdf';
  static const String lessonNotes = '/lesson/:lessonId/notes';

  // Quiz
  static const String quiz = '/quiz/:quizId';
  static const String quizResult = '/quiz/:quizId/result';

  // Certificates
  static const String certificates = '/certificates';
  static const String certificateDetail = '/certificates/:certificateId';

  // Profile sub-routes
  static const String myCourses = '/profile/my-courses';
  static const String learningHistory = '/profile/history';
  static const String settings = '/profile/settings';
  static const String editProfile = '/profile/edit';
}
