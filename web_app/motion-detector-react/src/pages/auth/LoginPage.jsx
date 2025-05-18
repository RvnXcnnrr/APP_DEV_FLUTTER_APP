import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getTheme } from '../../utils/theme';

/**
 * Login page component
 * @returns {JSX.Element} Login page component
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { login, isLoading: isContextLoading, error: contextError } = useUser();
  const theme = getTheme(isDarkMode);

  // Check for email parameter in URL query string (for redirects from registration)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // Update local errors when context error changes
  useEffect(() => {
    if (contextError) {
      setErrors({ general: contextError });
    }
  }, [contextError]);

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      console.log('Attempting login with email:', email);

      // Call login from UserContext
      const user = await login(email, password);

      console.log('Login successful:', user);

      // Check if email is verified
      if (!user.emailVerified) {
        console.warn('Email not verified');
        setErrors({
          general: 'Your email is not verified. Please check your inbox for the verification email or request a new one.'
        });

        // Redirect to register page with email parameter for resending verification
        navigate(`/register?email=${encodeURIComponent(email)}`);
        return;
      }

      // Navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error caught:', error);

      // Handle specific error cases
      if (error.message.includes('credentials') ||
          error.message.includes('password') ||
          error.message.includes('Invalid email') ||
          error.message.includes('Unable to log in')) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error.message.includes('verified') || error.message.includes('verification')) {
        setErrors({
          general: 'Your email is not verified. Please check your inbox for the verification email or request a new one.'
        });

        // Redirect to register page with email parameter for resending verification
        setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else if (error.message.includes('Network')) {
        setErrors({
          general: 'Network error. Please check your internet connection and try again.'
        });
      } else if (error.message.includes('Authentication failed')) {
        // This is our custom error for missing token
        setErrors({
          general: 'Authentication failed. Please try again or contact support if the issue persists.'
        });

        // Log more detailed information to help diagnose the issue
        console.error('Authentication failed details:', {
          email,
          timestamp: new Date().toISOString()
        });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }

      // Log detailed error information
      console.error('Login error details in LoginPage:', {
        message: error.message,
        email,
        timestamp: new Date().toISOString()
      });
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
          Login
        </h1>

        <form onSubmit={handleSubmit}>
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
                border: `1px solid ${errors.email ? theme.error || '#f44336' : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.email ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaEnvelope color={errors.email ? theme.error || '#f44336' : theme.textSecondary} />
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
              <div style={{ color: theme.error || '#f44336', fontSize: '0.8rem', marginTop: '4px' }}>
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
                border: `1px solid ${errors.password ? theme.error || '#f44336' : theme.divider}`,
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: errors.password ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
              }}
            >
              <FaLock color={errors.password ? theme.error || '#f44336' : theme.textSecondary} />
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
              <div style={{ color: theme.error || '#f44336', fontSize: '0.8rem', marginTop: '4px' }}>
                {errors.password}
              </div>
            )}
          </div>

          {/* Forgot password link */}
          <div
            style={{
              textAlign: 'right',
              marginBottom: '24px',
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: theme.primary,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* General error message */}
          {errors.general && (
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
              {errors.general}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading || isContextLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || isContextLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '16px',
              opacity: isLoading || isContextLoading ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading || isContextLoading ? (
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
                Logging in...
              </>
            ) : (
              'Login'
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

          {/* Register link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: theme.textSecondary }}>
              Don't have an account?{' '}
            </span>
            <Link
              to="/register"
              style={{
                color: theme.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
