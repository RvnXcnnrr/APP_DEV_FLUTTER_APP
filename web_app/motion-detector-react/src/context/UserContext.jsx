import React, { createContext, useState, useContext, useCallback } from 'react';
import User from '../models/User';

// Create the context
const UserContext = createContext();

/**
 * Provider component for user state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children, authService }) {
  // User state
  const [user, setUser] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

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

      // Logout with the auth service if available
      if (authService) {
        await authService.logout();
      }

      // Clear the user
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  // Context value
  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    register,
    login,
    logout,
    setError
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
