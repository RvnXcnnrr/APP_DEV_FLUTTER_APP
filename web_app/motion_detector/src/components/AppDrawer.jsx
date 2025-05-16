import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../utils/navigationHelper';
import { 
  FaHome, 
  FaUser, 
  FaCog, 
  FaMoon, 
  FaSun, 
  FaSignOutAlt 
} from 'react-icons/fa';

/**
 * A drawer component that displays user information and navigation options
 * @returns {JSX.Element} Drawer component
 */
const AppDrawer = ({ isOpen, onClose }) => {
  const { user, isDarkMode, toggleDarkMode, logout } = useUser();
  const { navigateTo } = useNavigation();

  // Show logout confirmation
  const showLogoutConfirmation = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigateTo('/login');
      onClose();
    }
  };

  // Drawer styles
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100%',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
    color: isDarkMode ? 'rgba(255, 255, 255, 0.87)' : '#213547',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  };

  // Overlay styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
    zIndex: 999,
  };

  // User header styles
  const userHeaderStyle = {
    padding: '20px',
    borderBottom: `1px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // Menu item styles
  const menuItemStyle = {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: `1px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`,
  };

  // Menu item hover effect
  const menuItemHoverStyle = {
    backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
  };

  // Icon styles
  const iconStyle = {
    marginRight: '10px',
    fontSize: '18px',
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Drawer */}
      <div style={drawerStyle}>
        {/* User header */}
        <div style={userHeaderStyle}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '10px',
              backgroundImage: user?.profileImageUrl ? `url(${user.profileImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!user?.profileImageUrl && (
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {user ? `${user.firstName[0] || ''}${user.lastName[0] || ''}` : '?'}
              </span>
            )}
          </div>
          <h3 style={{ margin: '5px 0' }}>
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>{user?.email || ''}</p>
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div
            style={menuItemStyle}
            onClick={() => {
              navigateTo('/dashboard');
              onClose();
            }}
          >
            <FaHome style={iconStyle} />
            <span>Dashboard</span>
          </div>

          <div
            style={menuItemStyle}
            onClick={() => {
              navigateTo('/profile');
              onClose();
            }}
          >
            <FaUser style={iconStyle} />
            <span>Profile</span>
          </div>

          <div
            style={menuItemStyle}
            onClick={() => {
              navigateTo('/settings');
              onClose();
            }}
          >
            <FaCog style={iconStyle} />
            <span>Settings</span>
          </div>

          <div
            style={menuItemStyle}
            onClick={() => {
              toggleDarkMode();
            }}
          >
            {isDarkMode ? <FaSun style={iconStyle} /> : <FaMoon style={iconStyle} />}
            <span>Dark Mode</span>
            <div
              style={{
                marginLeft: 'auto',
                width: '40px',
                height: '20px',
                backgroundColor: isDarkMode ? '#646cff' : '#e0e0e0',
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

          <div style={menuItemStyle} onClick={showLogoutConfirmation}>
            <FaSignOutAlt style={iconStyle} />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppDrawer;
