# Motion Detector React App

A React + Vite web application that replicates the frontend UI and routing of the Flutter app. This is a static frontend implementation without backend logic or API integrations.

## Features

- **UI Components**: Clean, responsive UI components that match the Flutter app design
- **Routing**: Complete page routing using React Router
- **Theme Switching**: Dark/light mode toggle in the top navigation bar
- **Static Dashboard**: Calendar view with simulated motion events
- **Profile Page**: User profile management UI
- **Settings Page**: App settings UI

## Project Structure

```
motion-detector-react/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and other assets
│   ├── components/          # Reusable UI components
│   │   └── TopNavBar.jsx    # Top navigation bar with theme toggle and logout
│   ├── context/             # React context providers
│   │   └── ThemeContext.jsx # Theme context for dark/light mode
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── SplashScreen.jsx
│   ├── utils/               # Utility functions
│   │   ├── navigationHelper.js
│   │   └── theme.js         # Theme configuration
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point with routing setup
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Navigate to the project directory:
   ```
   cd web_app/motion-detector-react
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Key UI Features

### Top Navigation Bar
- Title of the current page
- Dark mode toggle icon
- Logout button icon (UI only, no functionality)

### Dashboard
- Calendar view with month and year navigation
- Simulated motion events display
- Day selection functionality

### Profile Page
- User information display
- Profile editing UI
- Theme preference selection

### Settings Page
- Theme toggle
- Other app settings

## Building for Production

To build the app for production:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment to Netlify

This project is configured for deployment on Netlify.

### Deployment Configuration

- **Project Name**: motiondetectorappdev
- **Team**: Burger town
- **Branch to Deploy**: main
- **Base Directory**: web_app/motion-detector-react
- **Build Command**: npm run build
- **Publish Directory**: dist
- **Functions Directory**: netlify/functions

### Environment Variables

The following environment variables should be set in Netlify:

- `VITE_API_BASE_URL`: https://app-dev-flutter-app.onrender.com
- `VITE_WS_BASE_URL`: wss://app-dev-flutter-app.onrender.com/ws/sensors/

### Deployment URL

The app is deployed at: https://motiondetectorappdev.netlify.app

## Technologies Used

- React 18
- Vite
- React Router
- React Icons
- CSS-in-JS styling
