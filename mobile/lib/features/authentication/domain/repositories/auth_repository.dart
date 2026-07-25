import '../../../../core/utils/failure.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  /// Send OTP to phone number
  Future<({bool success, Failure? failure})> sendPhoneOtp(String phone);

  /// Verify OTP and sign in
  Future<({UserEntity? user, Failure? failure})> verifyPhoneOtp({
    required String phone,
    required String otp,
  });

  /// Sign in with email & password
  Future<({UserEntity? user, Failure? failure})> signInWithEmail({
    required String email,
    required String password,
  });

  /// Sign up with email & password
  Future<({UserEntity? user, Failure? failure})> signUpWithEmail({
    required String email,
    required String password,
    String? name,
  });

  /// Sign out
  Future<void> signOut();

  /// Get current authenticated user
  Future<UserEntity?> getCurrentUser();

  /// Update user profile
  Future<({UserEntity? user, Failure? failure})> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatarUrl,
  });

  /// Upload user profile avatar
  Future<({String? publicUrl, Failure? failure})> uploadAvatar({
    required String userId,
    required String filePath,
  });

  /// Listen to auth state changes
  Stream<UserEntity?> get authStateChanges;
}
