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
    // Use the deployed backend by default
    apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
  },
  // Production environment
  production: {
    apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
  },
};

// Current environment configuration
const currentConfig = config[getEnvironment()];

/**
 * Application configuration
 */
const AppConfig = {
  // Current environment
  currentEnvironment: getEnvironment(),

  // API base URL
  apiBaseUrl: currentConfig.apiBaseUrl,

  // WebSocket base URL
  wsBaseUrl: currentConfig.wsBaseUrl,
};

export default AppConfig;
