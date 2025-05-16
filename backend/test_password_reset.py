import os
import django
import sys
import json

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from allauth.account.models import EmailAddress
from django.urls import reverse
from django.test import RequestFactory
from dj_rest_auth.views import PasswordResetView

User = get_user_model()

def test_password_reset():
    """
    Test the password reset functionality
    """
    # Email to test with
    email = 'test@example.com'

    # Check if the user exists, create if not
    user = User.objects.filter(email=email).first()
    if not user:
        print(f"Creating test user with email: {email}")
        user = User.objects.create_user(
            username=email,
            email=email,
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        user.is_active = True
        user.save()

        # Create EmailAddress for the user
        EmailAddress.objects.create(
            user=user,
            email=email,
            verified=True,
            primary=True
        )
    else:
        print(f"Using existing user with email: {email}")

    # Make sure the site domain is set correctly
    site = Site.objects.get_current()
    if hasattr(settings, 'SITE_DOMAIN') and site.domain != settings.SITE_DOMAIN:
        site.domain = settings.SITE_DOMAIN
        site.save()
        print(f"Updated site domain to: {site.domain}")

    print(f"Current site domain: {site.domain}")

    # Create a request object
    factory = RequestFactory()
    request = factory.post('/api/auth/password/reset/', {'email': email})

    # Print email settings
    print(f"Email settings:")
    print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

    # Test the password reset view directly
    print(f"Testing password reset for email: {email}")
    view = PasswordResetView.as_view()
    response = view(request)

    print(f"Password reset response status code: {response.status_code}")

    # Safely handle response content
    try:
        response_data = json.loads(response.content.decode('utf-8')) if hasattr(response, 'content') else {}
        print(f"Password reset response data: {response_data}")
    except json.JSONDecodeError:
        print(f"Password reset response is not JSON. Content: {response.content.decode('utf-8') if hasattr(response, 'content') else 'No content'}")

    print("Password reset email should have been sent. Check your email or console output.")

if __name__ == "__main__":
    test_password_reset()
