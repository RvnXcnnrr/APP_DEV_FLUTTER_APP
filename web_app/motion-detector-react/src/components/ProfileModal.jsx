import React, { useState, useEffect } from 'react';
import { FaUser, FaTimes, FaSun, FaMoon, FaDesktop, FaEdit, FaSave, FaCamera } from 'react-icons/fa';
import { getTheme } from '../utils/theme';
import { useUser } from '../context/UserContext';
import User from '../models/User';

/**
 * Profile modal component
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.user - User object
 * @param {boolean} props.isDarkMode - Whether dark mode is enabled
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @returns {JSX.Element} Profile modal component
 */
const ProfileModal = ({ onClose, user, isDarkMode, toggleDarkMode }) => {
  const { updateProfile, updateThemePreference, isLoading, error } = useUser();
  const theme = getTheme(isDarkMode);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  // Initialize form values when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setSelectedTheme(user.theme || 'system');
    }
  }, [user]);

  // Get user's theme preference
  const getUserThemePreference = () => {
    if (isEditing) {
      return selectedTheme;
    }
    if (!user) return 'system';
    return user.theme || 'system';
  };

  // Get initials for avatar placeholder
  const getInitials = () => {
    if (!user) return '?';
    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
    return firstInitial + lastInitial || user.email.charAt(0).toUpperCase();
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setStatusMessage('');

      if (!user) return;

      // Create updated user object
      const updatedUser = new User(
        user.id,
        firstName,
        lastName,
        user.email,
        user.email, // Use email as username
        user.profileImageUrl,
        selectedTheme,
        user.emailVerified
      );

      // Update profile
      await updateProfile(updatedUser);

      // Show success message
      setStatusMessage('Profile updated successfully');
      setStatusType('success');

      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatusMessage(error.message || 'Failed to update profile');
      setStatusType('error');
    }
  };

  // Handle theme change
  const handleThemeChange = async (newTheme) => {
    if (isEditing) {
      setSelectedTheme(newTheme);
      return;
    }

    try {
      setStatusMessage('');

      if (!user) return;

      // Update theme preference
      await updateThemePreference(newTheme);

      // Toggle dark mode if needed
      if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
        toggleDarkMode();
      }

      // Show success message
      setStatusMessage('Theme updated successfully');
      setStatusType('success');
    } catch (error) {
      console.error('Error updating theme:', error);
      setStatusMessage(error.message || 'Failed to update theme');
      setStatusType('error');
    }
  };

  return (
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
        borderRadius: '16px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: `1px solid ${theme.divider}`,
        }}>
          <h3 style={{ margin: 0, color: theme.primary }}>Profile</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Edit/Save button */}
            <button
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={isEditing ? "Save" : "Edit"}
              disabled={isLoading}
            >
              {isEditing ? <FaSave size={18} /> : <FaEdit size={18} />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme.textSecondary,
              }}
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 120px)',
        }}>
          {/* Profile Image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: `${theme.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '12px',
              border: `1px solid ${theme.divider}`,
            }}>
              {user && user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: theme.primary,
                }}>
                  {getInitials()}
                </div>
              )}
            </div>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div style={{
              backgroundColor: statusType === 'success' ? '#e8f5e9' : '#ffebee',
              color: statusType === 'success' ? '#2e7d32' : '#c62828',
              padding: '8px 16px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
            }}>
              {statusMessage}
            </div>
          )}

          {/* User Info */}
          <div style={{ marginBottom: '24px' }}>
            {isEditing ? (
              /* Edit Form */
              <div>
                <h4 style={{
                  margin: '0 0 16px 0',
                  color: theme.primary,
                  textAlign: 'center',
                  fontSize: '20px',
                }}>
                  Edit Profile
                </h4>

                <div style={{
                  backgroundColor: `${theme.primary}10`,
                  borderRadius: '8px',
                  padding: '16px',
                }}>
                  {/* First Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '4px',
                      display: 'block',
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.divider}`,
                        backgroundColor: theme.surface,
                        color: theme.text,
                        fontSize: '16px',
                      }}
                    />
                  </div>

                  {/* Last Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '4px',
                      display: 'block',
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.divider}`,
                        backgroundColor: theme.surface,
                        color: theme.text,
                        fontSize: '16px',
                      }}
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '4px',
                      display: 'block',
                    }}>
                      Email (cannot be changed)
                    </label>
                    <input
                      type="email"
                      value={user ? user.email : ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.divider}`,
                        backgroundColor: `${theme.surface}80`,
                        color: theme.textSecondary,
                        fontSize: '16px',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <h4 style={{
                  margin: '0 0 16px 0',
                  color: theme.primary,
                  textAlign: 'center',
                  fontSize: '20px',
                }}>
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </h4>

                <div style={{
                  backgroundColor: `${theme.primary}10`,
                  borderRadius: '8px',
                  padding: '16px',
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '4px',
                    }}>
                      Email
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {user ? user.email : 'Not available'}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '4px',
                    }}>
                      Account Status
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: user && user.emailVerified ? '#4caf50' : '#f44336',
                    }}>
                      {user && user.emailVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Settings */}
          <div>
            <h4 style={{
              margin: '0 0 16px 0',
              color: theme.primary,
            }}>
              Theme Settings
            </h4>

            <div style={{
              backgroundColor: `${theme.primary}10`,
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div
                  onClick={() => {
                    if (isEditing) {
                      setSelectedTheme('system');
                    } else {
                      handleThemeChange('system');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: getUserThemePreference() === 'system' ? `${theme.primary}20` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <FaDesktop size={20} color={theme.text} />
                  <div>System Default</div>
                </div>

                <div
                  onClick={() => {
                    if (isEditing) {
                      setSelectedTheme('light');
                    } else {
                      handleThemeChange('light');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: getUserThemePreference() === 'light' ? `${theme.primary}20` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <FaSun size={20} color={theme.text} />
                  <div>Light Mode</div>
                </div>

                <div
                  onClick={() => {
                    if (isEditing) {
                      setSelectedTheme('dark');
                    } else {
                      handleThemeChange('dark');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: getUserThemePreference() === 'dark' ? `${theme.primary}20` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <FaMoon size={20} color={theme.text} />
                  <div>Dark Mode</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${theme.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          {isEditing && (
            <button
              onClick={() => {
                // Reset form values
                if (user) {
                  setFirstName(user.firstName || '');
                  setLastName(user.lastName || '');
                  setSelectedTheme(user.theme || 'system');
                }
                // Clear status message
                setStatusMessage('');
                // Exit edit mode
                setIsEditing(false);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.divider}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}

          {isEditing ? (
            <button
              onClick={handleSaveProfile}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
