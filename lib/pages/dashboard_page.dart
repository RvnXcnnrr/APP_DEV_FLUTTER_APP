import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appdev_md/widgets/motion_event_list.dart';
import 'package:appdev_md/widgets/app_drawer.dart';
import 'package:appdev_md/providers/motion_event_provider.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late DateTime _selectedDay;
  late DateTime _focusedDay;

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _focusedDay = DateTime.now();
  }

  bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Widget _buildCalendar() {
    final daysInMonth = DateTime(_focusedDay.year, _focusedDay.month + 1, 0).day;
    final firstDayOfMonth = DateTime(_focusedDay.year, _focusedDay.month, 1);
    final firstWeekday = firstDayOfMonth.weekday;

    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Calendar header with year and month navigation
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withAlpha(26), // ~10% opacity
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: Column(
                children: [
                  // Year navigation
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.keyboard_double_arrow_left),
                        color: Theme.of(context).colorScheme.primary,
                        onPressed: () {
                          setState(() {
                            _focusedDay = DateTime(_focusedDay.year - 1, _focusedDay.month, 1);
                            if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                              _selectedDay = _focusedDay;
                            }
                          });
                        },
                      ),
                      GestureDetector(
                        onTap: () => _showYearPicker(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20.0),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(26), // ~10% opacity
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${_focusedDay.year}',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                Icons.arrow_drop_down,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ],
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.keyboard_double_arrow_right),
                        color: Theme.of(context).colorScheme.primary,
                        onPressed: () {
                          setState(() {
                            _focusedDay = DateTime(_focusedDay.year + 1, _focusedDay.month, 1);
                            if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                              _selectedDay = _focusedDay;
                            }
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Month navigation
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios),
                        color: Theme.of(context).colorScheme.primary,
                        onPressed: () {
                          setState(() {
                            _focusedDay = DateTime(_focusedDay.year, _focusedDay.month - 1, 1);
                            if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                              _selectedDay = _focusedDay;
                            }
                          });
                        },
                      ),
                      GestureDetector(
                        onTap: () => _showMonthPicker(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20.0),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(26), // ~10% opacity
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _getMonthName(_focusedDay.month),
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                Icons.arrow_drop_down,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ],
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.arrow_forward_ios),
                        color: Theme.of(context).colorScheme.primary,
                        onPressed: () {
                          setState(() {
                            _focusedDay = DateTime(_focusedDay.year, _focusedDay.month + 1, 1);
                            if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                              _selectedDay = _focusedDay;
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Weekday headers
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: 1.5,
              ),
              itemCount: 7,
              itemBuilder: (context, index) {
                const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return Center(
                  child: Text(
                    weekdays[index],
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            // Calendar grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: 1.0,
              ),
              itemCount: 42,
              itemBuilder: (context, index) {
                final adjustedIndex = index - (firstWeekday - 1);
                if (adjustedIndex < 0 || adjustedIndex >= daysInMonth) {
                  return const SizedBox.shrink();
                }

                final day = adjustedIndex + 1;
                final date = DateTime(_focusedDay.year, _focusedDay.month, day);
                final isSelected = isSameDay(date, _selectedDay);

                // Check if the day has events using the provider
                final motionEventProvider = Provider.of<MotionEventProvider>(context, listen: false);
                final hasEvents = motionEventProvider.getEventsForDay(date).isNotEmpty;

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
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8.0),
                      border: hasEvents
                          ? Border.all(
                              color: Theme.of(context).colorScheme.primary.withAlpha(128), // 50% opacity
                              width: 1.5,
                            )
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        day.toString(),
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : Theme.of(context).textTheme.bodyLarge?.color,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 16,
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

  String _getMonthName(int month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  }

  void _showYearPicker(BuildContext context) {
    final currentYear = DateTime.now().year;
    final years = List.generate(30, (index) => currentYear - 10 + index);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Select Year',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            SizedBox(
              height: 300,
              width: double.maxFinite,
              child: ListView.builder(
                itemCount: years.length,
                itemBuilder: (context, index) {
                  final year = years[index];
                  final isSelected = year == _focusedDay.year;

                  return ListTile(
                    title: Text(
                      year.toString(),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).textTheme.bodyLarge?.color,
                      ),
                    ),
                    onTap: () {
                      setState(() {
                        _focusedDay = DateTime(year, _focusedDay.month, 1);
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
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMonthPicker(BuildContext context) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Select Month',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            SizedBox(
              height: 300,
              width: double.maxFinite,
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 2.0,
                ),
                itemCount: 12,
                itemBuilder: (context, index) {
                  final month = index + 1;
                  final isSelected = month == _focusedDay.month;

                  return InkWell(
                    onTap: () {
                      setState(() {
                        _focusedDay = DateTime(_focusedDay.year, month, 1);
                        if (_selectedDay.month != _focusedDay.month || _selectedDay.year != _focusedDay.year) {
                          _selectedDay = _focusedDay;
                        }
                      });
                      Navigator.pop(context);
                    },
                    child: Card(
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary.withAlpha(26) // ~10% opacity
                          : Colors.transparent,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                        side: BorderSide(
                          color: isSelected
                              ? Theme.of(context).colorScheme.primary
                              : Colors.transparent,
                          width: 1.0,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          monthNames[index],
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : Theme.of(context).textTheme.bodyLarge?.color,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Get provider with listen: true to ensure rebuilds when data changes
    final motionEventProvider = Provider.of<MotionEventProvider>(context, listen: true);

    // Get events for the selected day
    final eventsForSelectedDay = motionEventProvider.getEventsForDay(_selectedDay);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Motion Dashboard'),
        elevation: 0,
        centerTitle: true,
      ),
      drawer: const AppDrawer(),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch, // Ensure widgets stretch horizontally
              children: [
                const SizedBox(height: 16),
                // Calendar
                _buildCalendar(),
                const SizedBox(height: 24),
                // Selected date header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Events on ${_selectedDay.day} ${_getMonthName(_selectedDay.month)} ${_selectedDay.year}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Chip(
                        label: Text(
                          '${eventsForSelectedDay.length} events',
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: Theme.of(context).colorScheme.primary.withAlpha(26), // ~10% opacity
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Motion events list
                MotionEventList(
                  events: eventsForSelectedDay,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}