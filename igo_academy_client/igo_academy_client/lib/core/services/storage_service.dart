import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class StorageService {
  StorageService._();

  static late SharedPreferences _prefs;

  static Future<void> initialize() async {
    await Hive.initFlutter();
    _prefs = await SharedPreferences.getInstance();
    await _openBoxes();
  }

  static Future<void> _openBoxes() async {
    await Hive.openBox(AppConstants.settingsBox);
    await Hive.openBox(AppConstants.userBox);
    await Hive.openBox(AppConstants.courseBox);
    await Hive.openBox(AppConstants.progressBox);
  }

  // SharedPreferences helpers
  static Future<bool> setBool(String key, bool value) => _prefs.setBool(key, value);
  static bool getBool(String key, {bool defaultValue = false}) =>
      _prefs.getBool(key) ?? defaultValue;

  static Future<bool> setString(String key, String value) => _prefs.setString(key, value);
  static String? getString(String key) => _prefs.getString(key);

  static Future<bool> remove(String key) => _prefs.remove(key);
  static Future<bool> clear() => _prefs.clear();

  // Hive box accessors
  static Box get settingsBox => Hive.box(AppConstants.settingsBox);
  static Box get userBox => Hive.box(AppConstants.userBox);
  static Box get courseBox => Hive.box(AppConstants.courseBox);
  static Box get progressBox => Hive.box(AppConstants.progressBox);

  // Theme
  static bool get isDarkMode =>
      getBool(AppConstants.keyThemeMode);
  static Future<void> setDarkMode(bool value) =>
      setBool(AppConstants.keyThemeMode, value);

  // Language
  static String get language =>
      getString(AppConstants.keyLanguage) ?? 'en';
  static Future<void> setLanguage(String value) =>
      setString(AppConstants.keyLanguage, value);

  // Onboarding
  static bool get isOnboardingDone =>
      getBool(AppConstants.keyOnboardingDone);
  static Future<void> setOnboardingDone() =>
      setBool(AppConstants.keyOnboardingDone, true);
}
