import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/app_settings_model.dart';
import 'dart:convert';

class UserService {
  static const String _userKey = 'user_data';
  static const String _settingsKey = 'app_settings';

  static UserService? _instance;
  static UserService get instance => _instance ??= UserService._();

  UserService._();

  // User Management
  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toMap()));
  }

  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(_userKey);
    if (userData != null) {
      return User.fromMap(jsonDecode(userData));
    }
    return null;
  }

  Future<void> updateUser(User user) async {
    final updatedUser = user.copyWith(updatedAt: DateTime.now());
    await saveUser(updatedUser);
  }

  Future<void> deleteUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
  }

  // Settings Management
  Future<void> saveSettings(AppSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_settingsKey, jsonEncode(settings.toMap()));
  }

  Future<AppSettings> getSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final settingsData = prefs.getString(_settingsKey);
    if (settingsData != null) {
      return AppSettings.fromMap(jsonDecode(settingsData));
    }
    return AppSettings(); // Return default settings
  }

  Future<void> updateSettings(AppSettings settings) async {
    await saveSettings(settings);
  }

  Future<void> resetSettings() async {
    await saveSettings(AppSettings());
  }

  // Legacy support for existing auth
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userName') != null;
  }

  Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userName');
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Profile Image Management
  Future<void> updateProfileImage(String imagePath) async {
    final user = await getUser();
    if (user != null) {
      final updatedUser = user.copyWith(
        profileImagePath: imagePath,
        updatedAt: DateTime.now(),
      );
      await saveUser(updatedUser);
    }
  }

  // Theme Management
  Future<void> toggleTheme() async {
    final settings = await getSettings();
    final updatedSettings = settings.copyWith(
      isDarkMode: !settings.isDarkMode,
      theme: settings.isDarkMode ? 'light' : 'dark',
    );
    await saveSettings(updatedSettings);
  }

  Future<bool> isDarkMode() async {
    final settings = await getSettings();
    return settings.isDarkMode;
  }
}
