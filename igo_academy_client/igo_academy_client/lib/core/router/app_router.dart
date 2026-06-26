import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'route_names.dart';
import '../../features/authentication/presentation/screens/splash_screen.dart';
import '../../features/authentication/presentation/screens/login_screen.dart';
import '../../features/authentication/presentation/screens/signup_screen.dart';
import '../../features/authentication/presentation/screens/otp_screen.dart';
import '../../features/dashboard/presentation/screens/home_screen.dart';
import '../../features/dashboard/presentation/screens/categories_screen.dart';
import '../../features/dashboard/presentation/screens/category_detail_screen.dart';
import '../../features/dashboard/presentation/screens/course_enquiry_screen.dart';
import '../../features/courses/presentation/screens/course_list_screen.dart';
import '../../features/courses/presentation/screens/course_detail_screen.dart';
import '../../features/courses/presentation/screens/course_enrollment_screen.dart';
import '../../features/learning/presentation/screens/video_lesson_screen.dart';
import '../../features/learning/presentation/screens/pdf_lesson_screen.dart';
import '../../features/quizzes/presentation/screens/quiz_screen.dart';
import '../../features/quizzes/presentation/screens/quiz_result_screen.dart';
import '../../features/certificates/presentation/screens/certificates_screen.dart';
import '../../features/certificates/presentation/screens/certificate_detail_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/my_courses_screen.dart';
import '../../features/profile/presentation/screens/settings_screen.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/profile/presentation/screens/learning_history_screen.dart';
import '../../shared/widgets/main_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return AppRouter(ref).router;
});

class AppRouter {
  final Ref ref;

  AppRouter(this.ref);

  late final router = GoRouter(
    initialLocation: RouteNames.splash,
    debugLogDiagnostics: true,
    redirect: _handleRedirect,
    routes: [
      // Splash
      GoRoute(
        path: RouteNames.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes
      GoRoute(
        path: RouteNames.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: RouteNames.signup,
        name: 'signup',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: RouteNames.otp,
        name: 'otp',
        builder: (context, state) {
          final phone = state.extra as String? ?? '';
          return OtpScreen(phone: phone);
        },
      ),

      // Shell — bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: RouteNames.home,
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: RouteNames.categories,
            name: 'categories',
            builder: (context, state) => const CategoriesScreen(),
          ),
          GoRoute(
            path: RouteNames.search,
            name: 'search',
            builder: (context, state) => const CourseListScreen(isSearch: true),
          ),
          GoRoute(
            path: RouteNames.courseList,
            name: 'courseList',
            builder: (context, state) => const CourseListScreen(),
          ),
          GoRoute(
            path: RouteNames.notifications,
            name: 'notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
          GoRoute(
            path: RouteNames.profile,
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // Category Detail
      GoRoute(
        path: RouteNames.categoryDetail,
        name: 'categoryDetail',
        builder: (context, state) {
          final categoryId = state.pathParameters['categoryId']!;
          return CategoryDetailScreen(categoryId: categoryId);
        },
      ),
      GoRoute(
        path: RouteNames.courseEnquiry,
        name: 'courseEnquiry',
        builder: (context, state) {
          final categoryId = state.pathParameters['categoryId']!;
          return CourseEnquiryScreen(categoryId: categoryId);
        },
      ),

      // Courses
      GoRoute(
        path: RouteNames.courseDetail,
        name: 'courseDetail',
        builder: (context, state) {
          final courseId = state.pathParameters['courseId']!;
          return CourseDetailScreen(courseId: courseId);
        },
      ),
      GoRoute(
        path: RouteNames.courseEnrollment,
        name: 'courseEnrollment',
        builder: (context, state) {
          final courseId = state.pathParameters['courseId']!;
          return CourseEnrollmentScreen(courseId: courseId);
        },
      ),

      // Learning
      GoRoute(
        path: RouteNames.lessonVideo,
        name: 'lessonVideo',
        builder: (context, state) {
          final lessonId = state.pathParameters['lessonId']!;
          return VideoLessonScreen(lessonId: lessonId);
        },
      ),
      GoRoute(
        path: RouteNames.lessonPdf,
        name: 'lessonPdf',
        builder: (context, state) {
          final lessonId = state.pathParameters['lessonId']!;
          return PdfLessonScreen(lessonId: lessonId);
        },
      ),

      // Quiz
      GoRoute(
        path: RouteNames.quiz,
        name: 'quiz',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return QuizScreen(quizId: quizId);
        },
      ),
      GoRoute(
        path: RouteNames.quizResult,
        name: 'quizResult',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return QuizResultScreen(quizId: quizId);
        },
      ),

      // Certificates
      GoRoute(
        path: RouteNames.certificates,
        name: 'certificates',
        builder: (context, state) => const CertificatesScreen(),
      ),
      GoRoute(
        path: RouteNames.certificateDetail,
        name: 'certificateDetail',
        builder: (context, state) {
          final certificateId = state.pathParameters['certificateId']!;
          return CertificateDetailScreen(certificateId: certificateId);
        },
      ),

      // Profile sub-routes
      GoRoute(
        path: RouteNames.myCourses,
        name: 'myCourses',
        builder: (context, state) => const MyCoursesScreen(),
      ),
      GoRoute(
        path: RouteNames.settings,
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: RouteNames.editProfile,
        name: 'editProfile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: RouteNames.learningHistory,
        name: 'learningHistory',
        builder: (context, state) => const LearningHistoryScreen(),
      ),
    ],
  );

  String? _handleRedirect(BuildContext context, GoRouterState state) {
    // TODO: Add authentication-based redirect logic using ref
    // final isAuth = ref.read(authStateProvider).isAuthenticated;
    // if (!isAuth && !_publicRoutes.contains(state.matchedLocation)) {
    //   return RouteNames.login;
    // }
    return null;
  }
}
