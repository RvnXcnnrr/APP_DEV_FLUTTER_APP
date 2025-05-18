# Netlify Deployment Fixes - Part 2

This document explains the additional fixes made to address CORS issues with custom headers and mixed content warnings in the Netlify deployment.

## Issues Fixed

1. **CORS Error with Custom Headers**: The `x-device-owner` header was causing CORS preflight errors:
   ```
   Access to fetch at 'https://app-dev-flutter-app.onrender.com/api/sensors/motion-events/' from origin 'https://motiondetectorappdev.netlify.app' has been blocked by CORS policy: Request header field x-device-owner is not allowed by Access-Control-Allow-Headers in preflight response.
   ```

2. **Mixed Content Warning**: Profile images were being loaded over HTTP instead of HTTPS:
   ```
   Mixed Content: The page at 'https://motiondetectorappdev.netlify.app/dashboard' was loaded over HTTPS, but requested an insecure element 'http://app-dev-flutter-app.onrender.com/media/profile_pictures/34.jpg'.
   ```

## Changes Made

### 1. Fixed CORS Issues with Custom Headers

Modified `ApiService.js` to conditionally add custom headers based on the deployment environment:

```javascript
// For Netlify deployment, don't add custom headers that might cause CORS issues
if (!window.location.hostname.includes('netlify')) {
  // Add additional headers to help with authentication
  headers['X-Device-Owner'] = 'true';
  console.debug('Added device owner header for special device');
} else {
  console.debug('Skipping device owner header for Netlify deployment to avoid CORS issues');
}
```

This change prevents the `X-Device-Owner` header from being added when the app is running on Netlify, which avoids the CORS preflight error.

### 2. Fixed Mixed Content Warnings

Updated the `User` model to ensure profile image URLs always use HTTPS:

```javascript
// Ensure profile image URL uses HTTPS
if (profileImageUrl && profileImageUrl.startsWith('http:')) {
  this.profileImageUrl = profileImageUrl.replace('http:', 'https:');
  console.debug('Converted profile image URL from HTTP to HTTPS');
} else {
  this.profileImageUrl = profileImageUrl;
}
```

Also updated the `fromJson` method to ensure HTTPS URLs when creating a user from JSON data:

```javascript
// Get profile image URL
let profileImageUrl = json.profile_picture || json.profileImageUrl || null;

// Ensure profile image URL uses HTTPS
if (profileImageUrl && profileImageUrl.startsWith('http:')) {
  profileImageUrl = profileImageUrl.replace('http:', 'https:');
  console.debug('Converted profile image URL from HTTP to HTTPS in fromJson');
}
```

## Why These Changes Work

1. **CORS Fix**: By conditionally adding the custom header only in non-Netlify environments, we avoid the CORS preflight error while still maintaining the functionality in local development.

2. **Mixed Content Fix**: By automatically converting HTTP URLs to HTTPS, we ensure that all content is loaded securely, which prevents mixed content warnings in the browser.

## Testing

After deploying these changes, you should:

1. Test logging in from the Netlify deployment
2. Verify that motion events can be fetched without CORS errors
3. Check that profile images load correctly without mixed content warnings
4. Test the device ownership functionality to ensure it still works correctly

## Long-Term Solution

While these changes allow the app to work immediately, the proper long-term solution would be to update the backend's CORS settings:

1. Add the Netlify domain to the `CORS_ALLOWED_ORIGINS` list
2. Add the `X-Device-Owner` header to the `CORS_ALLOW_HEADERS` list

This would allow the frontend to use the custom headers without causing CORS errors.
