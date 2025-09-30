import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/claim_model.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  static Database? _database;

  DatabaseService._internal();

  factory DatabaseService() => _instance;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'fra_database.db');

    return await openDatabase(
      path,
      version: 3,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE claims(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        village TEXT,
        plotNumber TEXT,
        area TEXT,
        surveyNumber TEXT,
        imagePath TEXT,
        supportingDocPath TEXT,
        status TEXT DEFAULT 'Pending',
        createdAt TEXT NOT NULL
      )
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await db.execute('ALTER TABLE claims ADD COLUMN village TEXT');
      await db.execute('ALTER TABLE claims ADD COLUMN plotNumber TEXT');
      await db.execute('ALTER TABLE claims ADD COLUMN area TEXT');
      await db.execute('ALTER TABLE claims ADD COLUMN surveyNumber TEXT');
    }
    if (oldVersion < 3) {
      await db.execute(
        'ALTER TABLE claims ADD COLUMN status TEXT DEFAULT "Pending"',
      );
    }
  }

  Future<int> insertClaim(Claim claim) async {
    final db = await database;
    return await db.insert('claims', claim.toMap());
  }

  Future<List<Claim>> getAllClaims() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('claims');

    return List.generate(maps.length, (i) {
      return Claim.fromMap(maps[i]);
    });
  }

  Future<void> deleteClaim(int id) async {
    final db = await database;
    await db.delete('claims', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> updateClaimStatus(int id, String status) async {
    final db = await database;
    await db.update(
      'claims',
      {'status': status},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<Map<String, int>> getClaimStatusCounts() async {
    final db = await database;
    final List<Map<String, dynamic>> result = await db.rawQuery(
      'SELECT status, COUNT(*) as count FROM claims GROUP BY status',
    );

    Map<String, int> statusCounts = {
      'Total': 0,
      'Pending': 0,
      'Approved': 0,
      'Rejected': 0,
    };

    // Get total count
    final totalResult = await db.rawQuery(
      'SELECT COUNT(*) as total FROM claims',
    );
    statusCounts['Total'] = totalResult.first['total'] as int;

    // Process status counts
    for (var row in result) {
      String status = row['status'] ?? 'Pending';
      int count = row['count'] as int;
      statusCounts[status] = count;
    }

    return statusCounts;
  }
}
