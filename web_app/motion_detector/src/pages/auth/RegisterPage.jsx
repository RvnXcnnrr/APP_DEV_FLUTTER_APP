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
 * Registration page component
 * @returns {JSX.Element} Registration page
 */
const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isDarkMode } = useUser();
  const { navigateReplace } = useNavigation();
  const theme = getTheme(isDarkMode);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      // For development purposes, simulate registration
      // In a real app, you would send this data to a backend
      setTimeout(() => {
        // Create a user with the entered information
        const user = new User(firstName, lastName, email);

        // Set the user in the context
        login(user);

        setIsLoading(false);

        // Show success message
        alert('Registration successful!');

        // Navigate to dashboard
        navigateReplace('/dashboard');
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
            Create Account
          </h1>
        </div>

        <form onSubmit={handleRegister}>
          <AuthTextField
            label="First Name"
            value={firstName}
            onChange={setFirstName}
            placeholder="Enter your first name"
            error={errors.firstName}
            isDarkMode={isDarkMode}
          />

          <AuthTextField
            label="Last Name"
            value={lastName}
            onChange={setLastName}
            placeholder="Enter your last name"
            error={errors.lastName}
            isDarkMode={isDarkMode}
          />

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

          <AuthTextField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            isDarkMode={isDarkMode}
          />

          <div style={{ marginTop: '20px' }}>
            <AuthButton
              text="Register"
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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: theme.primary, textDecoration: 'none' }}
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
