import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../utils/theme';

/**
 * Reset password page component
 * @returns {JSX.Element} Reset password page component
 */
const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  // Extract uid and token from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const uidParam = searchParams.get('uid');
    const tokenParam = searchParams.get('token');
    
    if (!uidParam || !tokenParam) {
      setInvalidLink(true);
      setError('Invalid password reset link. Please request a new one.');
    } else {
      setUid(uidParam);
      setToken(tokenParam);
    }
  }, [location]);
  
  // Validate password
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  };
  
  // Validate form
  const validateForm = () => {
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get authService from window object (set in main.jsx)
      const authService = window.authService;
      
      if (authService) {
        // Reset password
        await authService.resetPassword(uid, token, password);
        console.log('Password reset successful');
        setSuccess(true);
      } else {
        console.error('AuthService not available');
        setError('Authentication service not available. Please try again later.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If the link is invalid, show error message
  if (invalidLink) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: theme.background,
          color: theme.text,
          padding: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.surface,
            borderRadius: '8px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <FaExclamationTriangle size={50} color={theme.error || '#f44336'} style={{ marginBottom: '16px' }} />
          <h1
            style={{
              marginBottom: '16px',
              color: theme.primary,
            }}
          >
            Invalid Link
          </h1>
          <p style={{ marginBottom: '24px' }}>
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: theme.primary,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }
  
  // If password reset was successful, show success message
  if (success) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: theme.background,
          color: theme.text,
          padding: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.surface,
            borderRadius: '8px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <FaCheckCircle size={50} color="#4caf50" style={{ marginBottom: '16px' }} />
          <h1
            style={{
              marginBottom: '16px',
              color: theme.primary,
            }}
          >
            Password Reset Successful
          </h1>
          <p style={{ marginBottom: '24px' }}>
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: theme.primary,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          borderRadius: '8px',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            color: theme.primary,
          }}
        >
          Reset Password
        </h1>
        
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '16px', color: theme.textSecondary }}>
            Enter your new password below.
          </p>
          
          {/* Password field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              New Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
              }}
            >
              <FaLock color={theme.textSecondary} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                style={{
                  flex: 1,
                  marginLeft: '8px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: theme.text,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              Confirm Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
              }}
            >
              <FaLock color={theme.textSecondary} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                style={{
                  flex: 1,
                  marginLeft: '8px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: theme.text,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                color: theme.error || '#f44336',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaExclamationTriangle style={{ marginRight: '8px' }} />
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '16px',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    marginRight: '8px',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
          
          {/* Add CSS for spinner animation */}
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          
          {/* Back to login link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                color: theme.primary,
                textDecoration: 'none',
              }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
