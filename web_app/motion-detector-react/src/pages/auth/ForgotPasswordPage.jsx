import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../utils/theme';

/**
 * Forgot password page component
 * @returns {JSX.Element} Forgot password page component
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error
    setError('');

    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);

      // Get authService from window object (set in main.jsx)
      const authService = window.authService;

      if (authService) {
        // Send password reset email
        await authService.forgotPassword(email);
        console.log('Password reset email sent successfully to:', email);
        setSubmitted(true);
      } else {
        console.error('AuthService not available');
        setError('Authentication service not available. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError(error.message || 'Failed to send password reset email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
          Forgot Password
        </h1>

        {submitted ? (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <p>
              If an account exists with the email {email}, you will receive
              password reset instructions.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ marginBottom: '16px', color: theme.textSecondary }}>
              Enter your email address and we'll send you instructions to reset your
              password.
            </p>

            {/* Email field */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                Email
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
                <FaEnvelope color={theme.textSecondary} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane style={{ marginRight: '8px' }} />
                  Reset Password
                </>
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
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
