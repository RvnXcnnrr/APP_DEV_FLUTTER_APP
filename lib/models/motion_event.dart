/// Model class representing a motion detection event
class MotionEvent {
  /// Unique identifier for the event
  final String id;

  /// Timestamp when the motion was detected
  final DateTime timestamp;

  /// ID of the device that detected the motion
  final String deviceId;

  /// Temperature reading at the time of the event (in Celsius)
  final double temperature;

  /// Humidity reading at the time of the event (in percentage)
  final double humidity;

  /// URL to the image captured during the motion event
  final String imageUrl;

  /// Creates a new motion event
  const MotionEvent({
    required this.id,
    required this.timestamp,
    required this.deviceId,
    required this.temperature,
    required this.humidity,
    required this.imageUrl,
  });

  /// Creates a formatted time string from the timestamp with AM/PM
  String get formattedTime {
    final hour = timestamp.hour > 12 ? timestamp.hour - 12 : timestamp.hour;
    final hourDisplay = hour == 0 ? 12 : hour; // Handle midnight (0:00) as 12 AM
    final amPm = timestamp.hour >= 12 ? 'PM' : 'AM';
    return '${hourDisplay.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')} $amPm';
  }

  /// Creates a formatted date string from the timestamp
  String get formattedDate {
    return '${timestamp.day.toString().padLeft(2, '0')}/${timestamp.month.toString().padLeft(2, '0')}/${timestamp.year}';
  }
}
