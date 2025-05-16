from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_email, user_field, user_username
from allauth.utils import build_absolute_uri
from django.urls import reverse
from django.contrib.sites.models import Site
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom account adapter for django-allauth

    This adapter customizes the registration process and email verification
    """

    def save_user(self, request, user, form, commit=True):
        """
        Saves a new user from the registration form

        This method is called by the registration view to save the user
        """
        data = form.cleaned_data

        # Set the user's email
        user_email(user, data.get('email'))

        # Set the user's username if provided
        if 'username' in data and data['username']:
            user_username(user, data['username'])
        else:
            # If username is not provided, use the email as username
            user_username(user, data['email'])

        # Set the user's first and last name if provided
        if 'first_name' in data:
            user_field(user, 'first_name', data['first_name'])
        if 'last_name' in data:
            user_field(user, 'last_name', data['last_name'])

        # Set the user's password
        if 'password1' in data:
            user.set_password(data['password1'])

        # Save the user
        if commit:
            user.save()

        return user

    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Constructs the email confirmation URL

        This method is called when sending the confirmation email
        """
        url = reverse('account_confirm_email', args=[emailconfirmation.key])
        # Use the site domain from settings instead of the request's domain
        site = Site.objects.get_current()

        # Update site domain if it doesn't match settings
        if hasattr(settings, 'SITE_DOMAIN') and site.domain != settings.SITE_DOMAIN:
            site.domain = settings.SITE_DOMAIN
            site.save()
            print(f"Updated site domain to {site.domain}")

        # Make sure the site domain doesn't have trailing slashes
        site_domain = site.domain.rstrip('/')

        # Ensure the URL starts with a slash
        if not url.startswith('/'):
            url = f"/{url}"

        protocol = 'https' if request and request.is_secure() else 'http'
        ret = f"{protocol}://{site_domain}{url}"
        print(f"Generated confirmation URL: {ret}")

        # Store the confirmation key in a more accessible place for debugging
        from django.core.cache import cache
        cache.set(f"email_confirmation_{emailconfirmation.key}", ret, 86400)  # Store for 24 hours
        print(f"Stored confirmation URL in cache with key: email_confirmation_{emailconfirmation.key}")

        return ret

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        """
        Sends the confirmation email

        This method is called when a user registers and email verification is required
        """
        # Get the current site from the database instead of request.site
        current_site = Site.objects.get_current()

        # Update site domain if it doesn't match settings
        if hasattr(settings, 'SITE_DOMAIN') and current_site.domain != settings.SITE_DOMAIN:
            current_site.domain = settings.SITE_DOMAIN
            current_site.save()
            print(f"Updated site domain to {current_site.domain} in send_confirmation_mail")

        activate_url = self.get_email_confirmation_url(request, emailconfirmation)
        ctx = {
            'user': emailconfirmation.email_address.user,
            'activate_url': activate_url,
            'current_site': current_site,
            'key': emailconfirmation.key,
        }

        if signup:
            email_template = 'account/email/email_confirmation_signup'
        else:
            email_template = 'account/email/email_confirmation'

        print(f"Sending confirmation email to: {emailconfirmation.email_address.email}")
        print(f"Activation URL: {activate_url}")
        print(f"Email template: {email_template}")

        self.send_mail(email_template, emailconfirmation.email_address.email, ctx)
        print(f"Confirmation email sent successfully")

    def respond_email_verification_sent(self, request, user):
        """
        Handles the response after the verification email is sent

        This method is called after the verification email is sent
        """
        return super().respond_email_verification_sent(request, user)

    def get_password_confirmation_url(self, request, user, token):
        """
        Constructs the password reset confirmation URL

        This method is called when sending the password reset email
        """
        # Generate the uidb64 for the user
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Construct the URL path
        path = reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})

        # Get the site domain from settings
        site = Site.objects.get_current()

        # Update site domain if it doesn't match settings
        if hasattr(settings, 'SITE_DOMAIN') and site.domain != settings.SITE_DOMAIN:
            site.domain = settings.SITE_DOMAIN
            site.save()
            print(f"Updated site domain to {site.domain} for password reset")

        # Use 127.0.0.1 instead of localhost for better compatibility
        site_domain = site.domain
        if site_domain == 'localhost:8000':
            site_domain = '127.0.0.1:8000'

        # Make sure the site domain doesn't have trailing slashes
        site_domain = site_domain.rstrip('/')

        # Ensure the URL starts with a slash
        if not path.startswith('/'):
            path = f"/{path}"

        protocol = 'https' if request and request.is_secure() else 'http'
        url = f"{protocol}://{site_domain}{path}"

        print(f"Generated password reset URL: {url}")
        return url

    def reset_password(self, request, user, token):
        """
        Overrides the default password reset URL generation

        This method is called by dj-rest-auth when sending password reset emails
        """
        # Get the password reset URL using our custom method
        password_reset_url = self.get_password_confirmation_url(request, user, token)

        # Return the URL
        return password_reset_url

    def render_mail(self, template_prefix, email, context):
        """
        Override the render_mail method to modify the context for password reset emails

        This ensures the password_reset_url is correctly set in the email template
        """
        # Check if this is a password reset email
        if template_prefix == 'account/email/password_reset_key':
            # If the user is in the context, generate a password reset URL
            if 'user' in context:
                user = context['user']
                # Generate a token for the user
                token = default_token_generator.make_token(user)
                # Get the password reset URL
                password_reset_url = self.get_password_confirmation_url(None, user, token)
                # Update the context with the custom URL
                context['password_reset_url'] = password_reset_url
                print(f"Set password_reset_url in email context: {password_reset_url}")

        # Call the parent method to render the email
        return super().render_mail(template_prefix, email, context)
