import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getTheme } from '../../utils/theme';

/**
 * Register page component
 * @returns {JSX.Element} Register page component
 */
const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { register, isLoading } = useUser();
  const theme = getTheme(isDarkMode);

  // Check for email parameter in URL query string (for resending verification)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setRegisteredEmail(emailParam);
      setShowResendButton(true);
      setSuccessMessage('Please verify your email to complete registration. If you did not receive the verification email, you can resend it below.');
    }
  }, [location]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Validate terms
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    const emailToResend = registeredEmail || email;

    if (!emailToResend) {
      setErrors({ general: 'Please enter your email address' });
      return;
    }

    try {
      setResendLoading(true);

      // Get authService from window object (set in main.jsx)
      const authService = window.authService;

      if (authService) {
        await authService.resendVerificationEmail(emailToResend);
        setSuccessMessage(`Verification email resent to ${emailToResend}. Please check your inbox and spam folder.`);
        setErrors({});
      } else {
        console.error('AuthService not available');
        setErrors({ general: 'Authentication service not available. Please try again later.' });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setErrors({ general: error.message || 'Failed to resend verification email. Please try again later.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Starting registration process...');

      // Register the user
      await register(firstName, lastName, email, password);

      console.log('Registration API call completed successfully');

      // Show success message
      setSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');

      // Save the registered email for resending verification
      setRegisteredEmail(email);
      setShowResendButton(true);

      // Clear form but keep the email for resending verification
      const registeredEmailValue = email;
      setFirstName('');
      setLastName('');
      setPassword('');
      setConfirmPassword('');
      setAgreeToTerms(false);

      // Set the email back after clearing the form
      setEmail(registeredEmailValue);

      // Clear any previous errors
      setErrors({});
    } catch (error) {
      console.error('Registration error caught:', error);

      // Clear any previous success message
      setSuccessMessage('');

      // Handle specific error cases
      if (error.message.includes('email')) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrors({ email: 'Email already exists. Please use a different email or try to login.' });
        } else {
          setErrors({ email: 'Email is invalid. Please enter a valid email address.' });
        }
      } else if (error.message.includes('password')) {
        setErrors({ password: 'Password is too weak. Use at least 8 characters with numbers and letters.' });
      } else if (error.message.includes('Network error')) {
        setErrors({
          general: 'Network error: Could not connect to the server. Please check your internet connection and try again.'
        });
      } else {
        setErrors({ general: error.message || 'Registration failed. Please try again.' });
      }

      // Log detailed error information for debugging
      console.error('Registration error details:', {
        message: error.message,
        timestamp: new Date().toISOString(),
        formData: { firstName, lastName, email }
      });
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
          Register
        </h1>

        <form onSubmit={handleSubmit}>
          {/* First Name field */}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${errors.firstName ? theme.error : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.firstName ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaUser color={errors.firstName ? theme.error : theme.textSecondary} />
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: null });
                  }
                }}
                placeholder="Enter your first name"
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
            {errors.firstName && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.firstName}
              </div>
            )}
          </div>

          {/* Last Name field */}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${errors.lastName ? theme.error : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.lastName ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaUser color={errors.lastName ? theme.error : theme.textSecondary} />
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: null });
                  }
                }}
                placeholder="Enter your last name"
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
            {errors.lastName && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.lastName}
              </div>
            )}
          </div>

          {/* Email field */}
          <div style={{ marginBottom: '16px' }}>
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
                border: `1px solid ${errors.email ? theme.error : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.email ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaEnvelope color={errors.email ? theme.error : theme.textSecondary} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: null });
                  }
                }}
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
            {errors.email && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>

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
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${errors.password ? theme.error : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.password ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaLock color={errors.password ? theme.error : theme.textSecondary} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: null });
                  }
                }}
                placeholder="Enter your password"
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
            {errors.password && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.password}
              </div>
            )}
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
                border: `1px solid ${errors.confirmPassword ? theme.error : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.confirmPassword ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaLock color={errors.confirmPassword ? theme.error : theme.textSecondary} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                placeholder="Confirm your password"
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
            {errors.confirmPassword && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Terms and Conditions checkbox */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors({ ...errors, terms: null });
                  }
                }}
                required
                style={{
                  marginRight: '8px',
                  outline: errors.terms ? `1px solid ${theme.error}` : 'none',
                }}
              />
              <span>
                I agree to the{' '}
                <a
                  href="#"
                  style={{
                    color: theme.primary,
                    textDecoration: 'none',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Terms and Conditions clicked');
                  }}
                >
                  Terms and Conditions
                </a>
              </span>
            </label>
            {errors.terms && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.terms}
              </div>
            )}
          </div>

          {/* Error message */}
          {errors.general && (
            <div
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                color: theme.error,
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaExclamationTriangle style={{ marginRight: '8px' }} />
              {errors.general}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div
              style={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: '#4caf50',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: showResendButton ? '8px' : '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {successMessage}
            </div>
          )}

          {/* Resend verification email button */}
          {showResendButton && (
            <div
              style={{
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: theme.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: resendLoading ? 0.7 : 1,
                }}
              >
                {resendLoading ? (
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
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          )}

          {/* Register button */}
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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>

          {/* Login link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: theme.textSecondary }}>
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
              style={{
                color: theme.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Login
            </Link>
          </div>

          {/* Add CSS for spinner animation */}
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
