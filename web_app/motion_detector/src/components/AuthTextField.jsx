import React from 'react';
import { getTheme } from '../utils/theme';

/**
 * A text field component for authentication screens
 * @param {Object} props - Component props
 * @returns {JSX.Element} Text field component
 */
const AuthTextField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error = '',
  helperText = '',
  fullWidth = true,
  disabled = false,
  isDarkMode = false,
}) => {
  const theme = getTheme(isDarkMode);

  const containerStyle = {
    marginBottom: '15px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: theme.text,
    fontSize: '14px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: `1px solid ${error ? theme.error : theme.divider}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  const errorStyle = {
    color: theme.error,
    fontSize: '12px',
    marginTop: '5px',
  };

  const helperTextStyle = {
    color: theme.textSecondary || '#666',
    fontSize: '12px',
    marginTop: '5px',
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        disabled={disabled}
      />
      {error && <div style={errorStyle}>{error}</div>}
      {helperText && !error && <div style={helperTextStyle}>{helperText}</div>}
    </div>
  );
};

export default AuthTextField;
