import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/send_otp_usecase.dart';
import '../../domain/usecases/verify_otp_usecase.dart';
import '../../domain/usecases/sign_out_usecase.dart';

// -- Dependency providers --

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>(
  (_) => AuthRemoteDataSourceImpl(),
);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(authRemoteDataSourceProvider));
});

final sendOtpUseCaseProvider = Provider<SendOtpUseCase>((ref) {
  return SendOtpUseCase(ref.watch(authRepositoryProvider));
});

final verifyOtpUseCaseProvider = Provider<VerifyOtpUseCase>((ref) {
  return VerifyOtpUseCase(ref.watch(authRepositoryProvider));
});

final signOutUseCaseProvider = Provider<SignOutUseCase>((ref) {
  return SignOutUseCase(ref.watch(authRepositoryProvider));
});

// -- State --

class AuthState {
  final UserEntity? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({UserEntity? user, bool? isLoading, String? error, bool clearError = false}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SendOtpUseCase _sendOtp;
  final VerifyOtpUseCase _verifyOtp;
  final SignOutUseCase _signOut;
  final AuthRepository _repository;

  AuthNotifier({
    required SendOtpUseCase sendOtp,
    required VerifyOtpUseCase verifyOtp,
    required SignOutUseCase signOut,
    required AuthRepository repository,
  })  : _sendOtp = sendOtp,
        _verifyOtp = verifyOtp,
        _signOut = signOut,
        _repository = repository,
        super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final user = await _repository.getCurrentUser();
    state = state.copyWith(user: user);
  }

  Future<bool> sendOtp(String phone) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final result = await _sendOtp(phone);
    state = state.copyWith(isLoading: false, error: result.failure?.message);
    return result.success;
  }

  Future<bool> verifyOtp({required String phone, required String otp}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final result = await _verifyOtp(phone: phone, otp: otp);
    state = state.copyWith(
      isLoading: false,
      user: result.user,
      error: result.failure?.message,
    );
    return result.user != null;
  }

  Future<bool> signInWithEmail({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final result = await _repository.signInWithEmail(email: email, password: password);
    state = state.copyWith(
      isLoading: false,
      user: result.user,
      error: result.failure?.message,
    );
    return result.user != null;
  }

  Future<bool> signUpWithEmail({
    required String email,
    required String password,
    String? name,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final result = await _repository.signUpWithEmail(
      email: email,
      password: password,
      name: name,
    );
    state = state.copyWith(
      isLoading: false,
      user: result.user,
      error: result.failure?.message,
    );
    return result.user != null;
  }

  Future<void> signOut() async {
    await _signOut();
    state = const AuthState();
  }

  Future<bool> updateProfile({
    String? name,
    String? bio,
    String? filePath,
  }) async {
    final currentUser = state.user;
    if (currentUser == null) return false;

    state = state.copyWith(isLoading: true, clearError: true);

    String? avatarUrl;
    if (filePath != null) {
      final uploadResult = await _repository.uploadAvatar(
        userId: currentUser.id,
        filePath: filePath,
      );
      if (uploadResult.failure != null) {
        state = state.copyWith(
          isLoading: false,
          error: uploadResult.failure?.message,
        );
        return false;
      }
      avatarUrl = uploadResult.publicUrl;
    }

    final result = await _repository.updateProfile(
      userId: currentUser.id,
      name: name,
      bio: bio,
      avatarUrl: avatarUrl,
    );

    state = state.copyWith(
      isLoading: false,
      user: result.user,
      error: result.failure?.message,
    );

    return result.user != null;
  }

  void clearError() => state = state.copyWith(clearError: true);
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    sendOtp: ref.watch(sendOtpUseCaseProvider),
    verifyOtp: ref.watch(verifyOtpUseCaseProvider),
    signOut: ref.watch(signOutUseCaseProvider),
    repository: ref.watch(authRepositoryProvider),
  );
});
