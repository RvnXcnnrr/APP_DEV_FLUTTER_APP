/**
 * Configuration for the application
 */

// Detect environment
const getEnvironment = () => {
  // Use NODE_ENV to determine the environment
  // This will be 'production' when built with 'npm run build'
  return import.meta.env.MODE || 'development';
};

// Check if we should use direct API calls (no proxy)
// This can be toggled by adding ?direct=true to the URL
const useDirectApi = () => {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).get('direct') === 'true';
  }
  return false;
};

// Configuration object
const config = {
  // Development environment (local)
  development: {
    // Use proxy URLs when running with Vite dev server (default)
    apiBaseUrl: '', // Empty string means use relative URLs with the proxy
    wsBaseUrl: '/ws/sensors/', // Relative URL for WebSocket with proxy

    // Direct URLs (used when proxy fails or when ?direct=true is in URL)
    directApiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    directWsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
  },
  // Production environment
  production: {
    apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
    directApiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
    directWsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
  },
};

// Current environment configuration
const currentConfig = config[getEnvironment()];

// Determine if we should use direct API calls
const useDirect = useDirectApi();

/**
 * Application configuration
 */
const AppConfig = {
  // Current environment
  currentEnvironment: getEnvironment(),

  // API base URL (either proxy or direct)
  apiBaseUrl: useDirect ? currentConfig.directApiBaseUrl : currentConfig.apiBaseUrl,

  // WebSocket base URL (either proxy or direct)
  wsBaseUrl: useDirect ? currentConfig.directWsBaseUrl : currentConfig.wsBaseUrl,

  // Always available direct URLs (for fallback)
  directApiBaseUrl: currentConfig.directApiBaseUrl,
  directWsBaseUrl: currentConfig.directWsBaseUrl,

  // Flag indicating if we're using direct API calls
  usingDirectApi: useDirect,
};

export default AppConfig;
