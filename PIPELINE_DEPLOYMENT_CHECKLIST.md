# Pipeline Deployment Checklist

## Pre-Deployment (Done ✅)

- [x] Fixed middleware fetch failures
- [x] Fixed React Hooks order in dashboard
- [x] Added SETUP_COMPLETED environment variable
- [x] Updated docker-compose.prod.yml

## Required Environment Variables

Ensure these are set in your deployment environment (server or pipeline secrets):

```env
# Core
NODE_ENV=production
PORT=4300

# Setup Control
SETUP_COMPLETED=true

# Your existing variables
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://admin.digimall.ng
NEXT_PUBLIC_API_URL=https://api.digimall.ng
# ... (all other existing env vars)
```

## Deployment Steps (Automated by Pipeline)

Your pipeline should:

1. ✅ Checkout code
2. ✅ Build Docker image
3. ✅ Push to registry
4. ✅ Deploy using docker-compose.prod.yml
5. ✅ Health check

## Post-Deployment Verification

After pipeline completes:

### 1. Check Container Status
```bash
docker ps | grep digimall-admin
```
Should show container running

### 2. Check Logs (No Errors)
```bash
docker logs digimall-admin --tail 50
```
Should NOT show: "Middleware setup check failed: Error: fetch failed"

### 3. Test Login Page
Open: `https://admin.digimall.ng/auth/login`
Should load without redirects to /setup

### 4. Test Authentication
Login with admin credentials - should work

## If Issues Occur

### Issue: Still redirecting to /setup
**Fix**: Check that `SETUP_COMPLETED=true` is set in environment

### Issue: Login not working
**Fix**: Check NEXTAUTH_SECRET and NEXTAUTH_URL are correct

### Issue: Container not starting
**Fix**: Check docker logs for specific errors

## Quick Commands

```bash
# View logs
docker logs -f digimall-admin

# Check environment
docker exec digimall-admin env | grep SETUP

# Restart container
docker-compose -f docker-compose.prod.yml restart

# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Files Modified in This Fix

```
src/middleware.ts                  # Removed fetch calls
src/app/dashboard/page.tsx         # Fixed hooks order
docker-compose.prod.yml            # Added SETUP_COMPLETED
```

## Commit & Push

```bash
git add src/middleware.ts src/app/dashboard/page.tsx docker-compose.prod.yml
git commit -m "fix: resolve production middleware and dashboard issues"
git push origin main
```

Your pipeline will handle the rest! 🚀

