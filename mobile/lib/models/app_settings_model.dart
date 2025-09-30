class AppSettings {
  final bool isDarkMode;
  final String language;
  final bool notificationsEnabled;
  final bool biometricEnabled;
  final bool autoBackup;
  final int backupFrequency; // in hours
  final String exportFormat; // 'pdf', 'excel', 'both'
  final bool offlineMode;
  final String mapType; // 'normal', 'satellite', 'terrain'
  final double fontSize;
  final String theme; // 'system', 'light', 'dark', 'custom'

  AppSettings({
    this.isDarkMode = false,
    this.language = 'en',
    this.notificationsEnabled = true,
    this.biometricEnabled = false,
    this.autoBackup = true,
    this.backupFrequency = 24,
    this.exportFormat = 'pdf',
    this.offlineMode = false,
    this.mapType = 'normal',
    this.fontSize = 14.0,
    this.theme = 'system',
  });

  Map<String, dynamic> toMap() {
    return {
      'isDarkMode': isDarkMode,
      'language': language,
      'notificationsEnabled': notificationsEnabled,
      'biometricEnabled': biometricEnabled,
      'autoBackup': autoBackup,
      'backupFrequency': backupFrequency,
      'exportFormat': exportFormat,
      'offlineMode': offlineMode,
      'mapType': mapType,
      'fontSize': fontSize,
      'theme': theme,
    };
  }

  factory AppSettings.fromMap(Map<String, dynamic> map) {
    return AppSettings(
      isDarkMode: map['isDarkMode'] ?? false,
      language: map['language'] ?? 'en',
      notificationsEnabled: map['notificationsEnabled'] ?? true,
      biometricEnabled: map['biometricEnabled'] ?? false,
      autoBackup: map['autoBackup'] ?? true,
      backupFrequency: map['backupFrequency'] ?? 24,
      exportFormat: map['exportFormat'] ?? 'pdf',
      offlineMode: map['offlineMode'] ?? false,
      mapType: map['mapType'] ?? 'normal',
      fontSize: map['fontSize']?.toDouble() ?? 14.0,
      theme: map['theme'] ?? 'system',
    );
  }

  AppSettings copyWith({
    bool? isDarkMode,
    String? language,
    bool? notificationsEnabled,
    bool? biometricEnabled,
    bool? autoBackup,
    int? backupFrequency,
    String? exportFormat,
    bool? offlineMode,
    String? mapType,
    double? fontSize,
    String? theme,
  }) {
    return AppSettings(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      language: language ?? this.language,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      autoBackup: autoBackup ?? this.autoBackup,
      backupFrequency: backupFrequency ?? this.backupFrequency,
      exportFormat: exportFormat ?? this.exportFormat,
      offlineMode: offlineMode ?? this.offlineMode,
      mapType: mapType ?? this.mapType,
      fontSize: fontSize ?? this.fontSize,
      theme: theme ?? this.theme,
    );
  }
}
