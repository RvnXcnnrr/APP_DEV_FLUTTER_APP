import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import User from '../models/User';

// Create the context
const UserContext = createContext();

// Token owner email constant - keep in sync with MotionEventContext
const TOKEN_OWNER_EMAIL = 'oracle.tech.143@gmail.com';

// Local storage key for persisting user data
const USER_STORAGE_KEY = 'motion_detector_user';

/**
 * Provider component for user state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children }) {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return new User(
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.profileImageUrl,
          userData.isDarkMode
        );
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    return null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          isDarkMode: user.isDarkMode
        }));
        console.log('User data saved to localStorage');
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
        console.log('User data removed from localStorage');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

  // Check if user is logged in
  const isLoggedIn = user !== null;

  // Get whether dark mode is enabled
  const isDarkMode = user?.isDarkMode || false;

  // Helper function to check if a user is the token owner
  const checkIsTokenOwner = useCallback((email) => {
    if (!email) return false;

    // Normalize the email for comparison (lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();
    return normalizedEmail === TOKEN_OWNER_EMAIL.toLowerCase();
  }, []);

  // Check if the current user is the token owner
  const isTokenOwner = checkIsTokenOwner(user?.email);

  // Debug user context
  useEffect(() => {
    console.log('UserContext - User:', user);
    console.log('UserContext - User email:', user?.email);
    console.log('UserContext - isTokenOwner:', isTokenOwner);
  }, [user, isTokenOwner]);

  // Set the user (login)
  const login = useCallback((newUser) => {
    console.log('Login called with user:', newUser);

    // Ensure email is normalized
    if (newUser && newUser.email) {
      const normalizedEmail = newUser.email.trim().toLowerCase();
      // Create a new user with the normalized email
      const normalizedUser = new User(
        newUser.firstName,
        newUser.lastName,
        normalizedEmail,
        newUser.profileImageUrl,
        newUser.isDarkMode
      );
      setUser(normalizedUser);
    } else {
      setUser(newUser);
    }
  }, []);

  // Clear the user (logout)
  const logout = useCallback(() => {
    console.log('Logout called');
    setUser(null);
  }, []);

  // Update the user's profile
  const updateUser = useCallback(({ firstName, lastName, email, profileImageUrl }) => {
    if (user) {
      console.log('Updating user profile:', { firstName, lastName, email, profileImageUrl });

      // Normalize email if provided
      const normalizedEmail = email ? email.trim().toLowerCase() : user.email;

      setUser(
        user.copyWith({
          firstName,
          lastName,
          email: normalizedEmail,
          profileImageUrl,
        })
      );
    }
  }, [user]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    if (user) {
      console.log('Toggling dark mode, current value:', user.isDarkMode);
      setUser(user.copyWith({ isDarkMode: !user.isDarkMode }));
    } else {
      // Create a default user with dark mode enabled if no user exists
      console.log('Creating default user with dark mode enabled');
      setUser(new User('', '', '', null, true));
    }
  }, [user]);

  // Context value
  const value = {
    user,
    isLoggedIn,
    isDarkMode,
    isTokenOwner,
    login,
    logout,
    updateUser,
    toggleDarkMode,
    checkIsTokenOwner
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
