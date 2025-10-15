# Admin API Test Suite

## Overview
Comprehensive testing interface for all DigiMall admin endpoints. Test all API endpoints in one place before implementing them throughout the application.

## Access
Navigate to: **http://localhost:3300/api-test**

## Features

### 🎯 Key Capabilities
- ✅ Test all 100+ admin endpoints in one interface
- ✅ Visual color-coded responses (success/error)
- ✅ Automatic token management after login
- ✅ Real-time response display with JSON formatting
- ✅ Copy responses to clipboard
- ✅ Response time tracking
- ✅ Collapsible sections by module
- ✅ Authentication status indicator

### 🎨 Color Coding
- **Green**: Public endpoints (no auth required)
- **Blue**: ADMIN level endpoints
- **Red**: SUPER_ADMIN level endpoints
- **Purple**: Special actions
- **Orange**: Utility actions

## Test Sections

### 1. Setup & Authentication (Public)
- Verify Setup Status
- Staff Login (with credentials form)
- Logout
- Token management

### 2. Staff Management
- Get All Staff
- Get Staff Analytics
- Get Security Audit
- Get Role Permissions

### 3. Vendor Management
- Get All Vendors
- Get Vendor Statistics
- Get Pending Vendors

### 4. Product Management
- Get All Products
- Get Pending Products
- Get Product Statistics

### 5. Order Management
- Get All Orders
- Get Order Statistics
- Get Order Count

### 6. User Management
- Get All Users
- Get User Statistics

### 7. Analytics (9 endpoints)
- Dashboard Analytics
- User Analytics
- Vendor Analytics
- Product Analytics
- Order Analytics
- Revenue Analytics
- Category Analytics
- System Analytics
- Performance Analytics

### 8. System Management
- Get System Config
- System Health Check
- Get System Metrics
- Get Database Stats
- Clear Cache

### 9. Category Management
- Get Category Hierarchy
- Get Category Statistics

### 10. Security
- Get Security Events
- Get Security Alerts
- Get Audit Log
- Get Fraud Detection
- Get Login Analytics
- Get Blocked IPs

### 11. Subscription Management
- Get Subscription Plans

## Usage Instructions

### Quick Start
1. **Start Backend** (if not running):
   ```bash
   cd /Users/tanta/Projects/Web/WebstormProjects/digimall-backend
   pnpm dev
   ```

2. **Start Admin Frontend** (if not running):
   ```bash
   cd /Users/tanta/Projects/Web/WebstormProjects/project-digimall-apps/project-digimall-admin
   pnpm dev
   ```

3. **Navigate to test page**:
   ```
   http://localhost:3300/api-test
   ```

### Testing Flow

#### Step 1: Verify Setup
1. Click **"Verify Setup Status"** to check if super admin exists
2. If setup required, create super admin first (use `/setup` page)

#### Step 2: Login
1. Enter credentials in the form (default: `admin@digimall.ng` / `Admin@123`)
2. Click **"Staff Login"**
3. Watch for green "🟢 Authenticated" indicator at top
4. Token is automatically stored for all authenticated requests

#### Step 3: Test Endpoints
1. Open any section by clicking on it
2. Click individual test buttons
3. View responses in the right panel (Output Console)
4. Responses show:
   - Status code (color-coded)
   - Response time in milliseconds
   - Timestamp
   - Full JSON response
   - Copy button for each response

#### Step 4: Analyze Results
- ✅ Green status = endpoint working
- ❌ Red status = error (check response for details)
- 🟡 Yellow = warning/redirect
- Common errors:
  - `401` = Not authenticated or token expired
  - `403` = Insufficient permissions
  - `404` = Endpoint not found
  - `500` = Server error

## Console Features

### Output Console (Right Panel)
- **Dark theme** for better readability
- **Auto-scroll** to latest response
- **Response metadata**:
  - HTTP status code
  - Status text
  - Response time
  - Timestamp
- **JSON formatting** with syntax highlighting
- **Copy to clipboard** button per response
- **Clear all** button to reset console

## Authentication

### Token Management
- Token automatically captured on successful login
- Stored in component state (not persisted)
- Included in all authenticated requests
- Can be manually cleared using "Clear Token" button
- Login will auto-populate token from response

### Testing Without Auth
Public endpoints (green buttons) work without authentication:
- Verify Setup
- Staff Login
- System Health Check

### Testing With Auth
After logging in, all endpoints automatically include the Bearer token:
```
Authorization: Bearer <access_token>
```

## API Test Client

### Technical Details
The test client (`/lib/api/test-client.ts`) provides:
- Centralized API calling
- Automatic token injection
- Response standardization
- Error handling
- Performance timing
- TypeScript support

### Request Flow
```
Test Button Click
    ↓
API Test Client
    ↓
/api/proxy/[...path]
    ↓
Unified Backend (port 4000)
    ↓
Response Back to Console
```

