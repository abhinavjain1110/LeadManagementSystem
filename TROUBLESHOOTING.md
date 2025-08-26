# Authentication Troubleshooting Guide

## Current Issues Fixed:

### 1. Cookie Configuration
- Updated cookie settings to work properly in production
- Added proper `sameSite` and `path` configurations
- Made cookies work across different domains

### 2. CORS Configuration
- Temporarily made CORS more permissive for debugging
- Added `Cookie` to allowed headers
- Enabled credentials

### 3. API Configuration
- All frontend components now use the correct backend URL
- Added comprehensive debugging logs
- Fixed axios configuration

## Testing Steps:

### 1. Test Backend Health
```bash
curl https://leadmanagementsystem-production.up.railway.app/api/health
```

### 2. Test Authentication Flow
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to login
4. Check the request/response for:
   - Cookie being set in response
   - Cookie being sent in subsequent requests

### 3. Check Environment Variables
Make sure these are set in Vercel:
- `REACT_APP_API_URL`: `https://leadmanagementsystem-production.up.railway.app`

Make sure these are set in Railway:
- `NODE_ENV`: `production`
- `JWT_SECRET`: (your secret)
- `MONGODB_URI`: (your MongoDB connection)

## Debug Information:

### Frontend Debug Logs
The frontend now logs:
- All API requests with full configuration
- Request headers and credentials settings
- Detailed error information

### Backend Debug Logs
The backend now logs:
- All incoming cookies
- Request headers
- Authentication attempts

## Common Issues and Solutions:

### 1. "Access denied. No token provided"
**Cause**: Cookie not being sent with request
**Solution**: 
- Check if `withCredentials: true` is set
- Verify cookie domain settings
- Check CORS configuration

### 2. CORS Errors
**Cause**: Frontend domain not allowed
**Solution**: 
- Temporarily using `origin: true` for debugging
- Check if your Vercel domain is in allowed origins

### 3. Cookie Not Set
**Cause**: Cookie configuration issues
**Solution**:
- Updated cookie settings for cross-domain
- Added proper `sameSite` and `secure` flags

## Next Steps:

1. **Deploy the updated backend** to Railway
2. **Set the environment variable** in Vercel
3. **Redeploy the frontend** to Vercel
4. **Test the authentication flow**
5. **Check browser dev tools** for any remaining issues

## Testing URLs:

- Frontend: Your Vercel URL
- Backend Health: `https://leadmanagementsystem-production.up.railway.app/api/health`
- Test Auth: `https://leadmanagementsystem-production.up.railway.app/api/test-auth` (requires login)

## Browser Testing:

1. Open browser dev tools
2. Go to Application tab
3. Check Cookies section
4. Verify the `token` cookie is present after login
5. Check if cookie is being sent with requests
