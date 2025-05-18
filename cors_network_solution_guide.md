# Comprehensive Guide to Fix CORS and Network Issues

This guide provides solutions for both your backend (Django on Render.com) and frontend (React) to resolve CORS and network connectivity issues.

## Backend Fixes (Django on Render.com)

### 1. Update CORS Settings

The main issue is that when using `credentials: 'include'` in your frontend, you cannot use a wildcard (`*`) for CORS origins. You must specify exact origins.

1. **Log in to your Render dashboard**
2. **Navigate to your Django backend service (app-dev-flutter-app)**
3. **Go to the "Environment" tab**
4. **Add/update these environment variables:**

```
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=["https://app-dev-flutter-app.onrender.com","http://localhost:5173","http://127.0.0.1:5173","http://localhost:5174","http://127.0.0.1:5174"]
CORS_ALLOW_CREDENTIALS=True
```

5. **Click "Save Changes" and wait for your service to redeploy**

### 2. Update Your Django Settings

If you prefer to update the code directly, modify your `settings.py` file with the content from the `django_cors_settings.py` file I've provided.

Key changes:
- Set `CORS_ALLOW_ALL_ORIGINS = False`
- Add specific origins to `CORS_ALLOWED_ORIGINS`
- Add `CORS_ALLOW_CREDENTIALS = True`
- Ensure your CSRF settings include all necessary origins

### 3. Check Server Logs

If you're still having issues:
1. Go to your Render dashboard
2. Select your backend service
3. Click on "Logs" to see any errors
4. Look for CORS-related errors or 403 responses

## Frontend Fixes (React)

### 1. Update API Service Configuration

Update your `ApiService.js` file to properly handle CORS and credentials:

```javascript
// ApiService.js - Proper configuration for cross-origin requests with credentials

async post(endpoint, data, requiresAuth = true, user = null) {
  try {
    const headers = this.getHeaders(requiresAuth, user);
    
    console.debug(`POST request to: ${this.baseUrl}/${endpoint}`);
    console.debug('Headers:', headers);
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      mode: 'cors',
      credentials: 'include', // This is correct for including cookies
    });
    
    return this.handleResponse(response);
  } catch (error) {
    // Error handling...
    throw error;
  }
}
```

### 2. Update Vite Configuration

Ensure your Vite proxy is correctly configured:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://app-dev-flutter-app.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://app-dev-flutter-app.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### 3. Implement Better Error Handling

Add better error handling in your API service:

```javascript
// Error handling in ApiService.js
catch (error) {
  console.error('Network error during request:', error);
  
  // Check if the server is unreachable
  if (error.message === 'Failed to fetch') {
    throw new Error(`Network error: Could not connect to ${this.baseUrl}. Please check your internet connection and make sure the server is running.`);
  }
  
  // Check for CORS errors
  if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
    throw new Error(`CORS error: The server is not configured to accept requests from ${window.location.origin}. Please check your CORS settings on the backend.`);
  }
  
  throw error;
}
```

## Temporary Workarounds (Development Only)

### 1. CORS Browser Extension

For Chrome, you can temporarily use the "CORS Unblock" extension during development:
https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino

### 2. Direct API Calls (No Proxy)

If the proxy is causing issues, try direct API calls:

```javascript
// config.js - Direct API calls
development: {
  apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
  wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
},
```

### 3. Disable CSRF for Testing

**WARNING: Only for development/testing!**

In your Django views, you can temporarily exempt specific views from CSRF protection:

```python
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    # Your login view code
```

## Production-Ready Solutions

### 1. Secure CORS Configuration

For production:
- Only allow specific origins
- Use HTTPS for all communications
- Set appropriate CORS headers

### 2. Secure Credential Handling

- Use HttpOnly cookies for sensitive tokens
- Implement proper token refresh mechanisms
- Consider using SameSite cookie attributes

### 3. API Gateway/CDN

Consider using an API gateway or CDN like Cloudflare to handle CORS and security:
- Provides additional security layers
- Can handle CORS headers at the edge
- Offers DDoS protection

## Debugging Tools

1. **Network Tab in Browser DevTools**:
   - Check the "Network" tab in Chrome DevTools
   - Look for failed requests (red)
   - Examine the "Response" and "Headers" tabs

2. **CORS Debugging**:
   - Look for "Access-Control-Allow-Origin" in response headers
   - Check for preflight OPTIONS requests
   - Verify credentials are being sent correctly

3. **Backend Logs**:
   - Check Django logs for CORS/CSRF errors
   - Look for 403 Forbidden responses
   - Check for any middleware errors

## Need More Help?

If you're still experiencing issues after implementing these solutions, please provide:
1. Updated error messages from the browser console
2. Response headers from the failed requests
3. Any logs from your Render deployment
