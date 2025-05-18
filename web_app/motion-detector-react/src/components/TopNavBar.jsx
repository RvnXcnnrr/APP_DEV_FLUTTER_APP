import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';

/**
 * Top navigation bar component
 * @returns {JSX.Element} Top navigation bar component
 */
const TopNavBar = ({ title }) => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useUser();
  const navigate = useNavigate();
  const theme = getTheme(isDarkMode);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px',
        backgroundColor: theme.surface,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        color: theme.text,
      }}
    >
      <h1 style={{ margin: 0, fontSize: '20px' }}>{title}</h1>

      <div style={{ display: 'flex', gap: '15px' }}>
        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutConfirmation(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Logout"
        >
          <FaSignOutAlt size={20} />
        </button>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: theme.surface,
            borderRadius: '8px',
            padding: '20px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}>
              <h3 style={{ margin: 0, color: theme.primary }}>Confirm Logout</h3>
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                }}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <p style={{ marginBottom: '20px' }}>
              Are you sure you want to log out?
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}>
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.divider}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Close the confirmation dialog first
                  setShowLogoutConfirmation(false);

                  // Perform logout
                  try {
                    // Call logout function
                    logout();

                    // Navigate to login page
                    console.info('Navigating to login page after logout');
                    navigate('/login');
                  } catch (error) {
                    console.error('Error during logout process:', error);
                    // Still navigate to login page even if there's an error
                    navigate('/login');
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavBar;
