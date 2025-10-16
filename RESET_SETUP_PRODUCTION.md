# Reset Production Setup - Run Setup From Scratch

## What Was Changed

Modified `docker-compose.prod.yml` to **add** `SETUP_REQUIRED=true`, which explicitly forces the admin dashboard to show the setup page and require initial configuration.

## Before Deployment

### Check Your Server's `.env.admin` File

SSH into your production server and ensure the `.env.admin` file does **NOT** contain:
```bash
SETUP_COMPLETED=true
```

If it does, remove that line:
```bash
# SSH to your server
ssh your-server

# Edit the .env.admin file
nano /path/to/.env.admin
# or
vim /path/to/.env.admin

# Remove or comment out this line:
# SETUP_COMPLETED=true

# Save and exit
```

## What Will Happen After Deployment

1. **First visit** to `https://admin.digimall.ng` will redirect to `/setup`
2. **Setup page** will be shown
3. You'll create the **first super admin account**
4. After completion, the system will check the backend to verify admin exists

## Setup Process

### Step 1: Access Setup Page
Navigate to: `https://admin.digimall.ng`
- Should automatically redirect to `https://admin.digimall.ng/setup`

### Step 2: Create Super Admin
Fill in the setup form:
```
First Name: [Your first name]
Last Name: [Your last name]
Email: [Your admin email]
Password: [Strong password]
Confirm Password: [Same password]
Setup Token: DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5
```

### Step 3: Submit
- Click "Complete Setup"
- System will create the super admin in the backend
- You'll be redirected to login page

### Step 4: Login
- Use your email and password to login
- Access the admin dashboard

## Backend Requirements

Make sure your backend API is running and accessible:
- URL: `https://api.digimall.ng`
- Endpoint: `POST /api/v1/staff/setup/initialize`
- Should accept the setup token and create the first admin

## Verification

After setup completes, verify:

```bash
# Check if admin was created in backend
curl -X POST https://api.digimall.ng/api/v1/staff/setup/verify-setup \
  -H "Content-Type: application/json"

# Should return:
# {"setupRequired": false, "message": "Setup complete"}
```

## After Setup is Complete - Disable Setup Mode

Once you've successfully created your admin account:

1. **Edit docker-compose.prod.yml**:
```yaml
environment:
  - NODE_ENV=production
  - PORT=4300
  # - SETUP_REQUIRED=true  # Comment out or remove this line
  - SETUP_COMPLETED=true   # Add this line
```

2. **OR add to server's .env.admin**:
```bash
SETUP_COMPLETED=true
# Make sure SETUP_REQUIRED is NOT set or is set to false
```

3. **Redeploy**:
```bash
# Your pipeline will pick up the change
git add docker-compose.prod.yml
git commit -m "chore: disable setup mode after completion"
git push origin main
```

## Troubleshooting

### Setup page not showing?
- Check logs: `docker logs digimall-admin`
- Verify SETUP_COMPLETED is not set: `docker exec digimall-admin env | grep SETUP`

### Backend connection failed?
- Ensure `https://api.digimall.ng` is accessible
- Check backend logs for the `/api/v1/staff/setup/initialize` endpoint
- Verify CORS settings allow requests from `admin.digimall.ng`

### Setup token invalid?
- The default token is: `DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5`
- This should match what's configured in your backend
- Check backend environment variables

## Important Security Notes

1. **Setup token** should be kept secret
2. After first admin is created, the setup endpoint should be disabled in backend
3. Consider changing the setup token after initial setup
4. Use strong passwords for admin accounts

## Commit This Change

```bash
git add docker-compose.prod.yml
git commit -m "chore: enable setup from scratch in production"
git push origin main
```

Your pipeline will:
1. Build new image
2. Deploy with setup enabled
3. Redirect to /setup on first access

---

**Status**: Ready to deploy with setup enabled  
**Action Required**: Push this commit to trigger deployment

