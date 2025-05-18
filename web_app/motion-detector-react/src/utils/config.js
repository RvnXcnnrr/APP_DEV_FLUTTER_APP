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
    // Use proxy URLs when running with Vite dev server
    apiBaseUrl: '', // Empty string means use relative URLs with the proxy
    wsBaseUrl: '/ws/sensors/', // Relative URL for WebSocket with proxy

    // Direct URLs (uncomment these if not using the proxy)
    // apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    // wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
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
