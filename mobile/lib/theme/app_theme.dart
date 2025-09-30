import 'package:flutter/material.dart';

class AppTheme {
  // Light Theme Colors
  static const Color primaryLight = Color(0xFF2196F3);
  static const Color primaryLightVariant = Color(0xFF1976D2);
  static const Color secondaryLight = Color(0xFF03DAC6);
  static const Color backgroundLight = Color(0xFFFAFAFA);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color errorLight = Color(0xFFB00020);

  // Dark Theme Colors
  static const Color primaryDark = Color(0xFF90CAF9);
  static const Color primaryDarkVariant = Color(0xFF42A5F5);
  static const Color secondaryDark = Color(0xFF03DAC6);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color errorDark = Color(0xFFCF6679);

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF000000);
  static const Color textSecondaryLight = Color(0xFF5F6368);
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFFBDC1C6);

  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: primaryLight,
      secondary: secondaryLight,
      surface: surfaceLight,
      error: errorLight,
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onSurface: textPrimaryLight,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: backgroundLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: primaryLight,
      foregroundColor: Colors.white,
      elevation: 2,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardThemeData(
      color: surfaceLight,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryLight,
        foregroundColor: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryLight, width: 2),
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w600,
      ),
      headlineMedium: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w600,
      ),
      headlineSmall: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w500,
      ),
      titleMedium: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w500,
      ),
      titleSmall: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: TextStyle(color: textPrimaryLight),
      bodyMedium: TextStyle(color: textPrimaryLight),
      bodySmall: TextStyle(color: textSecondaryLight),
      labelLarge: TextStyle(
        color: textPrimaryLight,
        fontWeight: FontWeight.w500,
      ),
      labelMedium: TextStyle(color: textSecondaryLight),
      labelSmall: TextStyle(color: textSecondaryLight),
    ),
    iconTheme: const IconThemeData(color: textPrimaryLight),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryLight;
        }
        return Colors.grey;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryLight.withOpacity(0.5);
        }
        return Colors.grey.withOpacity(0.3);
      }),
    ),
    sliderTheme: const SliderThemeData(
      activeTrackColor: primaryLight,
      inactiveTrackColor: Colors.grey,
      thumbColor: primaryLight,
      overlayColor: Color.fromRGBO(33, 150, 243, 0.2),
    ),
  );

  // Dark Theme
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: primaryDark,
      secondary: secondaryDark,
      surface: surfaceDark,
      error: errorDark,
      onPrimary: Colors.black,
      onSecondary: Colors.black,
      onSurface: textPrimaryDark,
      onError: Colors.black,
    ),
    scaffoldBackgroundColor: backgroundDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceDark,
      foregroundColor: textPrimaryDark,
      elevation: 2,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: textPrimaryDark,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardThemeData(
      color: surfaceDark,
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryDark,
        foregroundColor: Colors.black,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey.shade800,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade600),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade600),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryDark, width: 2),
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w600,
      ),
      headlineMedium: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w600,
      ),
      headlineSmall: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w500,
      ),
      titleMedium: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w500,
      ),
      titleSmall: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: TextStyle(color: textPrimaryDark),
      bodyMedium: TextStyle(color: textPrimaryDark),
      bodySmall: TextStyle(color: textSecondaryDark),
      labelLarge: TextStyle(
        color: textPrimaryDark,
        fontWeight: FontWeight.w500,
      ),
      labelMedium: TextStyle(color: textSecondaryDark),
      labelSmall: TextStyle(color: textSecondaryDark),
    ),
    iconTheme: const IconThemeData(color: textPrimaryDark),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark;
        }
        return Colors.grey;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark.withOpacity(0.5);
        }
        return Colors.grey.withOpacity(0.3);
      }),
    ),
    sliderTheme: const SliderThemeData(
      activeTrackColor: primaryDark,
      inactiveTrackColor: Colors.grey,
      thumbColor: primaryDark,
      overlayColor: Color.fromRGBO(144, 202, 249, 0.2),
    ),
  );

  // Custom Theme Colors
  static const List<Color> customThemeColors = [
    Color(0xFF4CAF50), // Green
    Color(0xFFF44336), // Red
    Color(0xFF9C27B0), // Purple
    Color(0xFFFF9800), // Orange
    Color(0xFF607D8B), // Blue Grey
    Color(0xFF795548), // Brown
    Color(0xFFE91E63), // Pink
    Color(0xFF009688), // Teal
  ];

  // Generate custom theme
  static ThemeData customTheme(Color primaryColor, bool isDark) {
    final baseTheme = isDark ? darkTheme : lightTheme;

    return baseTheme.copyWith(
      colorScheme: baseTheme.colorScheme.copyWith(
        primary: primaryColor,
        secondary: primaryColor.withOpacity(0.7),
      ),
      appBarTheme: baseTheme.appBarTheme.copyWith(
        backgroundColor: isDark ? surfaceDark : primaryColor,
        foregroundColor: isDark ? textPrimaryDark : Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: isDark ? Colors.black : Colors.white,
          elevation: isDark ? 4 : 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      inputDecorationTheme: baseTheme.inputDecorationTheme.copyWith(
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryColor;
          }
          return Colors.grey;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryColor.withOpacity(0.5);
          }
          return Colors.grey.withOpacity(0.3);
        }),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: primaryColor,
        inactiveTrackColor: Colors.grey,
        thumbColor: primaryColor,
        overlayColor: primaryColor.withOpacity(0.2),
      ),
    );
  }
}
