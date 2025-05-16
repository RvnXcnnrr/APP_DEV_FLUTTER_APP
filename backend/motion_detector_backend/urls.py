from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import permissions
from .views import verification_success, password_reset_confirm, api_password_reset_confirm
from motion_detector_backend.users.views import CustomConfirmEmailView
from typing import List, Any

# Import drf_yasg for API documentation
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Define URL patterns with type annotation to help Pylance
urlpatterns: List[Any] = [
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Custom URL for email confirmation
    re_path(r'^account-confirm-email/(?P<key>[-:\w]+)/$', CustomConfirmEmailView.as_view(), name='account_confirm_email'),

    # Password reset confirmation URL
    re_path(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$',
            password_reset_confirm,
            name='password_reset_confirm'),

    # API endpoint for password reset confirmation (for mobile apps)
    path('api/auth/password/reset/confirm/', api_password_reset_confirm, name='api_password_reset_confirm'),

    # Verification success page
    path('verification-success/', verification_success, name='verification_success'),

    # Root path for verification success redirect
    path('', verification_success, name='home'),

    # App endpoints
    path('api/users/', include('motion_detector_backend.users.urls')),
    path('api/sensors/', include('motion_detector_backend.sensors.urls')),
]

# Set up the schema view for Swagger documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Motion Detector API",
        default_version='v1',
        description="API for Motion Detector application",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@motiondetector.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Add Swagger URLs to the beginning of urlpatterns
swagger_patterns: List[Any] = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
urlpatterns = swagger_patterns + urlpatterns

# Add static/media files handling in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
