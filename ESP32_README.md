# ESP32 Motion Detector

This Arduino sketch enables an ESP32 microcontroller to function as a motion detector with temperature and humidity sensing capabilities. It communicates with the Django backend to send sensor data and motion events using both HTTP and WebSockets.

## Features

- **Motion Detection**: Uses a PIR sensor to detect movement
- **Temperature & Humidity Monitoring**: Uses a DHT22 sensor
- **Real-time Data Transmission**: Sends data to the Django backend via HTTP and WebSockets
- **Automatic Device Registration**: Attempts to register itself with the backend on startup
- **NTP Time Synchronization**: Gets accurate time from NTP servers
- **Robust Error Handling**: Graceful handling of connection issues and sensor failures
- **Automatic Reconnection**: Reconnects to WiFi and WebSocket server if connection is lost
- **Production-Ready**: Configurable for both development and production environments

## Hardware Requirements

- ESP32 development board
- PIR motion sensor
- DHT22 temperature and humidity sensor
- Jumper wires
- Breadboard (optional)
- Power supply (USB or external)

## Wiring

1. **PIR Motion Sensor**:
   - VCC → 3.3V or 5V (depending on your sensor)
   - GND → GND
   - OUT → GPIO 27

2. **DHT22 Sensor**:
   - VCC → 3.3V
   - GND → GND
   - DATA → GPIO 26

## Software Dependencies

The following Arduino libraries are required:

- **WiFi**: For connecting to WiFi (included with ESP32 board)
- **HTTPClient**: For making HTTP requests (included with ESP32 board)
- **WebSocketsClient**: For WebSocket communication
- **ArduinoJson**: For creating and parsing JSON
- **DHT**: For reading the DHT22 sensor (Adafruit DHT library)
- **Adafruit Unified Sensor**: Required by the DHT library
- **time.h**: For NTP time synchronization (standard library)

## Configuration

Before uploading the code, you need to configure:

1. **WiFi Credentials**:
   ```cpp
   const char* ssid = "YourWiFiSSID";
   const char* password = "YourWiFiPassword";
   ```

2. **Server URLs**:

   For development (local server):
   ```cpp
   const char* httpServerUrl = "http://192.168.1.9:8000";
   const char* wsServerUrl = "ws://192.168.1.9:8000/ws/sensors/";
   ```

   For production (deployed server):
   ```cpp
   const char* httpServerUrl = "https://app-dev-flutter-app.onrender.com";
   const char* wsServerUrl = "wss://app-dev-flutter-app.onrender.com/ws/sensors/";
   ```

3. **Authentication**:
   ```cpp
   const char* deviceToken = "fe1f6c58646d8942c85cb5fc456990d4a639c1a0";
   ```
   This token must be registered in the Django backend for the device.

4. **Device Information**:
   ```cpp
   const char* deviceId = "ESP32_001";
   const char* deviceLocation = "Living Room";
   const char* deviceOwnerEmail = "oracle.tech.143@gmail.com";
   ```
   You can change these to identify your specific device.

5. **Time Settings**:
   ```cpp
   const long gmtOffset_sec = 28800;  // GMT+8 (Philippine Time)
   const int daylightOffset_sec = 0;  // No DST in the Philippines
   ```
   Adjust these values based on your timezone.

## Installation

1. Install the Arduino IDE (version 2.0 or later recommended)
2. Add ESP32 board support to Arduino IDE:
   - Go to File > Preferences
   - Add `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json` to Additional Board Manager URLs
   - Go to Tools > Board > Boards Manager
   - Search for ESP32 and install "ESP32 by Espressif Systems"

3. Install required libraries through the Library Manager (Tools > Manage Libraries):
   - WebSocketsClient by Markus Sattler
   - ArduinoJson by Benoit Blanchon
   - DHT sensor library by Adafruit
   - Adafruit Unified Sensor by Adafruit

4. Choose between development and production code:
   - For local development: Use `esp32_motion_detector.ino`
   - For production deployment: Use `ESP32_Production_Template.ino`

5. Configure the settings as described in the Configuration section

6. Connect your ESP32 to your computer via USB

7. Select the correct board and port in Arduino IDE:
   - Tools > Board > ESP32 Arduino > DOIT ESP32 DEVKIT V1
   - Tools > Port > (select the COM port where your ESP32 is connected)

8. Upload the sketch (Upload button or Sketch > Upload)

## How It Works

1. **Setup Phase**:
   - Initializes serial communication for debugging
   - Connects to WiFi with automatic reconnection
   - Configures NTP time synchronization with multiple servers
   - Initializes the DHT22 sensor
   - Attempts to register the device with the backend
   - Establishes WebSocket connection with authentication

