import '../../../../core/utils/failure.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class VerifyOtpUseCase {
  final AuthRepository _repository;

  const VerifyOtpUseCase(this._repository);

  Future<({UserEntity? user, Failure? failure})> call({
    required String phone,
    required String otp,
  }) {
    return _repository.verifyPhoneOtp(phone: phone, otp: otp);
  }
}
