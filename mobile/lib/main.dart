import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
// import 'services/user_service.dart'; // Temporarily disabled
import 'pages/landing_page.dart';

void main() {
  runApp(const FRAApp());
}

class FRAApp extends StatefulWidget {
  const FRAApp({super.key});

  @override
  State<FRAApp> createState() => _FRAAppState();
}

class _FRAAppState extends State<FRAApp> {
  ThemeData _currentTheme = AppTheme.lightTheme;
  ThemeMode _themeMode = ThemeMode.system;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FRA App',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _themeMode,
      home: const LandingPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
