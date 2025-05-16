import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';
import AppDrawer from '../components/AppDrawer';
import { FaBars, FaMoon, FaSun, FaInfoCircle, FaPalette } from 'react-icons/fa';

/**
 * Settings page component
 * @returns {JSX.Element} Settings page
 */
const SettingsPage = () => {
  const { isDarkMode, toggleDarkMode } = useUser();
  const theme = getTheme(isDarkMode);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toggle drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Show appearance settings
  const showAppearanceSettings = () => {
    alert('Appearance settings will be implemented in a future update.');
  };

  // Show about dialog
  const showAboutDialog = () => {
    alert(`
      Motion Detector
      Version: 1.0.0
      
      Motion Detector is an application that detects motion and displays the events in a calendar view.
    `);
  };

  // List item style
  const listItemStyle = {
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.divider}`,
    cursor: 'pointer',
  };

  // Icon style
  const iconStyle = {
    marginRight: '15px',
    color: theme.primary,
    fontSize: '20px',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* App drawer */}
      <AppDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* App bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          backgroundColor: theme.surface,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          onClick={toggleDrawer}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '15px',
            color: theme.text,
          }}
        >
          <FaBars size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Settings</h1>
      </div>

      {/* Settings list */}
      <div
        style={{
          flex: 1,
          backgroundColor: theme.surface,
          marginTop: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Appearance */}
        <div style={listItemStyle} onClick={showAppearanceSettings}>
          <FaPalette style={iconStyle} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Appearance</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Customize the app appearance
            </div>
          </div>
          <div style={{ fontSize: '20px', color: theme.textSecondary }}>›</div>
        </div>

        {/* Dark Mode */}
        <div style={listItemStyle} onClick={toggleDarkMode}>
          {isDarkMode ? <FaSun style={iconStyle} /> : <FaMoon style={iconStyle} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Dark Mode</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Toggle between light and dark theme
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '20px',
              backgroundColor: isDarkMode ? theme.primary : theme.divider,
              borderRadius: '10px',
              position: 'relative',
              transition: 'background-color 0.3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                top: '2px',
                left: isDarkMode ? '22px' : '2px',
                transition: 'left 0.3s',
              }}
            />
          </div>
        </div>

        {/* About */}
        <div style={listItemStyle} onClick={showAboutDialog}>
          <FaInfoCircle style={iconStyle} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>About</div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              View app information
            </div>
          </div>
          <div style={{ fontSize: '20px', color: theme.textSecondary }}>›</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
