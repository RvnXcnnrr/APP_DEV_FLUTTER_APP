import React, { createContext, useState, useContext } from 'react';
import User from '../models/User';

// Create the context
const UserContext = createContext();

/**
 * Provider component for user state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Check if user is logged in
  const isLoggedIn = user !== null;

  // Get whether dark mode is enabled
  const isDarkMode = user?.isDarkMode || false;

  // Check if the user is the token owner (oracle.tech.143@gmail.com)
  const isTokenOwner = user?.email === 'oracle.tech.143@gmail.com';

  // Set the user (login)
  const login = (user) => {
    setUser(user);
  };

  // Clear the user (logout)
  const logout = () => {
    setUser(null);
  };

  // Update the user's profile
  const updateUser = ({ firstName, lastName, email, profileImageUrl }) => {
    if (user) {
      setUser(
        user.copyWith({
          firstName,
          lastName,
          email,
          profileImageUrl,
        })
      );
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (user) {
      setUser(user.copyWith({ isDarkMode: !user.isDarkMode }));
    } else {
      // Create a default user with dark mode enabled if no user exists
      setUser(new User('', '', '', null, true));
    }
  };

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
