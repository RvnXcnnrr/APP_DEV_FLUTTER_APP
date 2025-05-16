import React from 'react';
import { getTheme } from '../utils/theme';

/**
 * A button component for authentication screens
 * @param {Object} props - Component props
 * @returns {JSX.Element} Button component
 */
const AuthButton = ({
  text,
  onClick,
  isLoading = false,
  fullWidth = false,
  type = 'button',
  isDarkMode = false
}) => {
  const theme = getTheme(isDarkMode);

  const buttonStyle = {
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={isLoading ? null : onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '10px',
            }}
          />
          <span>Loading...</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
};

export default AuthButton;
