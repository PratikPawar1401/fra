import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'database_page.dart';
import 'auth_page.dart';
import 'upload_page.dart';
import 'profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  int _selectedIndex = 0;
  String _userName = 'User';

  late AnimationController _tabAnimationController;
  late Animation<double> _tabAnimation;
  late List<AnimationController> _iconControllers;
  late List<Animation<double>> _iconAnimations;

  late final List<Widget> _pages;
  late final List<NavigationItem> _navigationItems;

  @override
  void initState() {
    super.initState();
    _loadUserData();

    // Initialize pages with placeholder widgets
    _pages = [
      _buildHomeContent(),
      DatabasePage(),
      UploadPage(),
      _buildProfilePage(),
      _buildGeoTaggingPage(),
    ];

    // Define navigation items with Apple-style icons
    _navigationItems = [
      NavigationItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home_filled,
        label: 'Home',
      ),
      NavigationItem(
        icon: Icons.folder_outlined,
        activeIcon: Icons.folder,
        label: 'Database',
      ),
      NavigationItem(
        icon: Icons.add_circle_outline,
        activeIcon: Icons.add_circle,
        label: 'New Claim',
        isSpecial: true,
      ),
      NavigationItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'Profile',
      ),
      NavigationItem(
        icon: Icons.location_on_outlined,
        activeIcon: Icons.location_on,
        label: 'Geo Tag',
      ),
    ];

    // Initialize animations
    _tabAnimationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );

    _tabAnimation = CurvedAnimation(
      parent: _tabAnimationController,
      curve: Curves.easeInOut,
    );

    // Initialize icon animations
    _iconControllers = List.generate(
      _navigationItems.length,
      (index) => AnimationController(
        duration: Duration(milliseconds: 200),
        vsync: this,
      ),
    );

    _iconAnimations = _iconControllers.map((controller) {
      return Tween<double>(
        begin: 0.8,
        end: 1.0,
      ).animate(CurvedAnimation(parent: controller, curve: Curves.elasticOut));
    }).toList();

    // Start with home tab selected
    _iconControllers[0].forward();
    _tabAnimationController.forward();
  }

  Future<void> _loadUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      // Try to get userName first (from sign up), then fall back to userEmail
      String? userName = prefs.getString('userName');
      if (userName != null && userName.isNotEmpty) {
        _userName = userName;
      } else {
        // If no userName, extract name from email (for login users)
        String? userEmail = prefs.getString('userEmail');
        if (userEmail != null && userEmail.isNotEmpty) {
          // Extract name part before @ symbol
          _userName = userEmail.split('@').first;
        } else {
          _userName = 'User';
        }
      }
    });
  }

  @override
  void dispose() {
    _tabAnimationController.dispose();
    for (var controller in _iconControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;

    HapticFeedback.selectionClick();

    // Animate previous tab out
    _iconControllers[_selectedIndex].reverse();

    setState(() {
      _selectedIndex = index;
    });

    // Animate new tab in
    _iconControllers[index].forward();
  }

  void _showLogoutDialog() {
    HapticFeedback.lightImpact();

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            'Sign Out',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1C1C1E),
            ),
          ),
          content: Text(
            'Are you sure you want to sign out?',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: Color(0xFF8E8E93),
            ),
          ),
          actionsPadding: EdgeInsets.fromLTRB(16, 0, 16, 16),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              style: TextButton.styleFrom(
                foregroundColor: Color(0xFF007AFF),
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              child: Text(
                'Cancel',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _logout();
              },
              style: TextButton.styleFrom(
                foregroundColor: Color(0xFFFF3B30),
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              child: Text(
                'Sign Out',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _logout() async {
    HapticFeedback.mediumImpact();
    Navigator.pushAndRemoveUntil(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => AuthPage(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: animation.drive(
              Tween(begin: Offset(-1.0, 0.0), end: Offset.zero),
            ),
            child: child,
          );
        },
      ),
      (route) => false,
    );
  }

  // Placeholder widgets for pages
  Widget _buildHomeContent() {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome card
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF34C759), Color(0xFF30B94D)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.forest, color: Colors.white, size: 24),
                    SizedBox(width: 12),
                    Text(
                      'Welcome, $_userName',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  'Forest Official',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'AI-Powered FRA Atlas & Decision Support System',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 24),

          // Quick Actions section
          Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1C1C1E),
            ),
          ),
          SizedBox(height: 16),

          // Action buttons grid
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  icon: Icons.add_circle_outline,
                  title: 'New Claim',
                  subtitle: 'Create FRA claim',
                  color: Color(0xFF34C759),
                  onTap: () => _onItemTapped(2),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: _buildActionCard(
                  icon: Icons.list_alt,
                  title: 'Database',
                  subtitle: 'View records',
                  color: Color(0xFF007AFF),
                  onTap: () => _onItemTapped(1),
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  icon: Icons.location_on_outlined,
                  title: 'Geo Tagging',
                  subtitle: 'Location data',
                  color: Color(0xFFFF9500),
                  onTap: () => _onItemTapped(4),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: _buildActionCard(
                  icon: Icons.person_outline,
                  title: 'Profile',
                  subtitle: 'Manage account',
                  color: Color(0xFF5856D6),
                  onTap: () => _onItemTapped(3),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1C1C1E),
              ),
            ),
            SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(fontSize: 12, color: Color(0xFF8E8E93)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfilePage() {
    return ProfilePage();
  }

  Widget _buildGeoTaggingPage() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_on_outlined, size: 64, color: Color(0xFFFF9500)),
          SizedBox(height: 16),
          Text(
            'Geo Tagging',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1C1C1E),
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Location and mapping tools',
            style: TextStyle(fontSize: 16, color: Color(0xFF8E8E93)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFBFBFD),
      extendBodyBehindAppBar: false,
      appBar: _selectedIndex == 1
          ? null
          : PreferredSize(
              preferredSize: Size.fromHeight(kToolbarHeight),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF34C759), Color(0xFF30B94D)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0xFF34C759).withOpacity(0.2),
                      blurRadius: 10,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: AppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  systemOverlayStyle: SystemUiOverlayStyle.light,
                  centerTitle: false,
                  automaticallyImplyLeading: false,
                  title: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.forest_outlined,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Aṭavī Atlas',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          letterSpacing: -0.24,
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    Container(
                      margin: EdgeInsets.only(right: 16),
                      child: IconButton(
                        onPressed: _showLogoutDialog,
                        icon: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            Icons.more_horiz,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        splashRadius: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ),
      body: AnimatedSwitcher(
        duration: Duration(milliseconds: 300),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return SlideTransition(
            position: animation.drive(
              Tween(begin: Offset(0.1, 0.0), end: Offset.zero),
            ),
            child: FadeTransition(opacity: animation, child: child),
          );
        },
        child: Container(
          key: ValueKey<int>(_selectedIndex),
          child: _pages[_selectedIndex],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 20,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            height: 76,
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_navigationItems.length, (index) {
                final item = _navigationItems[index];
                final isSelected = _selectedIndex == index;

                return Expanded(
                  child: GestureDetector(
                    onTap: () => _onItemTapped(index),
                    behavior: HitTestBehavior.opaque,
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 6),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AnimatedBuilder(
                            animation: _iconAnimations[index],
                            builder: (context, child) {
                              return Transform.scale(
                                scale: _iconAnimations[index].value,
                                child: Container(
                                  width: item.isSpecial ? 34 : 26,
                                  height: item.isSpecial ? 34 : 26,
                                  decoration: item.isSpecial && isSelected
                                      ? BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              Color(0xFF007AFF),
                                              Color(0xFF0056CC),
                                            ],
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            17,
                                          ),
                                        )
                                      : null,
                                  child: Icon(
                                    isSelected ? item.activeIcon : item.icon,
                                    size: item.isSpecial ? 22 : 20,
                                    color: isSelected
                                        ? (item.isSpecial
                                              ? Colors.white
                                              : Color(0xFF007AFF))
                                        : Color(0xFF8E8E93),
                                  ),
                                ),
                              );
                            },
                          ),
                          SizedBox(height: 3),
                          Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: isSelected
                                  ? Color(0xFF007AFF)
                                  : Color(0xFF8E8E93),
                              letterSpacing: -0.07,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSpecial;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.isSpecial = false,
  });
}
