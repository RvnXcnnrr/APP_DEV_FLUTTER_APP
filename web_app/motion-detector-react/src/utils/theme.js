/**
 * Theme configuration for the app
 */

// Light theme colors
export const lightTheme = {
  primary: '#646cff',
  secondary: '#535bf2',
  background: '#ffffff',
  surface: '#f9f9f9',
  text: '#213547',
  textSecondary: '#666666',
  error: '#d32f2f',
  divider: '#e0e0e0',
};

// Dark theme colors
export const darkTheme = {
  primary: '#747bff',
  secondary: '#646cff',
  background: '#242424',
  surface: '#1a1a1a',
  text: 'rgba(255, 255, 255, 0.87)',
  textSecondary: '#a0a0a0',
  error: '#f44336',
  divider: '#333333',
};

/**
 * Get the current theme based on dark mode preference
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {Object} The current theme
 */
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
