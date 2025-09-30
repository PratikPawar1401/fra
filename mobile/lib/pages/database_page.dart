import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import '../services/database_service.dart';
import '../services/export_service.dart';
import '../models/claim_model.dart';

class DatabasePage extends StatefulWidget {
  const DatabasePage({super.key});

  @override
  State<DatabasePage> createState() => _DatabasePageState();
}

class _DatabasePageState extends State<DatabasePage> {
  final DatabaseService _databaseService = DatabaseService();
  List<Claim> _allClaims = [];
  List<Claim> _filteredClaims = [];
  bool _isLoading = true;
  Map<String, int> _statusCounts = {
    'Total': 0,
    'Pending': 0,
    'Approved': 0,
    'Rejected': 0,
  };

  // Filter controllers
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _stateController = TextEditingController();
  final TextEditingController _districtController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;

  // Sort options
  String _sortBy = 'date';
  bool _isAscending = false;
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _loadClaims();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _stateController.dispose();
    _districtController.dispose();
    super.dispose();
  }

  Future<void> _loadClaims() async {
    try {
      final claims = await _databaseService.getAllClaims();
      final statusCounts = await _databaseService.getClaimStatusCounts();
      setState(() {
        _allClaims = claims;
        _filteredClaims = claims;
        _statusCounts = statusCounts;
        _isLoading = false;
      });
      _applySorting();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showErrorSnackBar('Failed to load claims: $e');
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredClaims = ExportService.filterClaims(
        _allClaims,
        state: _stateController.text.isEmpty ? null : _stateController.text,
        district: _districtController.text.isEmpty
            ? null
            : _districtController.text,
        startDate: _startDate,
        endDate: _endDate,
        searchTerm: _searchController.text.isEmpty
            ? null
            : _searchController.text,
      );
    });
    _applySorting();
  }

  void _applySorting() {
    setState(() {
      _filteredClaims.sort((a, b) {
        int result;
        switch (_sortBy) {
          case 'name':
            result = a.name.compareTo(b.name);
            break;
          case 'state':
            result = a.state.compareTo(b.state);
            break;
          case 'district':
            result = a.district.compareTo(b.district);
            break;
          case 'date':
          default:
            result = a.createdAt.compareTo(b.createdAt);
            break;
        }
        return _isAscending ? result : -result;
      });
    });
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _stateController.clear();
      _districtController.clear();
      _startDate = null;
      _endDate = null;
      _filteredClaims = _allClaims;
    });
    _applySorting();
  }

  Future<void> _handleExport(String format) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '$format export temporarily disabled for compatibility',
          ),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      _showErrorSnackBar('Export failed: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Database'),
        backgroundColor: const Color(0xFF34C759),
        foregroundColor: Colors.white,
        elevation: 0,
        toolbarHeight: kToolbarHeight,
        actions: [
          IconButton(
            icon: Icon(
              _showFilters ? Icons.filter_list_off : Icons.filter_list,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() {
                _isLoading = true;
              });
              _loadClaims();
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.file_download, color: Colors.white),
            onSelected: _handleExport,
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'pdf',
                child: Row(
                  children: [
                    Icon(Icons.picture_as_pdf, color: Color(0xFFFF3B30)),
                    SizedBox(width: 8),
                    Text('Export as PDF'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'excel',
                child: Row(
                  children: [
                    Icon(Icons.table_chart, color: Color(0xFF34C759)),
                    SizedBox(width: 8),
                    Text('Export as Excel'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Filters Section
                if (_showFilters) _buildFiltersSection(),

                // Statistics Bar
                _buildStatisticsBar(),

                // Sort Options
                _buildSortOptions(),

                // Claims List
                Expanded(
                  child: _filteredClaims.isEmpty
                      ? _buildEmptyState()
                      : _buildClaimsList(),
                ),
              ],
            ),
    );
  }

  Widget _buildFiltersSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filters',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 16),
          // Search bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              labelText: 'Search claims...',
              labelStyle: TextStyle(color: Color(0xFF6B7280)),
              prefixIcon: Icon(Icons.search, color: Color(0xFF2E7D46)),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Color(0xFFE5E7EB)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Color(0xFF2E7D46), width: 2),
              ),
            ),
            onChanged: (value) => _applyFilters(),
          ),
          const SizedBox(height: 12),

          // State and District filters
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _stateController,
                  decoration: InputDecoration(
                    labelText: 'State',
                    labelStyle: TextStyle(color: Color(0xFF6B7280)),
                    prefixIcon: Icon(
                      Icons.location_on,
                      color: Color(0xFF2E7D46),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Color(0xFFE5E7EB)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: Color(0xFF2E7D46),
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (value) => _applyFilters(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _districtController,
                  decoration: InputDecoration(
                    labelText: 'District',
                    labelStyle: TextStyle(color: Color(0xFF6B7280)),
                    prefixIcon: Icon(Icons.map, color: Color(0xFF2E7D46)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Color(0xFFE5E7EB)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: Color(0xFF2E7D46),
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (value) => _applyFilters(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Date filters
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: _startDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      setState(() {
                        _startDate = date;
                      });
                      _applyFilters();
                    }
                  },
                  icon: Icon(Icons.date_range, color: Color(0xFF2E7D46)),
                  label: Text(
                    _startDate != null
                        ? DateFormat('dd/MM/yyyy').format(_startDate!)
                        : 'Start Date',
                    style: TextStyle(color: Color(0xFF2E7D46)),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Color(0xFF2E7D46)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: _endDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      setState(() {
                        _endDate = date;
                      });
                      _applyFilters();
                    }
                  },
                  icon: Icon(Icons.date_range, color: Color(0xFF2E7D46)),
                  label: Text(
                    _endDate != null
                        ? DateFormat('dd/MM/yyyy').format(_endDate!)
                        : 'End Date',
                    style: TextStyle(color: Color(0xFF2E7D46)),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Color(0xFF2E7D46)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Clear filters button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: _clearFilters,
              style: OutlinedButton.styleFrom(
                foregroundColor: Color(0xFF6B7280),
                side: BorderSide(color: Color(0xFFE5E7EB)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Clear Filters'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Expanded(
            child: _buildStatItem(
              'Total',
              _statusCounts['Total'].toString(),
              Color(0xFF2E7D46),
            ),
          ),
          Expanded(
            child: _buildStatItem(
              'Approved',
              _statusCounts['Approved'].toString(),
              Color(0xFF10B981),
            ),
          ),
          Expanded(
            child: _buildStatItem(
              'Rejected',
              _statusCounts['Rejected'].toString(),
              Color(0xFFDC2626),
            ),
          ),
          Expanded(
            child: _buildStatItem(
              'Pending',
              _statusCounts['Pending'].toString(),
              Color(0xFFF59E0B),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildSortOptions() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Text(
            'Sort by: ',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Color(0xFF1F2937),
            ),
          ),
          DropdownButton<String>(
            value: _sortBy,
            onChanged: (value) {
              setState(() {
                _sortBy = value!;
              });
              _applySorting();
            },
            underline: Container(),
            icon: Icon(Icons.keyboard_arrow_down, color: Color(0xFF2E7D46)),
            style: TextStyle(color: Color(0xFF2E7D46), fontSize: 16),
            items: const [
              DropdownMenuItem(value: 'date', child: Text('Date')),
              DropdownMenuItem(value: 'name', child: Text('Name')),
              DropdownMenuItem(value: 'state', child: Text('State')),
              DropdownMenuItem(value: 'district', child: Text('District')),
            ],
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: Icon(
              _isAscending ? Icons.arrow_upward : Icons.arrow_downward,
              color: Color(0xFF2E7D46),
            ),
            onPressed: () {
              setState(() {
                _isAscending = !_isAscending;
              });
              _applySorting();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox, size: 100, color: Color(0xFF9CA3AF)),
          SizedBox(height: 16),
          Text(
            'No claims found',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Try adjusting your filters or upload new claims',
            style: TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
          ),
        ],
      ),
    );
  }

  Widget _buildClaimsList() {
    return RefreshIndicator(
      onRefresh: _loadClaims,
      child: ListView.builder(
        itemCount: _filteredClaims.length,
        itemBuilder: (context, index) {
          final claim = _filteredClaims[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            elevation: 1,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide.none,
            ),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.transparent),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: ListTile(
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                leading: CircleAvatar(
                  backgroundColor: Color(0xFF2E7D46).withOpacity(0.1),
                  child: Text(
                    claim.name[0].toUpperCase(),
                    style: TextStyle(
                      color: Color(0xFF2E7D46),
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                title: Text(
                  claim.name,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                    fontSize: 16,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 4),
                    Text(
                      '${claim.state}, ${claim.district}',
                      style: TextStyle(color: Color(0xFF6B7280), fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Created: ${DateFormat('dd/MM/yyyy').format(claim.createdAt)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF9CA3AF),
                            ),
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(
                              claim.status,
                            ).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: _getStatusColor(claim.status),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            claim.status,
                            style: TextStyle(
                              color: _getStatusColor(claim.status),
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                trailing: PopupMenuButton(
                  icon: Icon(Icons.more_vert, color: Color(0xFF6B7280)),
                  onSelected: (value) {
                    if (value == 'view') {
                      _showClaimDetails(claim);
                    } else if (value == 'delete') {
                      _deleteClaim(claim);
                    } else if (value == 'approve') {
                      _updateClaimStatus(claim.id!, 'Approved');
                    } else if (value == 'reject') {
                      _updateClaimStatus(claim.id!, 'Rejected');
                    } else if (value == 'pending') {
                      _updateClaimStatus(claim.id!, 'Pending');
                    }
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [
                          Icon(
                            Icons.visibility,
                            color: Color(0xFF2E7D46),
                            size: 20,
                          ),
                          SizedBox(width: 8),
                          Text('View Details'),
                        ],
                      ),
                    ),
                    if (claim.status != 'Approved')
                      PopupMenuItem(
                        value: 'approve',
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: Color(0xFF10B981),
                              size: 20,
                            ),
                            SizedBox(width: 8),
                            Text('Approve'),
                          ],
                        ),
                      ),
                    if (claim.status != 'Rejected')
                      PopupMenuItem(
                        value: 'reject',
                        child: Row(
                          children: [
                            Icon(
                              Icons.cancel,
                              color: Color(0xFFDC2626),
                              size: 20,
                            ),
                            SizedBox(width: 8),
                            Text('Reject'),
                          ],
                        ),
                      ),
                    if (claim.status != 'Pending')
                      PopupMenuItem(
                        value: 'pending',
                        child: Row(
                          children: [
                            Icon(
                              Icons.schedule,
                              color: Color(0xFFF59E0B),
                              size: 20,
                            ),
                            SizedBox(width: 8),
                            Text('Mark Pending'),
                          ],
                        ),
                      ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(
                            Icons.delete,
                            color: Color(0xFFDC2626),
                            size: 20,
                          ),
                          SizedBox(width: 8),
                          Text('Delete'),
                        ],
                      ),
                    ),
                  ],
                ),
                onTap: () => _showClaimDetails(claim),
              ),
            ),
          );
        },
      ),
    );
  }

  Set<String> _getUniqueStates() {
    return _filteredClaims.map((claim) => claim.state).toSet();
  }

  Set<String> _getUniqueDistricts() {
    return _filteredClaims.map((claim) => claim.district).toSet();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Color(0xFF10B981);
      case 'rejected':
        return Color(0xFFDC2626);
      case 'pending':
      default:
        return Color(0xFFF59E0B);
    }
  }

  void _showClaimDetails(Claim claim) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(claim.name),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('Name:', claim.name),
              _buildDetailRow('State:', claim.state),
              _buildDetailRow('District:', claim.district),
              _buildDetailRow(
                'Created:',
                DateFormat('dd/MM/yyyy HH:mm').format(claim.createdAt),
              ),
              if (claim.imagePath != null) ...[
                const SizedBox(height: 16),
                const Text(
                  'Uploaded Image:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey),
                  ),
                  child: File(claim.imagePath!).existsSync()
                      ? Image.file(File(claim.imagePath!), fit: BoxFit.cover)
                      : const Center(child: Text('Image not found')),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Future<void> _deleteClaim(Claim claim) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Claim'),
        content: Text('Are you sure you want to delete "${claim.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && claim.id != null) {
      try {
        await _databaseService.deleteClaim(claim.id!);
        _loadClaims();
        _showSuccessSnackBar('Claim deleted successfully');
      } catch (e) {
        _showErrorSnackBar('Failed to delete claim: $e');
      }
    }
  }

  Future<void> _updateClaimStatus(int claimId, String newStatus) async {
    try {
      await _databaseService.updateClaimStatus(claimId, newStatus);
      await _loadClaims(); // Reload to update both the list and statistics
      _showSuccessSnackBar('Claim status updated to $newStatus');
    } catch (e) {
      _showErrorSnackBar('Failed to update claim status: $e');
    }
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
