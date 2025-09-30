class Claim {
  final int? id;
  final String name;
  final String state;
  final String district;
  final String? village;
  final String? plotNumber;
  final String? area;
  final String? surveyNumber;
  final String? imagePath;
  final String? supportingDocPath;
  final String status; // Added status field
  final DateTime createdAt;

  Claim({
    this.id,
    required this.name,
    required this.state,
    required this.district,
    this.village,
    this.plotNumber,
    this.area,
    this.surveyNumber,
    this.imagePath,
    this.supportingDocPath,
    this.status = 'Pending', // Default to Pending
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'state': state,
      'district': district,
      'village': village,
      'plotNumber': plotNumber,
      'area': area,
      'surveyNumber': surveyNumber,
      'imagePath': imagePath,
      'supportingDocPath': supportingDocPath,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Claim.fromMap(Map<String, dynamic> map) {
    return Claim(
      id: map['id']?.toInt(),
      name: map['name'] ?? '',
      state: map['state'] ?? '',
      district: map['district'] ?? '',
      village: map['village'],
      plotNumber: map['plotNumber'],
      area: map['area'],
      surveyNumber: map['surveyNumber'],
      imagePath: map['imagePath'],
      supportingDocPath: map['supportingDocPath'],
      status: map['status'] ?? 'Pending',
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
