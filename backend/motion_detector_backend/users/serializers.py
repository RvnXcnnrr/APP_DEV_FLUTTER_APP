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

        # Safely access validated_data with null check
        validated_data = getattr(self, 'validated_data', {})
        first_name = validated_data.get('first_name', '') if validated_data else ''
        last_name = validated_data.get('last_name', '') if validated_data else ''

        data.update({
            'first_name': first_name,
            'last_name': last_name,
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
        if getattr(app_settings, "UNIQUE_EMAIL", False):
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
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name',
                  'profile_picture', 'theme_preference', 'email_verified')
        read_only_fields = ('email', 'email_verified')

    def update(self, instance, validated_data):
        """
        Override update method to handle first_name and last_name properly
        """
        print(f"CustomUserDetailsSerializer.update() called with validated_data: {validated_data}")

        # Safely get current values
        current_first_name = getattr(instance, 'first_name', '')
        current_last_name = getattr(instance, 'last_name', '')

        # Update first_name and last_name if provided
        if 'first_name' in validated_data:
            print(f"Updating first_name from '{current_first_name}' to '{validated_data['first_name']}'")
            instance.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            print(f"Updating last_name from '{current_last_name}' to '{validated_data['last_name']}'")
            instance.last_name = validated_data.pop('last_name')

        # Update other fields
        instance = super().update(instance, validated_data)

        # Save the instance
        print(f"Saving instance with first_name='{getattr(instance, 'first_name', '')}', last_name='{getattr(instance, 'last_name', '')}'")
        instance.save()

        # Verify the changes were saved
        print(f"After save: first_name='{getattr(instance, 'first_name', '')}', last_name='{getattr(instance, 'last_name', '')}'")

        return instance

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
