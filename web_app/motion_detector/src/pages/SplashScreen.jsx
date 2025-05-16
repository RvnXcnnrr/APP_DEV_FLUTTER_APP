import React, { useEffect } from 'react';
import { useNavigation } from '../utils/navigationHelper';
import { getTheme } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { FaVideo } from 'react-icons/fa';

/**
 * Initial loading screen that redirects to login
 * @returns {JSX.Element} Splash screen component
 */
const SplashScreen = () => {
  const { navigateReplace } = useNavigation();
  const { isDarkMode } = useUser();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    // Navigate to login screen after delay
    const timer = setTimeout(() => {
      navigateReplace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigateReplace]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* App logo or icon */}
      <FaVideo
        size={80}
        color={theme.primary}
        style={{ marginBottom: '24px' }}
      />

      <h1 style={{ marginBottom: '16px', fontSize: '32px' }}>
        Motion Detector
      </h1>

      {/* Loading spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${theme.divider}`,
          borderTop: `4px solid ${theme.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Add keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;
