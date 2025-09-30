import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'dart:math';
import '../widgets/custom_button.dart';
import '../models/claim_model.dart';
import '../services/database_service.dart';

class UploadPage extends StatefulWidget {
  const UploadPage({Key? key}) : super(key: key);

  @override
  State<UploadPage> createState() => _UploadPageState();
}

class _UploadPageState extends State<UploadPage> {
  final ImagePicker _picker = ImagePicker();
  File? _selectedFile;
  String? _fileType;
  bool _showForm = false;
  bool _isProcessing = false;

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _villageController = TextEditingController();
  final _plotNumberController = TextEditingController();
  final _areaController = TextEditingController();
  final _surveyNumberController = TextEditingController();

  // Sample data for realistic random generation
  final List<String> _sampleNames = [
    'Rajesh Kumar Singh',
    'Priya Sharma',
    'Amit Patel',
    'Sunita Devi',
    'Vikram Singh',
    'Meera Gupta',
    'Suresh Kumar',
    'Lakshmi Nair',
    'Rohit Verma',
    'Kavita Joshi',
    'Anand Reddy',
    'Sita Ram',
    'Mukesh Yadav',
    'Radha Krishna',
  ];

  final List<String> _sampleStates = [
    'Maharashtra',
    'Gujarat',
    'Karnataka',
    'Tamil Nadu',
    'Rajasthan',
    'Uttar Pradesh',
    'West Bengal',
    'Kerala',
    'Punjab',
    'Haryana',
    'Madhya Pradesh',
    'Odisha',
  ];

  final Map<String, List<String>> _stateDistricts = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
    'Tamil Nadu': [
      'Chennai',
      'Coimbatore',
      'Madurai',
      'Salem',
      'Tiruchirappalli',
    ],
    'Rajasthan': ['Jaipur', 'Jodhur', 'Udaipur', 'Kota', 'Bikaner'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
    'Kerala': [
      'Thiruvananthapuram',
      'Kochi',
      'Kozhikode',
      'Thrissur',
      'Kollam',
    ],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur'],
  };

