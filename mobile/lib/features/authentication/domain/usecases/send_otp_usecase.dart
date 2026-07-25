import '../../../../core/utils/failure.dart';
import '../repositories/auth_repository.dart';

class SendOtpUseCase {
  final AuthRepository _repository;

  const SendOtpUseCase(this._repository);

  Future<({bool success, Failure? failure})> call(String phone) {
    return _repository.sendPhoneOtp(phone);
  }
}
