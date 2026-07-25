import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../shared/models/notification_model.dart';
import '../../../../core/services/supabase_service.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(SupabaseService.client);
});

class NotificationRepository {
  final SupabaseClient _client;
  RealtimeChannel? _channel;

  NotificationRepository(this._client);

  /// Fetches the user's unread notifications
  Future<List<NotificationModel>> fetchNotifications(String userId) async {
    final response = await _client
        .from('notifications')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => NotificationModel.fromJson(json)).toList();
  }

  /// Marks a specific notification as read
  Future<void> markAsRead(String id) async {
    await _client.from('notifications').update({'is_read': true}).eq('id', id);
  }

  /// Marks all unread notifications as read for the user
  Future<void> markAllAsRead(String userId) async {
    await _client
        .from('notifications')
        .update({'is_read': true})
        .eq('user_id', userId)
        .eq('is_read', false);
  }

  /// Listens for real-time changes in the user's notifications
  Stream<List<NotificationModel>> watchNotifications(String userId) {
    final controller = StreamController<List<NotificationModel>>();
    
    // Initial fetch
    fetchNotifications(userId).then((initialData) {
      if (!controller.isClosed) {
        controller.add(initialData);
      }
    }).catchError((error) {
      if (!controller.isClosed) controller.addError(error);
    });

    // Set up realtime channel
    _channel = _client.channel('public:notifications:user_id=$userId');
    
    _channel?.onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'notifications',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'user_id',
        value: userId,
      ),
      callback: (payload) async {
        try {
          final updatedData = await fetchNotifications(userId);
          if (!controller.isClosed) {
            controller.add(updatedData);
          }
        } catch (e) {
          if (!controller.isClosed) controller.addError(e);
        }
      },
    ).subscribe();

    controller.onCancel = () {
      _channel?.unsubscribe();
      controller.close();
    };

    return controller.stream;
  }
}
