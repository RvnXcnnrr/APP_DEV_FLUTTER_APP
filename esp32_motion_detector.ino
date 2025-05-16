#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>
#include <lwip/apps/sntp.h>

// WiFi credentials
const char* ssid = "WPA3-SAE-256bit24G-AES-GCMP";
const char* password = "Tech2025$WiFi";

// Server settings
const char* serverUrl = "http://192.168.1.9:8000";  // Your Django server IP address
const char* deviceId = "ESP32_001";  // Unique ID for this device
const char* deviceLocation = "Living Room";  // Location of this device

// Sensor pins
#define PIR_PIN 27       // PIR motion sensor pin
#define DHT_PIN 26       // DHT22 sensor pin
#define DHT_TYPE DHT22   // DHT sensor type

// Time settings
const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.nist.gov";
const char* ntpServer3 = "time.google.com";
const long gmtOffset_sec = 0;  // GMT offset in seconds (adjust for your timezone)
const int daylightOffset_sec = 3600;  // Daylight saving time offset in seconds

// Intervals
const unsigned long sensorReadInterval = 60000;  // Read sensor data every 60 seconds
unsigned long lastSensorReadTime = 0;
const unsigned long timeSyncInterval = 30000;  // Try to sync time every 30 seconds if not synchronized

// Sensor objects
DHT dht(DHT_PIN, DHT_TYPE);

// Variables
bool motionDetected = false;
float temperature = 0;
float humidity = 0;

// Global variables
bool timeIsSynchronized = false;
struct tm timeinfo;
unsigned long lastTimeSyncAttempt = 0;

void setup() {
  Serial.begin(115200);
  delay(100);  // Short delay to ensure serial is ready
  Serial.println("\n\nESP32 Motion Detector Starting...");

  // Initialize sensors
  pinMode(PIR_PIN, INPUT);
  dht.begin();
  Serial.println("Sensors initialized");

  // Connect to WiFi with timeout
  WiFi.mode(WIFI_STA);  // Set WiFi to station mode
  WiFi.disconnect(true);  // Disconnect from any previous connections
  delay(1000);  // Short delay to ensure WiFi is reset

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int wifiRetryCount = 0;
  const int maxWifiRetries = 30;  // 15 seconds timeout

  while (WiFi.status() != WL_CONNECTED && wifiRetryCount < maxWifiRetries) {
    delay(500);
    Serial.print(".");
    wifiRetryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Initialize time with multiple NTP servers
    initTime();

    // Register device with server
    registerDevice();
  } else {
    Serial.println("\nFailed to connect to WiFi. Will retry in loop.");
  }
}

// Function to initialize time with multiple NTP servers
void initTime() {
  // Ensure WiFi is connected before attempting NTP sync
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot sync time.");
    return;
  }

  // Disconnect from previous NTP servers if any
  sntp_stop();
  delay(100);

  Serial.println("Configuring time with NTP servers...");

  // Configure NTP servers with longer timeout
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2, ntpServer3);

  // Set higher NTP request timeout (default is 1000ms)
  sntp_setoperatingmode(SNTP_OPMODE_POLL);

  // Wait for time to be set (with timeout)
  int retryCount = 0;
  const int maxRetries = 15;  // Increased from 10 to 15 attempts
  const int retryDelay = 1000;  // 1 second between attempts

  Serial.println("Waiting for NTP time sync...");

  while (!getLocalTime(&timeinfo) && retryCount < maxRetries) {
    Serial.print(".");
    delay(retryDelay);
    retryCount++;
  }

  if (retryCount < maxRetries) {
    Serial.println("\nTime synchronized successfully!");
    timeIsSynchronized = true;
    printLocalTime();
  } else {
    Serial.println("\nFailed to obtain time after multiple attempts");
    Serial.println("Will use device uptime for timestamps instead");
    timeIsSynchronized = false;
  }

  // Record the time of this attempt
  lastTimeSyncAttempt = millis();
}

// Function to print the current time
void printLocalTime() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }

  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
}

