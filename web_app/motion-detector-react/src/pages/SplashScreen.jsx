import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';
import User from '../models/User';

/**
 * Initial loading screen that checks for existing session and redirects accordingly
 * @returns {JSX.Element} Splash screen component
 */
const SplashScreen = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthAndNavigate = async () => {
      try {
        setIsLoading(true);

        // First check if we have user data in localStorage
        const storedUserData = localStorage.getItem('user_data');
        const token = localStorage.getItem('auth_token');

        if (storedUserData && token) {
          console.info('Found existing user data and auth token');

          try {
            // Parse the stored user data
            const userData = JSON.parse(storedUserData);
            console.info('Successfully parsed stored user data:', userData.email);

            // Verify the token is still valid by making an API call
            const authService = window.authService;

            try {
              // Try to get the current user to verify the token is still valid
              await authService.getCurrentUser();
              console.info('Token verified as valid');

              // Create user object from stored data
              const user = new User(
                userData.id,
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.username,
                userData.profileImageUrl,
                userData.theme,
                userData.emailVerified
              );

              // Store user in context (this is redundant if UserContext already loaded from localStorage,
              // but we do it anyway to ensure consistency)
              setUser(user);

              // Navigate to dashboard
              console.info('Restoring session for user:', userData.email);
              navigate('/dashboard', { replace: true });
              return;
            } catch (apiError) {
              console.error('Token validation failed:', apiError);
              // Token is invalid, clear stored data
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('user_data');
          }
        } else if (token) {
          // We have a token but no user data, try to fetch user data
          console.info('Found auth token but no user data, attempting to restore session');

          try {
            // Get the current user using the token
            const authService = window.authService;
            const userData = await authService.getCurrentUser();

            if (userData) {
              console.info('Successfully fetched user data from API:', userData.email);

              // Create user object and update context
              const user = new User(
                userData.id,
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.username,
                userData.profileImageUrl,
                userData.theme,
                userData.emailVerified
              );

              // Store user in context
              setUser(user);

              // Navigate to dashboard
              navigate('/dashboard', { replace: true });
              return;
            }
          } catch (error) {
            console.error('Error restoring user session:', error);
            // Clear invalid token
            localStorage.removeItem('auth_token');
          }
        }

        // If no valid session found, navigate to login
        console.info('No valid session found, redirecting to login');
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Start the auth check with a small delay to allow the splash screen to render
    const timer = setTimeout(() => {
      checkAuthAndNavigate();
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, setUser]);

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
