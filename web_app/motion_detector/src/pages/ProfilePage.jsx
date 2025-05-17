import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';
import AuthTextField from '../components/AuthTextField';
import AuthButton from '../components/AuthButton';
import AppDrawer from '../components/AppDrawer';
import { FaBars, FaCamera, FaEdit, FaSave } from 'react-icons/fa';

/**
 * Profile page component
 * @returns {JSX.Element} Profile page
 */
const ProfilePage = () => {
  const { user, updateUser, isDarkMode } = useUser();
  const theme = getTheme(isDarkMode);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState({});

  // Toggle drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    // Don't validate email since it's disabled and can't be changed
    // Email validation is only needed for registration or email change

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      // Only update first name and last name, not email
      updateUser({
        firstName,
        lastName,
        // Don't include email in the update
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    }
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Select profile image
  const selectProfileImage = () => {
    if (isEditing) {
      // In a real app, you would open a file picker
      // For now, we'll just use a placeholder
      const imageUrl = prompt('Enter image URL (or leave empty to cancel):');
      if (imageUrl) {
        updateUser({ profileImageUrl: imageUrl });
      }
    }
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
        <h1 style={{ margin: 0, fontSize: '20px', flex: 1 }}>Profile</h1>
        <button
          onClick={isEditing ? handleSave : handleEdit}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.primary,
          }}
        >
          {isEditing ? <FaSave size={20} /> : <FaEdit size={20} />}
        </button>
      </div>

      {/* Profile content */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: theme.surface,
          marginTop: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Profile image */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: theme.divider,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundImage: user?.profileImageUrl ? `url(${user.profileImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: isEditing ? 'pointer' : 'default',
            }}
            onClick={selectProfileImage}
          >
            {!user?.profileImageUrl && (
              <span style={{ fontSize: '40px', fontWeight: 'bold' }}>
                {user ? `${user.firstName[0] || ''}${user.lastName[0] || ''}` : '?'}
              </span>
            )}
            {isEditing && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: theme.primary,
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FaCamera color="white" size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Profile form */}
        <div>
          <AuthTextField
            label="First Name"
            value={firstName}
            onChange={setFirstName}
            placeholder="Enter your first name"
            error={errors.firstName}
            disabled={!isEditing}
            isDarkMode={isDarkMode}
          />

          <AuthTextField
            label="Last Name"
            value={lastName}
            onChange={setLastName}
            placeholder="Enter your last name"
            error={errors.lastName}
            disabled={!isEditing}
            isDarkMode={isDarkMode}
          />

          <AuthTextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="Enter your email"
            error={null} // Remove error validation for email
            disabled={true} // Always disable email field
            helperText="Email cannot be changed"
            isDarkMode={isDarkMode}
          />

          {isEditing && (
            <div style={{ marginTop: '20px' }}>
              <AuthButton text="Save Changes" onClick={handleSave} fullWidth isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
