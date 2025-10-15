# Setup Endpoints Implementation

## Overview
Created missing setup endpoints in the unified DigiMall backend to enable first-time super admin creation and setup verification for the admin panel.

## Changes Made

### 1. Backend Changes (digimall-backend)

#### Created DTO
**File:** `src/modules/admin/staff/dto/create-super-admin.dto.ts`
- Validates super admin creation data
- Enforces strong password requirements (uppercase, lowercase, number, special character)
- Requires setup token for security
- Fields: `firstName`, `lastName`, `email`, `password`, `setupToken`

#### Service Methods
**File:** `src/modules/admin/staff/services/staff.service.ts`
- Added `createSuperAdmin()` method:
  - Validates setup token
  - Ensures only one super admin can be created via setup
  - Checks for email conflicts
  - Hashes password securely
  - Creates super admin with full permissions (`role: 'super_admin'`, `permissions: ['*']`)
  - Logs critical activity

- Added `verifySetup()` method:
  - Checks if any super admin exists
  - Returns setup status and super admin count
  - Used by frontend to determine if setup page should be shown

#### Controller Endpoints
**File:** `src/modules/admin/staff/controllers/staff.controller.ts`
- `POST /api/v1/staff/setup/create-super-admin`
  - Public endpoint (no authentication required)
  - Creates first super admin account
  - Requires valid setup token
  - Returns user details (without password)

- `POST /api/v1/staff/setup/verify-setup`
  - Public endpoint (no authentication required)
  - Checks if initial setup is complete
  - Returns `setupRequired` boolean and super admin count

### 2. Frontend Changes (project-digimall-admin)

#### Environment Configuration
**File:** `.env`
- Updated `NEXT_PUBLIC_BACKEND_URL` from `http://localhost:3000` → `http://localhost:4000`
- Updated `NEXT_PUBLIC_WS_URL` from `ws://localhost:3000` → `ws://localhost:4000`
- **Reason:** Port 3000 runs the admin frontend, port 4000 runs the unified backend

#### No Code Changes Required
All existing setup routes in the admin frontend are already configured correctly:
- `/src/app/api/setup/super-admin/route.ts` - Proxies to backend setup endpoint
- `/src/app/api/setup/check/route.ts` - Checks setup status
- `/src/app/setup/page.tsx` - Setup UI form

## API Endpoints

### Create Super Admin
```http
POST /api/v1/staff/setup/create-super-admin
Content-Type: application/json

{
  "email": "admin@digimall.ng",
  "password": "SecurePassword123!",
  "firstName": "Super",
  "lastName": "Admin",
  "setupToken": "DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "user": {
    "id": "68e3fbe834ca46ef9d41e1b9",
    "email": "admin@digimall.ng",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "super_admin"
  }
}
```

**Error Responses:**
- `401` - Invalid setup token
- `409` - Super admin already exists or email already in use

### Verify Setup Status
```http
POST /api/v1/staff/setup/verify-setup
```

**Response (201):**
```json
{
  "setupRequired": true,
  "message": "No super admin found. Please complete initial setup.",
  "superAdminCount": 0
}
```

or

```json
{
  "setupRequired": false,
  "message": "Setup already completed.",
  "superAdminCount": 1
}
```

## Security Features

1. **Setup Token Validation**
   - Prevents unauthorized super admin creation
   - Token stored in backend environment variables
   - Default: `DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5`

2. **One-Time Setup**
   - Setup can only be performed once
   - Subsequent attempts return 409 Conflict
   - Prevents privilege escalation attacks

3. **Password Requirements**
   - Minimum 8 characters
   - Must contain uppercase letter
   - Must contain lowercase letter
   - Must contain number
   - Must contain special character

4. **Activity Logging**
   - Critical severity logging for super admin creation
   - Tracks email and timestamp (setup token redacted)
   - Audit trail for compliance

## Testing

All endpoints have been tested and verified:

