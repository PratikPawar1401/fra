class User {
  final String id;
  final String name;
  final String email;
  final String? profileImagePath;
  final String? phoneNumber;
  final String? address;
  final DateTime? dateOfBirth;
  final String? occupation;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.profileImagePath,
    this.phoneNumber,
    this.address,
    this.dateOfBirth,
    this.occupation,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profileImagePath': profileImagePath,
      'phoneNumber': phoneNumber,
      'address': address,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'occupation': occupation,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      profileImagePath: map['profileImagePath'],
      phoneNumber: map['phoneNumber'],
      address: map['address'],
      dateOfBirth: map['dateOfBirth'] != null
          ? DateTime.parse(map['dateOfBirth'])
          : null,
      occupation: map['occupation'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? profileImagePath,
    String? phoneNumber,
    String? address,
    DateTime? dateOfBirth,
    String? occupation,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      profileImagePath: profileImagePath ?? this.profileImagePath,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      address: address ?? this.address,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      occupation: occupation ?? this.occupation,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