  final List<String> _sampleVillages = [
    'Rampur',
    'Krishnanagar',
    'Shivpuri',
    'Ganeshpur',
    'Laxminagar',
    'Raghunathpur',
    'Govindpur',
    'Hanumanganj',
    'Sitapur',
    'Anandpur',
  ];

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Always allow normal system back behavior since we removed the custom back button
        return true;
      },
      child: Scaffold(
        backgroundColor: Color(0xFFFBFBFD),
        appBar: _showForm
            ? AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                title: Text(
                  'Claim Info',
                  style: TextStyle(
                    color: Color(0xFF1C1C1E),
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                iconTheme: IconThemeData(color: Color(0xFF1C1C1E)),
                automaticallyImplyLeading:
                    false, // Remove back button completely
              )
            : null,
        body: _showForm ? _buildExtractedDataForm() : _buildUploadOptions(),
      ),
    );
  }

  Widget _buildUploadOptions() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Icon(
              Icons.cloud_upload_outlined,
              size: 80,
              color: Color(0xFF34C759),
            ),
            SizedBox(height: 24),
            Text(
              'Upload Your Document',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1C1C1E),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Choose how you want to upload your FRA document',
              style: TextStyle(fontSize: 16, color: Color(0xFF8E8E93)),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 48),

            // Upload from Gallery
            _buildUploadOption(
              icon: Icons.photo_library_outlined,
              title: 'Choose from Gallery',
              subtitle: 'Select image from your device',
              color: Color(0xFF007AFF),
              onTap: () => _pickFile(ImageSource.gallery),
            ),

            SizedBox(height: 16),

            // Upload from Camera
            _buildUploadOption(
              icon: Icons.camera_alt_outlined,
              title: 'Take Photo',
              subtitle: 'Capture document with camera',
              color: Color(0xFF34C759),
              onTap: () => _pickFile(ImageSource.camera),
            ),

            SizedBox(height: 16),

            // Upload PDF
            _buildUploadOption(
              icon: Icons.picture_as_pdf_outlined,
              title: 'Upload PDF',
              subtitle: 'Select PDF document',
              color: Color(0xFFFF3B30),
              onTap: () => _pickPDF(),
            ),

            SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      width: double.infinity,
      child: Card(
        elevation: 2,
        color: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1C1C1E),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: Color(0xFF8E8E93),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExtractedDataForm() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // File preview
              if (_selectedFile != null) ...[
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(0xFF34C759).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Color(0xFF34C759).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(_getFileIcon(), color: Color(0xFF34C759), size: 24),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Document Processed',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF34C759),
                              ),
                            ),
                            Text(
                              _selectedFile!.path.split('/').last,
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF8E8E93),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 24),
              ],

              Text(
                'Claim Information',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1C1C1E),
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Please verify and complete the extracted information',
                style: TextStyle(fontSize: 14, color: Color(0xFF8E8E93)),
              ),
              SizedBox(height: 24),

              // Form fields
              _buildFormField(
                controller: _nameController,
                label: 'Full Name',
                icon: Icons.person,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _stateController,
                label: 'State',
                icon: Icons.location_on,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _districtController,
                label: 'District',
                icon: Icons.map,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _villageController,
                label: 'Village',
                icon: Icons.home,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _plotNumberController,
                label: 'Plot Number',
                icon: Icons.grid_on,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _areaController,
                label: 'Area (in acres)',
                icon: Icons.square_foot,
              ),
              SizedBox(height: 16),

              _buildFormField(
                controller: _surveyNumberController,
                label: 'Survey Number',
                icon: Icons.description,
              ),
              SizedBox(height: 32),

              // Submit button
              Container(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF34C759),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Submit Claim',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
  }) {
    return TextFormField(
      controller: controller,
      style: TextStyle(
        color: Color(0xFF1C1C1E), // Dark text color for visibility
        fontSize: 16,
        fontWeight: FontWeight.w400,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(
          color: Color(0xFF8E8E93), // Gray label color
          fontSize: 16,
        ),
        prefixIcon: Icon(icon, color: Color(0xFF8E8E93)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Color(0xFFE5E5EA)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Color(0xFFE5E5EA)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Color(0xFF007AFF), width: 2),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'This field is required';
        }
        return null;
      },
    );
  }

  Future<void> _pickFile(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1800,
        maxHeight: 1800,
        imageQuality: 85,
      );

      if (image != null) {
        // Show success notification
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 20),
                SizedBox(width: 12),
                Text('Document uploaded successfully!'),
              ],
            ),
            backgroundColor: Color(0xFF34C759),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );

        setState(() {
          _selectedFile = File(image.path);
          _fileType = 'image';
          _isProcessing = true;
        });

        // Simulate processing delay and generate data
        await Future.delayed(Duration(seconds: 2));
        _generateRandomData();

        // Small delay to ensure form updates
        await Future.delayed(Duration(milliseconds: 300));

        setState(() {
          _isProcessing = false;
          _showForm = true;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error selecting image: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _pickPDF() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        allowMultiple: false,
      );

      if (result != null) {
        // Show success notification
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 20),
                Text('Document uploaded successfully!'),
              ],
            ),
            backgroundColor: Color(0xFF34C759),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );

        setState(() {
          _selectedFile = File(result.files.single.path!);
          _fileType = 'pdf';
          _isProcessing = true;
        });

        // Simulate processing delay and generate data
        await Future.delayed(Duration(seconds: 3));
        _generateRandomData();

        // Small delay to ensure form updates
        await Future.delayed(Duration(milliseconds: 300));

        setState(() {
          _isProcessing = false;
          _showForm = true;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error selecting PDF: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _generateRandomData() {
    final random = Random();

    final selectedName = _sampleNames[random.nextInt(_sampleNames.length)];
    final selectedState = _sampleStates[random.nextInt(_sampleStates.length)];
    final districts = _stateDistricts[selectedState]!;
    final selectedDistrict = districts[random.nextInt(districts.length)];
    final selectedVillage =
        _sampleVillages[random.nextInt(_sampleVillages.length)];

    // Force update the text controllers
    setState(() {
      _nameController.text = selectedName;
      _stateController.text = selectedState;
      _districtController.text = selectedDistrict;
      _villageController.text = selectedVillage;
      _plotNumberController.text =
          '${random.nextInt(999) + 1}/${random.nextInt(9) + 1}';
      _areaController.text =
          '${(random.nextDouble() * 10 + 0.5).toStringAsFixed(2)}';
      _surveyNumberController.text = 'SY-${random.nextInt(999) + 100}';
    });

    // Debug print to verify data generation
    print('Generated data:');
    print('Name: ${_nameController.text}');
    print('State: ${_stateController.text}');
    print('District: ${_districtController.text}');
    print('Village: ${_villageController.text}');
    print('Plot: ${_plotNumberController.text}');
    print('Area: ${_areaController.text}');
    print('Survey: ${_surveyNumberController.text}');
  }

  IconData _getFileIcon() {
    if (_fileType == 'pdf') {
      return Icons.picture_as_pdf;
    } else {
      return Icons.image;
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isProcessing = true;
      });

      try {
        final claim = Claim(
          name: _nameController.text,
          state: _stateController.text,
          district: _districtController.text,
          village: _villageController.text,
          plotNumber: _plotNumberController.text,
          area: _areaController.text,
          surveyNumber: _surveyNumberController.text,
          imagePath: _selectedFile?.path,
          createdAt: DateTime.now(),
        );

        await DatabaseService().insertClaim(claim);

        if (mounted) {
          // Show success dialog
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext context) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Color(0xFF34C759),
                      size: 28,
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Success!',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1C1C1E),
                      ),
                    ),
                  ],
                ),
                content: Text(
                  'Your claim has been successfully submitted!',
                  style: TextStyle(fontSize: 16, color: Color(0xFF8E8E93)),
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop(); // Close dialog
                      // Clear form and reset state instead of double pop
                      _clearForm();
                      _showForm = false;
                      setState(() {});
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: Color(0xFF34C759),
                      padding: EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                    ),
                    child: Text(
                      'OK',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error saving data: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isProcessing = false;
          });
        }
      }
    }
  }

  void _clearForm() {
    _nameController.clear();
    _stateController.clear();
    _districtController.clear();
    _villageController.clear();
    _plotNumberController.clear();
    _areaController.clear();
    _surveyNumberController.clear();
    _selectedFile = null;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _stateController.dispose();
    _districtController.dispose();
    _villageController.dispose();
    _plotNumberController.dispose();
    _areaController.dispose();
    _surveyNumberController.dispose();
    super.dispose();
  }
}
