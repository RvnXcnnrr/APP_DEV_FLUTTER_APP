import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './style.css';

// Services
import ApiService from './services/ApiService';
import AuthService from './services/AuthService';
import WebSocketService from './services/WebSocketService';
import AppConfig from './utils/config';

// Context providers
import { UserProvider } from './context/UserContext';
import { MotionEventProvider } from './context/MotionEventContext';
import { SensorDataProvider } from './context/SensorDataContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  // For development purposes, we'll allow access without authentication
  // In a real app, you would check if the user is authenticated
  return children;
};

// Create global services
const apiService = new ApiService(AppConfig.apiBaseUrl);
const authService = new AuthService(apiService);
const webSocketService = new WebSocketService(AppConfig.wsBaseUrl, apiService);

// Always use the same token as the Flutter app
// This ensures both apps can access the same data
console.log('Setting token from app configuration');

// Check if we already have a token in localStorage
const existingToken = localStorage.getItem('auth_token');
if (!existingToken) {
  // Use the default token from config which matches the Flutter app's token
  apiService.setToken(AppConfig.defaultToken);
  console.log('Using default token from config:', AppConfig.defaultToken);
} else {
  console.log('Using existing token from localStorage:', existingToken);
}

// Log the current token for debugging
console.log('Current token in localStorage:', apiService.getToken());
console.log('Authorization header will be:', `Token ${apiService.getToken()}`);

// Verify the token is the expected one for the device owner
const expectedToken = 'fe1f6c58646d8942c85cb5fc456990d4a639c1a0';
if (apiService.getToken() !== expectedToken) {
  console.warn('Warning: Current token does not match the expected token for the device owner!');
  console.warn('Expected:', expectedToken);
  console.warn('Current:', apiService.getToken());

  // Force set the correct token
  apiService.setToken(expectedToken);
  console.log('Token has been reset to the expected value:', apiService.getToken());
}

// App component
const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <MotionEventProvider webSocketService={webSocketService} apiService={apiService}>
          <SensorDataProvider webSocketService={webSocketService}>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SensorDataProvider>
        </MotionEventProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
