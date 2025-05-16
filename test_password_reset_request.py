import requests
import json

# Base URL of your Django server
BASE_URL = 'http://localhost:8000'

# Email to test with
email = 'test@example.com'

# Send password reset request
print(f"Sending password reset request for email: {email}")
response = requests.post(
    f"{BASE_URL}/api/auth/password/reset/",
    json={"email": email}
)

# Print response
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("Password reset email sent successfully!")
    print("Check your email or the Django console for the reset link.")
else:
    print("Failed to send password reset email.")
