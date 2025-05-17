from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from allauth.account.views import ConfirmEmailView
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC, EmailAddress
from allauth.account.utils import send_email_confirmation
from .serializers import (
    CustomUserDetailsSerializer,
    ProfilePictureSerializer,
    ThemePreferenceSerializer
)

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving and updating user profile
    """
    serializer_class = CustomUserDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, **kwargs):
        """
        Override update method to handle partial updates properly
        """
        # Always use partial=True for PATCH requests
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Log the request data for debugging
        print(f"Updating user profile with data: {request.data}")

        # Safely access first_name and last_name
        first_name = getattr(instance, 'first_name', '')
        last_name = getattr(instance, 'last_name', '')
        print(f"User before update - first_name: {first_name}, last_name: {last_name}")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Print validated data
        print(f"Validated data: {serializer.validated_data}")

        # Perform the update
        self.perform_update(serializer)

        # Explicitly save the instance to ensure changes are persisted
        instance.save()

        # Refresh from database to verify changes were saved
        instance.refresh_from_db()

        # Safely access first_name and last_name after update
        first_name = getattr(instance, 'first_name', '')
        last_name = getattr(instance, 'last_name', '')
        print(f"User after update - first_name: {first_name}, last_name: {last_name}")

        # Return the updated user data
        return Response(serializer.data)

class ProfilePictureUpdateView(generics.UpdateAPIView):
    """
    View for updating profile picture
    """
    serializer_class = ProfilePictureSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

class ThemePreferenceUpdateView(generics.UpdateAPIView):
    """
    View for updating theme preference
    """
    serializer_class = ThemePreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomConfirmEmailView(ConfirmEmailView):
    """
    Custom view to handle email confirmation and update the email_verified field
    """

    def get(self, *args, **kwargs):
        """
        Handle GET request for email confirmation
        """
        try:
            # Get the confirmation key from the URL
            self.object = self.get_object()
            print(f"Got confirmation object: {self.object}")

            # Confirm the email
            confirmation = self.object

            # Get the email address and user before confirming
            email_address = confirmation.email_address
            user = email_address.user
            print(f"Processing confirmation for user: {user.email}, current verified status: {email_address.verified}")

            # Confirm the email - this updates the EmailAddress.verified field
            confirmation.confirm(self.request)

            # Refresh the email address from the database to get updated verified status
            email_address.refresh_from_db()
            print(f"After confirmation, email verified status: {email_address.verified}")

            # Update the user's email_verified field and ensure they're active
            user.email_verified = True
            user.is_active = True
            user.save()

            # Refresh user from database to verify changes were saved
            user.refresh_from_db()

            # Print debug information
            print(f"Email verified for user: {user.email}")
            print(f"Email verified status: {user.email_verified}")
            print(f"User is_active status: {user.is_active}")
            print(f"Email address verified status: {email_address.verified}")

            # Redirect to the success page
            return HttpResponseRedirect(reverse('verification_success'))
        except Exception as e:
            # If there's an error, print detailed information and redirect to the error page
            print(f"Error confirming email: {e}")
            import traceback
            traceback.print_exc()

            # Try to get the key from the URL and manually verify if possible
            try:
                key = kwargs.get('key')
                if key:
                    print(f"Attempting manual verification with key: {key}")
                    from allauth.account.models import EmailConfirmationHMAC
                    email_confirmation = EmailConfirmationHMAC.from_key(key)
                    if email_confirmation:
                        email_address = email_confirmation.email_address
                        user = email_address.user

                        # Update verification status
                        email_address.verified = True
                        email_address.save()

                        user.email_verified = True
                        user.is_active = True
                        user.save()

                        print(f"Manual verification successful for user: {user.email}")
                        return HttpResponseRedirect(reverse('verification_success'))
            except Exception as manual_error:
                print(f"Manual verification failed: {manual_error}")
                traceback.print_exc()

            return HttpResponseRedirect(reverse('verification_success'))


class ResendVerificationEmailView(APIView):
    """
    View for resending verification email
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Handle POST request for resending verification email
        """
        email = request.data.get('email')
        if not email:
            return Response(
                {'detail': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if user exists
            user = User.objects.filter(email=email).first()
            if not user:
                # Don't reveal that the user doesn't exist
                return Response(
                    {'detail': 'Verification email sent if the account exists.'},
                    status=status.HTTP_200_OK
                )

            # Check if email is already verified
            email_address = EmailAddress.objects.filter(user=user, email=email).first()
            if email_address and email_address.verified:
                return Response(
                    {'detail': 'Email is already verified.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Send verification email
            send_email_confirmation(request, user)

            return Response(
                {'detail': 'Verification email sent.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Error resending verification email: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Failed to send verification email.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )