import 'package:flutter/material.dart';
import '../services/user_service.dart';
import '../models/app_settings_model.dart';
import '../theme/app_theme.dart';

class ThemeProvider with ChangeNotifier {
  static ThemeProvider? _instance;
  static ThemeProvider get instance => _instance ??= ThemeProvider._();

  ThemeProvider._() {
    _loadThemeSettings();
  }

  final UserService _userService = UserService.instance;

  AppSettings _currentSettings = AppSettings();
  ThemeData _currentTheme = AppTheme.lightTheme;
  Color _customPrimaryColor = AppTheme.primaryLight;

  // Getters
  AppSettings get currentSettings => _currentSettings;
  ThemeData get currentTheme => _currentTheme;
  Color get customPrimaryColor => _customPrimaryColor;
  bool get isDarkMode => _currentSettings.isDarkMode;
  String get themeMode => _currentSettings.theme;

  // Load theme settings from storage
  Future<void> _loadThemeSettings() async {
    try {
      _currentSettings = await _userService.getSettings();
      _applyTheme();
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading theme settings: $e');
    }
  }

  // Apply theme based on current settings
  void _applyTheme() {
    switch (_currentSettings.theme) {
      case 'light':
        _currentTheme = AppTheme.lightTheme;
        break;
      case 'dark':
        _currentTheme = AppTheme.darkTheme;
        break;
      case 'system':
        // For system theme, we'll handle this in the widget tree
        _currentTheme = _currentSettings.isDarkMode
            ? AppTheme.darkTheme
            : AppTheme.lightTheme;
        break;
      case 'custom':
        _currentTheme = AppTheme.customTheme(
          _customPrimaryColor,
          _currentSettings.isDarkMode,
        );
        break;
      default:
        _currentTheme = AppTheme.lightTheme;
    }
  }

  // Toggle between light and dark mode
  Future<void> toggleDarkMode() async {
    final newSettings = _currentSettings.copyWith(
      isDarkMode: !_currentSettings.isDarkMode,
      theme: _currentSettings.isDarkMode ? 'light' : 'dark',
    );

    await _updateSettings(newSettings);
  }

  // Set specific theme mode
  Future<void> setThemeMode(String themeMode) async {
    bool isDark = _currentSettings.isDarkMode;

    // Auto-determine dark mode for certain theme modes
    if (themeMode == 'dark') {
      isDark = true;
    } else if (themeMode == 'light') {
      isDark = false;
    }
    // For 'system' and 'custom', keep current dark mode setting

    final newSettings = _currentSettings.copyWith(
      theme: themeMode,
      isDarkMode: isDark,
    );

    await _updateSettings(newSettings);
  }

  // Set custom primary color
  Future<void> setCustomPrimaryColor(Color color) async {
    _customPrimaryColor = color;

    final newSettings = _currentSettings.copyWith(theme: 'custom');

    await _updateSettings(newSettings);
  }

  // Set font size
  Future<void> setFontSize(double fontSize) async {
    final newSettings = _currentSettings.copyWith(fontSize: fontSize);

    await _updateSettings(newSettings);
  }

  // Update system theme (called when system theme changes)
  void updateSystemTheme(bool isSystemDark) {
    if (_currentSettings.theme == 'system') {
      final newSettings = _currentSettings.copyWith(isDarkMode: isSystemDark);

      _currentSettings = newSettings;
      _applyTheme();
      notifyListeners();

      // Save the system preference
      _userService.saveSettings(_currentSettings);
    }
  }

  // Private method to update settings
  Future<void> _updateSettings(AppSettings newSettings) async {
    _currentSettings = newSettings;
    _applyTheme();

    await _userService.saveSettings(_currentSettings);
    notifyListeners();
  }

  // Reset theme to default
  Future<void> resetTheme() async {
    _currentSettings = AppSettings();
    _customPrimaryColor = AppTheme.primaryLight;
    _applyTheme();

    await _userService.saveSettings(_currentSettings);
    notifyListeners();
  }

