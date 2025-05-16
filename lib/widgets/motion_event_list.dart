import 'package:flutter/material.dart';
import 'package:appdev_md/models/motion_event.dart';

/// A widget that displays a list of motion events
class MotionEventList extends StatelessWidget {
  /// The list of motion events to display
  final List<MotionEvent> events;

  /// Creates a new motion event list
  const MotionEventList({
    super.key,
    required this.events,
  });

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) {
      return const SizedBox(
        height: 100,
        child: Center(
          child: Text('No motion events for this day'),
        ),
      );
    }

    // Calculate a reasonable height based on the number of events
    // with a minimum height and a maximum number of events to show without scrolling
    final int itemsToShow = events.length > 4 ? 4 : events.length;
    final double estimatedItemHeight = 120.0; // Approximate height of each card
    final double listHeight = itemsToShow * estimatedItemHeight;

    return SizedBox(
      height: listHeight,
      child: ListView.builder(
        // Remove shrinkWrap to improve performance
        physics: const AlwaysScrollableScrollPhysics(), // Allow scrolling within the ListView
        itemCount: events.length,
        padding: const EdgeInsets.all(8.0),
        itemBuilder: (context, index) {
          final event = events[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12.0),
            elevation: 2.0,
            child: ListTile(
              contentPadding: const EdgeInsets.all(16.0),
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primary,
                child: const Icon(
                  Icons.motion_photos_on,
                  color: Colors.white,
                ),
              ),
              title: Row(
                children: [
                  const Text(
                    'Motion detected',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 8.0),
                  Text(
                    event.formattedTime,
                    style: TextStyle(
                      fontSize: 12.0,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8.0),
                  Row(
                    children: [
                      Icon(
                        Icons.thermostat,
                        size: 16.0,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 4.0),
                      Text('${event.temperature.toStringAsFixed(1)}°C'),
                      const SizedBox(width: 16.0),
                      Icon(
                        Icons.water_drop,
                        size: 16.0,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 4.0),
                      Text('${event.humidity.toStringAsFixed(1)}%'),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text('Device: ${event.deviceId}'),
                ],
              ),
              trailing: IconButton(
                icon: const Icon(Icons.arrow_forward_ios),
                onPressed: () {
                  // Show event details
                  _showEventDetails(context, event);
                },
              ),
              onTap: () {
                // Show event details
                _showEventDetails(context, event);
              },
            ),
          );
        },
      ),
    );
  }

  /// Shows a dialog with event details
  void _showEventDetails(BuildContext context, MotionEvent event) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Motion Event Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date and time
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16.0,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8.0),
                Text('${event.formattedDate} at ${event.formattedTime}'),
              ],
            ),
            const SizedBox(height: 16.0),

            // Device info
            Row(
              children: [
                Icon(
                  Icons.devices,
                  size: 16.0,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8.0),
                Text('Device: ${event.deviceId}'),
              ],
            ),
            const SizedBox(height: 16.0),

            // Temperature and humidity
            Row(
              children: [
                Icon(
                  Icons.thermostat,
                  size: 16.0,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8.0),
                Text('Temperature: ${event.temperature.toStringAsFixed(1)}°C'),
              ],
            ),
            const SizedBox(height: 8.0),
            Row(
              children: [
                Icon(
                  Icons.water_drop,
                  size: 16.0,
                  color: Theme.of(context).colorScheme.secondary,
                ),
                const SizedBox(width: 8.0),
                Text('Humidity: ${event.humidity.toStringAsFixed(1)}%'),
              ],
            ),
            const SizedBox(height: 16.0),

            // Image
            const Text('Image:'),
            const SizedBox(height: 8.0),
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: const Center(
                child: Icon(Icons.image, size: 48.0, color: Colors.grey),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
