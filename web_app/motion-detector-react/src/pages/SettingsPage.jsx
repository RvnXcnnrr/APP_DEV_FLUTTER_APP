import React, { useState } from 'react';
import { FaMoon, FaSun, FaBell, FaInfoCircle, FaQuestionCircle, FaShieldAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import TopNavBar from '../components/TopNavBar';

/**
 * Settings page component
 * @returns {JSX.Element} Settings page component
 */
const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

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
      {/* Top navigation bar */}
      <TopNavBar title="Settings" />

      {/* Settings content */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            margin: 0, 
            padding: '16px', 
            borderBottom: `1px solid ${theme.divider}`,
            fontSize: '18px',
            color: theme.primary,
          }}>
            App Settings
          </h2>

          {/* Theme setting */}
          <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.divider}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDarkMode ? <FaMoon color={theme.primary} /> : <FaSun color={theme.primary} />}
              <div>
                <div style={{ fontWeight: 'bold' }}>Theme</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </div>
              </div>
            </div>
            <label className="switch" style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
            }}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleDarkMode}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDarkMode ? theme.primary : theme.divider,
                borderRadius: '34px',
                transition: '0.4s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: isDarkMode ? '26px' : '4px',
                  bottom: '2px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s',
                }}></span>
              </span>
            </label>
          </div>

          {/* Notifications setting */}
          <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.divider}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaBell color={theme.primary} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Notifications</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            <label className="switch" style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
            }}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: notificationsEnabled ? theme.primary : theme.divider,
                borderRadius: '34px',
                transition: '0.4s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: notificationsEnabled ? '26px' : '4px',
                  bottom: '2px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s',
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* About section */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            margin: 0, 
            padding: '16px', 
            borderBottom: `1px solid ${theme.divider}`,
            fontSize: '18px',
            color: theme.primary,
          }}>
            About
          </h2>

          {/* App info */}
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: `1px solid ${theme.divider}`,
          }}>
            <FaInfoCircle color={theme.primary} />
            <div>
              <div style={{ fontWeight: 'bold' }}>App Version</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>1.0.0</div>
            </div>
          </div>

          {/* Help */}
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: `1px solid ${theme.divider}`,
            cursor: 'pointer',
          }}>
            <FaQuestionCircle color={theme.primary} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Help & Support</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Get help with the app</div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}>
            <FaShieldAlt color={theme.primary} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Privacy Policy</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Read our privacy policy</div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          color: theme.textSecondary,
          fontSize: '14px',
        }}>
          <p>Motion Detector</p>
          <p>© 2025 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
