#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// ===== CONFIGURATION =====
// WiFi credentials - CHANGE THESE TO MATCH YOUR NETWORK
const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// WebSocket server settings - PRODUCTION SETTINGS
const char* WS_HOST = "app-dev-flutter-app.onrender.com";  // Your Render app domain
const int WS_PORT = 443;             // Use 443 for secure WebSocket (WSS)
const char* WS_PATH = "/ws/sensors/?token=fe1f6c58646d8942c85cb5fc456990d4a639c1a0"; // WebSocket endpoint with token
const char* DEVICE_ID = "ESP32_001";  // Unique ID for this device

// Sensor pins
#define PIR_PIN 27       // PIR motion sensor pin
#define DHT_PIN 26       // DHT22 sensor pin
#define DHT_TYPE DHT22   // DHT sensor type

// Timing constants
#define RECONNECT_INTERVAL 5000  // Reconnect interval in milliseconds
#define SENSOR_READ_INTERVAL 10000  // Sensor reading interval in milliseconds
#define MOTION_DEBOUNCE_TIME 5000  // Debounce time for motion detection in milliseconds

// ===== GLOBAL VARIABLES =====
WebSocketsClient webSocket;
DHT dht(DHT_PIN, DHT_TYPE);
bool motionDetected = false;
unsigned long lastMotionTime = 0;
unsigned long lastSensorReadTime = 0;
bool isConnected = false;

// ===== SETUP FUNCTION =====
void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println("\nESP32 Motion & Temperature Sensor with WebSocket");

  // Initialize sensors
  pinMode(PIR_PIN, INPUT);
  dht.begin();

  // Connect to WiFi
  setupWiFi();

  // Connect to WebSocket server
  setupWebSocket();
}

// ===== MAIN LOOP =====
void loop() {
  // Handle WebSocket events
  webSocket.loop();

  // Check for motion
  checkMotion();

  // Read sensor data periodically
  readSensorData();
}

// ===== WIFI FUNCTIONS =====
void setupWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.printf("WiFi connected. IP address: %s\n", WiFi.localIP().toString().c_str());
}

// ===== WEBSOCKET FUNCTIONS =====
void setupWebSocket() {
  // Server address, port, and URL
  Serial.printf("Connecting to WebSocket server: %s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);

  // For SSL connection (WSS) - use this for production with Render
  webSocket.beginSSL(WS_HOST, WS_PORT, WS_PATH, "", "wss");

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
      isConnected = false;
      break;

    case WStype_CONNECTED:
      Serial.println("WebSocket connected");
      isConnected = true;
      // Send initial device info
      sendDeviceInfo();
      break;

    case WStype_TEXT:
      handleWebSocketMessage(payload, length);
      break;

    case WStype_ERROR:
      Serial.println("WebSocket error");
      break;

    default:
      break;
  }
}

void handleWebSocketMessage(uint8_t * payload, size_t length) {
  // Convert payload to string for easier handling
  String message = String((char*)payload);
  Serial.printf("Received message: %s\n", message.c_str());

  // Parse JSON message
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.printf("JSON parsing error: %s\n", error.c_str());
    return;
  }

  // Handle different message types
  String type = doc["type"];

  if (type == "sensor_data_received") {
    Serial.println("Server acknowledged sensor data");
  }
}

// ===== SENSOR FUNCTIONS =====
void checkMotion() {
  int motionState = digitalRead(PIR_PIN);
  unsigned long currentTime = millis();

  // Motion detected
  if (motionState == HIGH) {
    // Debounce motion detection
    if (!motionDetected && (currentTime - lastMotionTime > MOTION_DEBOUNCE_TIME)) {
      motionDetected = true;
      lastMotionTime = currentTime;

      // Send motion event with current sensor readings
      sendMotionEvent();
    }
  } else {
    motionDetected = false;
  }
}

void readSensorData() {
  unsigned long currentTime = millis();

  // Read sensor data periodically
  if (currentTime - lastSensorReadTime > SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentTime;

    // Send sensor data
    sendSensorData();
  }
}

// ===== DATA SENDING FUNCTIONS =====
void sendDeviceInfo() {
  if (!isConnected) return;

  DynamicJsonDocument doc(1024);
  doc["type"] = "device_info";
  doc["device_id"] = DEVICE_ID;

  String jsonString;
  serializeJson(doc, jsonString);

  webSocket.sendTXT(jsonString);
  Serial.printf("Sent device info: %s\n", jsonString.c_str());
}

void sendMotionEvent() {
  if (!isConnected) return;

  // Read current temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    temperature = 0;
    humidity = 0;
  }

  // Create JSON message
  DynamicJsonDocument doc(1024);
  doc["type"] = "motion_event";
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = getCurrentTimestamp();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["motion"] = true;

  String jsonString;
  serializeJson(doc, jsonString);

  // Send to server
  webSocket.sendTXT(jsonString);
  Serial.printf("Sent motion event: %s\n", jsonString.c_str());
}

void sendSensorData() {
  if (!isConnected) return;

  // Read current temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Create JSON message
  DynamicJsonDocument doc(1024);
  doc["type"] = "sensor_data";
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = getCurrentTimestamp();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["motion"] = motionDetected;

  String jsonString;
  serializeJson(doc, jsonString);

  // Send to server
  webSocket.sendTXT(jsonString);
  Serial.printf("Sent sensor data: %s\n", jsonString.c_str());
}

// ===== UTILITY FUNCTIONS =====
String getCurrentTimestamp() {
  // For simplicity, we'll just use the uptime in milliseconds
  // In a real application, you would use NTP to get the actual time
  return String(millis());
}
