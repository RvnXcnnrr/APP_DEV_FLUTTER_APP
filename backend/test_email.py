import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    """
    Test sending an email using Django's email backend
    """
    subject = 'Test Email from Django'
    message = 'This is a test email from Django. If you received this, email sending is working correctly.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ['reyfoxconner@gmail.com']  # Using the same email as sender for testing

    print(f"Sending test email to {recipient_list} from {from_email}")
    print(f"Email settings:")
    print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")

    try:
        result = send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
        print(f"Email sent successfully: {result}")
    except Exception as e:
        print(f"Error sending email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_email()
