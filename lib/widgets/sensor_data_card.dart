import 'package:flutter/material.dart';

/// A widget that displays real-time sensor data
class SensorDataCard extends StatelessWidget {
  /// The current temperature in Celsius
  final double? temperature;

  /// The current humidity in percentage
  final double? humidity;

  /// Whether the WebSocket is connected
  final bool isConnected;

  /// Creates a new sensor data card
  const SensorDataCard({
    super.key,
    this.temperature,
    this.humidity,
    required this.isConnected,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      elevation: 3.0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Real-time Sensor Data',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                _buildConnectionStatus(),
              ],
            ),
            const SizedBox(height: 16.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildTemperatureCard(context),
                _buildHumidityCard(context),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the connection status indicator
  Widget _buildConnectionStatus() {
    return Row(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 500),
          width: 12.0,
          height: 12.0,
          decoration: BoxDecoration(
            color: isConnected ? Colors.green : Colors.red,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8.0),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          child: Text(
            isConnected ? 'Connected' : 'Disconnected',
            key: ValueKey<bool>(isConnected),
            style: TextStyle(
              color: isConnected ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  /// Builds the temperature card
  Widget _buildTemperatureCard(BuildContext context) {
    return Expanded(
      child: Card(
        color: Theme.of(context).colorScheme.primary.withAlpha(26), // ~10% opacity (255 * 0.1 = 25.5)
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(
                Icons.thermostat,
                size: 48.0,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 8.0),
              Text(
                'Temperature',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8.0),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: child,
                  );
                },
                child: Text(
                  temperature != null
                      ? '${temperature!.toStringAsFixed(1)}°C'
                      : 'N/A',
                  key: ValueKey<double?>(temperature),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the humidity card
  Widget _buildHumidityCard(BuildContext context) {
    return Expanded(
      child: Card(
        color: Theme.of(context).colorScheme.secondary.withAlpha(26), // ~10% opacity (255 * 0.1 = 25.5)
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(
                Icons.water_drop,
                size: 48.0,
                color: Theme.of(context).colorScheme.secondary,
              ),
              const SizedBox(height: 8.0),
              Text(
                'Humidity',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8.0),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: child,
                  );
                },
                child: Text(
                  humidity != null
                      ? '${humidity!.toStringAsFixed(1)}%'
                      : 'N/A',
                  key: ValueKey<double?>(humidity),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
