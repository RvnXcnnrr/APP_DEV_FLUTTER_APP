# ESP32 Motion Detector

This Arduino sketch enables an ESP32 microcontroller to function as a motion detector with temperature and humidity sensing capabilities. It communicates with the Django backend to send sensor data and motion events.

## Features

- **Motion Detection**: Uses a PIR sensor to detect movement
- **Temperature & Humidity Monitoring**: Uses a DHT22 sensor
- **Real-time Data Transmission**: Sends data to the Django backend via HTTP
- **Automatic Device Registration**: Attempts to register itself with the backend on startup
- **NTP Time Synchronization**: Gets accurate time from NTP servers

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
- **ArduinoJson**: For creating and parsing JSON
- **DHT**: For reading the DHT22 sensor (Adafruit DHT library)
- **time.h**: For NTP time synchronization (standard library)

## Configuration

Before uploading the code, you need to configure:

1. **WiFi Credentials**:
   ```cpp
   const char* ssid = "WPA3-SAE-256bit24G-AES-GCMP";
   const char* password = "Tech2025$WiFi";
   ```

2. **Server URL**:
   ```cpp
   const char* serverUrl = "http://192.168.1.9:8000";
   ```
   This is already configured to use your local IP address.

3. **Device Information**:
   ```cpp
   const char* deviceId = "ESP32_001";
   const char* deviceLocation = "Living Room";
   ```
   You can change these to identify your specific device.

4. **Time Settings**:
   ```cpp
   const long gmtOffset_sec = 0;  // GMT offset in seconds
   const int daylightOffset_sec = 3600;  // Daylight saving time offset
   ```
   Adjust these values based on your timezone.

## Installation

1. Install the Arduino IDE
2. Add ESP32 board support to Arduino IDE
3. Install required libraries through the Library Manager
4. Open `esp32_motion_detector.ino` in Arduino IDE
5. Configure the settings as described above
6. Connect your ESP32 to your computer
7. Select the correct board and port in Arduino IDE
8. Upload the sketch

## How It Works

1. **Setup Phase**:
   - Initializes serial communication
   - Connects to WiFi
   - Configures NTP time synchronization
   - Attempts to register the device with the backend

2. **Main Loop**:
   - Checks for motion using the PIR sensor
   - When motion is detected:
     - Reads temperature and humidity from DHT22
     - Sends a motion event to the backend
   - Periodically (every 60 seconds):
     - Reads temperature and humidity
     - Sends sensor data to the backend

3. **Data Transmission**:
   - Motion events: `/api/sensors/esp32/motion-event/`
   - Regular sensor data: `/api/sensors/esp32/sensor-data/`

## API Communication

The ESP32 sends JSON data to the backend with the following structure:

```json
{
  "device_id": "ESP32_001",
  "timestamp": "2025-05-16T12:34:56",
  "temperature": 25.5,
  "humidity": 60.2
}
```

## Troubleshooting

- **WiFi Connection Issues**:
  - Check your WiFi credentials
  - Ensure the ESP32 is within range of your WiFi router

- **Server Communication Issues**:
  - Verify the server URL is correct
  - Make sure the Django backend is running
  - Check that your computer's firewall allows incoming connections on port 8000

- **Sensor Reading Issues**:
  - Check the wiring connections
  - Verify the correct GPIO pins are used
  - Ensure the DHT22 sensor is properly powered

- **Time Synchronization Issues**:
  - The code now handles NTP time synchronization failures gracefully
  - If NTP time sync fails, the device will use uptime-based timestamps
  - The device will periodically retry NTP synchronization
  - Multiple NTP servers are configured for better reliability

- **Device Registration Issues**:
  - The device may need to be manually registered in the Django admin interface
  - Check the Django server logs for error messages

## Notes

- The ESP32 will attempt to reconnect to WiFi if the connection is lost
- The device registration function may fail if the backend requires authentication
- No image capture functionality is implemented in this version
- The code now includes a robust time handling system:
  - Uses multiple NTP servers for better reliability
  - Falls back to uptime-based timestamps if NTP fails
  - Periodically retries NTP synchronization
  - Timestamps format: "Uptime-DDdHHhMMmSSs" when NTP is unavailable
