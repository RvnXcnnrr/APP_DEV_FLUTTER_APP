import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import 'package:appdev_md/models/motion_event.dart';

/// Service for handling WebSocket connections to the backend
class WebSocketService {
  /// The WebSocket channel
  WebSocketChannel? _channel;

  /// Stream controller for motion events
  final _motionEventsController = StreamController<MotionEvent>.broadcast();

  /// Stream controller for sensor data
  final _sensorDataController = StreamController<Map<String, dynamic>>.broadcast();

  /// Stream controller for connection status
  final _connectionStatusController = StreamController<bool>.broadcast();

  /// Stream of motion events
  Stream<MotionEvent> get motionEvents => _motionEventsController.stream;

  /// Stream of sensor data
  Stream<Map<String, dynamic>> get sensorData => _sensorDataController.stream;

  /// Stream of connection status
  Stream<bool> get connectionStatus => _connectionStatusController.stream;

  /// Whether the WebSocket is connected
  bool _isConnected = false;

  /// Gets whether the WebSocket is connected
  bool get isConnected => _isConnected;

  /// The WebSocket server URL
  final String _serverUrl;

  /// Timer for reconnection attempts
  Timer? _reconnectTimer;

  /// Creates a new WebSocket service
  WebSocketService({required String serverUrl}) : _serverUrl = serverUrl {
    // Connect to the WebSocket server
    connect();
  }

  /// Connects to the WebSocket server
  void connect() {
    try {
      if (kDebugMode) {
        print('Attempting to connect to WebSocket server: $_serverUrl');
      }

      // Create a new WebSocket channel
      _channel = IOWebSocketChannel.connect(
        Uri.parse(_serverUrl),
        pingInterval: const Duration(seconds: 30), // Send ping every 30 seconds to keep connection alive
      );

      if (kDebugMode) {
        print('WebSocket channel created, setting up listeners');
      }

      // Listen for messages
      _channel!.stream.listen(
        (dynamic message) {
          _handleMessage(message);
        },
        onDone: () {
          if (kDebugMode) {
            print('WebSocket connection closed');
          }
          _handleDisconnection();
        },
        onError: (error) {
          if (kDebugMode) {
            print('WebSocket error: $error');
          }
          _handleDisconnection();
        },
      );

      // Update connection status
      _isConnected = true;
      _connectionStatusController.add(true);

      if (kDebugMode) {
        print('Connected to WebSocket server: $_serverUrl');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to connect to WebSocket server: $e');
        print('Stack trace: ${StackTrace.current}');
      }
      _handleDisconnection();
    }
  }

  /// Handles a message from the WebSocket server
  void _handleMessage(dynamic message) {
    try {
      if (kDebugMode) {
        print('Received WebSocket message: $message');
      }

      // Parse the message
      final data = jsonDecode(message as String) as Map<String, dynamic>;

      // Check the message type
      final type = data['type'] as String?;

      if (type == 'motion_event') {
        try {
          // Create a motion event from the data
          final event = _createMotionEventFromData(data);

          // Add the event to the stream
          _motionEventsController.add(event);

          if (kDebugMode) {
            print('Processed motion event: ${event.id} at ${event.formattedTime}');
            print('Temperature: ${event.temperature}°C, Humidity: ${event.humidity}%');
          }
        } catch (e) {
          if (kDebugMode) {
            print('Error processing motion event: $e');
            print('Event data: $data');
          }
        }
      } else if (type == 'sensor_data') {
        // Add the sensor data to the stream
        _sensorDataController.add(data);

        if (kDebugMode) {
          print('Received sensor data: Temperature: ${data['temperature']}°C, Humidity: ${data['humidity']}%');
        }
      } else if (type == 'motion_event_received' || type == 'sensor_data_received') {
        // Acknowledgment from server, just log it
        if (kDebugMode) {
          print('Received acknowledgment: ${data['message']}');
        }
      } else {
        if (kDebugMode) {
          print('Received unknown message type: $type');
          print('Message data: $data');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error handling WebSocket message: $e');
        print('Raw message: $message');
        print('Stack trace: ${StackTrace.current}');
      }
    }
  }

  /// Creates a motion event from WebSocket data
  MotionEvent _createMotionEventFromData(Map<String, dynamic> data) {
    // Parse the timestamp
    DateTime timestamp;

    // Check if the timestamp is in the format "DEVICE_UPTIME:seconds"
    final timestampStr = data['timestamp'] as String;
    if (timestampStr.startsWith('DEVICE_UPTIME:')) {
      // Use current time for device uptime timestamps
      timestamp = DateTime.now();
    } else {
      // Try to parse as ISO 8601 timestamp
      timestamp = DateTime.tryParse(timestampStr) ?? DateTime.now();
    }

    // Create a unique ID if none is provided
    final id = data['id'] as String? ?? 'event_${DateTime.now().millisecondsSinceEpoch}';

    // Create the motion event
    return MotionEvent(
      id: id,
      timestamp: timestamp,
      deviceId: data['device_id'] as String,
      temperature: (data['temperature'] as num).toDouble(),
      humidity: (data['humidity'] as num).toDouble(),
      imageUrl: data['image_url'] as String? ?? 'https://via.placeholder.com/150',
    );
  }

  /// Handles a disconnection from the WebSocket server
  void _handleDisconnection() {
    // Update connection status
    _isConnected = false;
    _connectionStatusController.add(false);

    if (kDebugMode) {
      print('Disconnected from WebSocket server');
    }

    // Schedule a reconnection attempt
    _scheduleReconnect();
  }

  /// Schedules a reconnection attempt
  void _scheduleReconnect() {
    // Cancel any existing timer
    _reconnectTimer?.cancel();

    // Schedule a new reconnection attempt
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      if (kDebugMode) {
        print('Attempting to reconnect to WebSocket server...');
      }
      connect();
    });
  }

  /// Disconnects from the WebSocket server
  void disconnect() {
    // Cancel any reconnection attempts
    _reconnectTimer?.cancel();

    // Close the WebSocket channel
    _channel?.sink.close();

    // Update connection status
    _isConnected = false;
    _connectionStatusController.add(false);
  }

  /// Disposes of the WebSocket service
  void dispose() {
    // Disconnect from the WebSocket server
    disconnect();

    // Close the stream controllers
    _motionEventsController.close();
    _sensorDataController.close();
    _connectionStatusController.close();
  }
}
