# Netlify Deployment Guide

This guide provides step-by-step instructions for deploying the Motion Detector React app to Netlify.

## Deployment Steps

1. **Log in to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Log in with your credentials

2. **Create a New Site**
   - Click "Add new site" > "Import an existing project"
   - Connect to your Git provider (GitHub, GitLab, etc.)
   - Select the repository containing the Motion Detector app

3. **Configure Build Settings**
   - **Team**: Burger town
   - **Project name**: motiondetectorappdev
   - **Branch to deploy**: main
   - **Base directory**: web_app/motion-detector-react
   - **Build command**: npm run build
   - **Publish directory**: dist
   - **Functions directory**: netlify/functions

4. **Set Environment Variables**
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     - `VITE_API_BASE_URL`: https://app-dev-flutter-app.onrender.com
     - `VITE_WS_BASE_URL`: wss://app-dev-flutter-app.onrender.com/ws/sensors/

5. **Deploy the Site**
   - Click "Deploy site"
   - Wait for the build and deployment to complete

6. **Verify Deployment**
   - Once deployment is complete, click on the generated URL (https://motiondetectorappdev.netlify.app)
   - Verify that the app loads correctly and functions as expected

## Troubleshooting

If you encounter issues during deployment:

1. **Check Build Logs**
   - Go to Deploys > [Latest Deploy] > View summary
   - Review the build logs for any errors

2. **CORS Issues**
   - If you encounter CORS errors, verify that the backend at https://app-dev-flutter-app.onrender.com has the correct CORS headers
   - Check that the `_headers` file in the `public` directory is being deployed correctly

3. **Routing Issues**
   - If routes like /dashboard or /profile return 404 errors, verify that the `netlify.toml` file is correctly configured with the redirect rule

4. **API Connection Issues**
   - Verify that the environment variables are correctly set
   - Check the browser console for any API connection errors

## Updating the Deployment

To update the deployed site:

1. Push changes to the main branch of your repository
2. Netlify will automatically detect the changes and trigger a new build and deployment

## Manual Deployment

If you need to manually trigger a deployment:

1. Go to the Netlify dashboard
2. Select your site
3. Go to Deploys
4. Click "Trigger deploy" > "Deploy site"
