import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

/**
 * Initial loading screen that redirects to login
 * @returns {JSX.Element} Splash screen component
 */
const SplashScreen = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    // Navigate to login screen after delay
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <FaVideo
          size={64}
          color={theme.primary}
          style={{ marginBottom: '16px' }}
        />
        <h1 style={{ margin: '0 0 16px 0', color: theme.primary }}>
          Motion Detector
        </h1>
        <p style={{ margin: 0, color: theme.textSecondary }}>Loading...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