  // Get theme mode display name
  String getThemeModeDisplayName(String themeMode) {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
      case 'custom':
        return 'Custom Theme';
      default:
        return 'Unknown';
    }
  }

  // Get available theme modes
  List<String> get availableThemeModes => ['system', 'light', 'dark', 'custom'];

  // Check if custom theme is active
  bool get isCustomTheme => _currentSettings.theme == 'custom';

  // Get current theme brightness
  Brightness get brightness => _currentTheme.brightness;

  // Method to apply theme with font size scaling
  ThemeData getScaledTheme() {
    final baseTheme = _currentTheme;
    final fontScale = _currentSettings.fontSize / 14.0; // 14 is base font size

    return baseTheme.copyWith(
      textTheme: baseTheme.textTheme.copyWith(
        displayLarge: baseTheme.textTheme.displayLarge?.copyWith(
          fontSize:
              (baseTheme.textTheme.displayLarge?.fontSize ?? 96) * fontScale,
        ),
        displayMedium: baseTheme.textTheme.displayMedium?.copyWith(
          fontSize:
              (baseTheme.textTheme.displayMedium?.fontSize ?? 60) * fontScale,
        ),
        displaySmall: baseTheme.textTheme.displaySmall?.copyWith(
          fontSize:
              (baseTheme.textTheme.displaySmall?.fontSize ?? 48) * fontScale,
        ),
        headlineLarge: baseTheme.textTheme.headlineLarge?.copyWith(
          fontSize:
              (baseTheme.textTheme.headlineLarge?.fontSize ?? 40) * fontScale,
        ),
        headlineMedium: baseTheme.textTheme.headlineMedium?.copyWith(
          fontSize:
              (baseTheme.textTheme.headlineMedium?.fontSize ?? 34) * fontScale,
        ),
        headlineSmall: baseTheme.textTheme.headlineSmall?.copyWith(
          fontSize:
              (baseTheme.textTheme.headlineSmall?.fontSize ?? 24) * fontScale,
        ),
        titleLarge: baseTheme.textTheme.titleLarge?.copyWith(
          fontSize:
              (baseTheme.textTheme.titleLarge?.fontSize ?? 20) * fontScale,
        ),
        titleMedium: baseTheme.textTheme.titleMedium?.copyWith(
          fontSize:
              (baseTheme.textTheme.titleMedium?.fontSize ?? 16) * fontScale,
        ),
        titleSmall: baseTheme.textTheme.titleSmall?.copyWith(
          fontSize:
              (baseTheme.textTheme.titleSmall?.fontSize ?? 14) * fontScale,
        ),
        bodyLarge: baseTheme.textTheme.bodyLarge?.copyWith(
          fontSize: (baseTheme.textTheme.bodyLarge?.fontSize ?? 16) * fontScale,
        ),
        bodyMedium: baseTheme.textTheme.bodyMedium?.copyWith(
          fontSize:
              (baseTheme.textTheme.bodyMedium?.fontSize ?? 14) * fontScale,
        ),
        bodySmall: baseTheme.textTheme.bodySmall?.copyWith(
          fontSize: (baseTheme.textTheme.bodySmall?.fontSize ?? 12) * fontScale,
        ),
        labelLarge: baseTheme.textTheme.labelLarge?.copyWith(
          fontSize:
              (baseTheme.textTheme.labelLarge?.fontSize ?? 14) * fontScale,
        ),
        labelMedium: baseTheme.textTheme.labelMedium?.copyWith(
          fontSize:
              (baseTheme.textTheme.labelMedium?.fontSize ?? 12) * fontScale,
        ),
        labelSmall: baseTheme.textTheme.labelSmall?.copyWith(
          fontSize:
              (baseTheme.textTheme.labelSmall?.fontSize ?? 11) * fontScale,
        ),
      ),
    );
  }
}
