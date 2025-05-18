# CORS settings for Django backend on Render.com
# Replace the current CORS settings in your settings.py with these

# IMPORTANT: Set CORS_ALLOW_ALL_ORIGINS to False
CORS_ALLOW_ALL_ORIGINS = False

# Specify allowed origins explicitly
CORS_ALLOWED_ORIGINS = [
    "https://app-dev-flutter-app.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",  # Alternative localhost notation
    "http://localhost:5174",  # Alternative Vite port
    "http://127.0.0.1:5174",  # Alternative localhost notation
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
]

# Allow specific HTTP methods for CORS
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Set the max age for preflight requests
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours
