from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from django.contrib.auth import get_user_model
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email

User = get_user_model()

class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer that includes first_name and last_name
    """
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        })
        return data

    # Completely override the validate_email method to avoid calling parent's implementation
    def validate_email(self, email):
        from django.core.validators import validate_email as email_validator
        from django.core.exceptions import ValidationError
        from allauth.account.models import EmailAddress
        from allauth.account import app_settings

        # Basic email validation
        try:
            email_validator(email)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

        # Check if email is already in use
        if app_settings.UNIQUE_EMAIL:
            if User.objects.filter(email__iexact=email).exists():
                # Check if the email is verified
                if EmailAddress.objects.filter(email__iexact=email, verified=True).exists():
                    raise serializers.ValidationError(
                        "A user is already registered with this email address."
                    )

        return email

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user.first_name = self.cleaned_data.get('first_name')
        user.last_name = self.cleaned_data.get('last_name')
        user.save()
        adapter.save_user(request, user, self)
        setup_user_email(request, user, [])
        return user

class CustomUserDetailsSerializer(UserDetailsSerializer):
    """
    Custom user details serializer that includes profile_picture, theme_preference, and email_verified
    """
    profile_picture = serializers.ImageField(required=False)
    theme_preference = serializers.CharField(required=False)
    email_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name',
                  'profile_picture', 'theme_preference', 'email_verified')
        read_only_fields = ('email', 'email_verified')

class ProfilePictureSerializer(serializers.ModelSerializer):
    """
    Serializer for updating profile picture
    """
    class Meta:
        model = User
        fields = ('profile_picture',)

class ThemePreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for updating theme preference
    """
    class Meta:
        model = User
        fields = ('theme_preference',)
