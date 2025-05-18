import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Services
import ApiService from './services/ApiService';
import AuthService from './services/AuthService';

// Context providers
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Create services
const apiService = new ApiService();
const authService = new AuthService(apiService);

// Make services available globally for components that can't use context
// This is not ideal, but it's a simple solution for components that need access to services
// but don't have access to the context
window.apiService = apiService;
window.authService = authService;

// App component
const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider authService={authService}>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