void loop() {
  // Check if WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.begin(ssid, password);

    // Wait for connection with timeout
    int wifiRetryCount = 0;
    while (WiFi.status() != WL_CONNECTED && wifiRetryCount < 20) {
      delay(500);
      Serial.print(".");
      wifiRetryCount++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nReconnected to WiFi");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());

      // Try to sync time immediately after reconnecting
      initTime();
    } else {
      Serial.println("\nFailed to reconnect to WiFi");
      delay(5000);  // Wait 5 seconds before trying again
    }
    return;
  }

  // Periodically try to sync time if it's not synchronized
  unsigned long currentMillis = millis();
  if (!timeIsSynchronized && (currentMillis - lastTimeSyncAttempt > timeSyncInterval)) {
    lastTimeSyncAttempt = currentMillis;
    Serial.println("Attempting to synchronize time...");

    // Try to configure time again
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2, ntpServer3);

    // Try to get time with a short timeout
    if (getLocalTime(&timeinfo)) {
      timeIsSynchronized = true;
      Serial.println("Time synchronized successfully!");
      printLocalTime();
    } else {
      Serial.println("Failed to obtain time");
    }
  }

  // Read motion sensor
  int pirValue = digitalRead(PIR_PIN);
  if (pirValue == HIGH) {
    if (!motionDetected) {
      Serial.println("Motion detected!");
      motionDetected = true;

      // Read temperature and humidity
      readDHTSensor();

      // Send motion event to server
      sendMotionEvent();
    }
  } else {
    motionDetected = false;
  }

  // Read sensor data at regular intervals
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorReadTime >= sensorReadInterval) {
    lastSensorReadTime = currentMillis;

    // Read temperature and humidity
    readDHTSensor();

    // Send sensor data to server
    sendSensorData();
  }

  delay(100);  // Small delay to prevent CPU overload
}

void readDHTSensor() {
  // Read temperature and humidity from DHT22 sensor
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // Check if reading was successful
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
}

// Function to generate a timestamp
String getTimestamp() {
  char timestamp[30];

  // First try to get the current time from NTP
  if (WiFi.status() == WL_CONNECTED) {
    struct tm timeinfo;
    bool timeSuccess = getLocalTime(&timeinfo);

    // If we got the time successfully
    if (timeSuccess) {
      // Update our time sync status
      if (!timeIsSynchronized) {
        timeIsSynchronized = true;
        Serial.println("Time synchronized during timestamp generation!");
      }

      // Format the timestamp in ISO 8601 format
      strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S", &timeinfo);
      return String(timestamp);
    } else if (timeIsSynchronized) {
      // If we previously had time but now don't, try to resync
      Serial.println("Time was synchronized but now failed. Attempting resync...");
      configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2, ntpServer3);

      // Try one more time
      if (getLocalTime(&timeinfo)) {
        strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S", &timeinfo);
        return String(timestamp);
      } else {
        // If still failed, mark as not synchronized
        timeIsSynchronized = false;
        Serial.println("Time resync failed. Using uptime for timestamp.");
      }
    }
  }

  // Fallback: use device uptime if NTP time is not available
  unsigned long currentTime = millis();
  unsigned long seconds = currentTime / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  unsigned long days = hours / 24;

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  // Format: "Uptime-DDdHHhMMmSSs"
  sprintf(timestamp, "Uptime-%02lud%02luh%02lum%02lus", days, hours, minutes, seconds);
  return String(timestamp);
}

void sendMotionEvent() {
  // Get timestamp
  String timestamp = getTimestamp();

  // Create JSON document
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["timestamp"] = timestamp;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;

  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send HTTP POST request
  HTTPClient http;
  String url = String(serverUrl) + "/api/sensors/esp32/motion-event/";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Motion event sent successfully");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error sending motion event");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
  }

  http.end();
}

void sendSensorData() {
  // Get timestamp
  String timestamp = getTimestamp();

  // Create JSON document
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["timestamp"] = timestamp;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;

  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send HTTP POST request
  HTTPClient http;
  String url = String(serverUrl) + "/api/sensors/esp32/sensor-data/";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Sensor data sent successfully");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error sending sensor data");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
  }

  http.end();
}

void registerDevice() {
  // Get timestamp (even if NTP failed, we'll use the uptime-based timestamp)
  String timestamp = getTimestamp();

  // Create JSON document for device registration
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["name"] = "ESP32 Sensor";
  doc["location"] = deviceLocation;

  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send HTTP POST request
  HTTPClient http;
  String url = String(serverUrl) + "/api/sensors/devices/";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Note: In a production environment, you would need to implement proper authentication
  // This is a simplified example that assumes the API allows device registration without auth
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Device registration attempt completed");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error in device registration");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Device may already be registered or server requires authentication");
  }

  http.end();
}
