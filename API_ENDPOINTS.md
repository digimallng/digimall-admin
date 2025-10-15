# DigiMall Admin - API Endpoints Reference

This document provides a comprehensive reference for all available admin API endpoints in the unified backend.

## Configuration

### Backend URL
- **Local Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.digimall.ng/api/v1`

### Authentication
All endpoints (except auth endpoints) require a JWT Bearer token:
```
Authorization: Bearer <access_token>
```

### Role Requirements
- **SUPER_ADMIN**: Full access to all admin features
- **ADMIN**: Access to most admin features (some restrictions)
- **STAFF**: Limited admin access

---

## Staff Management

### Authentication
- `POST /staff/auth/login` - Staff login
- `POST /staff/auth/logout` - Staff logout
- `POST /staff/auth/refresh-token` - Refresh access token
- `PUT /staff/auth/change-password` - Change password

### Staff CRUD (ADMIN/SUPER_ADMIN)
- `GET /staff` - List staff with filters
- `GET /staff/:id` - Get staff member details
- `POST /staff` - Create staff member (SUPER_ADMIN only)
- `PUT /staff/:id` - Update staff member (SUPER_ADMIN only)
- `DELETE /staff/:id` - Delete staff member (SUPER_ADMIN only)
- `POST /staff/invite` - Invite staff member (SUPER_ADMIN only)
- `PUT /staff/bulk-action` - Bulk staff actions (SUPER_ADMIN only)

### Session Management
- `GET /staff/:id/sessions` - Get staff sessions
- `PUT /staff/auth/sessions/:sessionId` - Revoke session

### Activity & Analytics
- `GET /staff/:id/activity` - Get staff activity log
- `GET /staff/analytics/overview` - Get staff analytics (SUPER_ADMIN)
- `GET /staff/analytics/security-audit` - Get security audit (SUPER_ADMIN)
- `GET /staff/analytics/productivity` - Get productivity metrics

### Permissions
- `PUT /staff/:id/permissions` - Update staff permissions (SUPER_ADMIN)
- `GET /staff/roles/permissions` - Get role permissions

---

## Vendor Management

### Vendor CRUD
- `GET /admin/vendors` - Get all vendors with filters
- `GET /admin/vendors/statistics` - Get vendor statistics
- `GET /admin/vendors/:id` - Get vendor details by ID
- `GET /admin/vendors/:id/performance` - Get vendor performance metrics
- `PUT /admin/vendors/:id/tier` - Update vendor tier (ADMIN/SUPER_ADMIN)
- `POST /admin/vendors/bulk-tier-update` - Bulk update vendor tiers (ADMIN/SUPER_ADMIN)

### Vendor Approval Workflow
- `GET /admin/vendors/pending` - Get pending vendor approvals (ADMIN/SUPER_ADMIN)
- `POST /admin/vendors/:vendorId/approve` - Approve/reject vendor (ADMIN/SUPER_ADMIN)
- `PUT /admin/vendors/:vendorId/activate` - Activate approved vendor (ADMIN/SUPER_ADMIN)

---

## Product Management

### Product CRUD
- `GET /admin/products` - Get all products with filters
- `GET /admin/products/pending-approvals` - Get products pending approval (ADMIN/SUPER_ADMIN)
- `GET /admin/products/statistics` - Get product statistics
- `GET /admin/products/:id` - Get product details by ID
- `PUT /admin/products/:id/approval` - Approve or reject product (ADMIN/SUPER_ADMIN)
- `PUT /admin/products/:id/inventory` - Update product inventory
- `POST /admin/products/bulk-action` - Perform bulk actions on products (ADMIN/SUPER_ADMIN)

---

## Order Management

### Order CRUD
- `GET /admin/orders` - Get all orders with advanced filters
- `GET /admin/orders/statistics` - Get order statistics
- `GET /admin/orders/count` - Get order count by filters
- `GET /admin/orders/:id` - Get order details by ID
- `PUT /admin/orders/:id/status` - Update order status
- `POST /admin/orders/:id/refund` - Process order refund (ADMIN/SUPER_ADMIN)
- `POST /admin/orders/bulk-action` - Perform bulk actions on orders (ADMIN/SUPER_ADMIN)

---

## User Management

### User CRUD
- `GET /admin/users` - Get all users with filters
- `GET /admin/users/statistics` - Get user statistics
- `GET /admin/users/:id` - Get user details by ID
- `GET /admin/users/:id/activity` - Get user activity history
- `PUT /admin/users/:id/status` - Update user status (ADMIN/SUPER_ADMIN)
- `POST /admin/users/bulk-action` - Perform bulk actions on users (ADMIN/SUPER_ADMIN)

---

## Analytics (ADMIN/SUPER_ADMIN)

### Analytics Endpoints
- `GET /analytics/dashboard` - Get dashboard analytics with growth metrics
- `GET /analytics/users` - Get user analytics
- `GET /analytics/vendors` - Get vendor analytics
- `GET /analytics/products` - Get product analytics
- `GET /analytics/orders` - Get order analytics
- `GET /analytics/revenue` - Get revenue analytics with monthly breakdown
- `GET /analytics/categories` - Get category performance metrics
- `GET /analytics/system` - Get system metrics
- `GET /analytics/performance` - Get performance metrics
- `POST /analytics/export` - Export analytics data

---

## Subscription Management (ADMIN/SUPER_ADMIN)

### Subscription Plans
- `GET /admin/subscription-plans` - Get all subscription plans
- `GET /admin/subscription-plans/:id` - Get subscription plan by ID
- `POST /admin/subscription-plans` - Create subscription plan (SUPER_ADMIN)
- `PUT /admin/subscription-plans/:id` - Update subscription plan (SUPER_ADMIN)
- `DELETE /admin/subscription-plans/:id` - Archive subscription plan (SUPER_ADMIN)
- `POST /admin/subscription-plans/:id/sync-paystack` - Sync plan with Paystack (SUPER_ADMIN)

---

## System Management (SUPER_ADMIN)

### System Configuration & Monitoring
- `GET /admin/system/config` - Get system configuration
- `PUT /admin/system/config` - Update system configuration
- `GET /admin/system/health` - Get system health status
- `GET /admin/system/metrics` - Get system metrics
- `GET /admin/system/database-stats` - Get database statistics (SUPER_ADMIN)
- `GET /admin/system/logs` - Get system logs
- `POST /admin/system/clear-cache` - Clear system cache
- `POST /admin/system/backup` - Perform system backup

---

## API Usage Examples

### Authentication Flow

```typescript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/v1/staff/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@digimall.ng',
    password: 'your_password'
  })
});

