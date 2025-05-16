import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:appdev_md/services/websocket_service.dart';

/// Provider for real-time sensor data
class SensorDataProvider extends ChangeNotifier {
  /// The WebSocket service
  final WebSocketService _webSocketService;

  /// Current temperature in Celsius
  double? _temperature;

  /// Current humidity in percentage
  double? _humidity;

  /// Whether the WebSocket is connected
  bool _isConnected = false;

  /// Subscription to sensor data
  StreamSubscription<Map<String, dynamic>>? _sensorDataSubscription;

  /// Subscription to connection status
  StreamSubscription<bool>? _connectionStatusSubscription;

  /// Gets the current temperature
  double? get temperature => _temperature;

  /// Gets the current humidity
  double? get humidity => _humidity;

  /// Gets whether the WebSocket is connected
  bool get isConnected => _isConnected;

  /// Creates a new sensor data provider
  SensorDataProvider({required WebSocketService webSocketService})
      : _webSocketService = webSocketService {
    // Subscribe to sensor data
    _sensorDataSubscription = _webSocketService.sensorData.listen(_handleSensorData);

    // Subscribe to connection status
    _connectionStatusSubscription = _webSocketService.connectionStatus.listen((connected) {
      _isConnected = connected;
      notifyListeners();
    });

    // Initialize connection status
    _isConnected = _webSocketService.isConnected;
  }

  /// Handles sensor data from the WebSocket
  void _handleSensorData(Map<String, dynamic> data) {
    // Only process data of type 'sensor_data', not 'motion_event'
    final type = data['type'] as String?;
    if (type != 'sensor_data') {
      // Skip processing if this is not a sensor data update
      return;
    }

    bool dataUpdated = false;

    // Update temperature and humidity
    if (data.containsKey('temperature')) {
      final newTemperature = (data['temperature'] as num).toDouble();
      if (_temperature != newTemperature) {
        _temperature = newTemperature;
        dataUpdated = true;
      }
    }

    if (data.containsKey('humidity')) {
      final newHumidity = (data['humidity'] as num).toDouble();
      if (_humidity != newHumidity) {
        _humidity = newHumidity;
        dataUpdated = true;
      }
    }

    // Only notify listeners if data has changed
    if (dataUpdated) {
      notifyListeners();

      if (kDebugMode) {
        print('Updated real-time sensor data: Temperature: $_temperature°C, Humidity: $_humidity%');
      }
    }
  }

  @override
  void dispose() {
    // Cancel subscriptions
    _sensorDataSubscription?.cancel();
    _connectionStatusSubscription?.cancel();

    super.dispose();
  }
}
