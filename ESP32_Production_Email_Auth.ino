/**
 * ESP32 Motion, Temperature and Humidity Sensor with WebSocket Communication
 * Using Email-based Authentication - PRODUCTION VERSION
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

// WebSocket server settings - PRODUCTION SETTINGS
const char* WS_HOST = "app-dev-flutter-app.onrender.com";  // Render app domain
const int WS_PORT = 443;             // Use 443 for secure WebSocket (WSS)
const char* DEVICE_OWNER_EMAIL = "oracle.tech.143@gmail.com"; // Device owner email
const char* WS_PATH = "/ws/sensors/?email=oracle.tech.143@gmail.com"; // WebSocket endpoint with email
const char* DEVICE_ID = "ESP32_001";  // Unique ID for this device

// Sensor pins
#define PIR_PIN 27       // PIR motion sensor pin
#define DHT_PIN 26       // DHT22 sensor pin
#define DHT_TYPE DHT22   // DHT sensor type

// NTP server settings
const char* NTP_SERVER_1 = "pool.ntp.org";
const char* NTP_SERVER_2 = "time.google.com";
const char* NTP_SERVER_3 = "time.windows.com";
const long GMT_OFFSET_SEC = 28800;  // GMT+8 (Philippine Time)
const int DAYLIGHT_OFFSET_SEC = 0;  // No DST in the Philippines

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
bool timeIsSynchronized = false;

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
void initTime();

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

  // Initialize time
  initTime();

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
    Serial.println("Attempting WebSocket reconnect...");
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

  Serial.printf("Connecting to %s...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiRetryCount = 0;
  const int maxWifiRetries = 30;  // 15 seconds timeout

  while (WiFi.status() != WL_CONNECTED && wifiRetryCount < maxWifiRetries) {
    delay(500);
    Serial.print(".");
    wifiRetryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nFailed to connect to WiFi");
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

// ===== TIME FUNCTIONS =====
void initTime() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot sync time: WiFi not connected");
    return;
  }

  // Configure NTP servers
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_1, NTP_SERVER_2, NTP_SERVER_3);
  
  Serial.println("Waiting for NTP time sync...");
  
  time_t now = time(nullptr);
  int retryCount = 0;
  const int maxRetries = 10;
  
  // Wait for time to be set
  while (now < 24 * 3600 && retryCount < maxRetries) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retryCount++;
  }
  
  if (now > 24 * 3600) {
    Serial.println("\nTime synchronized");
    timeIsSynchronized = true;
    
    // Print current time
    struct tm timeinfo;
    getLocalTime(&timeinfo);
    char timeString[64];
    strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
    Serial.printf("Current time: %s\n", timeString);
  } else {
    Serial.println("\nFailed to sync time");
    timeIsSynchronized = false;
  }
}

String getTimestamp() {
  if (timeIsSynchronized) {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      char timeString[30];
      strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%S", &timeinfo);
      return String(timeString);
    }
  }
  
  // Fallback to device uptime if time is not synchronized
  unsigned long uptime = millis() - deviceStartTime;
  unsigned long seconds = uptime / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  unsigned long days = hours / 24;
  
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  
  char uptimeStr[32];
  sprintf(uptimeStr, "DEVICE_UPTIME:%dd%dh%dm%ds", (int)days, (int)hours, (int)minutes, (int)seconds);
  return String(uptimeStr);
}

// ===== WEBSOCKET FUNCTIONS =====
void setupWebSocket() {
  // Server address, port, and URL
  Serial.printf("Connecting to %s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);

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
  }
}

// ===== SENSOR FUNCTIONS =====
void readDHTSensor() {
  // Read temperature and humidity
  float newTemp = dht.readTemperature();
  float newHumidity = dht.readHumidity();
  
  // Check if readings are valid
  if (isnan(newTemp) || isnan(newHumidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  // Update global variables
  temperature = newTemp;
  humidity = newHumidity;
  
  Serial.printf("Temp: %.1f°C, Humidity: %.1f%%\n", temperature, humidity);
}

void checkMotionSensor() {
  // Read motion sensor
  int motionValue = digitalRead(PIR_PIN);
  unsigned long currentMillis = millis();
  
  // Check if motion is detected and cooldown period has passed
  if (motionValue == HIGH && !motionDetected && (currentMillis - lastMotionTime > MOTION_COOLDOWN)) {
    motionDetected = true;
    lastMotionTime = currentMillis;
    
    // Read sensor data and send motion event
    readDHTSensor();
    sendMotionEvent();
  } else if (motionValue == LOW && motionDetected) {
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
  
  // Check if values have changed enough to send an update
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
