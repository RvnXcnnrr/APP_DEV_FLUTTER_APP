from django.urls import path
from .views import (
    UserProfileView,
    ProfilePictureUpdateView,
    ThemePreferenceUpdateView,
    ResendVerificationEmailView
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/picture/', ProfilePictureUpdateView.as_view(), name='profile-picture-update'),
    path('profile/theme/', ThemePreferenceUpdateView.as_view(), name='theme-preference-update'),
    path('resend-verification-email/', ResendVerificationEmailView.as_view(), name='resend-verification-email'),
]
