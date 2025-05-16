import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../utils/navigationHelper';
import { getTheme } from '../../utils/theme';
import AuthTextField from '../../components/AuthTextField';
import AuthButton from '../../components/AuthButton';
import { FaVideo } from 'react-icons/fa';

/**
 * Forgot password page component
 * @returns {JSX.Element} Forgot password page
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const { isDarkMode } = useUser();
  const { navigateTo } = useNavigation();
  const theme = getTheme(isDarkMode);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      // For development purposes, simulate password reset
      // In a real app, you would send this data to a backend
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '30px',
          borderRadius: '8px',
          backgroundColor: theme.surface,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* App logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <FaVideo size={50} color={theme.primary} />
          <h1 style={{ marginTop: '10px', color: theme.text }}>
            Forgot Password
          </h1>
        </div>

        {isSubmitted ? (
          <div
            style={{
              textAlign: 'center',
              color: theme.text,
            }}
          >
            <p>
              If an account exists with the email {email}, you will receive
              password reset instructions.
            </p>
            <div style={{ marginTop: '20px' }}>
              <AuthButton
                text="Back to Login"
                onClick={() => navigateTo('/login')}
                fullWidth
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p
              style={{
                marginBottom: '20px',
                color: theme.textSecondary,
                fontSize: '14px',
              }}
            >
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>

            <AuthTextField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Enter your email"
              error={errors.email}
              isDarkMode={isDarkMode}
            />

            <div style={{ marginTop: '20px' }}>
              <AuthButton
                text="Reset Password"
                isLoading={isLoading}
                fullWidth
                type="submit"
                isDarkMode={isDarkMode}
              />
            </div>

            <div
              style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: theme.textSecondary,
              }}
            >
              Remember your password?{' '}
              <Link
                to="/login"
                style={{ color: theme.primary, textDecoration: 'none' }}
              >
                Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
