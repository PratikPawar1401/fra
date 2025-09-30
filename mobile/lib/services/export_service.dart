import 'dart:io';
// import 'package:pdf/widgets.dart' as pw;
// import 'package:printing/printing.dart';
// import 'package:excel/excel.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import '../models/claim_model.dart';

class ExportService {
  // Export claims to PDF (temporarily disabled)
  static Future<void> exportToPDF(List<Claim> claims, {String? title}) async {
    throw UnsupportedError('PDF export temporarily disabled for compatibility');
  }

  // Export claims to Excel (temporarily disabled)
  static Future<String> exportToExcel(
    List<Claim> claims, {
    String? fileName,
  }) async {
    throw UnsupportedError(
      'Excel export temporarily disabled for compatibility',
    );
  }

  // Filter claims
  static List<Claim> filterClaims(
    List<Claim> claims, {
    String? state,
    String? district,
    DateTime? startDate,
    DateTime? endDate,
    String? searchTerm,
  }) {
    List<Claim> filtered = claims;

    if (state != null && state.isNotEmpty) {
      filtered = filtered
          .where(
            (claim) => claim.state.toLowerCase().contains(state.toLowerCase()),
          )
          .toList();
    }

    if (district != null && district.isNotEmpty) {
      filtered = filtered
          .where(
            (claim) =>
                claim.district.toLowerCase().contains(district.toLowerCase()),
          )
          .toList();
    }

    if (startDate != null) {
      filtered = filtered
          .where(
            (claim) => claim.createdAt.isAfter(
              startDate.subtract(const Duration(days: 1)),
            ),
          )
          .toList();
    }

    if (endDate != null) {
      filtered = filtered
          .where(
            (claim) =>
                claim.createdAt.isBefore(endDate.add(const Duration(days: 1))),
          )
          .toList();
    }

    if (searchTerm != null && searchTerm.isNotEmpty) {
      filtered = filtered
          .where(
            (claim) =>
                claim.name.toLowerCase().contains(searchTerm.toLowerCase()) ||
                claim.state.toLowerCase().contains(searchTerm.toLowerCase()) ||
                claim.district.toLowerCase().contains(searchTerm.toLowerCase()),
          )
          .toList();
    }

    return filtered;
  }

  // Helper methods
  static Set<String> _getUniqueStates(List<Claim> claims) {
    return claims.map((claim) => claim.state).toSet();
  }

  static Set<String> _getUniqueDistricts(List<Claim> claims) {
    return claims.map((claim) => claim.district).toSet();
  }
}
