class AppConstants {
  AppConstants._();

  static const String appName = 'IGO Academy';
  static const String appVersion = '1.0.0';

  // Pagination
  static const int defaultPageSize = 10;
  static const int defaultCacheTimeout = 300; // seconds

  // OTP
  static const int otpLength = 6;
  static const int otpResendTimeout = 60; // seconds

  // Video
  static const int videoBufferDuration = 30; // seconds

  // File size limits
  static const int maxProfileImageSize = 5 * 1024 * 1024; // 5 MB

  // Hive box names
  static const String userBox = 'user_box';
  static const String settingsBox = 'settings_box';
  static const String courseBox = 'course_box';
  static const String progressBox = 'progress_box';

  // SharedPreferences keys
  static const String keyOnboardingDone = 'onboarding_done';
  static const String keyThemeMode = 'theme_mode';
  static const String keyLanguage = 'language';
  static const String keyFcmToken = 'fcm_token';
}
