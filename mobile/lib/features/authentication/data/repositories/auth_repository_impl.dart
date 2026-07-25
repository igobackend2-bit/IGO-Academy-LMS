import '../../../../core/utils/failure.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  const AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<({bool success, Failure? failure})> sendPhoneOtp(String phone) =>
      _remoteDataSource.sendPhoneOtp(phone);

  @override
  Future<({UserEntity? user, Failure? failure})> verifyPhoneOtp({
    required String phone,
    required String otp,
  }) =>
      _remoteDataSource.verifyPhoneOtp(phone: phone, otp: otp);

  @override
  Future<({UserEntity? user, Failure? failure})> signInWithEmail({
    required String email,
    required String password,
  }) =>
      _remoteDataSource.signInWithEmail(email: email, password: password);

  @override
  Future<({UserEntity? user, Failure? failure})> signUpWithEmail({
    required String email,
    required String password,
    String? name,
  }) =>
      _remoteDataSource.signUpWithEmail(email: email, password: password, name: name);

  @override
  Future<void> signOut() => _remoteDataSource.signOut();

  @override
  Future<UserEntity?> getCurrentUser() => _remoteDataSource.getCurrentUser();

  @override
  Future<({UserEntity? user, Failure? failure})> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatarUrl,
  }) =>
      _remoteDataSource.updateProfile(
        userId: userId,
        name: name,
        bio: bio,
        avatarUrl: avatarUrl,
      );

  @override
  Future<({String? publicUrl, Failure? failure})> uploadAvatar({
    required String userId,
    required String filePath,
  }) =>
      _remoteDataSource.uploadAvatar(
        userId: userId,
        filePath: filePath,
      );

  @override
  Stream<UserEntity?> get authStateChanges => _remoteDataSource.authStateChanges;
}