2. **Main Loop**:
   - Checks for motion using the PIR sensor
   - When motion is detected:
     - Reads temperature and humidity from DHT22
     - Sends a motion event to the backend via HTTP
     - Sends a motion event via WebSocket for real-time updates
   - Periodically (every 60 seconds):
     - Reads temperature and humidity
     - Sends sensor data to the backend via HTTP
     - Sends sensor data via WebSocket
   - Maintains WebSocket connection:
     - Handles WebSocket events (connect, disconnect, messages)
     - Automatically reconnects if connection is lost
     - Implements exponential backoff for reconnection attempts

3. **Data Transmission**:
   - HTTP endpoints:
     - Motion events: `/api/sensors/esp32/motion-event/`
     - Regular sensor data: `/api/sensors/esp32/sensor-data/`
   - WebSocket endpoint:
     - `ws://[server-address]/ws/sensors/?token=[device-token]`

## API Communication

### HTTP Requests

The ESP32 sends HTTP POST requests to the backend with the following structure:

```
POST /api/sensors/esp32/motion-event/ HTTP/1.1
Host: app-dev-flutter-app.onrender.com
Content-Type: application/json
Authorization: Token fe1f6c58646d8942c85cb5fc456990d4a639c1a0

{
  "device_id": "ESP32_001",
  "timestamp": "2023-05-16T12:34:56",
  "temperature": 25.5,
  "humidity": 60.2
}
```

### WebSocket Messages

The ESP32 sends and receives WebSocket messages with the following structure:

```json
// Outgoing message (from ESP32 to server)
{
  "type": "motion_event",
  "data": {
    "device_id": "ESP32_001",
    "timestamp": "2023-05-16T12:34:56",
    "temperature": 25.5,
    "humidity": 60.2
  }
}

// Incoming message (from server to ESP32)
{
  "type": "sensor_data_received",
  "status": "success",
  "message": "Data received successfully"
}
```

## Troubleshooting

- **WiFi Connection Issues**:
  - Check your WiFi credentials in the code
  - Ensure the ESP32 is within range of your WiFi router
  - Check the Serial Monitor for connection status messages
  - The code includes automatic reconnection with exponential backoff

- **Server Communication Issues**:
  - Verify the server URLs are correct (HTTP and WebSocket)
  - Make sure the Django backend is running
  - Check that your device token is valid and registered in the backend
  - For local development, ensure your computer's firewall allows incoming connections
  - For production, check that the Render.com service is running

- **Sensor Reading Issues**:
  - Check the wiring connections (see Wiring section)
  - Verify the correct GPIO pins are used (PIR on GPIO 27, DHT22 on GPIO 26)
  - Ensure the DHT22 sensor is properly powered (3.3V)
  - The code includes error handling for sensor reading failures

- **Time Synchronization Issues**:
  - The code handles NTP time synchronization failures gracefully
  - If NTP time sync fails, the device will use uptime-based timestamps
  - The device periodically retries NTP synchronization
  - Multiple NTP servers are configured for better reliability
  - Check that your timezone settings are correct (gmtOffset_sec and daylightOffset_sec)

- **WebSocket Connection Issues**:
  - Check the WebSocket URL format (ws:// for local, wss:// for production)
  - Verify that the token parameter is included in the URL
  - The code includes automatic reconnection for WebSocket connections
  - Check the Serial Monitor for WebSocket connection status messages

- **Device Registration Issues**:
  - The device may need to be manually registered in the Django admin interface
  - Ensure the device is associated with a valid user account
  - Check the Django server logs for error messages

## Production Deployment

For production deployment:

1. Use the `ESP32_Production_Template.ino` file
2. Configure with production settings:
   ```cpp
   const char* httpServerUrl = "https://app-dev-flutter-app.onrender.com";
   const char* wsServerUrl = "wss://app-dev-flutter-app.onrender.com/ws/sensors/";
   const char* deviceToken = "your-device-token";
   ```
3. Set the correct timezone for your location
4. Upload the code to your ESP32
5. Monitor the Serial output for connection status

## Notes

- The ESP32 will automatically reconnect to WiFi if the connection is lost
- WebSocket connections include automatic reconnection with exponential backoff
- The device sends both HTTP requests and WebSocket messages for redundancy
- The code includes a robust time handling system:
  - Uses multiple NTP servers for better reliability
  - Falls back to uptime-based timestamps if NTP fails
  - Periodically retries NTP synchronization
- Serial output provides detailed debugging information
- The device is configured to use Philippine Time (PHT, UTC+8) by default
