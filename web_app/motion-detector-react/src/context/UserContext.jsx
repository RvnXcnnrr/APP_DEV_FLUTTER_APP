import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import User from '../models/User';
import DeviceService from '../services/DeviceService';

// Create the context
const UserContext = createContext();

// Default device ID - this is the device we're checking ownership for
const DEFAULT_DEVICE_ID = 'ESP32_001';

/**
 * Provider component for user state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children, authService }) {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.info('Restored user data from localStorage:', userData.email);
        return new User(
          userData.id,
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.username,
          userData.profileImageUrl,
          userData.theme,
          userData.emailVerified
        );
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error);
      localStorage.removeItem('user_data');
    }
    return null;
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Create device service
  const [deviceService] = useState(() => new DeviceService(authService?.apiService));

  // State for device ownership
  const [isDeviceOwner, setIsDeviceOwner] = useState(false);

  // Check device ownership when user changes
  useEffect(() => {
    const checkDeviceOwnership = async () => {
      if (user && user.email && deviceService) {
        // Special case for ESP32_001 - owner check handled by DeviceService
        const specialDeviceCheck = await deviceService.isDeviceOwner(DEFAULT_DEVICE_ID, user);
        if (specialDeviceCheck) {
          console.log(`User is the owner of device ${DEFAULT_DEVICE_ID}`);
          setIsDeviceOwner(true);
          return;
        }

        const isOwner = await deviceService.isDeviceOwner(DEFAULT_DEVICE_ID, user);
        setIsDeviceOwner(isOwner);
        console.log(`User ${user.email} ${isOwner ? 'is' : 'is not'} the owner of device ${DEFAULT_DEVICE_ID}`);
      } else {
        setIsDeviceOwner(false);
      }
    };

    checkDeviceOwnership();
  }, [user, deviceService]);

  // Register a new user
  const register = useCallback(async (firstName, lastName, email, password) => {
    if (!authService) {
      console.error('AuthService not provided to UserProvider');
      throw new Error('Authentication service not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting registration process...');
      console.log('Registration data:', { firstName, lastName, email });

      // Register with the auth service
      await authService.register(firstName, lastName, email, password);

      console.log('Registration API call completed successfully');
      console.log('Email verification is required before login');

      // Don't login after registration - email verification is required
      return true;
    } catch (error) {
      console.error('Registration error caught in UserContext:', error);

      // Set the error message
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);

      // Log detailed error information
      console.error('Registration error details:', {
        message: errorMessage,
        timestamp: new Date().toISOString(),
        userData: { firstName, lastName, email }
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Login with email and password
  const login = useCallback(async (email, password) => {
    if (!authService) {
      console.error('AuthService not provided to UserProvider');
      throw new Error('Authentication service not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting login process for email:', email);

      // Login with the auth service
      const userData = await authService.login(email, password);

      console.log('Login successful, received user data:', userData);

      // Create user object
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

      // Store user in state
      setUser(user);

      // Save user data to localStorage for persistence across page refreshes
      try {
        localStorage.setItem('user_data', JSON.stringify(user));
        console.info('User data saved to localStorage');
      } catch (storageError) {
        console.warn('Failed to save user data to localStorage:', storageError);
      }

      // Log successful login
      console.log('User logged in successfully:', user);

      return user;
    } catch (error) {
      console.error('Login error in UserContext:', error);

      // Set the error message in context state
      setError(error.message || 'Login failed');

      // Log detailed error information
      console.error('Login error details:', {
        message: error.message || 'Login failed',
        timestamp: new Date().toISOString(),
        userData: { email }
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Logout the user
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      console.info('Starting logout process');

      // Clear the user state first to update UI immediately
      setUser(null);

      // Remove user data from localStorage
      try {
        localStorage.removeItem('user_data');
        console.info('User data removed from localStorage');
      } catch (storageError) {
        console.warn('Failed to remove user data from localStorage:', storageError);
      }

      // Clear any error messages
      setError(null);

      // Logout with the auth service if available
      if (authService) {
        try {
          // We don't await this call to prevent blocking the UI
          // if there's an issue with the server logout
          authService.logout()
            .catch(error => {
              // Just log the error, don't affect the UI
              console.warn('Server logout had an issue:', error.message);
            });
        } catch (serviceError) {
          // Just log the error, don't affect the UI
          console.warn('Error calling logout service:', serviceError);
        }
      }

      console.info('User logged out successfully');
    } catch (error) {
      console.error('Logout error in UserContext:', error);
      // Don't set error state as it might prevent navigation
      // Just log it for debugging
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Update the user's profile
  const updateProfile = useCallback(async (updatedUser, formData = null) => {
    if (!authService) {
      console.error('AuthService not provided to UserProvider');
      throw new Error('Authentication service not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting profile update process...');
      console.log('Updated user data:', updatedUser);
      if (formData) {
        console.log('Profile update includes image upload');
      }

      // Update profile with the auth service
      const userData = await authService.updateProfile(updatedUser, formData);

      // Create user object
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

      // Store user in state
      setUser(user);

      // Save updated user data to localStorage
      try {
        localStorage.setItem('user_data', JSON.stringify(user));
        console.info('Updated user data saved to localStorage');
      } catch (storageError) {
        console.warn('Failed to save updated user data to localStorage:', storageError);
      }

      console.log('Profile updated successfully:', user);

      return user;
    } catch (error) {
      console.error('Profile update error in UserContext:', error);

      // Set the error message
      setError(error.message || 'Profile update failed');

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Update the user's theme preference
  const updateThemePreference = useCallback(async (theme) => {
    if (!authService || !user) {
      console.error('AuthService not provided or no user logged in');
      throw new Error('Authentication service not available or no user logged in');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting theme update process...');
      console.log('New theme:', theme);

      // Update theme with the auth service
      const userData = await authService.updateThemePreference(user, theme);

      // Create user object
      const updatedUser = new User(
        userData.id,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.username,
        userData.profileImageUrl,
        userData.theme,
        userData.emailVerified
      );

      // Store user in state
      setUser(updatedUser);

      // Save updated user data to localStorage
      try {
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        console.info('Updated user data with new theme saved to localStorage');
      } catch (storageError) {
        console.warn('Failed to save updated theme data to localStorage:', storageError);
      }

      console.log('Theme updated successfully:', updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Theme update error in UserContext:', error);

      // Set the error message
      setError(error.message || 'Theme update failed');

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService, user]);

  // Context value
  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    isDeviceOwner,
    register,
    login,
    logout,
    updateProfile,
    updateThemePreference,
    setError,
    // Expose setUser for session restoration
    setUser: (userData) => {
      setUser(userData);

      // Also save to localStorage for persistence
      if (userData) {
        try {
          localStorage.setItem('user_data', JSON.stringify(userData));
          console.info('User data saved to localStorage during session restoration');
        } catch (storageError) {
          console.warn('Failed to save user data to localStorage during session restoration:', storageError);
        }
      }

      console.info('User session restored:', userData?.email);
    }
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to use the user context
 * @returns {Object} User context
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
