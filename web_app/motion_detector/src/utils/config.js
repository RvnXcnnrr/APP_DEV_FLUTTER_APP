/**
 * Configuration for the application
 */

// Detect environment
const getEnvironment = () => {
  // In a real app, you might use process.env.NODE_ENV or window.location.hostname
  // For simplicity, we'll just use a hardcoded value for now
  return 'development';
};

// Configuration object
const config = {
  // Development environment (local)
  development: {
    apiBaseUrl: 'http://localhost:8000',
    wsBaseUrl: 'ws://localhost:8000/ws/sensors/',
    // This token matches the one used in the Flutter app (lib/utils/config.dart)
    // and the ESP32 device (esp32_websocket_with_token.ino)
    defaultToken: 'fe1f6c58646d8942c85cb5fc456990d4a639c1a0',
  },
  // Production environment
  production: {
    apiBaseUrl: 'https://your-production-api.com',
    wsBaseUrl: 'wss://your-production-api.com/ws/sensors/',
    // This token matches the one used in the Flutter app (lib/utils/config.dart)
    // and the ESP32 device (esp32_websocket_with_token.ino)
    defaultToken: 'fe1f6c58646d8942c85cb5fc456990d4a639c1a0',
  },
};

// Current environment configuration
const currentConfig = config[getEnvironment()];

/**
 * Application configuration
 */
export const AppConfig = {
  // Current environment
  currentEnvironment: getEnvironment(),

  // API base URL
  apiBaseUrl: currentConfig.apiBaseUrl,

  // WebSocket base URL
  wsBaseUrl: currentConfig.wsBaseUrl,

  // Default token for development
  defaultToken: currentConfig.defaultToken,
};

export default AppConfig;
