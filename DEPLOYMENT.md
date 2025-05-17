# Deployment Guide

This document provides instructions for deploying the Motion Detector application to Render.

## Backend Deployment (Django)

The backend is deployed on Render as a Web Service at: https://app-dev-flutter-app.onrender.com

### Manual Deployment Steps

1. Create a new Web Service on Render
   - Connect your GitHub repository
   - Select the branch to deploy
   - Set the build command to: `./backend/build.sh`
   - Set the start command to: `cd backend && daphne motion_detector_backend.asgi:application --port $PORT --bind 0.0.0.0`

2. Set Environment Variables on Render
   - `DATABASE_URL`: `postgresql://motion_detector_user:NBvmpfLaqH2AH4BE0P93VIdigkOn016U@dpg-d0k5uiffte5s738cqqa0-a.oregon-postgres.render.com/motion_detector`
   - `DEBUG`: `False`
   - `SECRET_KEY`: Generate a secure random key
   - `SITE_DOMAIN`: `app-dev-flutter-app.onrender.com`
   - `FRONTEND_URL`: `https://app-dev-flutter-app.onrender.com`
   - `PYTHON_VERSION`: `3.11.0`

### Blueprint Deployment (Alternative)

Alternatively, you can use the `render.yaml` file in the root directory to deploy using Render Blueprints:

1. Push the `render.yaml` file to your repository
2. Create a new Blueprint on Render
3. Connect your repository
4. Render will automatically set up the services defined in the YAML file

## Frontend Deployment

### Flutter App

The Flutter app is configured to connect to the deployed backend when built in release mode:

```bash
# Build for Android
flutter build apk --release

# Build for iOS
flutter build ios --release

# Build for web
flutter build web --release
```

### React Web App

The React web app is configured to connect to the deployed backend when built for production:

```bash
# Navigate to the web app directory
cd web_app/motion_detector

# Install dependencies
npm install

# Build for production
npm run build
```

You can deploy the built files (in the `dist` directory) to any static hosting service like Netlify, Vercel, or GitHub Pages.

## ESP32 Configuration

For the ESP32 device, use the `ESP32_Production_Template.ino` file as a template. Update the WiFi credentials and flash it to your device.

The ESP32 is configured to connect to the deployed backend using secure WebSockets (WSS).

## Database

The application uses a PostgreSQL database hosted on Render. The database URL is:

```
postgresql://motion_detector_user:NBvmpfLaqH2AH4BE0P93VIdigkOn016U@dpg-d0k5uiffte5s738cqqa0-a.oregon-postgres.render.com/motion_detector
```

## Troubleshooting

### WebSocket Connection Issues

If you're having trouble with WebSocket connections:

1. Make sure your backend is running with Daphne, not the standard Django development server
2. Check that your WebSocket URL uses `wss://` for secure connections to the production server
3. Verify that the authentication token is being passed correctly

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check that the `DATABASE_URL` environment variable is set correctly
2. Make sure your IP address is allowed in the database's firewall settings
3. Verify that the database user has the necessary permissions

### CORS Issues

If you're experiencing CORS issues:

1. Check the `CORS_ALLOWED_ORIGINS` setting in `settings.py`
2. Make sure your frontend domain is included in the allowed origins
3. Verify that the `CORS_ALLOW_ALL_ORIGINS` setting is `True` if you want to allow all origins
