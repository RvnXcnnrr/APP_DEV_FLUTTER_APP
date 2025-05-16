#!/usr/bin/env python
"""
Script to add email_verified field to the User model
"""
import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motion_detector_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection
from django.db.models import BooleanField
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from allauth.account.models import EmailAddress

User = get_user_model()

def add_email_verified_field():
    """
    Add email_verified field to the User model if it doesn't exist
    """
    print("Checking if email_verified field exists in User model...")
    
    # Check if the field already exists
    if hasattr(User, 'email_verified'):
        print("email_verified field already exists in User model.")
        return
    
    # Add the field using raw SQL
    print("Adding email_verified field to User model...")
    with connection.cursor() as cursor:
        cursor.execute(
            "ALTER TABLE users_customuser ADD COLUMN email_verified BOOLEAN DEFAULT FALSE"
        )
    
    print("email_verified field added successfully.")
    
    # Update existing users based on EmailAddress verification status
    print("Updating existing users' email_verified status...")
    verified_emails = EmailAddress.objects.filter(verified=True)
    for email_address in verified_emails:
        user = email_address.user
        # Update using raw SQL since the model doesn't have the field yet
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE users_customuser SET email_verified = TRUE WHERE id = %s",
                [user.id]
            )
        print(f"Updated user {user.email} to email_verified=True")
    
    print("User email_verified status updated successfully.")
    print("Please restart the Django server for changes to take effect.")

def update_user_is_active():
    """
    Update is_active field for all users with verified emails
    """
    print("Updating is_active field for users with verified emails...")
    
    verified_emails = EmailAddress.objects.filter(verified=True)
    for email_address in verified_emails:
        user = email_address.user
        if not user.is_active:
            user.is_active = True
            user.save()
            print(f"Updated user {user.email} to is_active=True")
    
    print("User is_active status updated successfully.")

if __name__ == "__main__":
    try:
        add_email_verified_field()
        update_user_is_active()
        print("Script completed successfully.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
