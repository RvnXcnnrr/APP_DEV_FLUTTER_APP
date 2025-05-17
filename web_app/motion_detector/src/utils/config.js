/**
 * Configuration for the application
 */

// Detect environment
const getEnvironment = () => {
  // Use NODE_ENV to determine the environment
  // This will be 'production' when built with 'npm run build'
  return import.meta.env.MODE || 'development';
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
    apiBaseUrl: 'https://your-render-app-name.onrender.com',
    wsBaseUrl: 'wss://your-render-app-name.onrender.com/ws/sensors/',
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
