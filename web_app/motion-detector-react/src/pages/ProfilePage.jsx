import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaCamera, FaSun, FaMoon, FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';
import TopNavBar from '../components/TopNavBar';
import User from '../models/User';
import './ProfilePage.css';

/**
 * Profile page component
 * @returns {JSX.Element} Profile page component
 */
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, updateProfile, updateThemePreference } = useUser();
  const theme = getTheme(isDarkMode);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setSelectedTheme(user.theme || (isDarkMode ? 'dark' : 'light'));
      setProfileImage(user.profileImageUrl || null);
    }
  }, [user, isDarkMode]);

  // Handle theme change
  const handleThemeChange = async (newTheme) => {
    if (!isEditing) return;

    setSelectedTheme(newTheme);

    try {
      // Update theme in context
      if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
        toggleDarkMode();
      }

      // Update theme on server
      if (user) {
        setIsLoading(true);
        await updateThemePreference(newTheme);
        setSuccessMessage('Theme updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      setError('Failed to update theme. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection for profile image
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create updated user object
      const updatedUser = new User(
        user.id,
        firstName,
        lastName,
        email,
        user.username || email,
        user.profileImageUrl,
        selectedTheme,
        user.emailVerified
      );

      // Create FormData if we have a new profile image
      let formData = null;
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        formData = new FormData();
        formData.append('profile_picture', fileInputRef.current.files[0]);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('theme_preference', selectedTheme);
      }

      // Update profile
      await updateProfile(updatedUser, formData);

      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form values to current user data
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setSelectedTheme(user.theme || (isDarkMode ? 'dark' : 'light'));
      setProfileImage(user.profileImageUrl || null);
    }
    setIsEditing(false);
    setError(null);
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
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? <FaSpinner className="spinner" /> : <FaSave />}
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: theme.surface,
                    color: theme.text,
                    border: `1px solid ${theme.divider}`,
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
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

          {/* Success/Error Messages */}
          {(successMessage || error) && (
            <div style={{
              padding: '10px',
              marginBottom: '16px',
              borderRadius: '4px',
              backgroundColor: successMessage ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
              color: successMessage ? 'green' : 'red',
              textAlign: 'center',
            }}>
              {successMessage || error}
            </div>
          )}

          {/* Profile image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div
              onClick={handleImageClick}
              style={{
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
                cursor: isEditing ? 'pointer' : 'default',
              }}
            >
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
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  onClick={handleImageClick}
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
              </>
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
