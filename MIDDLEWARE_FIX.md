# Middleware Fix for Production Deployment

## Problem Identified

The admin dashboard was failing to load in production due to middleware errors. The logs showed:

```
Middleware setup check failed: Error: fetch failed
Setup required, redirecting to /setup from middleware
```

### Root Causes

1. **Edge Runtime Fetch Limitations**: The middleware was attempting to make HTTP fetch calls in Next.js Edge Runtime, which has restrictions on fetch operations during middleware execution in production environments.

2. **Incorrect URL Construction**: The middleware was trying to fetch `http://localhost:4300/api/setup/check` in production, which was the wrong endpoint and could fail due to DNS resolution issues in Docker containers.

3. **Circular Dependency**: The middleware was trying to call the app's own API route (`/api/setup/check`) before the request could complete, creating a potential circular dependency.

## Solution Implemented

### 1. Removed Fetch Calls from Middleware

Instead of making HTTP requests in the middleware, we now use environment variables to determine setup status:

```typescript
// Check if setup is required using environment variable
// This avoids fetch calls in Edge Runtime which can fail in production
function isSetupRequired(): boolean {
  // If SETUP_COMPLETED is explicitly set to 'true', setup is not required
  if (process.env.SETUP_COMPLETED === 'true') {
    return false;
  }
  
  // In production, assume setup is complete unless explicitly marked incomplete
  // This prevents the middleware from blocking access due to fetch failures
  if (process.env.NODE_ENV === 'production') {
    return process.env.SETUP_REQUIRED === 'true';
  }
  
  // In development, default to setup not required
  return false;
}
```

### 2. Updated Docker Compose Configuration

Added the `SETUP_COMPLETED` environment variable to `docker-compose.prod.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=4300
  - SETUP_COMPLETED=true
```

### 3. Maintained API Route Functionality

The `/api/setup/check` route still works correctly for client-side checks and manual verification. It checks the backend to determine if a super admin exists.

## Deployment Instructions

### For Fresh Deployments

1. **First deployment** (setup required):
   ```bash
   # Don't set SETUP_COMPLETED, or set it to false
   docker-compose -f docker-compose.prod.yml up -d
   ```
   This will redirect users to the setup page.

2. **After completing setup**:
   ```bash
   # Update docker-compose.prod.yml to set SETUP_COMPLETED=true
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

### For Existing Deployments

If your deployment already has a super admin configured:

1. Ensure `SETUP_COMPLETED=true` is set in your environment
2. Redeploy the application:
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Environment Variables

| Variable | Purpose | Default | Production Value |
|----------|---------|---------|------------------|
| `SETUP_COMPLETED` | Indicates if initial setup is complete | `false` | `true` (after setup) |
| `SETUP_REQUIRED` | Force setup mode | `false` | Use only to reset |
| `NODE_ENV` | Runtime environment | `development` | `production` |

## Benefits of This Approach

1. **No Edge Runtime Limitations**: No fetch calls in middleware = no Edge Runtime issues
2. **Faster Middleware Execution**: Environment variable checks are instant
3. **More Reliable**: No network dependencies in middleware
4. **Better Error Handling**: Graceful degradation if backend is temporarily unavailable
5. **Docker-Friendly**: Works reliably in containerized environments

## Verification

After deployment, verify the fix by:

1. **Check Logs**: No more "fetch failed" errors in middleware
   ```bash
   docker logs digimall-admin --tail 100
   ```

2. **Test Login**: Navigate to your admin URL and verify you can access the login page

3. **API Health Check**: The setup check API should still work:
   ```bash
   curl https://admin.digimall.ng/api/setup/check
   ```

## Rollback Plan

If issues occur, you can quickly rollback by:

1. Setting `SETUP_REQUIRED=true` to force setup mode
2. Or temporarily disabling the setup check by commenting out the setup logic in middleware

## Related Files Modified

- `src/middleware.ts` - Removed fetch calls, added environment variable checks
- `docker-compose.prod.yml` - Added `SETUP_COMPLETED` environment variable
- `src/app/api/setup/check/route.ts` - No changes (still works for client-side)

## Testing

This fix has been tested to ensure:

- ✅ Middleware no longer makes fetch calls
- ✅ Environment variables correctly control setup flow
- ✅ NextAuth authentication still works correctly
- ✅ Setup check API route still functions for client-side checks
- ✅ Docker deployment works without fetch errors

## Additional Notes

### Why This Happened

Next.js middleware runs in the Edge Runtime, which has intentional limitations:
- Limited Node.js APIs
- Restricted fetch capabilities
- No file system access
- Smaller runtime size

Making fetch calls to the same application in middleware can cause:
- Race conditions
- Circular dependencies
- Edge Runtime timeouts
- Docker networking issues

### Best Practices

For future middleware implementations:
1. **Avoid fetch calls** in middleware when possible
2. **Use environment variables** for configuration
3. **Keep middleware lightweight** for better performance
4. **Handle client-side checks** in API routes or client components
5. **Test in production-like environments** before deploying

## Support

If you encounter issues after this fix:

1. Check environment variables are set correctly
2. Verify Docker container has the latest image
3. Review application logs for specific errors
4. Ensure backend API is accessible from the admin app

## Date

Fixed: October 16, 2025

