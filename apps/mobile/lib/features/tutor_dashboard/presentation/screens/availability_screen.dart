import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';

class AvailabilityScreen extends StatefulWidget {
  const AvailabilityScreen({super.key});

  @override
  State<AvailabilityScreen> createState() => _AvailabilityScreenState();
}

class _AvailabilityScreenState extends State<AvailabilityScreen> {
  // Map of day-index → list of hour-indices that are available
  final Map<int, Set<int>> _slots = {
    0: {9, 10, 11, 14, 15},
    1: {9, 10, 14},
    2: {10, 11, 15, 16},
    3: {9, 14, 15},
    4: {10, 11, 16},
    5: {9, 10},
    6: {},
  };

  final _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final _hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Availability'),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: _saveAvailability,
            child: const Text('Save',
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Header info
          Container(
            width: double.infinity,
            color: AppColors.primaryGreen.withValues(alpha: 0.08),
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: const Row(
              children: [
                Icon(Icons.info_outline_rounded,
                    size: 16, color: AppColors.primaryGreen),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Tap a time slot to toggle availability. Green = available.',
                    style: TextStyle(
                        color: AppColors.primaryDark, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),

          // Day headers + grid
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Day header row
                  Row(
                    children: [
                      const SizedBox(width: 44),
                      ..._days.asMap().entries.map((e) => Expanded(
                            child: Center(
                              child: Text(e.value,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: AppColors.textSecondary)),
                            ),
                          )),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Hour rows
                  ..._hours.asMap().entries.map((hourEntry) {
                    final hour = hourEntry.value;
                    final label = hour < 12
                        ? '$hour AM'
                        : hour == 12
                            ? '12 PM'
                            : '${hour - 12} PM';
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 44,
                            child: Text(label,
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textHint)),
                          ),
                          ..._days.asMap().entries.map((dayEntry) {
                            final dayIdx = dayEntry.key;
                            final isAvail =
                                _slots[dayIdx]?.contains(hour) ?? false;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => _toggleSlot(dayIdx, hour),
                                child: AnimatedContainer(
                                  duration: 200.ms,
                                  margin: const EdgeInsets.symmetric(
                                      horizontal: 2),
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: isAvail
                                        ? AppColors.primaryGreen
                                        : Colors.white,
                                    borderRadius:
                                        BorderRadius.circular(8),
                                    border: Border.all(
                                      color: isAvail
                                          ? AppColors.primaryGreen
                                          : AppColors.divider,
                                    ),
                                    boxShadow: isAvail
                                        ? [
                                            BoxShadow(
                                              color: AppColors.primaryGreen
                                                  .withValues(alpha: 0.3),
                                              blurRadius: 4,
                                              offset: const Offset(0, 2),
                                            )
                                          ]
                                        : null,
                                  ),
                                  child: isAvail
                                      ? const Center(
                                          child: Icon(
                                              Icons.check_rounded,
                                              size: 16,
                                              color: Colors.white))
                                      : null,
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    );
                  }),

                  const SizedBox(height: 24),

                  // Legend
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _Legend(color: AppColors.primaryGreen, label: 'Available'),
                      SizedBox(width: 20),
                      _Legend(color: Colors.white, label: 'Unavailable', bordered: true),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleSlot(int dayIdx, int hour) {
    setState(() {
      final set = _slots[dayIdx] ?? {};
      if (set.contains(hour)) {
        set.remove(hour);
      } else {
        set.add(hour);
      }
      _slots[dayIdx] = set;
    });
  }

  void _saveAvailability() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Availability saved!'),
        backgroundColor: AppColors.primaryGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend({
    required this.color,
    required this.label,
    this.bordered = false,
  });
  final Color color;
  final String label;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
            border: bordered ? Border.all(color: AppColors.divider) : null,
          ),
        ),
        const SizedBox(width: 6),
        Text(label,
            style: const TextStyle(
                fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}
