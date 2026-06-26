class ApiConstants {
  ApiConstants._();

  // Supabase - replace with actual values from Supabase project settings
  static const String supabaseUrl = 'https://bmrkjcxffduqdjonxvqg.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcmtqY3hmZmR1cWRqb254dnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzA2MDcsImV4cCI6MjA5NzM0NjYwN30.VjQIcK-DEr1XekBejrSxjB0AXbn9c48yyNEyb45p2K0';

  // Supabase tables
  static const String usersTable = 'users';
  static const String categoriesTable = 'categories';
  static const String coursesTable = 'courses';
  static const String lessonsTable = 'lessons';
  static const String enrollmentsTable = 'enrollments';
  static const String progressTable = 'lesson_progress';
  static const String quizzesTable = 'quizzes';
  static const String quizQuestionsTable = 'quiz_questions';
  static const String quizAttemptsTable = 'quiz_attempts';
  static const String certificatesTable = 'certificates';
  static const String notificationsTable = 'notifications';

  // Supabase storage buckets
  static const String courseImagesBucket = 'course-images';
  static const String lessonVideosBucket = 'lesson-videos';
  static const String lessonPdfsBucket = 'lesson-pdfs';
  static const String profileImagesBucket = 'profile-images';
  static const String certificatesBucket = 'certificates';
}
