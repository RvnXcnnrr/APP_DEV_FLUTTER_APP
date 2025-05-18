import os
import dj_database_url
from datetime import timedelta
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Use environment variable for SECRET_KEY in production
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
# Set DEBUG to False in production
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Add your Render web service URL to allowed hosts
ALLOWED_HOSTS = ['*']  # For development
# In production, specify your domain
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'drf_yasg',
    'channels',

    # Local apps
    'motion_detector_backend.users',
    'motion_detector_backend.sensors',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # Required for django-allauth 0.58.2+
]

ROOT_URLCONF = 'motion_detector_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'motion_detector_backend.wsgi.application'
ASGI_APPLICATION = 'motion_detector_backend.asgi.application'

# Channels settings
# Use InMemoryChannelLayer for development and testing
# For production, we'll continue to use InMemoryChannelLayer since this is a small app
# For larger production apps, consider using Redis or other backends
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# Database
# Use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Use PostgreSQL on Render
if 'DATABASE_URL' in os.environ:
    DATABASES['default'] = dict(dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    ))

# Direct PostgreSQL configuration for Render deployment
DATABASES['default'] = dict(dj_database_url.parse("postgresql://motion_detector_user:NBvmpfLaqH2AH4BE0P93VIdigkOn016U@dpg-d0k5uiffte5s738cqqa0-a.oregon-postgres.render.com/motion_detector"))

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'  # Philippine Time (PHT, UTC+8)
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'users.CustomUser'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# If you want to restrict CORS to specific origins in production, use this instead:
# CORS_ALLOWED_ORIGINS = [
#     "https://app-dev-flutter-app.onrender.com",
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:5173",  # Vite default port
# ]

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
    'x-user-email',  # Add your custom header here
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "https://app-dev-flutter-app.onrender.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Django AllAuth settings
SITE_ID = 1
# Use environment variable for SITE_DOMAIN in production
SITE_DOMAIN = os.environ.get('SITE_DOMAIN', 'app-dev-flutter-app.onrender.com')  # Used for email verification links
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
# Set to 'mandatory' to require email verification
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/verification-success/'
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/verification-success/'
ACCOUNT_ADAPTER = 'motion_detector_backend.users.adapters.CustomAccountAdapter'
# Set default user to inactive until email is verified
ACCOUNT_DEFAULT_USER_STATUS = False  # Users are inactive by default

# Protocol settings for URLs in emails
# Use HTTPS in production
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https' if not DEBUG else 'http'

# Email settings
# For development, use SMTP backend to send real emails
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'reyfoxconner@gmail.com'
EMAIL_HOST_PASSWORD = 'ehas ugvv akue flrm'
DEFAULT_FROM_EMAIL = 'reyfoxconner@gmail.com'

# For local testing, use console backend to print emails to console
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Frontend URL for password reset and other redirects
# In development, this should be your Flutter app's URL
# In production, this should be your deployed frontend URL
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://app-dev-flutter-app.onrender.com')

# dj-rest-auth settings
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'motion-detector-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'motion-detector-refresh-token',
    'USER_DETAILS_SERIALIZER': 'motion_detector_backend.users.serializers.CustomUserDetailsSerializer',
    'REGISTER_SERIALIZER': 'motion_detector_backend.users.serializers.CustomRegisterSerializer',
    # Password reset configuration
    'PASSWORD_RESET_USE_SITES_DOMAIN': True,
    'PASSWORD_RESET_CONFIRM_URL': 'password-reset/confirm/{uid}/{token}/',
}
