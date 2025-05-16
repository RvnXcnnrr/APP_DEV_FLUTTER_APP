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
      return const Center(
        child: Text('No motion events for this day'),
      );
    }

    return ListView.builder(
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
            title: Text(
              'Motion detected',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4.0),
                Text('Device: ${event.deviceId}'),
                const SizedBox(height: 4.0),
                Text('Time: ${event.formattedTime}'),
                const SizedBox(height: 4.0),
                Text('Temperature: ${event.temperature.toStringAsFixed(1)}°C'),
                const SizedBox(height: 4.0),
                Text('Humidity: ${event.humidity.toStringAsFixed(1)}%'),
              ],
            ),
            trailing: IconButton(
              icon: const Icon(Icons.arrow_forward_ios),
              onPressed: () {
                // Navigate to event details page
                // This will be implemented later
              },
            ),
            onTap: () {
              // Show event details
              _showEventDetails(context, event);
            },
          ),
        );
      },
    );
  }

  /// Shows a dialog with event details
  void _showEventDetails(BuildContext context, MotionEvent event) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Motion Event: ${event.id}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Device: ${event.deviceId}'),
            const SizedBox(height: 8.0),
            Text('Date: ${event.formattedDate}'),
            const SizedBox(height: 8.0),
            Text('Time: ${event.formattedTime}'),
            const SizedBox(height: 8.0),
            Text('Temperature: ${event.temperature.toStringAsFixed(1)}°C'),
            const SizedBox(height: 8.0),
            Text('Humidity: ${event.humidity.toStringAsFixed(1)}%'),
            const SizedBox(height: 16.0),
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
