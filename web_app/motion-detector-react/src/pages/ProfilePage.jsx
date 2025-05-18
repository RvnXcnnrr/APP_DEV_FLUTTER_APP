import React, { useState } from 'react';
import { FaUser, FaCamera, FaSun, FaMoon, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import TopNavBar from '../components/TopNavBar';

/**
 * Profile page component
 * @returns {JSX.Element} Profile page component
 */
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email] = useState('john.doe@example.com');
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [profileImage, setProfileImage] = useState(null);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    if (!isEditing) return;
    
    setSelectedTheme(newTheme);
    if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
      toggleDarkMode();
    }
  };

  // Handle save profile
  const handleSaveProfile = () => {
    // This is just UI, no actual save logic
    console.log('Save profile:', { firstName, lastName, email, selectedTheme, profileImage });
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form values (in a real app, would reset to original values from API)
    setFirstName('John');
    setLastName('Doe');
    setSelectedTheme(isDarkMode ? 'dark' : 'light');
    setIsEditing(false);
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
      {/* Top navigation bar */}
      <TopNavBar title="Profile" />

      {/* Profile content */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '16px',
        }}>
          {/* Profile header with actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h2 style={{ margin: 0, color: theme.primary }}>User Profile</h2>
            
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <FaSave /> Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: theme.surface,
                    color: theme.text,
                    border: `1px solid ${theme.divider}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              backgroundColor: theme.divider,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '8px',
            }}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <FaUser size={60} color={theme.textSecondary} />
              )}
              
              {isEditing && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  padding: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <FaCamera color="white" size={16} />
                </div>
              )}
            </div>
            {isEditing && (
              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: theme.primary,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Change Photo
              </button>
            )}
          </div>

          {/* Profile form */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="firstName"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.divider}`,
                  borderRadius: '4px',
                  backgroundColor: isEditing ? 'transparent' : theme.background,
                  color: theme.text,
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="lastName"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.divider}`,
                  borderRadius: '4px',
                  backgroundColor: isEditing ? 'transparent' : theme.background,
                  color: theme.text,
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                Email (cannot be changed)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.divider}`,
                  borderRadius: '4px',
                  backgroundColor: theme.background,
                  color: theme.textSecondary,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                Theme Preference
              </label>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px'
              }}>
                <button
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.divider}`,
                    backgroundColor: selectedTheme === 'light' ? theme.primary : theme.surface,
                    color: selectedTheme === 'light' ? 'white' : theme.text,
                    cursor: isEditing ? 'pointer' : 'default',
                    opacity: isEditing ? 1 : 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  disabled={!isEditing}
                >
                  <FaSun /> Light
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.divider}`,
                    backgroundColor: selectedTheme === 'dark' ? theme.primary : theme.surface,
                    color: selectedTheme === 'dark' ? 'white' : theme.text,
                    cursor: isEditing ? 'pointer' : 'default',
                    opacity: isEditing ? 1 : 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  disabled={!isEditing}
                >
                  <FaMoon /> Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
