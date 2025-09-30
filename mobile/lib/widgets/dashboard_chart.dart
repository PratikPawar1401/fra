import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardChart extends StatelessWidget {
  final List<ChartData> data;
  final String title;
  final Color color;

  const DashboardChart({
    super.key,
    required this.data,
    required this.title,
    this.color = Colors.blue,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 120,
              child: data.isNotEmpty
                  ? LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: const FlTitlesData(show: false),
                        borderData: FlBorderData(show: false),
                        minX: 0,
                        maxX: data.length.toDouble() - 1,
                        minY: 0,
                        maxY: data
                            .map((e) => e.value)
                            .reduce((a, b) => a > b ? a : b),
                        lineBarsData: [
                          LineChartBarData(
                            spots: data.asMap().entries.map((entry) {
                              return FlSpot(
                                entry.key.toDouble(),
                                entry.value.value,
                              );
                            }).toList(),
                            isCurved: true,
                            color: color,
                            barWidth: 3,
                            isStrokeCapRound: true,
                            dotData: const FlDotData(show: false),
                            belowBarData: BarAreaData(
                              show: true,
                              color: color.withOpacity(0.1),
                            ),
                          ),
                        ],
                      ),
                    )
                  : const Center(
                      child: Text(
                        'No data available',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChartData {
  final String label;
  final double value;

  ChartData(this.label, this.value);
}