## Components

### TestButton
Reusable button component with:
- Color variants (public, admin, super_admin, special, utility)
- Loading states
- Icons
- Disabled states

### TestSection
Collapsible section with:
- Title and description
- Expand/collapse animation
- Organized grouping of related tests

### OutputConsole
Response display with:
- Scrollable output area
- JSON formatting
- Status color coding
- Copy functionality
- Clear all button

## Common Test Scenarios

### Scenario 1: First-Time Setup
```
1. Verify Setup → setupRequired: true
2. Go to /setup page → Create super admin
3. Return to /api-test
4. Login with new credentials
5. Test authenticated endpoints
```

### Scenario 2: Daily Testing
```
1. Login with existing credentials
2. Test dashboard analytics
3. Test vendor list
4. Test product approvals
5. Test order statistics
```

### Scenario 3: Permission Testing
```
1. Login as ADMIN user
2. Test ADMIN endpoints (blue) → should work
3. Test SUPER_ADMIN endpoints (red) → should fail with 403
4. Document which endpoints require elevation
```

## Troubleshooting

### Backend Not Responding
**Error**: Network Error / Status 0
**Solution**:
```bash
# Check if backend is running
lsof -i :4000

# Start backend if not running
cd /Users/tanta/Projects/Web/WebstormProjects/digimall-backend
pnpm dev
```

### 401 Unauthorized
**Error**: Status 401
**Solution**:
- Click "Staff Login" to get new token
- Check if super admin exists
- Verify credentials are correct

### 404 Not Found
**Error**: Status 404
**Solution**:
- Endpoint might not be implemented yet
- Check backend controller for route definition
- Verify endpoint path in API_ENDPOINTS.md

### CORS Errors
**Error**: CORS policy blocked
**Solution**:
- Ensure backend CORS is configured for `http://localhost:3300`
- Check backend environment variables
- Restart backend if config changed

## Development

### Adding New Endpoints

1. **Add to API Test Client**:
```typescript
// src/lib/api/test-client.ts
async newEndpoint(params: any) {
  return this.request('GET', 'new/endpoint', params, true);
}
```

2. **Add Test Button**:
```tsx
<TestButton
  variant="admin"
  loading={loading === 'new-endpoint'}
  onClick={() => handleTest(() => apiTestClient.newEndpoint(), 'new-endpoint')}
>
  Test New Endpoint
</TestButton>
```

3. **Test and verify** in the console

### Customizing Test Data
Update `testData` state in page component:
```typescript
const [testData, setTestData] = useState({
  email: 'your-email@domain.com',
  password: 'your-password',
  setupToken: 'your-setup-token',
});
```

## Best Practices

1. **Test Setup First**: Always verify setup status before testing authenticated endpoints
2. **Login Early**: Get authentication token before testing protected endpoints
3. **Check Responses**: Review full JSON responses, not just status codes
4. **Test Incrementally**: Test one section at a time
5. **Document Issues**: Note which endpoints fail for backend team
6. **Clear Console**: Use "Clear Output" between test runs for clarity
7. **Copy Responses**: Use copy button to save important responses
8. **Check Permissions**: Verify endpoints return expected data based on user role

## Production Deployment

### Disable in Production
Add route guard in layout or middleware:
```typescript
if (process.env.NODE_ENV === 'production') {
  redirect('/dashboard');
}
```

### Or Use Feature Flag
```typescript
if (!process.env.NEXT_PUBLIC_ENABLE_API_TEST) {
  return <NotFound />;
}
```

## Files Created

### Frontend
- `/src/app/api-test/page.tsx` - Main test page
- `/src/lib/api/test-client.ts` - API test client
- `/src/components/api-test/TestButton.tsx` - Button component
- `/src/components/api-test/TestSection.tsx` - Section component
- `/src/components/api-test/OutputConsole.tsx` - Console component

### Documentation
- `/API_TEST_SUITE.md` - This file

## Benefits

✅ **Visual Verification**: See all endpoints working at a glance
✅ **Quick Debugging**: Identify broken endpoints immediately
✅ **No Postman Needed**: Test directly in the app
✅ **Documentation**: Serves as live API documentation
✅ **Early Detection**: Find issues before full implementation
✅ **Developer Friendly**: Easy for frontend devs to test backend
✅ **Time Saving**: Test multiple endpoints rapidly

## Support

For issues or questions:
- Check backend logs: `/Users/tanta/Projects/Web/WebstormProjects/digimall-backend/logs`
- Review API documentation: `API_ENDPOINTS.md`
- Check backend Swagger: `http://localhost:4000/docs`
- Test endpoints individually in Postman/Insomnia if needed

---

Last Updated: January 2025
Status: ✅ Complete and Ready for Testing