const { accessToken, refreshToken, user } = await loginResponse.json();

// 2. Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 3. Use token in subsequent requests
const response = await fetch('http://localhost:3000/api/v1/admin/vendors', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Using the Proxy

All requests should go through the Next.js proxy:

```typescript
// Instead of:
// fetch('http://localhost:3000/api/v1/admin/vendors')

// Use:
fetch('/api/proxy/admin/vendors')
```

### Pagination

Most list endpoints support pagination:

```typescript
const response = await fetch('/api/proxy/admin/vendors?page=1&limit=20');
const { data, pagination } = await response.json();

console.log(pagination);
// {
//   page: 1,
//   limit: 20,
//   total: 150,
//   totalPages: 8,
//   hasNext: true,
//   hasPrevious: false
// }
```

### Filtering

Advanced filtering is available:

```typescript
const params = new URLSearchParams({
  status: 'PENDING',
  tier: 'PREMIUM',
  search: 'electronics',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

const response = await fetch(`/api/proxy/admin/vendors?${params}`);
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/proxy/admin/vendors/123');

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    // {
    //   statusCode: 404,
    //   message: 'Vendor not found',
    //   error: 'Not Found',
    //   timestamp: '2024-01-15T10:30:00Z',
    //   path: '/api/v1/admin/vendors/123'
    // }
  }

  const vendor = await response.json();
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/admin/vendors"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Role-Based Access Control

### Role Hierarchy
```
SUPER_ADMIN (highest)
  ↓
ADMIN
  ↓
STAFF
  ↓
VENDOR
  ↓
CUSTOMER (lowest)
```

Higher roles inherit permissions from lower roles.

### Checking Permissions

```typescript
function canAccessFeature(userRole: string, requiredRoles: string[]) {
  const roleHierarchy = {
    super_admin: ['super_admin', 'admin', 'staff', 'vendor', 'customer'],
    admin: ['admin', 'staff', 'vendor', 'customer'],
    staff: ['staff', 'vendor', 'customer'],
    vendor: ['vendor', 'customer'],
    customer: ['customer']
  };

  return requiredRoles.some(role =>
    roleHierarchy[userRole]?.includes(role)
  );
}
```

---

## Rate Limiting

The API implements rate limiting:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: Configurable per environment

---

## WebSocket Integration

For real-time features:
- **Local**: `ws://localhost:3000`
- **Production**: `wss://api.digimall.ng`

---

## Best Practices

1. **Always use the proxy** - Route all API calls through `/api/proxy`
2. **Handle token refresh** - Implement automatic token refresh on 401 errors
3. **Implement retry logic** - For network failures
4. **Use TypeScript types** - Leverage existing types in `lib/api/types`
5. **Cache appropriately** - Use React Query for server state management
6. **Log errors** - Implement comprehensive error logging
7. **Test thoroughly** - Test all endpoints with different user roles

---

## Migration Notes

### Changes from Microservices

1. **Single Backend URL**: All services now accessed through one endpoint
2. **Updated Auth Flow**: Now uses `/staff/auth/*` endpoints
3. **Simplified Proxy**: No more service routing logic needed
4. **Consistent Response Format**: All endpoints return standardized responses

### Breaking Changes

- Authentication endpoints moved from `/auth/*` to `/staff/auth/*`
- Token response structure changed (now includes `accessToken` instead of `token`)
- Some endpoints may have slightly different response structures

---

## Support

For issues or questions:
- Check backend Swagger docs: `http://localhost:3000/docs`
- Review this documentation
- Check the comprehensive backend report in the admin app

---

Last Updated: January 2025
