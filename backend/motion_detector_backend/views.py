from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib import messages
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

User = get_user_model()

def verification_success(request):
    """
    View for email verification success page
    """
    return render(request, 'verification_success.html')

def password_reset_confirm(request, uidb64, token):
    """
    View for password reset confirmation

    This view handles both GET and POST requests:
    - GET: Shows the password reset form
    - POST: Processes the form submission and resets the password
    """
    try:
        # Decode the user id
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)

        # Check if the token is valid
        if default_token_generator.check_token(user, token):
            if request.method == 'POST':
                # Get the new password from the form
                password = request.POST.get('password')
                password_confirm = request.POST.get('password_confirm')

                # Validate the passwords
                if not password or not password_confirm:
                    return render(request, 'password_reset_confirm.html', {
                        'validlink': True,
                        'error': 'Please enter both passwords.',
                        'uidb64': uidb64,
                        'token': token
                    })

                if password != password_confirm:
                    return render(request, 'password_reset_confirm.html', {
                        'validlink': True,
                        'error': 'Passwords do not match.',
                        'uidb64': uidb64,
                        'token': token
                    })

                # Set the new password
                user.set_password(password)
                user.save()

                # Show success message
                return render(request, 'password_reset_complete.html')
            else:
                # Show the password reset form
                return render(request, 'password_reset_confirm.html', {
                    'validlink': True,
                    'uidb64': uidb64,
                    'token': token
                })
        else:
            # Invalid token
            return render(request, 'password_reset_confirm.html', {
                'validlink': False
            })
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        # Invalid user id
        return render(request, 'password_reset_confirm.html', {
            'validlink': False
        })

@csrf_exempt
def api_password_reset_confirm(request):
    """
    API view for password reset confirmation

    This view handles POST requests with JSON data:
    {
        "uid": "uidb64",
        "token": "token",
        "new_password1": "password",
        "new_password2": "password"
    }
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body)
        uidb64 = data.get('uid')
        token = data.get('token')
        password1 = data.get('new_password1')
        password2 = data.get('new_password2')

        # Validate the data
        if not all([uidb64, token, password1, password2]):
            return JsonResponse({'detail': 'Missing required fields.'}, status=400)

        if password1 != password2:
            return JsonResponse({'detail': 'Passwords do not match.'}, status=400)

        # Decode the user id
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)

        # Check if the token is valid
        if default_token_generator.check_token(user, token):
            # Set the new password
            user.set_password(password1)
            user.save()

            return JsonResponse({'detail': 'Password has been reset successfully.'})
        else:
            return JsonResponse({'detail': 'Invalid token.'}, status=400)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist, json.JSONDecodeError):
        return JsonResponse({'detail': 'Invalid data.'}, status=400)
