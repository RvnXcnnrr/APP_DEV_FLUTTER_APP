import 'package:flutter/material.dart';
import 'package:appdev_md/models/motion_event.dart';
import 'package:appdev_md/widgets/motion_event_list.dart';
import 'package:appdev_md/widgets/app_drawer.dart';


class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late DateTime _selectedDay;
  // _focusedDay is used in the _buildCalendar method when a day is selected
  late DateTime _focusedDay;
  late Map<DateTime, List<MotionEvent>> _events;

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _focusedDay = DateTime.now();
    _events = _generateMockEvents();
  }

  Map<DateTime, List<MotionEvent>> _generateMockEvents() {
    final Map<DateTime, List<MotionEvent>> events = {};
    final now = DateTime.now();

    // Generate events for the current month
    for (int i = 1; i <= 28; i++) {
      final day = DateTime(now.year, now.month, i);

      // Add 0-3 events per day randomly
      final eventCount = i % 4;
      if (eventCount > 0) {
        events[day] = List.generate(
          eventCount,
          (index) => MotionEvent(
            id: 'event_${i}_$index',
            timestamp: DateTime(now.year, now.month, i, 9 + index, 0),
            deviceId: 'device_${index + 1}',
            temperature: 20.0 + (index * 1.5) + (i % 5), // Random temperature between 20-30°C
            humidity: 40.0 + (index * 2.0) + (i % 10),   // Random humidity between 40-70%
            imageUrl: 'https://example.com/image_${i}_$index.jpg',
          ),
        );
      }
    }

    return events;
  }

  List<MotionEvent> _getEventsForDay(DateTime day) {
    return _events[DateTime(day.year, day.month, day.day)] ?? [];
  }

  /// Checks if two DateTime objects represent the same day
  bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  /// Builds a simple calendar widget
  Widget _buildCalendar() {
    // Use _focusedDay to determine which month to display
    final daysInMonth = DateTime(_focusedDay.year, _focusedDay.month + 1, 0).day;
    final firstDayOfMonth = DateTime(_focusedDay.year, _focusedDay.month, 1);
    final firstWeekday = firstDayOfMonth.weekday;

    // We'll generate days dynamically in the GridView

    return Card(
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Year navigation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.keyboard_double_arrow_left),
                  onPressed: () {
                    setState(() {
                      // Navigate to previous year
                      _focusedDay = DateTime(_focusedDay.year - 1, _focusedDay.month, 1);
                      // If the selected day is not in this month/year, select the 1st day
                      if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                        _selectedDay = _focusedDay;
                      }
                    });
                  },
                ),
                GestureDetector(
                  onTap: () {
                    _showYearPicker(context);
                  },
                  child: Row(
                    children: [
                      Text(
                        '${_focusedDay.year}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Icon(Icons.arrow_drop_down),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.keyboard_double_arrow_right),
                  onPressed: () {
                    setState(() {
                      // Navigate to next year
                      _focusedDay = DateTime(_focusedDay.year + 1, _focusedDay.month, 1);
                      // If the selected day is not in this month/year, select the 1st day
                      if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                        _selectedDay = _focusedDay;
                      }
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 8.0),
            // Month navigation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios),
                  onPressed: () {
                    setState(() {
                      // Navigate to previous month
                      _focusedDay = DateTime(_focusedDay.year, _focusedDay.month - 1, 1);
                      // If the selected day is not in this month, select the 1st day
                      if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                        _selectedDay = _focusedDay;
                      }
                    });
                  },
                ),
                GestureDetector(
                  onTap: () {
                    _showMonthPicker(context);
                  },
                  child: Row(
                    children: [
                      Text(
                        _getMonthName(_focusedDay.month),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Icon(Icons.arrow_drop_down),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward_ios),
                  onPressed: () {
                    setState(() {
                      // Navigate to next month
                      _focusedDay = DateTime(_focusedDay.year, _focusedDay.month + 1, 1);
                      // If the selected day is not in this month, select the 1st day
                      if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                        _selectedDay = _focusedDay;
                      }
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            // Weekday headers
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: const [
                Text('Mon', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Tue', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Wed', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Thu', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Fri', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Sat', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Sun', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8.0),
            // Calendar grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: 1.0,
              ),
              itemCount: 42, // 6 rows of 7 days
              itemBuilder: (context, index) {
                // Adjust index to account for the first day of the month
                final adjustedIndex = index - (firstWeekday - 1);

                // Check if the day is in the current month
                if (adjustedIndex < 0 || adjustedIndex >= daysInMonth) {
                  return const SizedBox.shrink();
                }

                final day = adjustedIndex + 1;
                final date = DateTime(_focusedDay.year, _focusedDay.month, day);
                final isSelected = isSameDay(date, _selectedDay);
                final hasEvents = _getEventsForDay(date).isNotEmpty;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedDay = date;
                      _focusedDay = date;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.all(2.0),
                    decoration: BoxDecoration(
                      color: isSelected ? Theme.of(context).colorScheme.primary : null,
                      borderRadius: BorderRadius.circular(8.0),
                      border: hasEvents
                          ? Border.all(color: Theme.of(context).colorScheme.primary)
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        day.toString(),
                        style: TextStyle(
                          color: isSelected ? Colors.white : null,
                          fontWeight: isSelected || hasEvents ? FontWeight.bold : null,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Returns the name of the month for the given month number
  String _getMonthName(int month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  }

  /// Shows a dialog to pick a year
  void _showYearPicker(BuildContext context) {
    final currentYear = DateTime.now().year;
    final years = List.generate(30, (index) => currentYear - 10 + index);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Year'),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: ListView.builder(
            itemCount: years.length,
            itemBuilder: (context, index) {
              final year = years[index];
              final isSelected = year == _focusedDay.year;

              return ListTile(
                title: Text(
                  year.toString(),
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Theme.of(context).colorScheme.primary : null,
                  ),
                ),
                onTap: () {
                  setState(() {
                    _focusedDay = DateTime(year, _focusedDay.month, 1);
                    // If the selected day is not in this month/year, select the 1st day
                    if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                      _selectedDay = _focusedDay;
                    }
                  });
                  Navigator.pop(context);
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  /// Shows a dialog to pick a month
  void _showMonthPicker(BuildContext context) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Month'),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: ListView.builder(
            itemCount: 12,
            itemBuilder: (context, index) {
              final month = index + 1;
              final isSelected = month == _focusedDay.month;

              return ListTile(
                title: Text(
                  monthNames[index],
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Theme.of(context).colorScheme.primary : null,
                  ),
                ),
                onTap: () {
                  setState(() {
                    _focusedDay = DateTime(_focusedDay.year, month, 1);
                    // If the selected day is not in this month/year, select the 1st day
                    if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                      _selectedDay = _focusedDay;
                    }
                  });
                  Navigator.pop(context);
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Motion Dashboard'),
      ),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          _buildCalendar(),
          const SizedBox(height: 8.0),
          Expanded(
            child: MotionEventList(
              events: _getEventsForDay(_selectedDay),
            ),
          ),
        ],
      ),
    );
  }
}