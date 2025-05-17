import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:appdev_md/models/motion_event.dart';
import 'package:appdev_md/services/websocket_service.dart';
import 'package:appdev_md/services/api_service.dart';
import 'package:appdev_md/utils/logger.dart';

/// Provider for motion events
class MotionEventProvider extends ChangeNotifier {
  /// The WebSocket service
  final WebSocketService _webSocketService;

  /// The API service for fetching historical data
  final ApiService _apiService;

  /// Map of dates to lists of motion events
  final Map<DateTime, List<MotionEvent>> _events = {};

  /// Subscription to motion events
  StreamSubscription<MotionEvent>? _motionEventSubscription;

  /// Subscription to connection status
  StreamSubscription<bool>? _connectionStatusSubscription;

  /// Whether the WebSocket is connected
  bool _isConnected = false;

  /// Whether we're currently loading historical events
  bool _isLoadingHistoricalEvents = false;

  /// Gets whether the WebSocket is connected
  bool get isConnected => _isConnected;

  /// Gets whether we're currently loading historical events
  bool get isLoadingHistoricalEvents => _isLoadingHistoricalEvents;

  /// Creates a new motion event provider
  MotionEventProvider({
    required WebSocketService webSocketService,
    ApiService? apiService,
  }) : _webSocketService = webSocketService,
       _apiService = apiService ?? ApiService(baseUrl: 'http://localhost:8000') {
    // Subscribe to motion events
    _motionEventSubscription = _webSocketService.motionEvents.listen(_handleMotionEvent);

    // Subscribe to connection status
    _connectionStatusSubscription = _webSocketService.connectionStatus.listen((connected) {
      _isConnected = connected;
      notifyListeners();
    });

    // Initialize connection status
    _isConnected = _webSocketService.isConnected;
  }

  /// Gets all events
  Map<DateTime, List<MotionEvent>> get events => _events;

  /// Gets events for a specific day
  List<MotionEvent> getEventsForDay(DateTime day) {
    // Normalize the date to remove time component
    final normalizedDate = DateTime(day.year, day.month, day.day);

    // Return events for the day or an empty list
    return _events[normalizedDate] ?? [];
  }

  /// Handles a motion event from the WebSocket
  void _handleMotionEvent(MotionEvent event) {
    // Normalize the date to remove time component
    final date = DateTime(event.timestamp.year, event.timestamp.month, event.timestamp.day);

    // Add the event to the map
    if (_events.containsKey(date)) {
      _events[date]!.add(event);

      // Sort events by timestamp (newest first)
      _events[date]!.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    } else {
      _events[date] = [event];
    }

    // Notify listeners
    notifyListeners();

    if (kDebugMode) {
      print('Added motion event: ${event.id} on ${event.formattedDate}');
    }
  }

  /// Clears all events
  void clearEvents() {
    _events.clear();
    notifyListeners();
  }

  /// Fetches historical motion events from the API
  Future<void> fetchHistoricalEvents() async {
    try {
      // Set loading state
      _isLoadingHistoricalEvents = true;
      notifyListeners();

      Logger.info('Fetching historical motion events from API');

      // Check if we have a valid token first
      final token = await _apiService.getToken();
      if (token == null) {
        Logger.warning('No authentication token found, cannot fetch motion events');
        return;
      }

      Logger.debug('Using token: ${token.substring(0, token.length > 10 ? 10 : token.length)}...');

      // Fetch motion events from the API
      final response = await _apiService.get('api/sensors/motion-events/');

      // Log the response for debugging
      Logger.debug('API response type: ${response.runtimeType}');
      Logger.debug('API response: $response');

      // Clear existing events
      _events.clear();

      // Parse the response
      if (response is List) {
        Logger.info('Received ${response.length} motion events from API');

        for (final eventData in response) {
          try {
            // Parse the timestamp
            final timestamp = DateTime.parse(eventData['timestamp']);

            // Create a motion event
            final event = MotionEvent(
              id: eventData['id'].toString(),
              timestamp: timestamp,
              deviceId: eventData['device_name'] ?? 'Unknown Device',
              temperature: (eventData['temperature'] ?? 0.0).toDouble(),
              humidity: (eventData['humidity'] ?? 0.0).toDouble(),
              imageUrl: eventData['image'] ?? 'https://via.placeholder.com/150',
            );

            // Add the event to the map
            _handleMotionEvent(event);

            Logger.debug('Added historical event: ${event.id} on ${event.formattedDate}');
          } catch (e) {
            Logger.error('Error parsing motion event: $e');
            Logger.error('Event data: $eventData');
          }
        }
      } else {
        Logger.warning('Unexpected response format: ${response.runtimeType}');

        // Try to handle different response formats
        if (response is Map<String, dynamic> && response.containsKey('results')) {
          final results = response['results'];
          if (results is List) {
            Logger.info('Found results list in response with ${results.length} items');

            for (final eventData in results) {
              try {
                // Parse the timestamp
                final timestamp = DateTime.parse(eventData['timestamp']);

                // Create a motion event
                final event = MotionEvent(
                  id: eventData['id'].toString(),
                  timestamp: timestamp,
                  deviceId: eventData['device_name'] ?? 'Unknown Device',
                  temperature: (eventData['temperature'] ?? 0.0).toDouble(),
                  humidity: (eventData['humidity'] ?? 0.0).toDouble(),
                  imageUrl: eventData['image'] ?? 'https://via.placeholder.com/150',
                );

                // Add the event to the map
                _handleMotionEvent(event);

                Logger.debug('Added historical event from results: ${event.id} on ${event.formattedDate}');
              } catch (e) {
                Logger.error('Error parsing motion event from results: $e');
              }
            }
          }
        }
      }

      Logger.info('Finished fetching historical motion events, total events: ${_events.values.fold<int>(0, (sum, list) => sum + list.length)}');
    } catch (e) {
      Logger.error('Error fetching historical motion events: $e');
      Logger.error('Stack trace: ${StackTrace.current}');
    } finally {
      // Reset loading state
      _isLoadingHistoricalEvents = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    // Cancel subscriptions
    _motionEventSubscription?.cancel();
    _connectionStatusSubscription?.cancel();

    super.dispose();
  }
}
