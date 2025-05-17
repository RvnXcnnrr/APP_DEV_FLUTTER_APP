import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../utils/navigationHelper';
import { getTheme } from '../../utils/theme';
import AuthTextField from '../../components/AuthTextField';
import AuthButton from '../../components/AuthButton';
import User from '../../models/User';
import { FaVideo } from 'react-icons/fa';

/**
 * Login page component
 * @returns {JSX.Element} Login page
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isDarkMode } = useUser();
  const { navigateReplace } = useNavigation();
  const theme = getTheme(isDarkMode);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      // For development purposes, allow login without credentials
      // In a real app, you would validate credentials against a backend
      setTimeout(() => {
        try {
          // Create a user with the entered email
          // The email will be normalized in the UserContext
          const user = new User('Dev', 'User', email);

          console.log('LoginPage - Created user:', user);
          console.log('LoginPage - User email:', user.email);

          // Set the user in the context
          login(user);

          console.log('LoginPage - After login, user email:', email);

          // Check if the user is the token owner
          const isOwner = email.trim().toLowerCase() === 'oracle.tech.143@gmail.com';

          // Show success message
          if (isOwner) {
            alert('Login successful! You have full access to device data as the token owner.');
          } else {
            alert('Login successful! Note: Only oracle.tech.143@gmail.com has access to device data.');
          }

          // Navigate to dashboard
          navigateReplace('/dashboard');
        } catch (error) {
          console.error('Error during login:', error);
          alert('An error occurred during login. Please try again.');
        } finally {
          setIsLoading(false);
        }
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
            Motion Detector
          </h1>
        </div>

        <form onSubmit={handleLogin}>
          <AuthTextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="Enter your email"
            error={errors.email}
            isDarkMode={isDarkMode}
          />

          <AuthTextField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Enter your password"
            error={errors.password}
            isDarkMode={isDarkMode}
          />

          <div style={{ marginTop: '20px' }}>
            <AuthButton
              text="Login"
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
            <Link
              to="/forgot-password"
              style={{ color: theme.primary, textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '14px',
              color: theme.textSecondary,
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: theme.primary, textDecoration: 'none' }}
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
