import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:appdev_md/models/motion_event.dart';
import 'package:appdev_md/services/websocket_service.dart';

/// Provider for motion events
class MotionEventProvider extends ChangeNotifier {
  /// The WebSocket service
  final WebSocketService _webSocketService;
  
  /// Map of dates to lists of motion events
  final Map<DateTime, List<MotionEvent>> _events = {};
  
  /// Subscription to motion events
  StreamSubscription<MotionEvent>? _motionEventSubscription;
  
  /// Subscription to connection status
  StreamSubscription<bool>? _connectionStatusSubscription;
  
  /// Whether the WebSocket is connected
  bool _isConnected = false;
  
  /// Gets whether the WebSocket is connected
  bool get isConnected => _isConnected;
  
  /// Creates a new motion event provider
  MotionEventProvider({required WebSocketService webSocketService}) 
      : _webSocketService = webSocketService {
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
  
  @override
  void dispose() {
    // Cancel subscriptions
    _motionEventSubscription?.cancel();
    _connectionStatusSubscription?.cancel();
    
    super.dispose();
  }
}
