// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:igo_academy/core/services/storage_service.dart';
import 'package:igo_academy/core/utils/failure.dart';
import 'package:igo_academy/features/authentication/data/datasources/auth_remote_datasource.dart';
import 'package:igo_academy/features/authentication/domain/entities/user_entity.dart';
import 'package:igo_academy/features/authentication/presentation/providers/auth_provider.dart';
import 'package:igo_academy/main.dart';

class MockAuthRemoteDataSource implements AuthRemoteDataSource {
  @override
  Future<({bool success, Failure? failure})> sendPhoneOtp(String phone) async {
    return (success: true, failure: null);
  }

  @override
  Future<({UserEntity? user, Failure? failure})> verifyPhoneOtp({
    required String phone,
    required String otp,
  }) async {
    return (user: null, failure: null);
  }

  @override
  Future<({UserEntity? user, Failure? failure})> signInWithEmail({
    required String email,
    required String password,
  }) async {
    return (user: null, failure: null);
  }

  @override
  Future<({UserEntity? user, Failure? failure})> signUpWithEmail({
    required String email,
    required String password,
    String? name,
  }) async {
    return (user: null, failure: null);
  }

  @override
  Future<void> signOut() async {}

  @override
  Future<UserEntity?> getCurrentUser() async {
    return null;
  }

  @override
  Future<({UserEntity? user, Failure? failure})> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatarUrl,
  }) async {
    return (user: null, failure: null);
  }

  @override
  Future<({String? publicUrl, Failure? failure})> uploadAvatar({
    required String userId,
    required String filePath,
  }) async {
    return (publicUrl: null, failure: null);
  }

  @override
  Stream<UserEntity?> get authStateChanges => Stream.value(null);
}

void main() {
  setUp(() async {
    TestWidgetsFlutterBinding.ensureInitialized();

    // Mock path_provider channel
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
      const MethodChannel('plugins.flutter.io/path_provider'),
      (MethodCall methodCall) async {
        return '.';
      },
    );

    SharedPreferences.setMockInitialValues({});
    await StorageService.initialize();
  });

  testWidgets('Splash screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRemoteDataSourceProvider.overrideWithValue(MockAuthRemoteDataSource()),
        ],
        child: const IgoAcademyApp(),
      ),
    );

    // Verify that our app starts with the splash screen showing 'IGO Academy'.
    expect(find.text('IGO Academy'), findsOneWidget);

    // Settle all remaining animations and timers (like the 2-second splash screen navigation delay)
    await tester.pumpAndSettle();
  });
}
