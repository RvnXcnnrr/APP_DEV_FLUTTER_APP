import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from allauth.account.models import EmailAddress, EmailConfirmation
import datetime
from django.utils import timezone

User = get_user_model()

def test_email_verification():
    """
    Test the email verification process by creating a user and sending a verification email
    """
    # Update the site domain
    site = Site.objects.get(id=settings.SITE_ID)
    site.domain = settings.SITE_DOMAIN
    site.name = 'Motion Detector'
    site.save()
    
    print(f"Site domain updated to: {site.domain}")
    
    # Create a test user
    email = 'test@example.com'
    
    # Delete existing user if it exists
    User.objects.filter(email=email).delete()
    EmailAddress.objects.filter(email=email).delete()
    
    # Create a new user
    user = User.objects.create_user(
        username=email,
        email=email,
        password='testpassword123',
        is_active=False,  # User is inactive until email is verified
        email_verified=False
    )
    
    print(f"Created test user: {user.email}, is_active: {user.is_active}")
    
    # Create email address for the user
    email_address = EmailAddress.objects.create(
        user=user,
        email=email,
        primary=True,
        verified=False
    )
    
    print(f"Created email address: {email_address.email}, verified: {email_address.verified}")
    
    # Create email confirmation
    confirmation = EmailConfirmation.objects.create(
        email_address=email_address,
        created=timezone.now(),
        sent=timezone.now(),
        key='testkey123'
    )
    
    print(f"Created email confirmation with key: {confirmation.key}")
    
    # Print email settings
    print(f"Email settings:")
    print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    
    # Send a test email
    subject = 'Test Email Verification'
    message = f"""
    This is a test email verification message.
    
    To confirm your email, please click on the following link:
    http://{site.domain}/account-confirm-email/{confirmation.key}/
    
    Thank you!
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        result = send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
        print(f"Email sent successfully: {result}")
        print(f"Verification link: http://{site.domain}/account-confirm-email/{confirmation.key}/")
    except Exception as e:
        print(f"Error sending email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_email_verification()
