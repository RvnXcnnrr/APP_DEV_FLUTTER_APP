/**
 * ESP32 Motion, Temperature and Humidity Sensor with WebSocket Communication
 *
 * This production-grade code reads data from a DHT22 temperature/humidity sensor
 * and detects motion using a PIR sensor. It sends real-time updates via WebSocket
 * to a backend server when motion is detected or sensor values change significantly.
 *
 * Hardware:
 * - ESP32 development board (DOIT DevKit V1 or similar)
 * - DHT22 temperature and humidity sensor connected to GPIO 26
 * - PIR motion sensor connected to GPIO 27
 *
 * Libraries required:
 * - WiFi (built-in with ESP32 Arduino core)
 * - WebSocketsClient (by Links2004)
 * - ArduinoJson (by Benoit Blanchon)
 * - DHT sensor library (by Adafruit)
 * - Adafruit Unified Sensor (dependency for DHT library)
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// ===== CONFIGURATION =====
// WiFi credentials - CHANGE THESE TO MATCH YOUR NETWORK
const char* WIFI_SSID = "WPA3-SAE-256bit24G-AES-GCMP";
const char* WIFI_PASSWORD = "Tech2025$WiFi";

// WebSocket server settings - CHANGE THESE TO MATCH YOUR SERVER
const char* WS_HOST = "192.168.1.9";  // Your server IP address
const int WS_PORT = 8000;             // Your server port
const char* WS_PATH = "/ws/sensors/?token=d6d5f5d99bbd616cce3452ad1d02cd6ae968b20d"; // WebSocket endpoint with token
const char* DEVICE_ID = "ESP32_001";  // Unique ID for this device

// Sensor pins
#define PIR_PIN 27       // PIR motion sensor pin
#define DHT_PIN 26       // DHT22 sensor pin
#define DHT_TYPE DHT22   // DHT sensor type

// Timing constants
const unsigned long SENSOR_READ_INTERVAL = 60000;  // Read sensor data every 60 seconds
const unsigned long RECONNECT_INTERVAL = 5000;     // Try to reconnect every 5 seconds
const unsigned long MOTION_COOLDOWN = 5000;        // Minimum time between motion events
const float TEMP_THRESHOLD = 0.5;                  // Minimum temperature change to trigger update
const float HUMIDITY_THRESHOLD = 1.0;              // Minimum humidity change to trigger update

// ===== GLOBAL VARIABLES =====
// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// Initialize WebSocket client
WebSocketsClient webSocket;

// Variables for sensor readings
float temperature = 0.0;
float humidity = 0.0;
float lastTemperature = 0.0;
float lastHumidity = 0.0;
bool motionDetected = false;
bool lastMotionState = false;

// Timing variables
unsigned long lastSensorReadTime = 0;
unsigned long lastMotionTime = 0;
unsigned long lastReconnectAttempt = 0;
unsigned long deviceStartTime = 0;

// Connection state
bool wsConnected = false;

// ===== FUNCTION PROTOTYPES =====
void connectToWiFi();
void setupWebSocket();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
void readDHTSensor();
void checkMotionSensor();
void sendMotionEvent();
void sendSensorData(bool forceSend = false);
String getTimestamp();
void handleWiFiDisconnect();

// ===== SETUP =====
void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  delay(100);  // Short delay to ensure serial is ready
  Serial.println("\n\nESP32 Motion & Temperature Sensor Starting...");

  // Record start time
  deviceStartTime = millis();

  // Initialize sensors
  pinMode(PIR_PIN, INPUT);
  dht.begin();
  Serial.println("Sensors initialized");

  // Connect to WiFi
  connectToWiFi();

  // Setup WebSocket connection
  setupWebSocket();

  // Initial sensor reading
  readDHTSensor();
  lastTemperature = temperature;
  lastHumidity = humidity;

  Serial.println("Setup complete");
}

// ===== MAIN LOOP =====
void loop() {
  unsigned long currentMillis = millis();

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    handleWiFiDisconnect();
    return;  // Skip the rest of the loop if WiFi is disconnected
  }

  // Handle WebSocket connection
  webSocket.loop();

  // Check for motion
  checkMotionSensor();

  // Read sensor data at regular intervals
  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentMillis;
    readDHTSensor();
    sendSensorData();
  }

  // Attempt to reconnect WebSocket if disconnected
  if (!wsConnected && (currentMillis - lastReconnectAttempt >= RECONNECT_INTERVAL)) {
    lastReconnectAttempt = currentMillis;
    Serial.println("Attempting to reconnect WebSocket...");
    webSocket.disconnect();
    setupWebSocket();
  }

  // Small delay to prevent CPU overload
  delay(50);
}

// ===== WIFI FUNCTIONS =====
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;  // Already connected
  }

  WiFi.mode(WIFI_STA);  // Set WiFi to station mode
  WiFi.disconnect(true);  // Disconnect from any previous connections
  delay(1000);  // Short delay to ensure WiFi is reset

  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiRetryCount = 0;
  const int maxWifiRetries = 30;  // 15 seconds timeout

  while (WiFi.status() != WL_CONNECTED && wifiRetryCount < maxWifiRetries) {
    delay(500);
    Serial.print(".");
    wifiRetryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi");
    Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());

    // Print network details for debugging
    Serial.printf("Subnet mask: %s\n", WiFi.subnetMask().toString().c_str());
    Serial.printf("Gateway IP: %s\n", WiFi.gatewayIP().toString().c_str());
    Serial.printf("DNS server: %s\n", WiFi.dnsIP().toString().c_str());
    Serial.printf("Signal strength (RSSI): %d dBm\n", WiFi.RSSI());
  } else {
    Serial.println("\nFailed to connect to WiFi. Will retry later.");
  }
}

void handleWiFiDisconnect() {
  unsigned long currentMillis = millis();
  static unsigned long lastWiFiAttempt = 0;

  if (currentMillis - lastWiFiAttempt >= RECONNECT_INTERVAL) {
    lastWiFiAttempt = currentMillis;
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
}

// ===== WEBSOCKET FUNCTIONS =====
void setupWebSocket() {
  // Server address, port, and URL
  Serial.printf("Connecting to WebSocket server: %s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);

  // For non-SSL connection (regular WebSocket)
  webSocket.begin(WS_HOST, WS_PORT, WS_PATH);

  // For SSL connection (WSS) - uncomment this and comment the line above if your server uses SSL
  // webSocket.beginSSL(WS_HOST, WS_PORT, WS_PATH, "", "wss");

  // Event handler
  webSocket.onEvent(webSocketEvent);

  // Try every 5 seconds if connection has failed
  webSocket.setReconnectInterval(RECONNECT_INTERVAL);

  Serial.println("WebSocket client started");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected");
      wsConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.printf("WebSocket connected to: %s\n", payload);
      wsConnected = true;
      // Send initial sensor data upon connection
      readDHTSensor();
      sendSensorData(true);
      break;

    case WStype_TEXT:
      Serial.printf("WebSocket received text: %s\n", payload);
      // You can handle server responses here if needed
      break;

    case WStype_BIN:
      Serial.println("WebSocket received binary data");
      break;

    case WStype_ERROR:
      Serial.printf("WebSocket error: %s\n", payload);
      wsConnected = false;
      break;

    case WStype_PING:
      Serial.println("WebSocket received ping");
      break;

    case WStype_PONG:
      Serial.println("WebSocket received pong");
      break;

    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      Serial.println("WebSocket fragment received");
      break;

    default:
      Serial.printf("WebSocket unknown event type: %d\n", type);
      break;
  }
}

// ===== SENSOR FUNCTIONS =====
void readDHTSensor() {
  // Read humidity
  float newHumidity = dht.readHumidity();
  // Read temperature in Celsius
  float newTemperature = dht.readTemperature();

  // Check if any reads failed
  if (isnan(newHumidity) || isnan(newTemperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Update global variables
  temperature = newTemperature;
  humidity = newHumidity;

  Serial.printf("Temperature: %.1f°C, Humidity: %.1f%%\n", temperature, humidity);
}

void checkMotionSensor() {
  unsigned long currentMillis = millis();

  // Read motion sensor
  int pirValue = digitalRead(PIR_PIN);

  // Check if motion is detected and we're not in cooldown period
  if (pirValue == HIGH) {
    if (!motionDetected && (currentMillis - lastMotionTime >= MOTION_COOLDOWN)) {
      Serial.println("Motion detected!");
      motionDetected = true;
      lastMotionTime = currentMillis;

      // Read temperature and humidity
      readDHTSensor();

      // Send motion event to server
      sendMotionEvent();
    }
  } else {
    // Reset motion state if no motion is detected
    motionDetected = false;
  }
}

// ===== DATA TRANSMISSION FUNCTIONS =====
void sendMotionEvent() {
  if (!wsConnected) {
    Serial.println("WebSocket not connected. Cannot send motion event.");
    return;
  }

  // Create JSON document
  StaticJsonDocument<256> doc;
  doc["type"] = "motion_event";
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = getTimestamp();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;

  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send WebSocket message
  webSocket.sendTXT(jsonString);
  Serial.println("Motion event sent via WebSocket");
}

void sendSensorData(bool forceSend) {
  if (!wsConnected) {
    Serial.println("WebSocket not connected. Cannot send sensor data.");
    return;
  }

  // Check if values have changed enough to warrant sending an update
  bool tempChanged = abs(temperature - lastTemperature) >= TEMP_THRESHOLD;
  bool humidityChanged = abs(humidity - lastHumidity) >= HUMIDITY_THRESHOLD;

  if (forceSend || tempChanged || humidityChanged) {
    // Create JSON document
    StaticJsonDocument<256> doc;
    doc["type"] = "sensor_data";
    doc["device_id"] = DEVICE_ID;
    doc["timestamp"] = getTimestamp();
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;

    // Serialize JSON to string
    String jsonString;
    serializeJson(doc, jsonString);

    // Send WebSocket message
    webSocket.sendTXT(jsonString);
    Serial.println("Sensor data sent via WebSocket");

    // Update last sent values
    lastTemperature = temperature;
    lastHumidity = humidity;
  }
}

// ===== UTILITY FUNCTIONS =====
String getTimestamp() {
  // Since we don't have a real-time clock, we'll use a timestamp format
  // that indicates the device uptime in seconds since boot
  // Format: "DEVICE_UPTIME:seconds"
  unsigned long uptime = millis() / 1000; // seconds

  // This format can be parsed by the backend to create a proper timestamp
  // or the backend can use its own timestamp when receiving the message
  return String("DEVICE_UPTIME:") + String(uptime);
}