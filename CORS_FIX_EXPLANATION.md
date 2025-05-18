# CORS Issue Fix for Netlify Deployment

This document explains the changes made to fix the CORS (Cross-Origin Resource Sharing) issues encountered when deploying the Motion Detector React app to Netlify.

## The Problem

When deploying to Netlify, the app encountered CORS errors when trying to communicate with the Django backend on Render:

```
Access to fetch at 'https://app-dev-flutter-app.onrender.com/api/auth/login/' from origin 'https://motiondetectorappdev.netlify.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

This error occurs because:

1. The backend is using `CORS_ALLOW_ALL_ORIGINS = True`, which sets the `Access-Control-Allow-Origin` header to `*` (wildcard)
2. The frontend is using `credentials: 'include'` in fetch requests, which includes cookies
3. For security reasons, browsers don't allow wildcard origins when credentials are included

## The Solution

We modified the ApiService.js file to handle CORS issues specifically for Netlify deployments:

1. **Detect Netlify Environment**: Added code to detect when the app is running on Netlify
   ```javascript
   if (window.location.hostname.includes('netlify')) {
     // Netlify-specific code
   }
   ```

2. **Skip CSRF Token Fetch**: For Netlify deployments, we skip the CSRF token fetch and use a workaround
   ```javascript
   if (window.location.hostname.includes('netlify')) {
     console.debug('Running on Netlify, using CSRF workaround');
     return 'cross-origin-workaround';
   }
   ```

3. **Use Direct API Calls**: For Netlify deployments, we always use direct API calls instead of proxy
   ```javascript
   if (window.location.hostname.includes('netlify')) {
     console.debug('Running on Netlify, using direct API call');
     // Direct API call code
   }
   ```

4. **Omit Credentials**: For Netlify deployments, we set `credentials: 'omit'` instead of `'include'`
   ```javascript
   credentials: 'omit', // Don't include credentials for cross-origin requests from Netlify
   ```

## Why This Works

By omitting credentials in the fetch requests from Netlify, we allow the backend to use a wildcard origin (`*`) in its CORS headers. This is a workaround that allows the app to function without requiring changes to the backend.

The tradeoff is that we can't use cookies for authentication, but this is fine because:

1. We're using token-based authentication stored in localStorage
2. The token is sent in the Authorization header, which still works without credentials mode

## Long-Term Solution

While this fix allows the app to work immediately, the proper long-term solution would be to update the backend's CORS settings:

1. Set `CORS_ALLOW_ALL_ORIGINS = False`
2. Add the Netlify domain to `CORS_ALLOWED_ORIGINS`
3. Set `CORS_ALLOW_CREDENTIALS = True`

This would allow the frontend to use `credentials: 'include'` and still pass CORS checks.

## Testing

After deploying these changes, you should:

1. Test logging in from the Netlify deployment
2. Verify that the token is properly stored in localStorage
3. Check that authenticated requests work correctly
4. Test refreshing the page to ensure the session is maintained

If you encounter any issues, check the browser console for error messages.
