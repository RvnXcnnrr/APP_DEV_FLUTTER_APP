import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.contrib.sites.models import Site
from django.conf import settings
from django.core.management import call_command

def fix_email_verification():
    """
    Apply all fixes for email verification
    """
    print("Applying email verification fixes...")

    # 1. Update the site domain
    try:
        site = Site.objects.get(id=settings.SITE_ID)
        site.domain = settings.SITE_DOMAIN
        site.name = 'Motion Detector'
        site.save()
        print(f"Site domain updated to: {site.domain}")
    except Site.DoesNotExist:
        Site.objects.create(id=settings.SITE_ID, domain=settings.SITE_DOMAIN, name='Motion Detector')
        print(f"Created new Site with domain {settings.SITE_DOMAIN}")

    # 2. Run migrations to ensure all models are up to date
    print("Running migrations...")
    call_command('migrate')

    # 3. Fix existing users with verified emails
    from django.contrib.auth import get_user_model
    from allauth.account.models import EmailAddress

    User = get_user_model()
    print("\nFixing existing users with verified emails...")

    # Get all verified email addresses
    verified_emails = EmailAddress.objects.filter(verified=True)
    print(f"Found {verified_emails.count()} verified email addresses")

    # Update corresponding users
    for email_address in verified_emails:
        user = email_address.user
        if not user.email_verified:
            user.email_verified = True
            user.is_active = True
            user.save()
            print(f"Updated user {user.email}: email_verified=True, is_active=True")

    # 4. Check for users with unverified emails
    unverified_emails = EmailAddress.objects.filter(verified=False)
    print(f"\nFound {unverified_emails.count()} unverified email addresses")

    for email_address in unverified_emails:
        user = email_address.user
        print(f"User {user.email}: verified={email_address.verified}, email_verified={user.email_verified}, is_active={user.is_active}")

    print("\nEmail verification fixes applied successfully!")
    print(f"Current email backend: {settings.EMAIL_BACKEND}")
    print(f"Site domain: {Site.objects.get(id=settings.SITE_ID).domain}")
    print("\nTo test email sending, run: python test_email.py")
    print("To test email verification, run: python test_email_verification.py")

if __name__ == '__main__':
    fix_email_verification()
