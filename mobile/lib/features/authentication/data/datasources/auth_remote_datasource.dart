import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/services/supabase_service.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/utils/failure.dart';
import '../../domain/entities/user_entity.dart';

abstract class AuthRemoteDataSource {
  Future<({bool success, Failure? failure})> sendPhoneOtp(String phone);
  Future<({UserEntity? user, Failure? failure})> verifyPhoneOtp({required String phone, required String otp});
  Future<({UserEntity? user, Failure? failure})> signInWithEmail({required String email, required String password});
  Future<({UserEntity? user, Failure? failure})> signUpWithEmail({required String email, required String password, String? name});
  Future<void> signOut();
  Future<UserEntity?> getCurrentUser();
  Future<({UserEntity? user, Failure? failure})> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatarUrl,
  });
  Future<({String? publicUrl, Failure? failure})> uploadAvatar({
    required String userId,
    required String filePath,
  });
  Stream<UserEntity?> get authStateChanges;
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final SupabaseClient _client = SupabaseService.client;

  @override
  Future<({bool success, Failure? failure})> sendPhoneOtp(String phone) async {
    try {
      await _client.auth.signInWithOtp(phone: phone);
      return (success: true, failure: null);
    } on AuthException catch (e) {
      return (success: false, failure: AuthFailure(e.message));
    } catch (e) {
      return (success: false, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<({UserEntity? user, Failure? failure})> signUpWithEmail({
    required String email,
    required String password,
    String? name,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: name != null ? {'name': name} : null,
      );
      if (response.user == null) {
        return (user: null, failure: const AuthFailure('Signup failed. Please try again.'));
      }
      // Also upsert user profile to database
      await _upsertUserProfile(response.user!);
      return (user: _mapUser(response.user!), failure: null);
    } on AuthException catch (e) {
      return (user: null, failure: AuthFailure(e.message));
    } catch (e) {
      return (user: null, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<({UserEntity? user, Failure? failure})> verifyPhoneOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final response = await _client.auth.verifyOTP(
        type: OtpType.sms,
        phone: phone,
        token: otp,
      );
      if (response.user == null) {
        return (user: null, failure: const AuthFailure('Verification failed. Please try again.'));
      }
      await _upsertUserProfile(response.user!);
      return (user: _mapUser(response.user!), failure: null);
    } on AuthException catch (e) {
      return (user: null, failure: AuthFailure(e.message));
    } catch (e) {
      return (user: null, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<({UserEntity? user, Failure? failure})> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      if (response.user == null) {
        return (user: null, failure: const AuthFailure('Login failed. Please try again.'));
      }
      return (user: await getCurrentUser(), failure: null);
    } on AuthException catch (e) {
      return (user: null, failure: AuthFailure(e.message));
    } catch (e) {
      return (user: null, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<void> signOut() => _client.auth.signOut();

  @override
  Future<UserEntity?> getCurrentUser() async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      final data = await _client.from(ApiConstants.usersTable).select().eq('id', user.id).maybeSingle();
      if (data != null) {
        return UserEntity(
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: data['name'] as String? ?? user.userMetadata?['name'] as String?,
          avatarUrl: data['avatar_url'] as String? ?? user.userMetadata?['avatar_url'] as String?,
          bio: data['bio'] as String?,
        );
      }
    } catch (e) {
      debugPrint('Error fetching user profile: $e');
    }
    return _mapUser(user);
  }

  @override
  Future<({UserEntity? user, Failure? failure})> updateProfile({
    required String userId,
    String? name,
    String? bio,
    String? avatarUrl,
  }) async {
    try {
      final Map<String, dynamic> metadata = {};
      if (name != null) metadata['name'] = name;
      if (avatarUrl != null) metadata['avatar_url'] = avatarUrl;

      if (metadata.isNotEmpty) {
        await _client.auth.updateUser(UserAttributes(data: metadata));
      }

      final Map<String, dynamic> updateData = {
        'updated_at': DateTime.now().toIso8601String(),
      };
      if (name != null) updateData['name'] = name;
      if (bio != null) updateData['bio'] = bio;
      if (avatarUrl != null) updateData['avatar_url'] = avatarUrl;

      await _client.from(ApiConstants.usersTable).upsert({
        'id': userId,
        ...updateData,
      });

      final user = await getCurrentUser();
      return (user: user, failure: null);
    } on AuthException catch (e) {
      return (user: null, failure: AuthFailure(e.message));
    } catch (e) {
      return (user: null, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Future<({String? publicUrl, Failure? failure})> uploadAvatar({
    required String userId,
    required String filePath,
  }) async {
    try {
      final file = File(filePath);
      final fileExtension = filePath.split('.').last;
      final path = '$userId/avatar_${DateTime.now().millisecondsSinceEpoch}.$fileExtension';

      await _client.storage.from(ApiConstants.profileImagesBucket).upload(
        path,
        file,
        fileOptions: const FileOptions(upsert: true),
      );

      final publicUrl = _client.storage.from(ApiConstants.profileImagesBucket).getPublicUrl(path);
      return (publicUrl: publicUrl, failure: null);
    } catch (e) {
      return (publicUrl: null, failure: UnexpectedFailure(e.toString()));
    }
  }

  @override
  Stream<UserEntity?> get authStateChanges {
    return _client.auth.onAuthStateChange.asyncMap((event) async {
      final user = event.session?.user;
      if (user == null) return null;
      try {
        final data = await _client.from(ApiConstants.usersTable).select().eq('id', user.id).maybeSingle();
        if (data != null) {
          return UserEntity(
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: data['name'] as String? ?? user.userMetadata?['name'] as String?,
            avatarUrl: data['avatar_url'] as String? ?? user.userMetadata?['avatar_url'] as String?,
            bio: data['bio'] as String?,
          );
        }
      } catch (e) {
        debugPrint('Error fetching user profile in changes: $e');
      }
      return _mapUser(user);
    });
  }

  Future<void> _upsertUserProfile(User user) async {
    await _client.from(ApiConstants.usersTable).upsert({
      'id': user.id,
      'phone': user.phone,
      'email': user.email,
      'name': user.userMetadata?['name'] as String?,
      'avatar_url': user.userMetadata?['avatar_url'] as String?,
      'updated_at': DateTime.now().toIso8601String(),
    });
  }

  UserEntity _mapUser(User user) {
    return UserEntity(
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.userMetadata?['name'] as String?,
      avatarUrl: user.userMetadata?['avatar_url'] as String?,
    );
  }
}
