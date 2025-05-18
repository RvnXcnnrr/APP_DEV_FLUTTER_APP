# Motion Detector React App

A React + Vite web application that replicates the functionality of the Flutter app with a responsive web interface. The app connects to the Django backend to display real-time motion events and sensor data.

## Features

- **Authentication**: Login, registration, and password recovery with email verification
- **User Profile**: Profile management with theme preference
- **Theme Switching**: Dark/light mode toggle in the top navigation bar
- **Dashboard**: Real-time display of motion detection events with temperature and humidity data
- **WebSocket Integration**: Live updates of motion events and sensor readings
- **Responsive Design**: Works on desktop and mobile browsers
- **JWT Authentication**: Secure token-based authentication with refresh capability

## Project Structure

```
motion-detector-react/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and other assets
│   ├── components/          # Reusable UI components
│   │   ├── TopNavBar.jsx    # Top navigation bar with theme toggle and logout
│   │   ├── MotionEventList.jsx # List of motion events
│   │   ├── ConfirmDialog.jsx # Confirmation dialog for actions
│   │   ├── ProfileCard.jsx  # User profile card component
│   │   └── LoadingSpinner.jsx # Loading indicator
│   ├── context/             # React context providers
│   │   ├── ThemeContext.jsx # Theme context for dark/light mode
│   │   ├── AuthContext.jsx  # Authentication context
│   │   └── MotionEventContext.jsx # Motion event data context
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── VerifyEmailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── SplashScreen.jsx
│   ├── services/            # API and WebSocket services
│   │   ├── api.js           # API service for backend communication
│   │   ├── auth.js          # Authentication service
│   │   └── websocket.js     # WebSocket service for real-time updates
│   ├── utils/               # Utility functions
│   │   ├── navigationHelper.js
│   │   ├── theme.js         # Theme configuration
│   │   ├── config.js        # Environment configuration
│   │   ├── dateUtils.js     # Date formatting utilities
│   │   └── tokenStorage.js  # JWT token storage utilities
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point with routing setup
├── index.html
├── package.json
├── vite.config.js
└── netlify.toml             # Netlify deployment configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- Access to the Django backend (local or deployed)

### Installation

1. Clone the repository and navigate to the project directory:
   ```
   git clone https://github.com/yourusername/motion-detector-app.git
   cd motion-detector-app/web_app/motion-detector-react
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:

   Create a `.env.local` file in the project root with the following variables:
   ```
   # For local development with proxy (recommended)
   VITE_API_BASE_URL=
   VITE_WS_BASE_URL=/ws/sensors/

   # For direct connection to the deployed backend
   # VITE_API_BASE_URL=https://app-dev-flutter-app.onrender.com
   # VITE_WS_BASE_URL=wss://app-dev-flutter-app.onrender.com/ws/sensors/
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Connecting to the Backend

The app is configured to use a proxy for local development, which forwards API requests to the backend. This helps avoid CORS issues during development.

If you want to connect directly to the deployed backend, update the environment variables as shown in the commented section above.

## Key Features

### Authentication
- **Login**: Email and password authentication with JWT tokens
- **Registration**: User registration with email verification
- **Password Recovery**: Forgot password flow with email reset link
- **Email Verification**: Account activation via email verification
- **Token Refresh**: Automatic refresh of JWT tokens

### Dashboard
- **Motion Events List**: Display of motion events with timestamps
- **Temperature & Humidity**: Real-time temperature and humidity data
- **WebSocket Updates**: Live updates when new events are detected
- **Pagination**: Load more events as needed
- **Filtering**: Filter events by date

### User Profile
- **Profile Information**: Display and edit user information
- **Theme Preference**: Toggle between light and dark mode
- **Profile Card**: Modal display of user profile from navigation bar
- **Logout Confirmation**: Confirmation dialog before logging out

### WebSocket Integration
- **Real-time Updates**: Live updates of motion events and sensor data
- **Automatic Reconnection**: Reconnects if connection is lost
- **Authentication**: Secure WebSocket connection with JWT token

## Building for Production

To build the app for production:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

### Netlify Deployment

This project is configured for deployment on Netlify.

#### Deployment Configuration

- **Project Name**: motiondetectorappdev
- **Team**: Burger town
- **Branch to Deploy**: main
- **Base Directory**: web_app/motion-detector-react
- **Build Command**: npm run build
- **Publish Directory**: dist
- **Functions Directory**: netlify/functions

#### Environment Variables

The following environment variables should be set in Netlify:

- `VITE_API_BASE_URL`: https://app-dev-flutter-app.onrender.com
- `VITE_WS_BASE_URL`: wss://app-dev-flutter-app.onrender.com/ws/sensors/

#### Deployment URL

The app is deployed at: https://motiondetectorappdev.netlify.app

### Netlify.toml Configuration

The project includes a `netlify.toml` file with the following configuration:

```toml
[build]
  base = "web_app/motion-detector-react"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This configuration ensures that all routes are handled by the React Router.

## API Integration

### Backend API

The app connects to the Django backend API at:
- Production: https://app-dev-flutter-app.onrender.com
- Development: http://localhost:8000

### WebSocket Connection

Real-time updates are received via WebSocket connection:
- Production: wss://app-dev-flutter-app.onrender.com/ws/sensors/
- Development: ws://localhost:8000/ws/sensors/

### Authentication

The app uses JWT authentication with the following endpoints:
- Login: `/api/auth/login/`
- Registration: `/api/auth/registration/`
- Password Reset: `/api/auth/password/reset/`
- Token Refresh: `/api/auth/token/refresh/`

## Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **React Query**: Data fetching and caching
- **React Context API**: State management
- **JWT Decode**: JWT token parsing
- **React Icons**: Icon library
- **CSS Modules**: Scoped styling
