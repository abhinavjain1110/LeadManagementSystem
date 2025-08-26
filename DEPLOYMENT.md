# Deployment Configuration Guide

## Frontend (Vercel) Environment Variables

Add these environment variables in your Vercel project settings:

### Required Environment Variables:
- `REACT_APP_API_URL`: `https://leadmanagementsystem-production.up.railway.app`

### How to Set Environment Variables in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variable with:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://leadmanagementsystem-production.up.railway.app`
   - **Environment**: Production (and Preview if needed)

## Backend (Railway) Environment Variables

Make sure these environment variables are set in your Railway project:

### Required Environment Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time (e.g., `7d`)
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://lead-management-system-two.vercel.app`)

## Troubleshooting 401 Errors

If you're still getting 401 errors:

1. **Check CORS Configuration**: Ensure your frontend URL is in the allowed origins list in `backend/server.js`
2. **Verify Environment Variables**: Make sure `REACT_APP_API_URL` is set correctly in Vercel
3. **Check Network Tab**: Open browser dev tools and check the Network tab to see the exact request failing
4. **Verify Backend Health**: Test your backend directly: `https://leadmanagementsystem-production.up.railway.app/api/health`

## Common Issues:

1. **Missing Environment Variable**: If `REACT_APP_API_URL` is not set, the frontend will use the fallback URL
2. **CORS Issues**: Make sure your frontend domain is in the allowed origins
3. **Cookie Issues**: Ensure `secure: true` and `sameSite: 'none'` are set for production
4. **Network Issues**: Check if Railway service is running and accessible
