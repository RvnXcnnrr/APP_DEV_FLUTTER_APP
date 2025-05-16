from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import permissions
from .views import verification_success
from motion_detector_backend.users.views import CustomConfirmEmailView

# Import drf_yasg for API documentation
# pylint: disable=import-error
# type: ignore[import]
# pyright: reportMissingImports=false
import importlib.util

# Define schema_view and swagger_enabled at module level
schema_view = None
swagger_enabled = False

# Check if drf_yasg is available
if importlib.util.find_spec("drf_yasg") is not None:
    # These imports are protected by the check above
    from drf_yasg.views import get_schema_view  # type: ignore
    from drf_yasg import openapi  # type: ignore

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
    swagger_enabled = True

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Custom URL for email confirmation
    re_path(r'^account-confirm-email/(?P<key>[-:\w]+)/$', CustomConfirmEmailView.as_view(), name='account_confirm_email'),

    # Verification success page
    path('verification-success/', verification_success, name='verification_success'),

    # Root path for verification success redirect
    path('', verification_success, name='home'),

    # App endpoints
    path('api/users/', include('motion_detector_backend.users.urls')),
    path('api/sensors/', include('motion_detector_backend.sensors.urls')),
]

# Add Swagger documentation URLs if available
if swagger_enabled:
    urlpatterns = [
        # API documentation
        re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
