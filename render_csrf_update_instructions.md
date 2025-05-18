# Updating CSRF Settings on Render Deployment

To fix the CSRF error when connecting your local React frontend to the Render-deployed Django backend, you need to update the `CSRF_TRUSTED_ORIGINS` setting on your Render deployment.

## Option 1: Update via Render Dashboard

1. Log in to your Render dashboard
2. Navigate to your Django backend service (app-dev-flutter-app)
3. Go to the "Environment" tab
4. Add a new environment variable:
   - Key: `CSRF_TRUSTED_ORIGINS`
   - Value: `["https://app-dev-flutter-app.onrender.com","http://localhost:5173","http://localhost:5174"]`
5. Click "Save Changes"
6. Your service will automatically redeploy with the new settings

## Option 2: Update settings.py and Redeploy

If you prefer to update the code directly:

1. Update your `settings.py` file:

```python
# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "https://app-dev-flutter-app.onrender.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5173",  # Vite development server
    "http://127.0.0.1:5173",  # Alternative localhost notation
    "http://localhost:5174",  # Alternative Vite port
    "http://127.0.0.1:5174",  # Alternative localhost notation
]
```

2. Commit and push your changes to the repository connected to Render
3. Render will automatically redeploy your application

## Option 3: Temporary Workaround

If you need a quick temporary solution, you can modify your Django settings to disable CSRF protection for the login endpoint. **Note: This is not recommended for production use as it reduces security.**

```python
# Add this to your settings.py
CSRF_EXEMPT_VIEWS = [
    'dj_rest_auth.views.LoginView',
]

# Then in your urls.py, wrap the login view with csrf_exempt
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.views import LoginView

urlpatterns = [
    # ... other URL patterns
    path('api/auth/login/', csrf_exempt(LoginView.as_view()), name='rest_login'),
    # ... other URL patterns
]
```

## Alternative: Direct API Calls

As a last resort, you can modify your React frontend to make direct API calls to the Render backend instead of using the proxy:

1. Update your `config.js` to use the full Render URL:

```javascript
// Development environment (local)
development: {
  apiBaseUrl: 'https://app-dev-flutter-app.onrender.com',
  wsBaseUrl: 'wss://app-dev-flutter-app.onrender.com/ws/sensors/',
},
```

2. Update your API service to include the `withCredentials` option in fetch calls:

```javascript
const response = await fetch(`${this.baseUrl}/${endpoint}`, {
  method: 'POST',
  headers,
  body: JSON.stringify(data),
  mode: 'cors',
  credentials: 'include',
});
```

This approach may still face CORS issues, which would need to be addressed in your Django CORS settings.
