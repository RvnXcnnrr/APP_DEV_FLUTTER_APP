from django.shortcuts import render

def verification_success(request):
    """
    View for email verification success page
    """
    return render(request, 'verification_success.html')
