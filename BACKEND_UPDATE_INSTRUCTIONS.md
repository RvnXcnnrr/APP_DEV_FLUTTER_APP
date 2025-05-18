# Backend Updates for Netlify Deployment

To ensure the React web app deployed on Netlify can communicate properly with the Django backend on Render, you need to update the backend's CORS and CSRF settings.

## Option 1: Update via Render Dashboard (Recommended)

This is the quickest way to update the settings without redeploying the backend:

1. Log in to your Render dashboard
2. Navigate to your Django backend service (app-dev-flutter-app)
3. Go to the "Environment" tab
4. Add or update these environment variables:

   ```
   CORS_ALLOWED_ORIGINS=["https://app-dev-flutter-app.onrender.com","http://localhost:5173","http://localhost:5174","https://motiondetectorappdev.netlify.app"]
   
   CSRF_TRUSTED_ORIGINS=["https://app-dev-flutter-app.onrender.com","http://localhost:5173","http://localhost:5174","https://motiondetectorappdev.netlify.app"]
   ```

5. Click "Save Changes"
6. Your service will automatically redeploy with the new settings

## Option 2: Update settings.py and Redeploy

If you prefer to update the code directly:

1. Open `backend/motion_detector_backend/settings.py`
2. Find the CORS settings section and update it:

   ```python
   # CORS settings
   CORS_ALLOW_ALL_ORIGINS = False  # Change from True to False for better security
   
   # Specify allowed origins explicitly
   CORS_ALLOWED_ORIGINS = [
       "https://app-dev-flutter-app.onrender.com",
       "http://localhost:3000",
       "http://127.0.0.1:3000",
       "http://localhost:5173",  # Vite default port
       "http://127.0.0.1:5173",  # Alternative localhost notation
       "https://motiondetectorappdev.netlify.app",  # Netlify deployment
   ]
   
   # Allow credentials in CORS requests
   CORS_ALLOW_CREDENTIALS = True
   
   # Allow specific headers in CORS requests
   CORS_ALLOW_HEADERS = [
       'accept',
       'accept-encoding',
       'authorization',
       'content-type',
       'dnt',
       'origin',
       'user-agent',
       'x-csrftoken',
       'x-requested-with',
       'x-user-email',  # Your custom header
   ]
   
   # CSRF settings
   CSRF_TRUSTED_ORIGINS = [
       "https://app-dev-flutter-app.onrender.com",
       "http://localhost:8000",
       "http://127.0.0.1:8000",
       "http://localhost:5173",  # Vite development server
       "http://127.0.0.1:5173",  # Alternative localhost notation
       "http://localhost:5174",  # Alternative Vite port
       "http://127.0.0.1:5174",  # Alternative localhost notation
       "https://motiondetectorappdev.netlify.app",  # Netlify deployment
   ]
   ```

3. Commit and push your changes to the repository connected to Render
4. Render will automatically redeploy your application

## Testing the Connection

After updating the backend settings, you should test the connection:

1. Deploy your React app to Netlify
2. Open the deployed app at https://motiondetectorappdev.netlify.app
3. Try to log in with your credentials
4. Check the browser console for any CORS or CSRF errors
5. If you encounter errors, verify that the backend settings have been updated correctly

## Troubleshooting

If you still encounter CORS issues:

1. **Check the Network Tab**: In your browser's developer tools, look at the Network tab to see the specific CORS errors
2. **Verify Headers**: Check that the `Access-Control-Allow-Origin` header is present in the response and includes your Netlify domain
3. **Check for CSRF Issues**: If you see CSRF errors, make sure the `CSRF_TRUSTED_ORIGINS` setting includes your Netlify domain
4. **Try Direct API Calls**: If proxy issues persist, update your React app to make direct API calls to the Render backend

## Additional Notes

- The WebSocket connection might also need CORS configuration. If you encounter WebSocket connection issues, make sure your WebSocket server is configured to accept connections from the Netlify domain.
- If you're using JWT authentication, make sure the tokens are being properly stored and sent with requests from the Netlify domain.
- Consider adding a custom header to your API requests from the Netlify app to help identify and debug issues.
