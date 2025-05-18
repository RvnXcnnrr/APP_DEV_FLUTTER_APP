import React, { useState, useEffect } from 'react';
import { FaUser, FaTimes, FaSun, FaMoon, FaDesktop, FaEdit, FaSave, FaCamera, FaSpinner } from 'react-icons/fa';
import { getTheme } from '../utils/theme';
import { useUser } from '../context/UserContext';
import User from '../models/User';

// Define keyframes animation for spinner
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add the animation to the document
const styleElement = document.createElement('style');
styleElement.textContent = spinAnimation;
document.head.appendChild(styleElement);

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
  const { updateProfile, updateThemePreference, error } = useUser();
  const theme = getTheme(isDarkMode);

  // Local state
  const [isLoading, setIsLoading] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef(null);

  // Initialize form values when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setSelectedTheme(user.theme || 'system');

      // Reset image preview when user changes or when exiting edit mode
      setImagePreview(user.profileImageUrl || null);
      setProfileImage(null);
    }
  }, [user]);

  // Handle image selection
  const handleImageSelect = (event) => {
    // Clear any previous status messages
    setStatusMessage('');
    setStatusType('');

    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setStatusMessage('Please select an image file (JPEG, PNG, etc.)');
      setStatusType('error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage('Image size should be less than 5MB');
      setStatusType('error');
      return;
    }

    // Set the selected file
    setProfileImage(file);

    // Show a status message
    setStatusMessage('Image selected. Click Save to upload.');
    setStatusType('success');

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Log information about the selected file
    console.log('Selected image file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
      setStatusType('');

      if (!user) return;

      // Set loading state
      setIsLoading(true);

      // Create updated user object
      const updatedUser = new User(
        user.id,
        firstName,
        lastName,
        user.email,
        user.email, // Use email as username
        imagePreview, // Use the preview URL for immediate UI update
        selectedTheme,
        user.emailVerified
      );

      // Handle profile image upload separately if we have a new image
      if (profileImage) {
        try {
          setIsUploadingImage(true);
          setStatusMessage('Uploading profile image...');
          setStatusType('info');

          // Create FormData for the image upload
          const formData = new FormData();
          formData.append('profile_picture', profileImage);
          formData.append('first_name', firstName);
          formData.append('last_name', lastName);
          formData.append('theme_preference', selectedTheme);

          console.log('Uploading profile image with form data');

          // Simulate upload progress (since we can't track actual progress with fetch)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const newProgress = prev + Math.random() * 15;
              return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
            });
          }, 300);

          try {
            // Update profile with image
            await updateProfile(updatedUser, formData);

            // Complete the progress bar
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Show success message
            setStatusMessage('Profile and image updated successfully');
            setStatusType('success');

            // Exit edit mode
            setIsEditing(false);

            // Reset image state
            setProfileImage(null);
          } catch (uploadError) {
            clearInterval(progressInterval);
            console.error('Error uploading profile image:', uploadError);

            // Try to update profile without image as fallback
            setStatusMessage('Failed to upload image. Updating profile information only...');
            setStatusType('warning');

            // Update profile without image
            await updateProfile(updatedUser);

            setStatusMessage('Profile updated, but image upload failed. Please try again later.');
            setStatusType('warning');

            // Don't exit edit mode so user can try again
          }
        } finally {
          setIsUploadingImage(false);
          setUploadProgress(0);
        }
      } else {
        // Update profile without image
        await updateProfile(updatedUser);

        // Show success message
        setStatusMessage('Profile updated successfully');
        setStatusType('success');

        // Exit edit mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatusMessage(error.message || 'Failed to update profile');
      setStatusType('error');
    } finally {
      setIsLoading(false);
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
                cursor: isLoading || isUploadingImage ? 'default' : 'pointer',
                color: isLoading || isUploadingImage ? theme.textSecondary : theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || isUploadingImage ? 0.7 : 1,
              }}
              aria-label={isEditing ? "Save" : "Edit"}
              disabled={isLoading || isUploadingImage}
            >
              {isEditing ?
                (isLoading || isUploadingImage ? <FaSpinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave size={18} />)
                : <FaEdit size={18} />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: isLoading || isUploadingImage ? 'default' : 'pointer',
                color: isLoading || isUploadingImage ? `${theme.textSecondary}80` : theme.textSecondary,
                opacity: isLoading || isUploadingImage ? 0.7 : 1,
              }}
              aria-label="Close"
              disabled={isLoading || isUploadingImage}
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
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: `${theme.primary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '12px',
                border: `1px solid ${theme.divider}`,
                position: 'relative',
                cursor: isEditing && !isUploadingImage ? 'pointer' : 'default',
              }}
              onClick={isEditing && !isUploadingImage ? triggerFileInput : undefined}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isUploadingImage ? 0.7 : 1,
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
                  opacity: isUploadingImage ? 0.7 : 1,
                }}>
                  {getInitials()}
                </div>
              )}

              {/* Upload progress overlay */}
              {isUploadingImage && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                }}>
                  <FaSpinner
                    size={30}
                    style={{
                      animation: 'spin 1s linear infinite',
                      marginBottom: '8px',
                    }}
                  />
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    Uploading...
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
              )}

              {/* Camera overlay when editing */}
              {isEditing && !isUploadingImage && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <FaCamera color="white" size={20} />
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
                disabled={isUploadingImage}
              />
            </div>

            {isEditing && (
              <button
                onClick={triggerFileInput}
                disabled={isUploadingImage}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isUploadingImage ? theme.textSecondary : theme.primary,
                  cursor: isUploadingImage ? 'default' : 'pointer',
                  fontSize: '14px',
                  marginBottom: '8px',
                  opacity: isUploadingImage ? 0.7 : 1,
                }}
              >
                {isUploadingImage ? 'Uploading...' : profileImage ? 'Change Photo' : 'Add Photo'}
              </button>
            )}
          </div>

          {/* Status message */}
          {statusMessage && (
            <div style={{
              backgroundColor:
                statusType === 'success' ? '#e8f5e9' :
                statusType === 'error' ? '#ffebee' :
                statusType === 'warning' ? '#fff8e1' :
                statusType === 'info' ? '#e3f2fd' : '#f5f5f5',
              color:
                statusType === 'success' ? '#2e7d32' :
                statusType === 'error' ? '#c62828' :
                statusType === 'warning' ? '#f57f17' :
                statusType === 'info' ? '#1565c0' : '#424242',
              padding: '8px 16px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>{statusMessage}</span>
              {isUploadingImage && (
                <FaSpinner
                  size={14}
                  style={{
                    animation: 'spin 1s linear infinite',
                    marginLeft: '8px',
                  }}
                />
              )}
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
