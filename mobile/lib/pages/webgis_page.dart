import 'package:flutter/material.dart';

class WebGISPage extends StatelessWidget {
  const WebGISPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WebGIS'),
        backgroundColor: Colors.blue.shade600,
        foregroundColor: Colors.white,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.map,
              size: 100,
              color: Colors.orange,
            ),
            SizedBox(height: 24),
            Text(
              'WebGIS Module',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'GIS functionality will be implemented here. This could include interactive maps, spatial data visualization, and geographic analysis tools.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(height: 32),
            Card(
              margin: EdgeInsets.symmetric(horizontal: 32),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      'Coming Soon:',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text('• Interactive Maps'),
                    Text('• Location Services'),
                    Text('• Spatial Analysis'),
                    Text('• Data Visualization'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}