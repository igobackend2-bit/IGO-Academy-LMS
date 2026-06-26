import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/storage_service.dart';

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier()
      : super(StorageService.isDarkMode ? ThemeMode.dark : ThemeMode.light);

  Future<void> toggle() async {
    final isDark = state == ThemeMode.dark;
    state = isDark ? ThemeMode.light : ThemeMode.dark;
    await StorageService.setDarkMode(!isDark);
  }

  Future<void> setTheme(ThemeMode mode) async {
    state = mode;
    await StorageService.setDarkMode(mode == ThemeMode.dark);
  }

  bool get isDark => state == ThemeMode.dark;
}