### ✅ Verify Setup (No Super Admin)
```bash
curl -X POST http://localhost:4000/api/v1/staff/setup/verify-setup
# Returns: setupRequired: true
```

### ✅ Create Super Admin
```bash
curl -X POST http://localhost:4000/api/v1/staff/setup/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@digimall.ng",
    "password": "Admin@123",
    "firstName": "Super",
    "lastName": "Admin",
    "setupToken": "DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5"
  }'
# Returns: 201 Created
```

### ✅ Verify Setup (Super Admin Exists)
```bash
curl -X POST http://localhost:4000/api/v1/staff/setup/verify-setup
# Returns: setupRequired: false, superAdminCount: 1
```

### ✅ Prevent Duplicate Setup
```bash
curl -X POST http://localhost:4000/api/v1/staff/setup/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{...}'
# Returns: 409 Conflict - "Super admin already exists"
```

### ✅ Login with Super Admin
```bash
curl -X POST http://localhost:4000/api/v1/staff/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@digimall.ng",
    "password": "Admin@123"
  }'
# Returns: 201 Created with accessToken, refreshToken, and staff details
```

## Integration Flow

1. **User visits admin panel** → `http://localhost:3300`
2. **Frontend checks setup status** → `GET /api/setup/check`
   - Internally calls → `POST /api/v1/staff/setup/verify-setup`
3. **If setup required** → Redirect to `/setup` page
4. **User fills form** → Submits to `POST /api/setup/super-admin`
   - Internally calls → `POST /api/v1/staff/setup/create-super-admin`
5. **On success** → Redirect to login page
6. **User logs in** → `POST /api/v1/staff/auth/login`
7. **Access granted** → Dashboard with super_admin privileges

## Database Schema

The super admin is stored in MongoDB collection `staffs` with the following structure:

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (lowercase, unique),
  password: String (bcrypt hashed),
  role: 'super_admin',
  status: 'active',
  permissions: ['*'],
  twoFactorEnabled: false,
  emailVerified: true,
  loginAttempts: 0,
  sessions: [],
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

### Backend (.env)
```bash
# Setup Token
SETUP_TOKEN=DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5
# or
ADMIN_SETUP_TOKEN=DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5

# MongoDB
MONGODB_URI=mongodb://localhost:27017/digimall_db
```

### Frontend (.env)
```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Setup Token (for frontend validation)
SETUP_TOKEN=DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5
```

## Production Deployment

### Backend
1. Set secure `SETUP_TOKEN` environment variable
2. Ensure MongoDB connection string is correct
3. Backend should be accessible at `https://api.digimall.ng`

### Frontend
1. Update `NEXT_PUBLIC_BACKEND_URL=https://api.digimall.ng`
2. Update `NEXT_PUBLIC_WS_URL=wss://api.digimall.ng`
3. Ensure setup token matches backend

## Files Modified

### Backend (digimall-backend)
- ✅ `src/modules/admin/staff/dto/create-super-admin.dto.ts` (created)
- ✅ `src/modules/admin/staff/services/staff.service.ts` (modified)
- ✅ `src/modules/admin/staff/controllers/staff.controller.ts` (modified)

### Frontend (project-digimall-admin)
- ✅ `.env` (modified - updated backend port)
- ℹ️ No code changes required - existing routes already compatible

## Next Steps

1. **Frontend Testing:** Navigate to `http://localhost:3300` and test complete setup flow
2. **Documentation:** Update API documentation with new setup endpoints
3. **Production:** Deploy backend and frontend with production environment variables

## Notes

- Setup endpoints are intentionally public (no authentication) to allow initial setup
- After setup is complete, these endpoints return 409 Conflict
- Super admin has full permissions (`['*']`) and can create other staff members
- The backend is running on port 4000, not 3000 (which runs the frontend)

---

**Last Updated:** January 2025
**Status:** ✅ Complete and Tested
