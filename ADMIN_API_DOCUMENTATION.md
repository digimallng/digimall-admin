# DigiMall Admin API Documentation

**Version:** 1.6.0
**Base URL:** `http://localhost:4000/api/v1` (Development)
**Production URL:** `https://api.digimall.ng/api/v1`
**Last Updated:** October 11, 2025
**Status:** ✅ 115 endpoints available

> **Recent Updates**:
> - **NEW:** Complete review management system with 8 admin endpoints for platform-wide moderation
> - **NEW:** Bulk review moderation operations (approve, reject, flag, delete multiple reviews)
> - **NEW:** Platform-wide review statistics and analytics with rating distribution
> - **NEW:** Vendor-specific and product-specific review analytics for admins
> - **NEW:** File uploads & S3 integration with 4 comprehensive endpoints (image, documents, delete, signed URLs)
> - **UPDATED:** Categories and Products now support S3/CloudFront image URLs
> - **NEW:** Resend email verification OTP endpoint for better user experience
> - **Fixed:** Email verification enum values - OTPs now send correctly after registration
> - **NEW:** Audit logs management with 7 comprehensive endpoints (SUPER_ADMIN only)
> - **NEW:** Admin notifications management with 9 comprehensive endpoints
> - Real-time system logs viewing with comprehensive filtering (limit, level, context, date range, search)

## Table of Contents

1. [Authentication](#authentication)
2. [File Uploads & S3 Integration](#file-uploads--s3-integration)
3. [Staff Management](#staff-management)
4. [Admin Analytics](#admin-analytics)
5. [Products Management](#products-management)
6. [Vendors Management](#vendors-management)
7. [Orders Management](#orders-management)
8. [Escrow Management](#escrow-management)
9. [Users Management](#users-management)
10. [Categories Management](#categories-management)
11. [Landing Page Management](#landing-page-management)
12. [Reviews Management](#reviews-management)
13. [Security & Audit](#security--audit)
14. [Audit Logs](#audit-logs)
15. [System Management](#system-management)
16. [Subscription Plans](#subscription-plans)
17. [Notifications Management](#notifications-management)
18. [Admin Vendor Operations](#admin-vendor-operations)
19. [Error Handling](#error-handling)
20. [Rate Limiting](#rate-limiting)

---

## Authentication

All admin endpoints require Bearer token authentication. The token must be included in the `Authorization` header.

### Staff Login

```http
POST /staff/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@digimall.ng",
  "password": "Blank@50"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "staff": {
    "id": "68e4023434ca46ef9d41e1cf",
    "email": "admin@digimall.ng",
    "firstName": "Admin",
    "lastName": "Admin",
    "role": "super_admin",
    "permissions": ["*"]
  }
}
```

### Using the Access Token

Include the access token in all subsequent requests:

```http
GET /admin/products
Authorization: Bearer {accessToken}
```

### Refresh Token

```http
POST /staff/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Logout

```http
POST /staff/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sessionId": "optional-session-id"
}
```

---

## File Uploads & S3 Integration

Base path: `/uploads`

### Overview

The file uploads module handles secure file uploads to AWS S3 with CloudFront CDN integration. Supports images, documents, and provides signed URLs for private files.

**Role Requirements:** ADMIN, SUPER_ADMIN, VENDOR (CUSTOMER for signed URLs only)

**AWS Services:**
- **S3**: Secure file storage
- **CloudFront**: Global CDN for fast delivery
- **Environment Variables Required**:
    - `AWS_S3_BUCKET`: S3 bucket name (e.g., `digimall-assets`)
    - `AWS_REGION`: AWS region (e.g., `us-east-1`)
    - `AWS_ACCESS_KEY_ID`: AWS credentials
    - `AWS_SECRET_ACCESS_KEY`: AWS credentials
    - `CLOUDFRONT_DOMAIN` (optional): CloudFront distribution domain

---

### 1. Upload Single Image

Upload a single image file to S3 with automatic optimization and CDN delivery.

```http
POST /uploads/image
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `file` (required): Image file (JPEG, PNG, WebP)
- `folder` (optional): Destination folder (e.g., `categories`, `products`, `vendors`)

**File Constraints:**
- **Allowed Types**: JPEG, PNG, WebP
- **Max Size**: 5MB
- **Auto-optimization**: Images are optimized for web delivery

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "key": "categories/electronics-1696843200000.jpg",
    "url": "https://d1234567890.cloudfront.net/categories/electronics-1696843200000.jpg",
    "bucket": "digimall-assets",
    "size": 245678,
    "contentType": "image/jpeg"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/v1/uploads/image \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=categories"
```

**Usage in Categories/Products:**
```json
{
  "name": "Electronics",
  "image": "https://d1234567890.cloudfront.net/categories/electronics-1696843200000.jpg"
}
```

---

### 2. Upload Multiple Images

Upload multiple images in a single request (max 10 files).

```http
POST /uploads/images
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `files` (required): Array of image files (max 10)
- `folder` (optional): Destination folder

**File Constraints:**
- **Allowed Types**: JPEG, PNG, WebP
- **Max Size**: 5MB per file
- **Max Files**: 10 per request

**Response (201 Created):**
```json
{
  "success": true,
  "message": "5 image(s) uploaded successfully",
  "data": [
    {
      "key": "products/product-image-1.jpg",
      "url": "https://d1234567890.cloudfront.net/products/product-image-1.jpg",
      "bucket": "digimall-assets",
      "size": 245678,
      "contentType": "image/jpeg"
    },
    {
      "key": "products/product-image-2.jpg",
      "url": "https://d1234567890.cloudfront.net/products/product-image-2.jpg",
      "bucket": "digimall-assets",
      "size": 189234,
      "contentType": "image/jpeg"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/v1/uploads/images \
  -H "Authorization: Bearer {accessToken}" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.jpg" \
  -F "folder=products"
```

**Usage in Products (Multiple Images):**
```json
{
  "title": "iPhone 15 Pro",
  "images": [
    "https://d1234567890.cloudfront.net/products/product-image-1.jpg",
    "https://d1234567890.cloudfront.net/products/product-image-2.jpg",
    "https://d1234567890.cloudfront.net/products/product-image-3.jpg"
  ]
}
```

---

### 3. Upload Document

Upload PDF or Word documents (private by default).

```http
POST /uploads/document
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `file` (required): Document file (PDF, DOC, DOCX)
- `folder` (optional): Destination folder (default: `documents`)

**File Constraints:**
- **Allowed Types**: PDF, DOC, DOCX
- **Max Size**: 10MB
- **Privacy**: Documents are private by default (requires signed URL for access)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "key": "documents/vendor-verification-doc.pdf",
    "url": "https://digimall-assets.s3.amazonaws.com/documents/vendor-verification-doc.pdf",
    "bucket": "digimall-assets",
    "size": 1245678,
    "contentType": "application/pdf"
  }
}
```

---

### 4. Delete File

Delete a file from S3 storage.

```http
DELETE /uploads/{fileKey}
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `fileKey`: Full S3 key (URL-encoded if contains slashes)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "key": "categories/electronics-1696843200000.jpg"
  }
}
```

**cURL Example:**
```bash
# Delete a category image
curl -X DELETE "http://localhost:4000/api/v1/uploads/categories%2Felectronics-1696843200000.jpg" \
  -H "Authorization: Bearer {accessToken}"
```

**Error Responses:**
- `404`: File not found
- `403`: Insufficient permissions

---

### 5. Get Signed URL (Private Files)

Generate a temporary signed URL for accessing private files (e.g., documents).

```http
POST /uploads/signed-url
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "key": "documents/vendor-verification-doc.pdf",
  "expiresIn": 3600
}
```

**Parameters:**
- `key` (required): S3 file key
- `expiresIn` (optional): URL expiration in seconds (default: 3600 = 1 hour)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed URL generated successfully",
  "data": {
    "key": "documents/vendor-verification-doc.pdf",
    "signedUrl": "https://digimall-assets.s3.amazonaws.com/documents/vendor-verification-doc.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "expiresIn": 3600
  }
}
```

---

### Image Upload Workflow for Categories & Products

**Step 1: Upload Image(s)**
```bash
# Upload category image
curl -X POST http://localhost:4000/api/v1/uploads/image \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@electronics.jpg" \
  -F "folder=categories"

# Response:
{
  "data": {
    "url": "https://d1234567890.cloudfront.net/categories/electronics-1696843200000.jpg"
  }
}
```

**Step 2: Create Category with Image URL**
```bash
curl -X POST http://localhost:4000/api/v1/admin/categories \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image": "https://d1234567890.cloudfront.net/categories/electronics-1696843200000.jpg",
    "bannerImage": "https://d1234567890.cloudfront.net/categories/electronics-banner.jpg"
  }'
```

**Step 3: Upload Multiple Product Images**
```bash
# Upload product gallery
curl -X POST http://localhost:4000/api/v1/uploads/images \
  -H "Authorization: Bearer {accessToken}" \
  -F "files=@product-front.jpg" \
  -F "files=@product-back.jpg" \
  -F "files=@product-side.jpg" \
  -F "folder=products"

# Response:
{
  "data": [
    { "url": "https://d1234567890.cloudfront.net/products/product-front.jpg" },
    { "url": "https://d1234567890.cloudfront.net/products/product-back.jpg" },
    { "url": "https://d1234567890.cloudfront.net/products/product-side.jpg" }
  ]
}
```

**Step 4: Create Product with Multiple Images**
```bash
curl -X POST http://localhost:4000/api/v1/admin/products \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "basePrice": 1299.99,
    "categoryId": "68e...",
    "vendorId": "68d...",
    "images": [
      "https://d1234567890.cloudfront.net/products/product-front.jpg",
      "https://d1234567890.cloudfront.net/products/product-back.jpg",
      "https://d1234567890.cloudfront.net/products/product-side.jpg"
    ]
  }'
```

---

### Best Practices

1. **Image Optimization**:
    - Upload high-quality images (the system handles optimization)
    - Recommended dimensions for categories: 800x600px or higher
    - Recommended dimensions for products: 1200x1200px or higher

2. **Folder Organization**:
    - `categories/` - Category images and banners
    - `products/` - Product images and galleries
    - `vendors/` - Vendor logos and banners
    - `documents/` - Private documents (verification, contracts)

3. **CDN Benefits**:
    - Global delivery with low latency
    - Automatic caching
    - Reduced server load
    - HTTPS by default

4. **Security**:
    - Images are public (via CloudFront)
    - Documents are private (require signed URLs)
    - All uploads require authentication
    - File type validation prevents malicious uploads

5. **Error Handling**:
    - Always validate file type before upload
    - Check file size limits (5MB images, 10MB documents)
    - Handle upload failures gracefully
    - Store URLs in database after successful upload

---

## Staff Management

Base path: `/staff`

### Overview

The staff management module handles admin user operations including creation, authentication, permissions, and activity tracking.

**Role Requirements:**
- **SUPER_ADMIN**: Full access to all operations
- **ADMIN**: Read access and limited write operations
- **STAFF**: Read-only access to assigned modules

---

### 1. Get All Staff Members

```http
GET /staff
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `role` (string, optional): Filter by role (super_admin, admin, staff)
- `status` (string, optional): Filter by status (active, inactive, suspended)
- `search` (string, optional): Search by name or email

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "68e4023434ca46ef9d41e1cf",
      "email": "admin@digimall.ng",
      "firstName": "Admin",
      "lastName": "Admin",
      "role": "super_admin",
      "status": "active",
      "permissions": ["*"],
      "createdAt": "2025-01-15T10:30:00Z",
      "lastLogin": "2025-10-07T13:06:34Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2. Get Staff Member by ID

```http
GET /staff/:id
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `id` (string, required): Staff member ID

**Response (200 OK):**
```json
{
  "id": "68e4023434ca46ef9d41e1cf",
  "email": "admin@digimall.ng",
  "firstName": "Admin",
  "lastName": "Admin",
  "role": "super_admin",
  "status": "active",
  "permissions": ["*"],
  "phone": null,
  "department": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-10-07T13:06:34Z",
  "lastLogin": "2025-10-07T13:06:34Z"
}
```

---

### 3. Create Staff Member

```http
POST /staff
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "email": "newstaff@digimall.ng",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "role": "staff",
  "department": "Customer Support",
  "permissions": ["products:read", "orders:read", "orders:update"]
}
```

**Response (201 Created):**
```json
{
  "message": "Staff member created successfully",
  "data": {
    "id": "68e40234newstaffid",
    "email": "newstaff@digimall.ng",
    "firstName": "John",
    "lastName": "Doe",
    "role": "staff",
    "status": "active"
  }
}
```

---

### 4. Update Staff Member

```http
PUT /staff/:id
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe",
  "status": "active",
  "department": "Sales"
}
```

**Response (200 OK):**
```json
{
  "message": "Staff member updated successfully",
  "data": {
    "id": "68e40234newstaffid",
    "email": "newstaff@digimall.ng",
    "firstName": "John Updated",
    "lastName": "Doe"
  }
}
```

---

### 5. Delete Staff Member (Soft Delete)

```http
DELETE /staff/:id
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "message": "Staff member deleted successfully"
}
```

---

### 6. Get Staff Sessions

```http
GET /staff/:id/sessions
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "sessionId": "session123",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-10-07T13:06:34Z",
      "lastActivity": "2025-10-07T14:30:00Z",
      "isActive": true
    }
  ]
}
```

---

### 7. Revoke Session

```http
PUT /staff/auth/sessions/:sessionId
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Session revoked successfully"
}
```

---

### 8. Get Staff Activity Log

```http
GET /staff/:id/activity
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "action": "product_approved",
      "resource": "Product",
      "resourceId": "prod123",
      "details": "Approved product: iPhone 15 Pro",
      "ipAddress": "192.168.1.1",
      "timestamp": "2025-10-07T14:25:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 9. Invite Staff Member

```http
POST /staff/invite
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "email": "newstaff@digimall.ng",
  "role": "staff",
  "permissions": ["products:read", "orders:read"]
}
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitationToken": "inv_token_here"
}
```

---

### 10. Change Password

```http
PUT /staff/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

### 11. Update Staff Permissions

```http
PUT /staff/:id/permissions
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "permissions": [
    "products:read",
    "products:write",
    "orders:read",
    "orders:update",
    "users:read"
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Permissions updated successfully",
  "data": {
    "permissions": ["products:read", "products:write", "orders:read", "orders:update", "users:read"]
  }
}
```

---

### 12. Get Role Permissions

```http
GET /staff/roles/permissions
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "super_admin": {
    "description": "Full system access",
    "permissions": ["*"]
  },
  "admin": {
    "description": "Administrative access",
    "permissions": [
      "products:*",
      "orders:*",
      "users:read",
      "vendors:*",
      "analytics:read"
    ]
  },
  "staff": {
    "description": "Limited access",
    "permissions": [
      "products:read",
      "orders:read",
      "orders:update"
    ]
  }
}
```

---

### 13. Get Staff Analytics Overview

```http
GET /staff/analytics/overview
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "totalStaff": 15,
  "activeStaff": 12,
  "inactiveStaff": 3,
  "byRole": {
    "super_admin": 2,
    "admin": 5,
    "staff": 8
  },
  "recentActivity": {
    "last24Hours": 145,
    "last7Days": 980
  }
}
```

---

### 14. Get Security Audit

```http
GET /staff/analytics/security-audit?days=30
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Query Parameters:**
- `days` (number, optional): Number of days to audit (default: 30)

**Response (200 OK):**
```json
{
  "period": "30 days",
  "failedLoginAttempts": 12,
  "suspiciousActivities": 3,
  "passwordChanges": 8,
  "events": [
    {
      "type": "failed_login",
      "staffEmail": "staff@digimall.ng",
      "ipAddress": "192.168.1.100",
      "timestamp": "2025-10-05T10:30:00Z"
    }
  ]
}
```

---

### 15. Get Productivity Metrics

```http
GET /staff/analytics/productivity
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `staffId` (string, optional): Filter by specific staff member

**Response (200 OK):**
```json
{
  "metrics": [
    {
      "staffId": "68e4023434ca46ef9d41e1cf",
      "staffName": "Admin Admin",
      "actionsPerformed": 245,
      "productsApproved": 45,
      "ordersProcessed": 120,
      "averageResponseTime": "5.2 minutes"
    }
  ]
}
```

---

### 16. Bulk Staff Actions

```http
PUT /staff/bulk-action
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "staffIds": ["id1", "id2", "id3"],
  "action": "suspend",
  "reason": "Policy violation investigation"
}
```

**Actions:** `activate`, `suspend`, `delete`

**Response (200 OK):**
```json
{
  "message": "Bulk action completed successfully",
  "successful": 3,
  "failed": 0
}
```

---

### 17. Setup - Create Super Admin (First-time Only)

```http
POST /staff/setup/create-super-admin
Content-Type: application/json
```

**Note:** This endpoint is public but only works if no super admin exists.

**Request Body:**
```json
{
  "email": "admin@digimall.ng",
  "password": "SecurePassword123!",
  "firstName": "Admin",
  "lastName": "User",
  "setupToken": "provided-in-env-file"
}
```

**Response (201 Created):**
```json
{
  "message": "Super admin created successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "staff": {
    "id": "68e4023434ca46ef9d41e1cf",
    "email": "admin@digimall.ng",
    "role": "super_admin"
  }
}
```

---

## Admin Analytics

Base path: `/analytics`

### Overview

Comprehensive analytics and reporting for all aspects of the platform.

**Role Requirements:** ADMIN, SUPER_ADMIN

---

### 1. Get Dashboard Analytics

```http
GET /analytics/dashboard
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): ISO date string
- `endDate` (string, optional): ISO date string
- `period` (string, optional): today, week, month, year

**Response (200 OK):**
```json
{
  "overview": {
    "totalRevenue": 125000.00,
    "totalOrders": 450,
    "totalUsers": 1250,
    "totalVendors": 85,
    "totalProducts": 3500
  },
  "growth": {
    "revenue": {
      "current": 125000.00,
      "previous": 98000.00,
      "growthRate": 27.55,
      "trend": "up"
    },
    "orders": {
      "current": 450,
      "previous": 380,
      "growthRate": 18.42,
      "trend": "up"
    },
    "users": {
      "current": 1250,
      "previous": 1100,
      "growthRate": 13.64,
      "trend": "up"
    }
  },
  "recentActivity": {
    "pendingOrders": 25,
    "pendingProducts": 12,
    "pendingVendors": 5,
    "unreadDisputes": 3
  }
}
```

---

### 2. Get User Analytics

```http
GET /analytics/users
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response (200 OK):**
```json
{
  "totalUsers": 1250,
  "activeUsers": 980,
  "newUsers": {
    "today": 15,
    "thisWeek": 87,
    "thisMonth": 250
  },
  "usersByRole": {
    "customer": 1150,
    "vendor": 85,
    "admin": 15
  },
  "engagement": {
    "dailyActive": 450,
    "weeklyActive": 850,
    "monthlyActive": 1100
  },
  "retention": {
    "day1": 85,
    "day7": 65,
    "day30": 45
  }
}
```

---

### 3. Get Vendor Analytics

```http
GET /analytics/vendors
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalVendors": 85,
  "activeVendors": 72,
  "pendingApproval": 5,
  "suspended": 3,
  "newVendorsThisMonth": 8,
  "topVendorsByRevenue": [
    {
      "vendorId": "vendor123",
      "businessName": "Tech Store Ltd",
      "revenue": 45000.00,
      "orders": 250
    }
  ],
  "averageOrderValue": 278.50
}
```

---

### 4. Get Product Analytics

```http
GET /analytics/products
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalProducts": 3500,
  "activeProducts": 3200,
  "outOfStock": 150,
  "pendingApproval": 12,
  "topProducts": [
    {
      "productId": "prod123",
      "name": "iPhone 15 Pro",
      "sales": 125,
      "revenue": 156250.00,
      "views": 5420
    }
  ],
  "categoriesDistribution": [
    {
      "category": "Electronics",
      "count": 850,
      "percentage": 24.3
    }
  ]
}
```

---

### 5. Get Order Analytics

```http
GET /analytics/orders
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalOrders": 450,
  "completedOrders": 380,
  "pendingOrders": 45,
  "cancelledOrders": 25,
  "ordersByStatus": {
    "pending": 45,
    "processing": 15,
    "shipped": 8,
    "delivered": 380,
    "cancelled": 25
  },
  "averageOrderValue": 277.78,
  "averageProcessingTime": "2.5 days"
}
```

---

### 6. Get Revenue Analytics

```http
GET /analytics/revenue
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)
- `groupBy` (string, optional): day, week, month

**Response (200 OK):**
```json
{
  "totalRevenue": 125000.00,
  "platformFees": 12500.00,
  "vendorPayouts": 112500.00,
  "monthlyBreakdown": [
    {
      "month": "2025-01",
      "revenue": 95000.00,
      "orders": 350,
      "averageOrderValue": 271.43
    },
    {
      "month": "2025-02",
      "revenue": 108000.00,
      "orders": 420,
      "averageOrderValue": 257.14
    }
  ],
  "topCategories": [
    {
      "category": "Electronics",
      "revenue": 65000.00,
      "percentage": 52.0
    }
  ]
}
```

---

### 7. Get Category Analytics

```http
GET /analytics/categories
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalCategories": 45,
  "categoriesWithProducts": 42,
  "topPerformingCategories": [
    {
      "categoryId": "cat123",
      "name": "Electronics",
      "products": 850,
      "orders": 320,
      "revenue": 65000.00
    }
  ]
}
```

---

### 8. Get System Metrics

```http
GET /analytics/system
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "database": {
    "size": "2.5 GB",
    "collections": 15,
    "totalDocuments": 125000
  },
  "storage": {
    "totalUsed": "45 GB",
    "available": "455 GB",
    "percentage": 9.0
  },
  "performance": {
    "averageResponseTime": "120ms",
    "uptime": "99.95%",
    "requestsPerMinute": 450
  }
}
```

---

### 9. Get Performance Metrics

```http
GET /analytics/performance
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "apiPerformance": {
    "averageResponseTime": "120ms",
    "p95ResponseTime": "350ms",
    "p99ResponseTime": "850ms",
    "errorRate": 0.5
  },
  "endpoints": [
    {
      "path": "/api/v1/products",
      "method": "GET",
      "avgResponseTime": "85ms",
      "requestCount": 15000
    }
  ],
  "cacheHitRate": 85.5
}
```

---

### 10. Export Analytics

```http
POST /analytics/export
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `format` (string, optional): json, csv, excel (default: json)
- `type` (string, optional): dashboard, users, orders, revenue

**Response:** File download

---

### 11. Get Traffic Analytics

```http
GET /admin/analytics/traffic
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): ISO date string
- `endDate` (string, optional): ISO date string

**Response (200 OK):**
```json
{
  "pageViews": 0,
  "uniqueVisitors": 0,
  "bounceRate": 0,
  "avgSessionDuration": 0,
  "topPages": [],
  "trafficSources": {
    "direct": 0,
    "organic": 0,
    "social": 0,
    "referral": 0
  },
  "deviceStats": {
    "mobile": 0,
    "desktop": 0,
    "tablet": 0
  },
  "geographicData": [],
  "note": "Traffic analytics requires request logging implementation"
}
```

**Implementation Note:**
This endpoint returns a placeholder structure. Full traffic analytics requires:
- Request logging middleware
- Session tracking implementation
- User-agent parsing
- Geolocation services
- Referrer tracking

Once the infrastructure is in place, this endpoint will provide:
- Page views and unique visitor counts
- Bounce rate and session duration metrics
- Top performing pages
- Traffic source breakdown
- Device type distribution
- Geographic visitor data

---

### 12. Get Conversion Analytics

```http
GET /admin/analytics/conversion
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): ISO date string (default: 30 days ago)
- `endDate` (string, optional): ISO date string (default: now)

**Response (200 OK):**
```json
{
  "overallConversionRate": 5.2,
  "funnelSteps": [
    {
      "step": "Visited Site",
      "visitors": 10000,
      "conversionRate": 100
    },
    {
      "step": "Viewed Product",
      "visitors": 3500,
      "conversionRate": 35
    },
    {
      "step": "Added to Cart",
      "visitors": 1200,
      "conversionRate": 12
    },
    {
      "step": "Completed Order",
      "visitors": 520,
      "conversionRate": 5.2
    }
  ],
  "cartAbandonment": {
    "rate": 58.3,
    "abandonedCarts": 680,
    "recoveredCarts": 45
  },
  "note": "Full conversion tracking requires cart and session tracking implementation"
}
```

**Metrics Explained:**
- **Overall Conversion Rate**: Percentage of visitors who complete an order
- **Funnel Steps**: User journey from site visit to purchase
- **Cart Abandonment**: Percentage of carts not converted to orders

**Current Implementation:**
- Calculates conversion rate based on orders placed
- Provides placeholder funnel structure
- Requires cart tracking for accurate abandonment metrics

**Future Enhancement:**
Full conversion tracking will include:
- Session tracking for visitor counts
- Cart creation and abandonment events
- Multi-step checkout funnel
- Recovery campaign tracking

---

### 13. Get Comparison Analytics

```http
GET /admin/analytics/comparison
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): Start date for current period
- `endDate` (string, optional): End date for current period

**Response (200 OK):**
```json
{
  "current": {
    "period": "2025-10-01 - 2025-10-07",
    "revenue": 45600.00,
    "orders": 320,
    "averageOrderValue": 142.50,
    "customers": 285
  },
  "previous": {
    "period": "2025-09-24 - 2025-09-30",
    "revenue": 38200.00,
    "orders": 280,
    "averageOrderValue": 136.43,
    "customers": 245
  },
  "changes": {
    "revenue": {
      "value": 7400.00,
      "percentage": 19.37
    },
    "orders": {
      "value": 40,
      "percentage": 14.29
    },
    "averageOrderValue": {
      "value": 6.07,
      "percentage": 4.45
    },
    "customers": {
      "value": 40,
      "percentage": 16.33
    }
  },
  "trend": "up"
}
```

**Business Logic:**
- **Current Period**: Specified date range or last 7 days
- **Previous Period**: Same duration immediately before current period
- **Automatic Calculation**: Previous period dates calculated automatically

**Example Scenarios:**

**Scenario 1: Week-over-week comparison**
```
Request: startDate=2025-10-01, endDate=2025-10-07
Current: Oct 1-7 (7 days)
Previous: Sep 24-30 (7 days)
```

**Scenario 2: Month-over-month comparison**
```
Request: startDate=2025-10-01, endDate=2025-10-31
Current: Oct 1-31 (31 days)
Previous: Sep 1-30 (30 days)
```

**Scenario 3: Default (no dates specified)**
```
Current: Last 7 days from today
Previous: 7 days before that
```

**Growth Indicators:**
- **Positive percentage**: Growth (shown in green on frontend)
- **Negative percentage**: Decline (shown in red on frontend)
- **Zero percentage**: No change

**Use Cases:**
1. Weekly performance reviews
2. Month-end reports
3. Campaign effectiveness measurement
4. Seasonal trend analysis
5. Executive dashboards

---

## Products Management

Base path: `/admin/products`

### Overview

Manage product listings, approvals, inventory, and bulk operations with S3/CloudFront image gallery support.

**Role Requirements:** ADMIN, SUPER_ADMIN, STAFF

**Image Fields:**
- `images`: Array of product images (recommended: 1200x1200px) - S3/CloudFront URLs
    - First image in array is the primary/featured image
    - Support for up to 10 images per product
    - Displayed in product gallery
- `variants[].images`: Variant-specific images for different colors/styles

**Image Upload Workflow:**
1. Upload multiple images using `/uploads/images` endpoint (see [File Uploads](#file-uploads--s3-integration))
2. Receive array of CloudFront URLs in response
3. Use URLs in product `images` array (order matters - first is primary)
4. For variants, upload variant-specific images and assign to variant
5. All images served via global CDN for fast loading

**Example Product Image Structure:**
```json
{
  "title": "iPhone 15 Pro",
  "images": [
    "https://d1234567890.cloudfront.net/products/iphone-front.jpg",   // Primary image
    "https://d1234567890.cloudfront.net/products/iphone-back.jpg",
    "https://d1234567890.cloudfront.net/products/iphone-side.jpg"
  ],
  "variants": [
    {
      "name": "Gold 256GB",
      "images": [
        "https://d1234567890.cloudfront.net/products/iphone-gold-front.jpg",
        "https://d1234567890.cloudfront.net/products/iphone-gold-back.jpg"
      ]
    }
  ]
}
```

---

### 1. Get All Products

```http
GET /admin/products
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): active, inactive, pending, rejected
- `vendorId` (string, optional): Filter by vendor
- `categoryId` (string, optional): Filter by category
- `search` (string, optional): Search by name
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `sortBy` (string, optional): name, price, createdAt, sales
- `sortOrder` (string, optional): asc, desc

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "prod123",
      "name": "iPhone 15 Pro Max 256GB",
      "slug": "iphone-15-pro-max-256gb",
      "description": "Latest Apple smartphone...",
      "price": 1250.00,
      "compareAtPrice": 1350.00,
      "sku": "IPH15PM256",
      "status": "active",
      "stock": 45,
      "vendor": {
        "id": "vendor123",
        "businessName": "Tech Store Ltd"
      },
      "category": {
        "id": "cat123",
        "name": "Smartphones"
      },
      "images": [
        "https://cdn.digimall.ng/products/iphone15pro.jpg"
      ],
      "rating": 4.8,
      "reviewCount": 156,
      "sales": 125,
      "views": 5420,
      "createdAt": "2025-09-15T10:00:00Z",
      "updatedAt": "2025-10-07T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3500,
    "totalPages": 175
  }
}
```

---

### 2. Get Product by ID

```http
GET /admin/products/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "prod123",
  "name": "iPhone 15 Pro Max 256GB",
  "slug": "iphone-15-pro-max-256gb",
  "description": "Latest Apple smartphone with A17 Pro chip...",
  "price": 1250.00,
  "compareAtPrice": 1350.00,
  "costPrice": 1000.00,
  "sku": "IPH15PM256",
  "barcode": "123456789012",
  "status": "active",
  "approvalStatus": "approved",
  "stock": 45,
  "lowStockThreshold": 10,
  "vendor": {
    "id": "vendor123",
    "businessName": "Tech Store Ltd",
    "email": "vendor@techstore.com"
  },
  "category": {
    "id": "cat123",
    "name": "Smartphones",
    "path": "Electronics > Mobile Phones > Smartphones"
  },
  "images": [
    {
      "url": "https://cdn.digimall.ng/products/iphone15pro-1.jpg",
      "alt": "iPhone 15 Pro front view",
      "isPrimary": true
    }
  ],
  "specifications": [
    {
      "name": "Display",
      "value": "6.7-inch Super Retina XDR"
    },
    {
      "name": "Processor",
      "value": "A17 Pro chip"
    }
  ],
  "variants": [
    {
      "name": "Color",
      "options": ["Natural Titanium", "Blue Titanium", "White Titanium"]
    }
  ],
  "shipping": {
    "weight": 0.221,
    "dimensions": {
      "length": 15.95,
      "width": 7.67,
      "height": 0.83
    }
  },
  "seo": {
    "metaTitle": "iPhone 15 Pro Max 256GB - Buy Online",
    "metaDescription": "Get the latest iPhone 15 Pro Max...",
    "keywords": ["iPhone", "Apple", "Smartphone"]
  },
  "rating": 4.8,
  "reviewCount": 156,
  "sales": 125,
  "views": 5420,
  "approvedBy": {
    "staffId": "staff123",
    "staffName": "Admin User",
    "approvedAt": "2025-09-16T09:30:00Z"
  },
  "createdAt": "2025-09-15T10:00:00Z",
  "updatedAt": "2025-10-07T14:30:00Z"
}
```

---

### 3. Get Pending Approvals

```http
GET /admin/products/pending-approvals
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "prod456",
      "name": "Samsung Galaxy S24 Ultra",
      "price": 1199.00,
      "vendor": {
        "id": "vendor456",
        "businessName": "Mobile Hub"
      },
      "submittedAt": "2025-10-06T15:20:00Z",
      "status": "pending"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

### 4. Approve/Reject Product

```http
PUT /admin/products/:id/approval
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "status": "approved",
  "reason": "Product meets all requirements"
}
```

Or for rejection:
```json
{
  "status": "rejected",
  "reason": "Product images do not meet quality standards. Please upload higher resolution images."
}
```

**Response (200 OK):**
```json
{
  "message": "Product approval status updated",
  "data": {
    "id": "prod456",
    "name": "Samsung Galaxy S24 Ultra",
    "approvalStatus": "approved",
    "approvedBy": "staff123",
    "approvedAt": "2025-10-07T15:00:00Z"
  }
}
```

---

### 5. Update Product Inventory

```http
PUT /admin/products/:id/inventory
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "stock": 100,
  "lowStockThreshold": 15,
  "reason": "New stock received from supplier"
}
```

**Response (200 OK):**
```json
{
  "message": "Inventory updated successfully",
  "data": {
    "id": "prod123",
    "stock": 100,
    "lowStockThreshold": 15,
    "updatedBy": "staff123",
    "updatedAt": "2025-10-07T15:30:00Z"
  }
}
```

---

### 6. Get Product Statistics

```http
GET /admin/products/statistics
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `vendorId` (string, optional): Filter by vendor
- `categoryId` (string, optional): Filter by category

**Response (200 OK):**
```json
{
  "totalProducts": 3500,
  "activeProducts": 3200,
  "inactiveProducts": 200,
  "pendingApproval": 12,
  "rejectedProducts": 88,
  "outOfStock": 150,
  "lowStock": 245,
  "averagePrice": 125.50,
  "totalValue": 438750.00,
  "byCategory": [
    {
      "categoryId": "cat123",
      "categoryName": "Electronics",
      "count": 850,
      "percentage": 24.3
    }
  ],
  "topVendors": [
    {
      "vendorId": "vendor123",
      "businessName": "Tech Store Ltd",
      "productCount": 250,
      "totalSales": 45000.00
    }
  ]
}
```

---

### 7. Bulk Product Actions

```http
POST /admin/products/bulk-action
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "productIds": ["prod123", "prod456", "prod789"],
  "action": "activate",
  "reason": "Batch activation after review"
}
```

**Actions:** `activate`, `deactivate`, `delete`, `approve`, `reject`

**Response (200 OK):**
```json
{
  "message": "Bulk action completed",
  "successful": 3,
  "failed": 0,
  "details": [
    {
      "productId": "prod123",
      "status": "success"
    },
    {
      "productId": "prod456",
      "status": "success"
    },
    {
      "productId": "prod789",
      "status": "success"
    }
  ]
}
```

---

## Vendors Management

Base path: `/admin/vendors`

### Overview

Manage vendor accounts, tiers, performance tracking, and approvals.

**Role Requirements:** ADMIN, SUPER_ADMIN, STAFF

---

### 1. Get All Vendors

```http
GET /admin/vendors
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional): active, pending, suspended, inactive
- `tier` (string, optional): basic, silver, gold, platinum
- `search` (string, optional)
- `sortBy` (string, optional): businessName, createdAt, revenue
- `sortOrder` (string, optional): asc, desc

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "vendor123",
      "userId": "user456",
      "businessName": "Tech Store Ltd",
      "email": "vendor@techstore.com",
      "phone": "+234801234567",
      "status": "active",
      "tier": "gold",
      "kycStatus": "verified",
      "rating": 4.7,
      "products": 250,
      "orders": 1250,
      "revenue": 45000.00,
      "commission": 15.0,
      "createdAt": "2024-06-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

---

### 2. Get Vendor by ID

```http
GET /admin/vendors/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "vendor123",
  "userId": "user456",
  "businessName": "Tech Store Ltd",
  "email": "vendor@techstore.com",
  "phone": "+234801234567",
  "status": "active",
  "tier": "gold",
  "businessAddress": {
    "street": "123 Market Street",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "bankDetails": {
    "accountName": "Tech Store Ltd",
    "accountNumber": "1234567890",
    "bankName": "GTBank",
    "bankCode": "058"
  },
  "kycStatus": "verified",
  "kycDocuments": [
    {
      "type": "cac_certificate",
      "status": "verified",
      "verifiedAt": "2024-06-20T14:30:00Z"
    }
  ],
  "subscription": {
    "plan": "premium",
    "status": "active",
    "expiresAt": "2025-12-31T23:59:59Z"
  },
  "performance": {
    "rating": 4.7,
    "reviewCount": 345,
    "products": 250,
    "activeProducts": 235,
    "orders": 1250,
    "completedOrders": 1180,
    "revenue": 45000.00,
    "averageOrderValue": 36.00,
    "responseTime": "2.5 hours",
    "fulfillmentRate": 94.4
  },
  "commission": 15.0,
  "createdAt": "2024-06-15T10:00:00Z",
  "approvedAt": "2024-06-20T15:00:00Z"
}
```

---

### 3. Get Vendor Performance

```http
GET /admin/vendors/:id/performance
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "vendorId": "vendor123",
  "period": "last_30_days",
  "metrics": {
    "revenue": 12500.00,
    "orders": 320,
    "averageOrderValue": 39.06,
    "cancelledOrders": 8,
    "returnRate": 2.5,
    "responseTime": "2.5 hours",
    "rating": 4.7,
    "newReviews": 45
  },
  "trends": {
    "revenueGrowth": 15.5,
    "ordersGrowth": 12.3,
    "ratingChange": 0.2
  },
  "topProducts": [
    {
      "productId": "prod123",
      "name": "iPhone 15 Pro",
      "sales": 45,
      "revenue": 5625.00
    }
  ]
}
```

---

### 4. Update Vendor Tier

```http
PUT /admin/vendors/:id/tier
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "tier": "platinum",
  "commission": 12.0,
  "reason": "Exceeded performance targets for Q4"
}
```

**Tiers:** `basic`, `silver`, `gold`, `platinum`

**Response (200 OK):**
```json
{
  "message": "Vendor tier updated successfully",
  "data": {
    "vendorId": "vendor123",
    "tier": "platinum",
    "commission": 12.0,
    "updatedBy": "staff123",
    "updatedAt": "2025-10-07T16:00:00Z"
  }
}
```

---

### 5. Get Vendor Statistics

```http
GET /admin/vendors/statistics
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalVendors": 85,
  "activeVendors": 72,
  "pendingApproval": 5,
  "suspendedVendors": 3,
  "inactiveVendors": 5,
  "byTier": {
    "basic": 35,
    "silver": 28,
    "gold": 18,
    "platinum": 4
  },
  "kycStatus": {
    "verified": 72,
    "pending": 8,
    "rejected": 5
  },
  "totalRevenue": 1250000.00,
  "averageRevenuePerVendor": 14705.88,
  "topPerformers": [
    {
      "vendorId": "vendor123",
      "businessName": "Tech Store Ltd",
      "revenue": 45000.00,
      "rating": 4.7
    }
  ]
}
```

---

### 6. Bulk Tier Update

```http
POST /admin/vendors/bulk-tier-update
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "vendorIds": ["vendor123", "vendor456"],
  "tier": "gold",
  "commission": 15.0,
  "reason": "Q4 Performance Upgrade"
}
```

**Response (200 OK):**
```json
{
  "message": "Bulk tier update completed",
  "successful": 2,
  "failed": 0
}
```

---

### 7. Suspend/Unsuspend Vendor

```http
PUT /admin/vendors/:id/suspension
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Vendor ID

**Request Body (Suspend):**
```json
{
  "action": "suspend",
  "reason": "Multiple customer complaints about delayed shipments",
  "duration": 30
}
```

**Request Body (Unsuspend):**
```json
{
  "action": "unsuspend",
  "reason": "Issues resolved, vendor reinstated"
}
```

**Field Descriptions:**
- `action` (string, required): Either `suspend` or `unsuspend`
- `reason` (string, optional): Reason for the action (max 500 characters)
- `duration` (number, optional): Suspension duration in days (for temporary suspension)

**Response (200 OK) - Suspend:**
```json
{
  "message": "Vendor suspended successfully",
  "vendor": {
    "id": "vendor123",
    "businessName": "Tech Store Ltd",
    "status": "suspended",
    "metadata": {
      "suspensionReason": "Multiple customer complaints about delayed shipments",
      "suspendedAt": "2025-10-07T15:00:00Z",
      "suspendedBy": "staff456",
      "suspendedUntil": "2025-11-06T15:00:00Z"
    }
  },
  "previousStatus": "active",
  "newStatus": "suspended",
  "action": "suspend",
  "reason": "Multiple customer complaints about delayed shipments",
  "duration": 30,
  "affectedProducts": 250,
  "suspendedUntil": "2025-11-06T15:00:00Z"
}
```

**Response (200 OK) - Unsuspend:**
```json
{
  "message": "Vendor unsuspended successfully",
  "vendor": {
    "id": "vendor123",
    "businessName": "Tech Store Ltd",
    "status": "active",
    "metadata": {
      "unsuspendedAt": "2025-10-07T16:00:00Z",
      "unsuspendedBy": "staff456",
      "unsuspensionReason": "Issues resolved, vendor reinstated"
    }
  },
  "previousStatus": "suspended",
  "newStatus": "active",
  "action": "unsuspend",
  "reason": "Issues resolved, vendor reinstated",
  "duration": null,
  "affectedProducts": 0,
  "suspendedUntil": null
}
```

**Business Logic:**

**When Suspending:**
- Vendor status changes to `suspended`
- All vendor products are automatically **deactivated** (isActive = false)
- Suspension metadata stored (reason, timestamp, staff ID)
- Optional duration creates temporary suspension (auto-expires)
- Returns count of affected products

**When Unsuspending:**
- Only works if vendor is currently suspended
- Vendor status changes to `active`
- Products remain deactivated (vendor must manually reactivate)
- Unsuspension metadata stored (reason, timestamp, staff ID)
- Clears suspension metadata

**Use Cases:**
1. **Policy Violation**: Suspend vendor for violating platform policies
2. **Quality Issues**: Temporary suspension while vendor resolves quality complaints
3. **Investigation**: Suspend during fraud investigation
4. **Reinstatement**: Unsuspend after issues are resolved

**Example: Temporary 7-day suspension**
```json
{
  "action": "suspend",
  "reason": "Pending investigation of customer complaints",
  "duration": 7
}
```

**Example: Permanent suspension (no duration)**
```json
{
  "action": "suspend",
  "reason": "Severe policy violation - counterfeit products"
}
```

**Error Responses:**
- `400 Bad Request`:
    - Invalid vendor ID
    - Invalid action (must be "suspend" or "unsuspend")
    - Vendor is not currently suspended (when trying to unsuspend)
- `404 Not Found`: Vendor not found

**Note**: Suspended vendors cannot:
- Add new products
- Accept orders
- Access vendor dashboard
- Their existing products are hidden from customers

---

## Orders Management

Base path: `/admin/orders`

### Overview

Monitor and manage all orders, process refunds, and update order statuses.

**Role Requirements:** ADMIN, SUPER_ADMIN, STAFF

---

### 1. Get All Orders

```http
GET /admin/orders
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional): pending, processing, shipped, delivered, cancelled, refunded
- `paymentStatus` (string, optional): pending, paid, failed, refunded
- `vendorId` (string, optional)
- `customerId` (string, optional)
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date
- `minAmount` (number, optional)
- `maxAmount` (number, optional)
- `search` (string, optional): Search by order number or customer name

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "order123",
      "orderNumber": "DGM-2025-000123",
      "customer": {
        "id": "customer456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+234801234567"
      },
      "vendor": {
        "id": "vendor123",
        "businessName": "Tech Store Ltd"
      },
      "items": [
        {
          "productId": "prod123",
          "productName": "iPhone 15 Pro",
          "quantity": 1,
          "price": 1250.00,
          "subtotal": 1250.00
        }
      ],
      "subtotal": 1250.00,
      "shipping": 10.00,
      "tax": 0.00,
      "discount": 50.00,
      "total": 1210.00,
      "status": "delivered",
      "paymentStatus": "paid",
      "paymentMethod": "paystack",
      "shippingAddress": {
        "street": "456 Customer Ave",
        "city": "Lagos",
        "state": "Lagos State",
        "country": "Nigeria",
        "postalCode": "100001"
      },
      "trackingNumber": "TRK123456789",
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-05T14:30:00Z",
      "deliveredAt": "2025-10-05T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```

---

### 2. Get Order by ID

```http
GET /admin/orders/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "order123",
  "orderNumber": "DGM-2025-000123",
  "customer": {
    "id": "customer456",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+234801234567"
  },
  "vendor": {
    "id": "vendor123",
    "businessName": "Tech Store Ltd",
    "email": "vendor@techstore.com",
    "phone": "+234809876543"
  },
  "items": [
    {
      "id": "item1",
      "productId": "prod123",
      "productName": "iPhone 15 Pro Max 256GB",
      "sku": "IPH15PM256",
      "quantity": 1,
      "price": 1250.00,
      "subtotal": 1250.00,
      "image": "https://cdn.digimall.ng/products/iphone15pro.jpg"
    }
  ],
  "pricing": {
    "subtotal": 1250.00,
    "shipping": 10.00,
    "tax": 0.00,
    "discount": 50.00,
    "total": 1210.00
  },
  "status": "delivered",
  "paymentStatus": "paid",
  "paymentMethod": "paystack",
  "paymentReference": "PAY-REF-123456",
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+234801234567",
    "street": "456 Customer Ave",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "billingAddress": {
    "name": "John Doe",
    "phone": "+234801234567",
    "street": "456 Customer Ave",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "shipping": {
    "method": "standard",
    "carrier": "FEZ Delivery",
    "trackingNumber": "TRK123456789",
    "estimatedDelivery": "2025-10-05T00:00:00Z"
  },
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2025-10-01T10:00:00Z",
      "note": "Order placed"
    },
    {
      "status": "processing",
      "timestamp": "2025-10-01T11:30:00Z",
      "note": "Payment confirmed"
    },
    {
      "status": "shipped",
      "timestamp": "2025-10-02T09:00:00Z",
      "note": "Order shipped",
      "updatedBy": "vendor123"
    },
    {
      "status": "delivered",
      "timestamp": "2025-10-05T14:30:00Z",
      "note": "Order delivered"
    }
  ],
  "notes": [
    {
      "author": "staff123",
      "authorName": "Admin User",
      "note": "Customer requested expedited shipping",
      "timestamp": "2025-10-01T10:30:00Z"
    }
  ],
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-05T14:30:00Z",
  "deliveredAt": "2025-10-05T14:30:00Z"
}
```

---

### 3. Update Order Status

```http
PUT /admin/orders/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK987654321",
  "note": "Order shipped via FEZ Delivery"
}
```

**Valid Statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`

**Response (200 OK):**
```json
{
  "message": "Order status updated successfully",
  "data": {
    "orderId": "order123",
    "status": "shipped",
    "trackingNumber": "TRK987654321",
    "updatedBy": "staff123",
    "updatedAt": "2025-10-07T16:30:00Z"
  }
}
```

---

### 4. Process Refund

```http
POST /admin/orders/:id/refund
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "amount": 1210.00,
  "reason": "Product defective",
  "refundMethod": "original_payment",
  "note": "Full refund approved after inspection"
}
```

**Response (200 OK):**
```json
{
  "message": "Refund processed successfully",
  "data": {
    "orderId": "order123",
    "refundId": "refund456",
    "amount": 1210.00,
    "status": "processing",
    "processedBy": "staff123",
    "processedAt": "2025-10-07T17:00:00Z"
  }
}
```

---

### 5. Get Order Statistics

```http
GET /admin/orders/statistics
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date

**Response (200 OK):**
```json
{
  "totalOrders": 450,
  "ordersByStatus": {
    "pending": 45,
    "processing": 15,
    "shipped": 8,
    "delivered": 380,
    "cancelled": 25,
    "refunded": 12
  },
  "revenue": {
    "total": 125000.00,
    "average": 277.78,
    "highest": 2500.00,
    "lowest": 25.00
  },
  "fulfillment": {
    "averageProcessingTime": "6.5 hours",
    "averageShippingTime": "3.2 days",
    "onTimeDeliveryRate": 92.5
  },
  "payment": {
    "paid": 420,
    "pending": 18,
    "failed": 12
  }
}
```

---

### 6. Get Order Count

```http
GET /admin/orders/count
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (string, optional)
- `paymentStatus` (string, optional)

**Response (200 OK):**
```json
{
  "count": 450,
  "filters": {
    "status": null,
    "paymentStatus": null
  }
}
```

---

### 7. Bulk Order Actions

```http
POST /admin/orders/bulk-action
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "orderIds": ["order123", "order456", "order789"],
  "action": "mark_shipped",
  "data": {
    "carrier": "FEZ Delivery",
    "note": "Batch shipment"
  }
}
```

**Actions:** `mark_processing`, `mark_shipped`, `cancel`, `export`

**Response (200 OK):**
```json
{
  "message": "Bulk action completed",
  "successful": 3,
  "failed": 0
}
```

---

### 8. Cancel Order

```http
POST /admin/orders/:id/cancel
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Order ID

**Request Body:**
```json
{
  "reason": "Customer requested cancellation",
  "notes": "Customer called to cancel order, requested refund",
  "refund": true
}
```

**Field Descriptions:**
- `reason` (string, optional): Cancellation reason (max 500 characters)
- `notes` (string, optional): Additional notes about the cancellation
- `refund` (boolean, optional): Whether to initiate refund (default: true for paid orders)

**Response (200 OK):**
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": "order123",
    "orderNumber": "DGM-2025-000123",
    "status": "cancelled",
    "cancelledAt": "2025-10-07T15:00:00Z",
    "cancelledBy": "staff456",
    "cancellationReason": "Customer requested cancellation"
  },
  "refund": {
    "initiated": true,
    "transactionId": "refund789",
    "amount": 1210.00,
    "status": "processing",
    "message": "Refund initiated successfully"
  }
}
```

**Business Logic:**
- **Cannot cancel** orders with status: `delivered`, `cancelled`, `refunded`
- **Automatic refund**: If order is paid and `refund` is not explicitly set to false
- **Order status**: Updated to `cancelled`
- **Metadata tracking**: Stores cancellation reason, notes, timestamp, and staff ID
- **Order history**: Cancellation event added to order history

**Error Responses:**
- `400 Bad Request`:
    - Invalid order ID
    - Order cannot be cancelled (message: "Order cannot be cancelled in current status: {status}")
- `404 Not Found`: Order not found

**Example: Cancel without refund**
```json
{
  "reason": "Vendor out of stock",
  "refund": false
}
```

---

### 9. Export Orders

```http
POST /admin/orders/export
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN, STAFF

**Request Body:**
```json
{
  "format": "csv",
  "status": "delivered",
  "vendorId": "vendor123",
  "customerId": "customer456",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-07T23:59:59Z",
  "includeCancelled": false
}
```

**Field Descriptions:**
- `format` (string, required): Export format - `csv`, `excel`, or `pdf`
- `status` (string, optional): Filter by order status
- `vendorId` (string, optional): Filter by vendor
- `customerId` (string, optional): Filter by customer
- `startDate` (string, optional): Start date for date range (ISO 8601)
- `endDate` (string, optional): End date for date range (ISO 8601)
- `includeCancelled` (boolean, optional): Include cancelled orders (default: true)

**Response (200 OK):**
```json
{
  "format": "csv",
  "totalRecords": 145,
  "data": [
    {
      "orderNumber": "DGM-2025-000123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+234801234567",
      "vendorBusinessName": "Tech Store Ltd",
      "vendorEmail": "vendor@techstore.com",
      "status": "delivered",
      "paymentStatus": "paid",
      "paymentMethod": "paystack",
      "subtotal": 1250.00,
      "deliveryFee": 10.00,
      "total": 1210.00,
      "orderDate": "2025-10-01T10:00:00Z",
      "deliveredDate": "2025-10-05T14:30:00Z",
      "shippingAddress": "456 Customer Ave, Lagos, Lagos State, Nigeria",
      "trackingNumber": "TRK123456789"
    }
  ]
}
```

**Export Data Includes:**
- Order number and dates (order, delivery)
- Customer details (name, email, phone)
- Vendor details (business name, email, phone)
- Order status and payment information
- Pricing breakdown (subtotal, delivery fee, total)
- Shipping address (formatted as single string)
- Tracking number

**Use Cases:**
1. **Accounting**: Export all paid orders for reconciliation
2. **Vendor Reports**: Export orders by vendor for commission calculations
3. **Customer Service**: Export customer orders for support tickets
4. **Business Intelligence**: Import into analytics tools

**Example: Export all orders for a vendor**
```json
{
  "format": "excel",
  "vendorId": "vendor123",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z"
}
```

**Example: Export delivered orders only (no cancelled)**
```json
{
  "format": "csv",
  "status": "delivered",
  "includeCancelled": false
}
```

**Error Responses:**
- `400 Bad Request`:
    - Invalid format
    - Invalid date range
    - Invalid vendor or customer ID

**Note**: The response returns formatted data ready for CSV/Excel/PDF generation. Frontend should implement the actual file generation and download functionality.

---

## Escrow Management

Base path: `/admin/escrow`

### Overview

Manage escrow accounts, release/refund funds, resolve disputes, and track escrow activity. Escrow accounts hold payment funds until order delivery is confirmed.

**Role Requirements:** ADMIN, SUPER_ADMIN (manual actions require SUPER_ADMIN)

### 7.1 List All Escrow Accounts

```http
GET /admin/escrow
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (pending, funded, released, refunded, disputed)
- `customerId` (string, optional): Filter by customer ID
- `vendorId` (string, optional): Filter by vendor ID
- `orderId` (string, optional): Filter by order ID
- `parentOrderId` (string, optional): Filter by parent order ID
- `searchTerm` (string, optional): Search by escrow ID
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `minAmount` (number, optional): Minimum amount in kobo
- `maxAmount` (number, optional): Maximum amount in kobo
- `sortBy` (string, optional): Sort field (default: createdAt)
- `sortOrder` (string, optional): Sort order (asc/desc, default: desc)

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "68da1234567890abcdef1234",
      "escrowId": "esc_20251008_abc123",
      "orderId": {
        "_id": "68da0987654321fedcba9876",
        "orderNumber": "ORD-2025-001234",
        "status": "delivered"
      },
      "customerId": {
        "_id": "68da4c265e57ac800e37cc31",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "vendorId": {
        "_id": "68d9a456bc28dd6d740b93bd",
        "businessInfo": {
          "businessName": "Tech Store",
          "contactEmail": "store@techstore.com"
        }
      },
      "amount": 2500000,
      "currency": "NGN",
      "status": "funded",
      "fundedAt": "2025-10-01T10:00:00Z",
      "expiresAt": "2025-10-04T10:00:00Z",
      "releaseConditions": {
        "autoReleaseAfterDays": 3,
        "requiresDeliveryConfirmation": true,
        "requiresCustomerApproval": false
      },
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "hasNext": true,
  "hasPrev": false
}
```

### 7.2 Get Escrow Statistics

```http
GET /admin/escrow/statistics?startDate={date}&endDate={date}
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): Start date for filtering
- `endDate` (string, optional): End date for filtering

**Response (200 OK):**
```json
{
  "totalEscrows": 500,
  "totalAmount": 125000000,
  "statusBreakdown": {
    "pending": 50,
    "funded": 200,
    "released": 220,
    "refunded": 25,
    "disputed": 5
  },
  "averageHoldTime": 2.5,
  "disputedEscrows": 5,
  "expiringInNext24Hours": 12
}
```

### 7.3 Get Escrow Account Details

```http
GET /admin/escrow/{id}
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "_id": "68da1234567890abcdef1234",
  "escrowId": "esc_20251008_abc123",
  "orderId": {
    "_id": "68da0987654321fedcba9876",
    "orderNumber": "ORD-2025-001234",
    "status": "delivered",
    "totalAmount": 2500000,
    "items": [...]
  },
  "parentOrderId": {
    "_id": "68da5678901234567890abcd",
    "parentOrderNumber": "PORD-2025-000100"
  },
  "customerId": {
    "_id": "68da4c265e57ac800e37cc31",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+234801234567"
  },
  "vendorId": {
    "_id": "68d9a456bc28dd6d740b93bd",
    "businessInfo": {
      "businessName": "Tech Store",
      "contactEmail": "store@techstore.com",
      "contactPhone": "+234807654321"
    }
  },
  "amount": 2500000,
  "currency": "NGN",
  "status": "funded",
  "fundedAt": "2025-10-01T10:00:00Z",
  "expiresAt": "2025-10-04T10:00:00Z",
  "releaseConditions": {
    "autoReleaseAfterDays": 3,
    "requiresDeliveryConfirmation": true,
    "requiresCustomerApproval": false
  },
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-01T10:00:00Z"
}
```

### 7.4 Get Escrow by Order ID

```http
GET /admin/escrow/order/{orderId}
Authorization: Bearer {accessToken}
```

**Response:** Same as 7.3

### 7.5 Manually Release Escrow

```http
POST /admin/escrow/{id}/release
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Requirements:** SUPER_ADMIN only

**Request Body:**
```json
{
  "reason": "Order delivered and confirmed by customer",
  "forceRelease": false
}
```

**Response (200 OK):**
```json
{
  "_id": "68da1234567890abcdef1234",
  "escrowId": "esc_20251008_abc123",
  "status": "released",
  "releasedAt": "2025-10-08T15:30:00Z",
  "amount": 2500000,
  "vendorId": "68d9a456bc28dd6d740b93bd",
  "customerId": "68da4c265e57ac800e37cc31"
}
```

**Error Responses:**
- `404 Not Found`: Escrow account not found
- `400 Bad Request`: Cannot release escrow in current status

### 7.6 Manually Refund Escrow

```http
POST /admin/escrow/{id}/refund
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Requirements:** SUPER_ADMIN only

**Request Body:**
```json
{
  "reason": "Order cancelled by vendor",
  "forceRefund": false
}
```

**Response (200 OK):**
```json
{
  "_id": "68da1234567890abcdef1234",
  "escrowId": "esc_20251008_abc123",
  "status": "refunded",
  "refundedAt": "2025-10-08T15:30:00Z",
  "amount": 2500000,
  "vendorId": "68d9a456bc28dd6d740b93bd",
  "customerId": "68da4c265e57ac800e37cc31"
}
```

**Error Responses:**
- `404 Not Found`: Escrow account not found
- `400 Bad Request`: Cannot refund escrow in current status

### 7.7 List Disputed Escrows

```http
GET /admin/escrow/disputed?page={page}&limit={limit}
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "68da1234567890abcdef1234",
      "escrowId": "esc_20251008_abc123",
      "orderId": {
        "_id": "68da0987654321fedcba9876",
        "orderNumber": "ORD-2025-001234",
        "status": "processing"
      },
      "customerId": {...},
      "vendorId": {...},
      "amount": 2500000,
      "status": "disputed",
      "updatedAt": "2025-10-05T14:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 7.8 Resolve Disputed Escrow

```http
POST /admin/escrow/{id}/resolve-dispute
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Requirements:** SUPER_ADMIN only

**Request Body:**
```json
{
  "resolution": "release_to_vendor",
  "resolutionNotes": "After reviewing the evidence, vendor provided proof of delivery"
}
```

**Resolution Options:**
- `release_to_vendor`: Release funds to vendor
- `refund_to_customer`: Refund funds to customer

**Response (200 OK):**
```json
{
  "_id": "68da1234567890abcdef1234",
  "escrowId": "esc_20251008_abc123",
  "status": "released",
  "releasedAt": "2025-10-08T15:30:00Z",
  "amount": 2500000
}
```

**Error Responses:**
- `404 Not Found`: Escrow account not found
- `400 Bad Request`: Escrow is not in disputed status

### 7.9 List Escrows Expiring Soon

```http
GET /admin/escrow/expiring-soon?hours={hours}&page={page}&limit={limit}
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `hours` (number, optional): Hours threshold (default: 24)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "68da1234567890abcdef1234",
      "escrowId": "esc_20251008_abc123",
      "orderId": {...},
      "customerId": {...},
      "vendorId": {...},
      "amount": 2500000,
      "status": "funded",
      "expiresAt": "2025-10-08T18:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "threshold": "24 hours"
}
```

### 7.10 Get Escrow Audit Log

```http
GET /admin/escrow/audit-log?escrowId={id}&staffId={id}&startDate={date}&endDate={date}&page={page}&limit={limit}
Authorization: Bearer {accessToken}
```

**Role Requirements:** SUPER_ADMIN only

**Query Parameters:**
- `escrowId` (string, optional): Filter by escrow ID
- `staffId` (string, optional): Filter by staff member
- `startDate` (string, optional): Start date
- `endDate` (string, optional): End date
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "68da9999888877776666555",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@digimall.ng",
        "role": "super_admin"
      },
      "action": "release_escrow",
      "resource": "escrow",
      "resourceId": "68da1234567890abcdef1234",
      "actionType": "update",
      "severity": "medium",
      "success": true,
      "metadata": {
        "reason": "Order delivered and confirmed",
        "forceRelease": false,
        "escrowId": "esc_20251008_abc123",
        "amount": 2500000
      },
      "createdAt": "2025-10-08T15:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

## Users Management

Base path: `/admin/users`

### Overview

Manage customer accounts, view activity, and perform bulk operations.

**Role Requirements:** ADMIN, SUPER_ADMIN, STAFF

---

### 1. Get All Users

```http
GET /admin/users
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `role` (string, optional): customer, vendor, admin
- `status` (string, optional): active, inactive, suspended, deleted
- `verified` (boolean, optional): Filter by email verification
- `search` (string, optional)
- `sortBy` (string, optional): createdAt, name, email
- `sortOrder` (string, optional): asc, desc

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "user123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+234801234567",
      "role": "customer",
      "status": "active",
      "emailVerified": true,
      "phoneVerified": true,
      "orders": 15,
      "totalSpent": 4500.00,
      "createdAt": "2024-03-15T10:00:00Z",
      "lastLogin": "2025-10-07T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

---

### 2. Get User by ID

```http
GET /admin/users/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "user123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234801234567",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "role": "customer",
  "status": "active",
  "emailVerified": true,
  "phoneVerified": true,
  "addresses": [
    {
      "id": "addr1",
      "type": "shipping",
      "street": "456 Customer Ave",
      "city": "Lagos",
      "state": "Lagos State",
      "country": "Nigeria",
      "postalCode": "100001",
      "isDefault": true
    }
  ],
  "orders": {
    "total": 15,
    "completed": 13,
    "cancelled": 2,
    "pending": 0
  },
  "spending": {
    "total": 4500.00,
    "average": 300.00,
    "highest": 1250.00
  },
  "wishlistItems": 8,
  "cartItems": 2,
  "reviews": 12,
  "averageRating": 4.5,
  "preferences": {
    "newsletter": true,
    "smsNotifications": true,
    "pushNotifications": true
  },
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2025-10-07T09:00:00Z",
  "lastLogin": "2025-10-07T09:00:00Z"
}
```

---

### 3. Get User Activity

```http
GET /admin/users/:id/activity
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response (200 OK):**
```json
{
  "userId": "user123",
  "period": "30 days",
  "activity": [
    {
      "type": "order_placed",
      "orderId": "order123",
      "details": "Placed order #DGM-2025-000123",
      "timestamp": "2025-10-01T10:00:00Z"
    },
    {
      "type": "product_reviewed",
      "productId": "prod123",
      "details": "Reviewed iPhone 15 Pro",
      "rating": 5,
      "timestamp": "2025-10-05T15:00:00Z"
    },
    {
      "type": "wishlist_added",
      "productId": "prod456",
      "details": "Added Samsung Galaxy S24 to wishlist",
      "timestamp": "2025-10-06T12:30:00Z"
    }
  ],
  "summary": {
    "totalOrders": 3,
    "totalReviews": 2,
    "wishlistAdditions": 4,
    "cartAdditions": 8,
    "loginCount": 15
  }
}
```

---

### 4. Update User Status

```http
PUT /admin/users/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Multiple policy violations",
  "duration": 30
}
```

**Valid Statuses:** `active`, `inactive`, `suspended`

**Response (200 OK):**
```json
{
  "message": "User status updated successfully",
  "data": {
    "userId": "user123",
    "status": "suspended",
    "suspendedUntil": "2025-11-06T18:00:00Z",
    "updatedBy": "staff123",
    "updatedAt": "2025-10-07T18:00:00Z"
  }
}
```

---

### 5. Get User Statistics

```http
GET /admin/users/statistics
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "totalUsers": 1250,
  "activeUsers": 980,
  "inactiveUsers": 200,
  "suspendedUsers": 15,
  "deletedUsers": 55,
  "byRole": {
    "customer": 1150,
    "vendor": 85,
    "admin": 15
  },
  "verification": {
    "emailVerified": 1100,
    "phoneVerified": 950,
    "fullyVerified": 900
  },
  "growth": {
    "today": 15,
    "thisWeek": 87,
    "thisMonth": 250,
    "lastMonth": 220
  },
  "engagement": {
    "activeToday": 450,
    "activeThisWeek": 850,
    "activeThisMonth": 1100
  },
  "topSpenders": [
    {
      "userId": "user123",
      "name": "John Doe",
      "totalSpent": 4500.00,
      "orders": 15
    }
  ]
}
```

---

### 6. Bulk User Actions

```http
POST /admin/users/bulk-action
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "userIds": ["user123", "user456", "user789"],
  "action": "suspend",
  "reason": "Suspicious activity detected",
  "duration": 7
}
```

**Actions:** `activate`, `suspend`, `delete`, `verify_email`, `send_notification`

**Response (200 OK):**
```json
{
  "message": "Bulk action completed",
  "successful": 3,
  "failed": 0
}
```

---

## Categories Management

Base path: `/admin/categories`

### Overview

Manage product categories, hierarchy, and performance tracking with S3/CloudFront image integration.

**Role Requirements:** ADMIN, SUPER_ADMIN, STAFF

**Image Fields:**
- `image`: Category thumbnail (recommended: 800x600px) - S3/CloudFront URL
- `bannerImage`: Category banner for listing pages - S3/CloudFront URL

**Image Upload Workflow:**
1. Upload image(s) using `/categories/upload-image` endpoint (see below)
2. Receive CloudFront URL in response
3. Use URL in category `image` or `bannerImage` field
4. Images are served via global CDN for fast loading

**Note:** There are two category endpoints:
- `/categories` - Public category endpoints (for frontend)
- `/admin/categories` - Admin-only category management (documented here)

---

### 1. Get Category Hierarchy

```http
GET /admin/categories/hierarchy
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": "cat1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "image": "https://d2p2bqd74chr0p.cloudfront.net/categories/electronics.jpg",
      "productCount": 850,
      "sortOrder": 1,
      "isEnabled": true,
      "children": [
        {
          "id": "cat2",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "productCount": 320,
          "sortOrder": 1,
          "children": [
            {
              "id": "cat3",
              "name": "Smartphones",
              "slug": "smartphones",
              "productCount": 280,
              "sortOrder": 1
            },
            {
              "id": "cat4",
              "name": "Feature Phones",
              "slug": "feature-phones",
              "productCount": 40,
              "sortOrder": 2
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 2. Get Category Statistics

```http
GET /admin/categories/statistics
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "total": 45,
  "active": 42,
  "inactive": 3,
  "featured": 8,
  "rootCategories": 12,
  "subCategories": 33
}
```

---

### 3. Get Category Performance

```http
GET /admin/categories/:id/performance
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date

**Response (200 OK):**
```json
{
  "categoryId": "cat1",
  "name": "Electronics",
  "period": "last_30_days",
  "metrics": {
    "products": 850,
    "activeProducts": 820,
    "orders": 320,
    "revenue": 65000.00,
    "views": 15000,
    "conversionRate": 2.13
  },
  "trends": {
    "revenueGrowth": 15.5,
    "ordersGrowth": 12.0,
    "productsGrowth": 8.5
  },
  "topProducts": [
    {
      "productId": "prod123",
      "name": "iPhone 15 Pro",
      "sales": 45,
      "revenue": 5625.00
    }
  ],
  "topVendors": [
    {
      "vendorId": "vendor123",
      "businessName": "Tech Store Ltd",
      "products": 50,
      "revenue": 15000.00
    }
  ]
}
```

---

### 4. Reorder Categories

```http
POST /admin/categories/reorder
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "categories": [
    {
      "id": "cat1",
      "order": 1
    },
    {
      "id": "cat2",
      "order": 2
    },
    {
      "id": "cat3",
      "order": 3
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Categories reordered successfully"
}
```

---

### 5. Merge Categories

```http
PUT /admin/categories/:sourceId/merge/:targetId
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "message": "Categories merged successfully",
  "data": {
    "sourceId": "cat5",
    "targetId": "cat3",
    "productsMoved": 25,
    "targetProductCount": 305
  }
}
```

---

### 6. Get Category by ID

```http
GET /admin/categories/:id
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `id` (string, required): Category ID

**Response (200 OK):**
```json
{
  "id": "cat1",
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices and accessories",
  "parentId": null,
  "image": "https://d2p2bqd74chr0p.cloudfront.net/categories/electronics.jpg",
  "bannerImage": "https://d2p2bqd74chr0p.cloudfront.net/categories/electronics-banner.jpg",
  "isEnabled": true,
  "isFeatured": true,
  "sortOrder": 1,
  "seoTitle": "Electronics - Shop Online",
  "seoDescription": "Browse electronic devices and gadgets",
  "categoryPath": [],
  "productCount": 850,
  "subcategoryCount": 5,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2025-10-07T13:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid category ID
- `404 Not Found`: Category not found

---

### 7. Create Category

```http
POST /admin/categories
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "Smart Home",
  "slug": "smart-home",
  "description": "Smart home devices and automation",
  "parentId": "68e4023434ca46ef9d41e1cf",
  "image": "https://d2p2bqd74chr0p.cloudfront.net/categories/smart-home.jpg",
  "bannerImage": "https://d2p2bqd74chr0p.cloudfront.net/categories/smart-home-banner.jpg",
  "isEnabled": true,
  "isFeatured": false,
  "sortOrder": 5,
  "seoTitle": "Smart Home Devices - Shop Online",
  "seoDescription": "Automate your home with our smart devices collection"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Category name (2-100 chars) |
| `slug` | string | ✗ | URL slug (auto-generated if not provided) |
| `description` | string | ✗ | Category description (max 500 chars) |
| `parentId` | string | ✗ | Parent category ID for subcategories |
| `image` | string | ✗ | Category thumbnail URL (from S3/CloudFront) |
| `bannerImage` | string | ✗ | Category banner URL (from S3/CloudFront) |
| `isEnabled` | boolean | ✗ | Active status (default: true) |
| `isFeatured` | boolean | ✗ | Featured status (default: false) |
| `sortOrder` | number | ✗ | Display order (default: 0) |
| `seoTitle` | string | ✗ | SEO title (max 200 chars) |
| `seoDescription` | string | ✗ | SEO meta description (max 300 chars) |

**Response (201 Created):**
```json
{
  "id": "68e4023434ca46ef9d41e1cf",
  "name": "Smart Home",
  "slug": "smart-home",
  "description": "Smart home devices and automation",
  "parentId": "68e4023434ca46ef9d41e1cf",
  "image": "https://d2p2bqd74chr0p.cloudfront.net/categories/smart-home.jpg",
  "bannerImage": "https://d2p2bqd74chr0p.cloudfront.net/categories/smart-home-banner.jpg",
  "isEnabled": true,
  "isFeatured": false,
  "sortOrder": 5,
  "seoTitle": "Smart Home Devices - Shop Online",
  "seoDescription": "Automate your home with our smart devices collection",
  "categoryPath": ["Electronics"],
  "createdAt": "2025-10-10T14:00:00Z",
  "updatedAt": "2025-10-10T14:00:00Z"
}
```

**Features:**
- Automatic slug generation from name (URL-friendly)
- Duplicate slug validation
- Parent-child hierarchy support
- SEO metadata support
- Auto-generated categoryPath for breadcrumbs

**Error Responses:**
- `400 Bad Request`: Validation error or duplicate slug
- `404 Not Found`: Parent category not found
- `409 Conflict`: Category with same name already exists

---

### 8. Update Category

```http
PUT /admin/categories/:id
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Category ID

**Request Body:**
```json
{
  "name": "Smart Home & IoT",
  "description": "Updated description",
  "isActive": true,
  "order": 3,
  "metadata": {
    "seoTitle": "Smart Home & IoT Devices"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Category updated successfully",
  "category": {
    "id": "cat123",
    "name": "Smart Home & IoT",
    "slug": "smart-home-iot",
    "description": "Updated description",
    "parentId": "cat1",
    "order": 3,
    "isActive": true,
    "updatedAt": "2025-10-07T14:30:00Z"
  },
  "previousSlug": "smart-home",
  "newSlug": "smart-home-iot"
}
```

**Features:**
- Slug automatically regenerated if name changes
- Duplicate slug validation
- Partial updates supported (only send fields to update)
- Parent category can be updated

**Error Responses:**
- `400 Bad Request`: Invalid ID or duplicate slug
- `404 Not Found`: Category not found

---

### 9. Upload Category Image

```http
POST /categories/upload-image
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body (multipart/form-data):**
- `file` (required): Image file (JPEG, PNG, WebP)

**File Constraints:**
- **Allowed Types**: JPEG, PNG, WebP
- **Max Size**: 5MB

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category image uploaded successfully",
  "data": {
    "key": "categories/electronics-abc123.jpg",
    "url": "https://digimall-assets.s3.us-east-1.amazonaws.com/categories/electronics-abc123.jpg",
    "cloudFrontUrl": "https://d2p2bqd74chr0p.cloudfront.net/categories/electronics-abc123.jpg",
    "bucket": "digimall-assets",
    "size": 245678,
    "contentType": "image/jpeg"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/v1/categories/upload-image \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@/path/to/category-image.jpg"
```

**Usage Workflow:**
1. Upload the image using this endpoint
2. Copy the `cloudFrontUrl` from the response
3. Use the URL when creating/updating category in the `image` or `bannerImage` field

**Error Responses:**
- `400 Bad Request`: No file provided or invalid file type
- `413 Payload Too Large`: File exceeds 5MB limit

---

### 10. Delete Category

```http
DELETE /admin/categories/:id
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Category ID

**Response (200 OK):**
```json
{
  "message": "Category deleted successfully",
  "categoryId": "cat123",
  "deletedAt": "2025-10-07T15:00:00Z"
}
```

**Validation Rules:**
- Cannot delete category with active products
- Cannot delete category with subcategories
- Soft delete implementation (deletedAt timestamp)

**Error Responses:**
- `400 Bad Request`:
    - Invalid category ID
    - Category has products (message: "Cannot delete category with X products")
    - Category has subcategories (message: "Cannot delete category with X subcategories")
- `404 Not Found`: Category not found

---

## Landing Page Management

Base path: `/admin/landing`

### Overview

Comprehensive landing page content management system for controlling homepage elements including hero carousels, platform statistics, promotional banners, category deals, and featured vendors.

**Role Requirements:** ADMIN, SUPER_ADMIN

**Features:**
- Hero carousel slide management with scheduling
- Platform statistics tracking and display
- Promotional banner campaigns with targeting
- Category deal management with timing controls
- Featured vendor algorithmic and manual curation
- Real-time analytics tracking (views, clicks, CTR)

---

### Hero Slides Management

#### Get All Hero Slides (Admin)

```http
GET /admin/landing/hero-slides
Authorization: Bearer {accessToken}
```

**Response:** Returns all hero slides including inactive ones.

#### Get Hero Slide by ID

```http
GET /admin/landing/hero-slides/:id
Authorization: Bearer {accessToken}
```

#### Create Hero Slide

```http
POST /admin/landing/hero-slides
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventBadge": "FLASH SALE",
  "headline": "Big Deals on Premium Electronics",
  "description": "Get up to 50% off on selected items",
  "ctaButtons": [
    {
      "text": "Shop Now",
      "link": "/products/flash-sales",
      "style": "primary",
      "icon": "arrow-right"
    }
  ],
  "heroImage": "https://cdn.digimall.ng/hero/electronics-sale.jpg",
  "mobileImage": "https://cdn.digimall.ng/hero/mobile.jpg",
  "floatingProducts": [
    {
      "imageUrl": "https://cdn.digimall.ng/products/iphone.jpg",
      "link": "/products/iphone-14",
      "alt": "iPhone 14",
      "position": "top-10 right-20"
    }
  ],
  "theme": "dark",
  "order": 1,
  "isActive": true,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "backgroundColor": "#FF6B35",
  "textColor": "#FFFFFF"
}
```

**Valid Themes:** `light`, `dark`, `colorful`
**CTA Styles:** `primary`, `secondary`, `outline`

#### Update Hero Slide

```http
PUT /admin/landing/hero-slides/:id
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** Same as create (all fields optional)

#### Delete Hero Slide

```http
DELETE /admin/landing/hero-slides/:id
Authorization: Bearer {accessToken}
```

---

### Platform Statistics Management

#### Get Current Statistics

```http
GET /admin/landing/statistics
Authorization: Bearer {accessToken}
```

#### Create/Update Platform Statistics

```http
POST /admin/landing/statistics
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "totalVendors": 2500,
  "totalCustomers": 150000,
  "totalProducts": 50000,
  "totalOrders": 75000,
  "totalRevenue": 500000000,
  "activeDeals": 120,
  "averageRating": 4.5,
  "totalReviews": 25000,
  "orderGrowthRate": 15.5,
  "revenueGrowthRate": 22.3,
  "vendorGrowthRate": 8.7,
  "customerGrowthRate": 12.4,
  "citiesCovered": 36,
  "averageDeliveryTime": 24,
  "customerSatisfactionRate": 92.5,
  "periodLabel": "January 2025",
  "notes": "Strong growth across all metrics"
}
```

**Note:** Creating new statistics automatically marks previous ones as not current.

---

### Promotional Banners Management

#### Get All Banners (Admin)

```http
GET /admin/landing/banners
Authorization: Bearer {accessToken}
```

#### Get Banner by ID

```http
GET /admin/landing/banners/:id
Authorization: Bearer {accessToken}
```

#### Create Promotional Banner

```http
POST /admin/landing/banners
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Summer Electronics Sale",
  "subtitle": "Up to 70% off on selected items",
  "type": "full_width",
  "position": "middle",
  "imageUrl": "https://cdn.digimall.ng/banners/summer-sale.jpg",
  "mobileImageUrl": "https://cdn.digimall.ng/banners/mobile.jpg",
  "tabletImageUrl": "https://cdn.digimall.ng/banners/tablet.jpg",
  "link": "/products?sale=true",
  "linkTarget": "_self",
  "ctaText": "Shop Now",
  "backgroundColor": "#FF6B35",
  "textColor": "#FFFFFF",
  "order": 1,
  "isActive": true,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "targetAudience": "all",
  "categoryId": "507f1f77bcf86cd799439011",
  "isDismissible": false,
  "maxImpressions": 100000,
  "animationType": "fade-in"
}
```

**Banner Types:** `full_width`, `half_width`, `sidebar`, `floating`
**Positions:** `top`, `middle`, `bottom`, `sidebar_right`, `sidebar_left`
**Target Audiences:** `all`, `new_users`, `returning_users`, `premium_users`

#### Update Promotional Banner

```http
PUT /admin/landing/banners/:id
Authorization: Bearer {accessToken}
```

#### Delete Promotional Banner

```http
DELETE /admin/landing/banners/:id
Authorization: Bearer {accessToken}
```

---

### Category Deals Management

#### Get All Category Deals (Admin)

```http
GET /admin/landing/category-deals
Authorization: Bearer {accessToken}
```

**Response:** Returns all category deals with populated category information.

#### Get Category Deal by ID

```http
GET /admin/landing/category-deals/:id
Authorization: Bearer {accessToken}
```

#### Create Category Deal

```http
POST /admin/landing/category-deals
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "categoryId": "507f1f77bcf86cd799439011",
  "title": "Mega Electronics Sale",
  "description": "Get up to 60% off on all electronics",
  "discountPercentage": 60,
  "imageUrl": "https://cdn.digimall.ng/deals/electronics.jpg",
  "mobileImageUrl": "https://cdn.digimall.ng/deals/mobile.jpg",
  "thumbnailUrl": "https://cdn.digimall.ng/deals/thumb.jpg",
  "link": "/products?category=electronics&deal=mega-sale",
  "badgeType": "hot",
  "customBadgeText": "Limited Time",
  "priority": "high",
  "order": 1,
  "isActive": true,
  "isFeatured": true,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "productCount": 150,
  "minPurchaseAmount": 1000000,
  "maxDiscountAmount": 5000000,
  "backgroundColor": "#FF6B35",
  "textColor": "#FFFFFF",
  "termsAndConditions": "Offer valid while stocks last",
  "participatingVendors": ["68d9a456bc28dd6d740b93bd"]
}
```

**Badge Types:** `hot`, `new`, `sale`, `limited`, `exclusive`
**Priorities:** `low`, `medium`, `high`, `urgent`

#### Update Category Deal

```http
PUT /admin/landing/category-deals/:id
Authorization: Bearer {accessToken}
```

#### Delete Category Deal

```http
DELETE /admin/landing/category-deals/:id
Authorization: Bearer {accessToken}
```

---

### Featured Vendors Management

#### Get All Featured Vendors (Admin)

```http
GET /admin/landing/featured-vendors
Authorization: Bearer {accessToken}
```

**Response:** Returns all featured vendors with full trending score details and populated vendor information.

**Response Includes:**
- Trending score (0-100) and grade (S, A, B, C, D)
- Performance metrics (sales growth, customer acquisition, ratings, response rate)
- Score breakdown showing contribution of each factor
- Manual vs. algorithmic feature status

**Trending Score Algorithm:**

The system automatically calculates vendor trending scores daily at 2:00 AM using a weighted algorithm:

1. **Sales Growth (35%)**: Month-over-month sales increase
2. **Customer Acquisition Rate (25%)**: New customer percentage
3. **Reviews (20%)**: Combined rating quality (70%) and volume (30%)
4. **Response Rate (10%)**: Vendor responsiveness to inquiries
5. **View Growth (10%)**: Product views increase

**Score Grades:**
- **S (90-100)**: Exceptional - Top tier vendors
- **A (80-89)**: Excellent - High performing vendors
- **B (70-79)**: Good - Solid performing vendors
- **C (60-69)**: Average - Meeting standards
- **D (0-59)**: Below Average - Needs improvement

**Performance Levels:**
- Excellent: 85+
- Good: 70-84
- Average: 55-69
- Below Average: <55

**Notes:**
- Scores recalculate automatically daily at 2:00 AM (WAT)
- Admins can manually feature vendors to override algorithmic ranking
- Manual features can have custom display order and expiration dates
- Expired manual features automatically deactivate hourly

---

## Reviews Management

Base path: `/admin/reviews`

### Overview

Platform-wide review management system for moderating customer reviews, vendor responses, and ensuring quality control across all products and vendors.

**Role Requirements:** ADMIN, SUPER_ADMIN

**Features:**
- Platform-wide review moderation with advanced filtering
- Approve, reject, flag, or delete reviews
- Bulk moderation operations for efficiency
- Platform-wide review statistics and analytics
- Vendor-specific and product-specific review analytics
- Review history tracking with moderator information
- Automatic product rating synchronization

**Review Types:**
- **PRODUCT**: Reviews for products
- **VENDOR**: Reviews for vendor stores

**Review Status:**
- **PENDING**: Awaiting moderation (auto-approved if 4-5 stars)
- **APPROVED**: Visible on platform
- **REJECTED**: Hidden from platform (with reason)
- **FLAGGED**: Marked for investigation

---

### 1. Get All Reviews (Platform-wide)

Get all reviews across the platform with comprehensive filtering options.

```http
GET /admin/reviews
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `type` (string, optional): Filter by type (PRODUCT, VENDOR)
- `status` (string, optional): Filter by status (PENDING, APPROVED, REJECTED, FLAGGED)
- `minRating` (number, optional): Minimum rating (1-5)
- `maxRating` (number, optional): Maximum rating (1-5)
- `productId` (string, optional): Filter by product
- `vendorId` (string, optional): Filter by vendor
- `customerId` (string, optional): Filter by customer
- `isFlagged` (boolean, optional): Filter flagged reviews
- `needsModeration` (boolean, optional): Show only pending reviews
- `sortBy` (string, optional): Sort field (createdAt, rating, helpfulVotes) - default: createdAt
- `sortOrder` (string, optional): Sort order (asc, desc) - default: desc
- `search` (string, optional): Full-text search in review content

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "68e123abc...",
        "type": "PRODUCT",
        "productId": {
          "_id": "68e456def...",
          "title": "iPhone 15 Pro",
          "images": ["https://cdn.digimall.ng/products/iphone15.jpg"]
        },
        "vendorId": {
          "_id": "68e789ghi...",
          "businessName": "Tech Store Ltd"
        },
        "customerId": {
          "_id": "68e012jkl...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatar": "https://cdn.digimall.ng/avatars/john.jpg"
        },
        "rating": 5,
        "title": "Excellent product!",
        "content": "Best phone I've ever owned. Fast delivery and great service.",
        "images": ["https://cdn.digimall.ng/reviews/photo1.jpg"],
        "status": "APPROVED",
        "verifiedPurchase": true,
        "helpfulVotes": 12,
        "isFlagged": false,
        "vendorResponse": {
          "message": "Thank you for your review!",
          "respondedAt": "2025-10-10T14:30:00Z",
          "respondedBy": {
            "_id": "68e345mno...",
            "firstName": "Vendor",
            "lastName": "Admin"
          }
        },
        "moderatedBy": {
          "_id": "68e678pqr...",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@digimall.ng"
        },
        "approvedAt": "2025-10-09T10:00:00Z",
        "createdAt": "2025-10-08T15:20:00Z",
        "updatedAt": "2025-10-10T14:30:00Z"
      }
    ],
    "total": 1523,
    "page": 1,
    "limit": 20,
    "pages": 77
  }
}
```

**Use Cases:**
```bash
# Get all pending reviews for moderation
GET /admin/reviews?needsModeration=true

# Get all flagged reviews
GET /admin/reviews?isFlagged=true

# Get all 1-star reviews
GET /admin/reviews?maxRating=1

# Get all reviews for a specific vendor
GET /admin/reviews?vendorId=68e789ghi...

# Search reviews by content
GET /admin/reviews?search=defective%20product
```

---

### 2. Get Review by ID

Get detailed information about a specific review.

```http
GET /admin/reviews/:id
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `id` (string, required): Review ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "68e123abc...",
    "type": "PRODUCT",
    "productId": {
      "_id": "68e456def...",
      "title": "iPhone 15 Pro",
      "description": "Latest Apple smartphone...",
      "basePrice": 1299.99,
      "images": ["https://cdn.digimall.ng/products/iphone15.jpg"]
    },
    "vendorId": {
      "_id": "68e789ghi...",
      "businessName": "Tech Store Ltd",
      "email": "vendor@techstore.com",
      "rating": 4.7
    },
    "customerId": {
      "_id": "68e012jkl...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "avatar": "https://cdn.digimall.ng/avatars/john.jpg"
    },
    "orderId": "68e901stu...",
    "rating": 5,
    "title": "Excellent product!",
    "content": "Best phone I've ever owned. Fast delivery and great service.",
    "images": [
      "https://cdn.digimall.ng/reviews/photo1.jpg",
      "https://cdn.digimall.ng/reviews/photo2.jpg"
    ],
    "status": "APPROVED",
    "verifiedPurchase": true,
    "helpfulVotes": 12,
    "isFlagged": false,
    "flagReason": null,
    "rejectionReason": null,
    "vendorResponse": {
      "message": "Thank you for your review!",
      "respondedAt": "2025-10-10T14:30:00Z",
      "respondedBy": {
        "_id": "68e345mno...",
        "firstName": "Vendor",
        "lastName": "Admin"
      }
    },
    "moderatedBy": {
      "_id": "68e678pqr...",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@digimall.ng"
    },
    "approvedAt": "2025-10-09T10:00:00Z",
    "createdAt": "2025-10-08T15:20:00Z",
    "updatedAt": "2025-10-10T14:30:00Z"
  }
}
```

---

### 3. Approve Review

Approve a review to make it publicly visible.

```http
POST /admin/reviews/:id/approve
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): Review ID

**Request Body:**
```json
{
  "comment": "Review meets quality standards"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "_id": "68e123abc...",
    "status": "APPROVED",
    "approvedAt": "2025-10-11T10:00:00Z",
    "moderatedBy": {
      "_id": "68e678pqr...",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

**Side Effects:**
- Review status changes to APPROVED
- Review becomes visible on product/vendor page
- Product rating is recalculated automatically
- Moderation timestamp and admin info recorded

---

### 4. Reject Review

Reject a review with a reason.

```http
POST /admin/reviews/:id/reject
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): Review ID

**Request Body:**
```json
{
  "reason": "Review contains inappropriate language and violates community guidelines"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review rejected successfully",
  "data": {
    "_id": "68e123abc...",
    "status": "REJECTED",
    "rejectionReason": "Review contains inappropriate language and violates community guidelines",
    "moderatedBy": {
      "_id": "68e678pqr...",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

**Side Effects:**
- Review status changes to REJECTED
- Review is hidden from public view
- Rejection reason is stored for audit trail
- Product rating is recalculated (rejected review excluded)

---

### 5. Flag Review for Investigation

Flag a review that requires further investigation.

```http
POST /admin/reviews/:id/flag
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): Review ID

**Request Body:**
```json
{
  "reason": "Suspected fake review - customer has no purchase history"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review flagged successfully",
  "data": {
    "_id": "68e123abc...",
    "isFlagged": true,
    "status": "FLAGGED",
    "flagReason": "Suspected fake review - customer has no purchase history",
    "moderatedBy": {
      "_id": "68e678pqr...",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

**Use Cases:**
- Suspected fake or fraudulent reviews
- Reviews requiring legal review
- Reviews with unverified claims
- Reviews flagged by multiple users
- Reviews with suspicious patterns

---

### 6. Delete Review

Permanently delete a review from the system.

```http
DELETE /admin/reviews/:id
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `id` (string, required): Review ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Warning:**
- This is a permanent action and cannot be undone
- Product rating will be recalculated automatically
- Use with caution - consider rejection instead of deletion for audit purposes

**Error Responses:**
- `404 Not Found`: Review does not exist
- `403 Forbidden`: Insufficient permissions

---

### 7. Get Platform Review Statistics

Get comprehensive platform-wide review statistics.

```http
GET /admin/reviews/stats
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 15234,
    "pending": 45,
    "approved": 14856,
    "rejected": 289,
    "flagged": 44,
    "needsResponse": 123,
    "averageRating": 4.3,
    "ratingDistribution": {
      "1": 456,
      "2": 789,
      "3": 2345,
      "4": 5123,
      "5": 6521
    },
    "productReviews": 14234,
    "vendorReviews": 1000,
    "verifiedPurchasePercentage": 87.5,
    "reviewsWithVendorResponse": 8234,
    "vendorResponseRate": 55.4,
    "averageResponseTime": "2.5 hours",
    "reviewsLast24Hours": 67,
    "reviewsLast7Days": 523,
    "reviewsLast30Days": 2145,
    "topRatedProducts": [
      {
        "productId": "68e456def...",
        "title": "iPhone 15 Pro",
        "averageRating": 4.9,
        "reviewCount": 234
      }
    ],
    "topRatedVendors": [
      {
        "vendorId": "68e789ghi...",
        "businessName": "Tech Store Ltd",
        "averageRating": 4.8,
        "reviewCount": 456
      }
    ],
    "moderationMetrics": {
      "averageApprovalTime": "1.2 hours",
      "autoApprovedPercentage": 78.5,
      "manuallyModeratedPercentage": 21.5
    }
  }
}
```

**Metrics Explained:**
- **needsResponse**: Reviews without vendor response
- **verifiedPurchasePercentage**: % of reviews from verified purchases
- **vendorResponseRate**: % of reviews with vendor responses
- **averageResponseTime**: Average time for vendors to respond
- **autoApprovedPercentage**: % of reviews auto-approved (4-5 stars)

---

### 8. Bulk Moderate Reviews

Perform bulk moderation actions on multiple reviews.

```http
POST /admin/reviews/bulk/moderate
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reviewIds": [
    "68e123abc...",
    "68e456def...",
    "68e789ghi..."
  ],
  "action": "approve",
  "reason": "Batch approval after quality review"
}
```

**Actions:**
- `approve`: Approve all selected reviews
- `reject`: Reject all selected reviews (reason required)
- `flag`: Flag all selected reviews for investigation (reason required)
- `delete`: Delete all selected reviews (use with caution)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully approved 3 reviews",
  "data": {
    "processed": 3,
    "action": "approve"
  }
}
```

**Example Use Cases:**

**Bulk Approve:**
```json
{
  "reviewIds": ["68e123abc...", "68e456def..."],
  "action": "approve"
}
```

**Bulk Reject:**
```json
{
  "reviewIds": ["68e123abc...", "68e456def..."],
  "action": "reject",
  "reason": "Contains spam or promotional content"
}
```

**Bulk Flag:**
```json
{
  "reviewIds": ["68e123abc...", "68e456def..."],
  "action": "flag",
  "reason": "Suspected coordinated fake reviews"
}
```

**Bulk Delete:**
```json
{
  "reviewIds": ["68e123abc..."],
  "action": "delete"
}
```

**Side Effects:**
- Product ratings are recalculated for all affected products
- Moderation history is recorded for audit trail
- Bulk operations are processed sequentially for consistency

**Error Responses:**
- `400 Bad Request`: No review IDs provided, or reason missing for reject/flag actions
- `403 Forbidden`: Insufficient permissions

---

### 9. Get Vendor Review Analytics

Get review analytics for a specific vendor.

```http
GET /admin/reviews/vendor/:vendorId/analytics
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `vendorId` (string, required): Vendor ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vendorId": "68e789ghi...",
    "businessName": "Tech Store Ltd",
    "totalReviews": 456,
    "averageRating": 4.7,
    "ratingDistribution": {
      "1": 12,
      "2": 23,
      "3": 67,
      "4": 145,
      "5": 209
    },
    "productReviews": 423,
    "vendorReviews": 33,
    "responseRate": 78.5,
    "averageResponseTime": "3.2 hours",
    "reviewTrend": {
      "last30Days": 45,
      "previous30Days": 38,
      "growth": 18.4
    },
    "topReviewedProducts": [
      {
        "productId": "68e456def...",
        "title": "iPhone 15 Pro",
        "reviewCount": 89,
        "averageRating": 4.8
      }
    ]
  }
}
```

---

### 10. Get Product Review Analytics

Get review analytics for a specific product.

```http
GET /admin/reviews/product/:productId/analytics
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `productId` (string, required): Product ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "productId": "68e456def...",
    "title": "iPhone 15 Pro",
    "totalReviews": 234,
    "averageRating": 4.9,
    "ratingDistribution": {
      "1": 2,
      "2": 5,
      "3": 12,
      "4": 67,
      "5": 148
    },
    "verifiedPurchasePercentage": 92.3,
    "reviewsWithImages": 89,
    "reviewsWithVendorResponse": 198,
    "reviewTrend": {
      "last30Days": 23,
      "previous30Days": 18,
      "growth": 27.8
    },
    "sentimentAnalysis": {
      "positive": 215,
      "neutral": 15,
      "negative": 4
    }
  }
}
```

---

### Review Moderation Best Practices

**Approval Guidelines:**
1. Review is relevant to the product/vendor
2. No offensive language or personal attacks
3. Based on actual experience (preferably verified purchase)
4. Constructive feedback provided
5. No promotional content or spam

**Rejection Reasons:**
- Inappropriate language or hate speech
- Spam or promotional content
- Review not related to product/vendor
- Duplicate reviews from same user
- Fake or fraudulent reviews

**Flag Triggers:**
- Multiple negative reviews in short time
- Reviews from accounts with no purchase history
- Reviews with external links
- Reviews flagged by multiple users
- Suspicious rating patterns

**Response to Flagged Reviews:**
1. Investigate customer purchase history
2. Check for duplicate accounts
3. Review order details if verifiedPurchase
4. Contact customer if needed
5. Make moderation decision (approve/reject/keep flagged)

---

## Security & Audit

Base path: `/admin/security`

### Overview

Monitor security events, audit logs, fraud detection, and manage IP blocking.

**Role Requirements:** ADMIN, SUPER_ADMIN

---

### 1. Get Security Events

```http
GET /admin/security/events
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `type` (string, optional): login, logout, permission_change, ip_blocked
- `severity` (string, optional): low, medium, high, critical
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "event123",
      "type": "failed_login",
      "severity": "medium",
      "userId": "user456",
      "email": "john@example.com",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "attempts": 5,
        "reason": "Invalid password"
      },
      "timestamp": "2025-10-07T18:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

---

### 2. Get Security Alerts

```http
GET /admin/security/alerts
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "alert123",
      "type": "brute_force_attempt",
      "severity": "high",
      "ipAddress": "192.168.1.100",
      "details": "15 failed login attempts in 5 minutes",
      "status": "active",
      "createdAt": "2025-10-07T18:25:00Z"
    },
    {
      "id": "alert124",
      "type": "suspicious_activity",
      "severity": "medium",
      "userId": "user789",
      "details": "Multiple orders from different locations",
      "status": "investigating",
      "createdAt": "2025-10-07T17:00:00Z"
    }
  ],
  "summary": {
    "total": 8,
    "active": 3,
    "investigating": 2,
    "resolved": 3
  }
}
```

---

### 3. Get Audit Log

```http
GET /admin/security/audit-log
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": "log123",
      "action": "user_suspended",
      "performedBy": {
        "staffId": "staff123",
        "staffName": "Admin User",
        "role": "super_admin"
      },
      "target": {
        "type": "user",
        "id": "user456",
        "email": "john@example.com"
      },
      "details": {
        "reason": "Policy violation",
        "duration": 30
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2025-10-07T18:00:00Z"
    }
  ],
  "meta": {
    "period": "30 days",
    "total": 2450
  }
}
```

---

### 4. Get Fraud Detection Data

```http
GET /admin/security/fraud-detection
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "suspicious": {
    "orders": 8,
    "users": 12,
    "transactions": 5
  },
  "flaggedOrders": [
    {
      "orderId": "order789",
      "reason": "Multiple cards same IP",
      "riskScore": 85,
      "timestamp": "2025-10-07T15:00:00Z"
    }
  ],
  "flaggedUsers": [
    {
      "userId": "user999",
      "email": "suspicious@example.com",
      "reason": "Multiple failed payments",
      "riskScore": 75,
      "timestamp": "2025-10-07T14:30:00Z"
    }
  ]
}
```

---

### 5. Get Threat Intelligence

```http
GET /admin/security/threat-intelligence
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "knownThreats": 25,
  "blockedIPs": 45,
  "blockedCountries": [],
  "recentThreats": [
    {
      "type": "brute_force",
      "source": "192.168.1.100",
      "attempts": 50,
      "lastAttempt": "2025-10-07T18:30:00Z",
      "status": "blocked"
    }
  ]
}
```

---

### 6. Get Login Analytics

```http
GET /admin/security/login-analytics
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response (200 OK):**
```json
{
  "period": "30 days",
  "successful": 12500,
  "failed": 250,
  "successRate": 98.0,
  "byHour": [
    {
      "hour": 9,
      "count": 450
    },
    {
      "hour": 10,
      "count": 520
    }
  ],
  "byCountry": [
    {
      "country": "Nigeria",
      "count": 11000
    },
    {
      "country": "Ghana",
      "count": 800
    }
  ],
  "topIPs": [
    {
      "ip": "192.168.1.50",
      "count": 120,
      "lastLogin": "2025-10-07T18:30:00Z"
    }
  ]
}
```

---

### 7. Get Blocked IPs

```http
GET /admin/security/blocked-ips
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "blocked": [
    {
      "ip": "192.168.1.100",
      "reason": "Brute force attack",
      "blockedBy": "staff123",
      "blockedAt": "2025-10-07T18:30:00Z",
      "expiresAt": "2025-10-14T18:30:00Z"
    }
  ],
  "total": 45
}
```

---

### 8. Block IP Address

```http
POST /admin/security/block-ip
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "ipAddress": "192.168.1.100",
  "reason": "Brute force attack detected",
  "duration": 7
}
```

**Response (200 OK):**
```json
{
  "message": "IP address blocked successfully",
  "data": {
    "ip": "192.168.1.100",
    "blockedUntil": "2025-10-14T19:00:00Z"
  }
}
```

---

### 9. Unblock IP Address

```http
DELETE /admin/security/unblock-ip/:ipAddress
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "message": "IP address unblocked successfully"
}
```

---

## Audit Logs

Base path: `/admin/audit-logs`

### Overview

Comprehensive audit logging system for tracking all administrative actions and system events. All endpoints are restricted to **SUPER_ADMIN** role only.

**Role Requirements:** SUPER_ADMIN only

**Key Features:**
- Complete activity tracking for all staff actions
- Advanced filtering by staff, action type, resource, severity, and date ranges
- Statistics and analytics on audit data
- Critical and failed action monitoring
- IP address tracking and metadata storage

---

### 1. Get All Audit Logs

```http
GET /admin/audit-logs
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `staffId` (string, optional): Filter by staff member ID
- `actionType` (enum, optional): Filter by action type
    - Values: `create`, `read`, `update`, `delete`, `login`, `logout`
- `resource` (string, optional): Filter by resource type (e.g., "product", "user", "order")
- `resourceId` (string, optional): Filter by specific resource ID
- `severity` (enum, optional): Filter by severity level
    - Values: `low`, `medium`, `high`, `critical`
- `success` (boolean, optional): Filter by success status (true/false)
- `startDate` (string, optional): Start date filter (ISO 8601 format)
- `endDate` (string, optional): End date filter (ISO 8601 format)
- `search` (string, optional): Search in action and resource fields
- `ipAddress` (string, optional): Filter by IP address

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e4023434ca46ef9d41e1cf",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "admin@digimall.ng",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin"
      },
      "action": "Created new product",
      "actionType": "create",
      "resource": "product",
      "resourceId": "68e4023434ca46ef9d41e1d0",
      "severity": "low",
      "success": true,
      "metadata": {
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "device": "Desktop",
        "endpoint": "/api/v1/admin/products",
        "method": "POST",
        "duration": 245,
        "responseCode": 201
      },
      "createdAt": "2025-10-08T12:30:00Z",
      "updatedAt": "2025-10-08T12:30:00Z"
    }
  ],
  "pagination": {
    "total": 1245,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  }
}
```

---

### 2. Get Audit Log by ID

```http
GET /admin/audit-logs/:id
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Audit log ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "68e4023434ca46ef9d41e1cf",
    "staffId": {
      "_id": "68e4023434ca46ef9d41e1cf",
      "email": "admin@digimall.ng",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "phone": "+2348012345678"
    },
    "action": "Updated user status",
    "actionType": "update",
    "resource": "user",
    "resourceId": "68e4023434ca46ef9d41e1d0",
    "severity": "medium",
    "success": true,
    "metadata": {
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "changes": {
        "status": {
          "from": "active",
          "to": "suspended"
        }
      },
      "endpoint": "/api/v1/admin/users/68e4023434ca46ef9d41e1d0",
      "method": "PATCH",
      "duration": 180,
      "responseCode": 200
    },
    "createdAt": "2025-10-08T12:30:00Z",
    "updatedAt": "2025-10-08T12:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid audit log ID
- `404 Not Found`: Audit log not found

---

### 3. Get Audit Log Statistics

```http
GET /admin/audit-logs/statistics
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Query Parameters:**
- `startDate` (string, optional): Start date filter (ISO 8601 format)
    - Example: `2025-10-01T00:00:00Z`
- `endDate` (string, optional): End date filter (ISO 8601 format)
    - Example: `2025-10-31T23:59:59Z`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalLogs": 12450,
      "totalSuccess": 12100,
      "totalFailure": 350,
      "successRate": "97.19%"
    },
    "byActionType": {
      "create": 3500,
      "read": 5200,
      "update": 2800,
      "delete": 450,
      "login": 400,
      "logout": 100
    },
    "byResource": [
      {
        "resource": "product",
        "count": 4200
      },
      {
        "resource": "order",
        "count": 3100
      },
      {
        "resource": "user",
        "count": 2500
      }
    ],
    "bySeverity": {
      "low": 8500,
      "medium": 2800,
      "high": 950,
      "critical": 200
    },
    "topUsers": [
      {
        "staffId": "68e4023434ca46ef9d41e1cf",
        "email": "admin@digimall.ng",
        "firstName": "Admin",
        "lastName": "User",
        "actionsCount": 2450
      }
    ],
    "recentCriticalActions": [
      {
        "_id": "68e4023434ca46ef9d41e1d0",
        "staffId": {
          "email": "admin@digimall.ng",
          "firstName": "Admin",
          "lastName": "User"
        },
        "action": "Deleted user account",
        "resource": "user",
        "severity": "critical",
        "success": true,
        "createdAt": "2025-10-08T12:00:00Z"
      }
    ]
  }
}
```

---

### 4. Get Critical Audit Logs

```http
GET /admin/audit-logs/critical
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e4023434ca46ef9d41e1cf",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "admin@digimall.ng",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin"
      },
      "action": "Deleted vendor account",
      "actionType": "delete",
      "resource": "vendor",
      "resourceId": "68e4023434ca46ef9d41e1d0",
      "severity": "critical",
      "success": true,
      "metadata": {
        "ipAddress": "192.168.1.100",
        "reason": "Policy violation"
      },
      "createdAt": "2025-10-08T11:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 5. Get Failed Audit Logs

```http
GET /admin/audit-logs/failed
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e4023434ca46ef9d41e1cf",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "staff@digimall.ng",
        "firstName": "Staff",
        "lastName": "Member",
        "role": "admin"
      },
      "action": "Attempted to delete protected resource",
      "actionType": "delete",
      "resource": "category",
      "resourceId": "68e4023434ca46ef9d41e1d0",
      "severity": "high",
      "success": false,
      "errorMessage": "Cannot delete category with active products",
      "metadata": {
        "ipAddress": "192.168.1.105",
        "responseCode": 400
      },
      "createdAt": "2025-10-08T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 127,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

---

### 6. Get Audit Logs by Staff Member

```http
GET /admin/audit-logs/staff/:staffId
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Path Parameters:**
- `staffId` (string, required): Staff member ID (MongoDB ObjectId)
    - Example: `68e4023434ca46ef9d41e1cf`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e4023434ca46ef9d41e1cf",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "admin@digimall.ng",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin"
      },
      "action": "Updated product inventory",
      "actionType": "update",
      "resource": "product",
      "resourceId": "68e4023434ca46ef9d41e1d0",
      "severity": "low",
      "success": true,
      "createdAt": "2025-10-08T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 856,
    "page": 1,
    "limit": 20,
    "totalPages": 43
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid staff ID
- `404 Not Found`: Staff member not found

---

### 7. Get Audit Logs by Resource

```http
GET /admin/audit-logs/resource/:resource
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Path Parameters:**
- `resource` (string, required): Resource type
    - Examples: `product`, `user`, `order`, `vendor`, `category`, `subscription`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e4023434ca46ef9d41e1cf",
      "staffId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "admin@digimall.ng",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin"
      },
      "action": "Created new product",
      "actionType": "create",
      "resource": "product",
      "resourceId": "68e4023434ca46ef9d41e1d0",
      "severity": "low",
      "success": true,
      "createdAt": "2025-10-08T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 2340,
    "page": 1,
    "limit": 20,
    "totalPages": 117
  }
}
```

---

## System Management

Base path: `/admin/system`

### Overview

System configuration, health monitoring, metrics, and maintenance operations.

**Role Requirements:** SUPER_ADMIN (most endpoints), ADMIN/STAFF (read-only)

---

### 1. Get System Configuration

```http
GET /admin/system/config
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "platform": {
    "name": "DigiMall",
    "version": "1.0.0",
    "environment": "production",
    "maintenanceMode": false
  },
  "features": {
    "bargaining": true,
    "chat": true,
    "reviews": true,
    "wishlist": true,
    "subscriptions": true
  },
  "limits": {
    "maxProductImages": 10,
    "maxFileSize": 10485760,
    "orderRetentionDays": 90
  },
  "email": {
    "provider": "resend",
    "fromAddress": "noreply@digimall.ng"
  },
  "payment": {
    "providers": ["paystack"],
    "currency": "NGN"
  }
}
```

---

### 2. Update System Configuration

```http
PUT /admin/system/config
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** SUPER_ADMIN

**Request Body:**
```json
{
  "maintenanceMode": false,
  "features": {
    "bargaining": true,
    "chat": true
  },
  "limits": {
    "maxProductImages": 12,
    "maxFileSize": 15728640
  }
}
```

**Response (200 OK):**
```json
{
  "message": "System configuration updated successfully",
  "data": {
    "updatedBy": "staff123",
    "updatedAt": "2025-10-07T19:30:00Z"
  }
}
```

---

### 3. Get System Health

```http
GET /admin/system/health
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T19:35:00Z",
  "services": {
    "database": {
      "status": "up",
      "responseTime": "5ms"
    },
    "redis": {
      "status": "up",
      "responseTime": "2ms"
    },
    "elasticsearch": {
      "status": "up",
      "responseTime": "15ms"
    },
    "storage": {
      "status": "up",
      "responseTime": "10ms"
    },
    "email": {
      "status": "up",
      "responseTime": "120ms"
    },
    "payment": {
      "status": "up",
      "responseTime": "250ms"
    }
  }
}
```

---

### 4. Get System Metrics

```http
GET /admin/system/metrics
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "server": {
    "uptime": "15 days, 8 hours",
    "cpuUsage": 45.5,
    "memoryUsage": 68.2,
    "diskUsage": 32.5
  },
  "application": {
    "activeConnections": 450,
    "requestsPerMinute": 850,
    "averageResponseTime": "120ms",
    "errorRate": 0.5
  },
  "database": {
    "connections": 8,
    "queryTime": "15ms",
    "slowQueries": 3
  },
  "cache": {
    "hitRate": 85.5,
    "missRate": 14.5,
    "evictionRate": 2.0
  }
}
```

---

### 5. Get Database Statistics

```http
GET /admin/system/database-stats
Authorization: Bearer {accessToken}
```

**Role Required:** ADMIN, SUPER_ADMIN

**Response (200 OK):**
```json
{
  "size": "2.5 GB",
  "collections": [
    {
      "name": "products",
      "documents": 3500,
      "size": "450 MB",
      "averageObjectSize": "128 KB"
    },
    {
      "name": "orders",
      "documents": 450,
      "size": "85 MB",
      "averageObjectSize": "189 KB"
    },
    {
      "name": "users",
      "documents": 1250,
      "size": "120 MB",
      "averageObjectSize": "96 KB"
    }
  ],
  "indexes": 45,
  "performance": {
    "averageQueryTime": "15ms",
    "slowQueries": 3
  }
}
```

---

### 6. Get System Logs

```http
GET /admin/system/logs
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (number, optional): Number of logs to return (default: 100, max: 1000)
- `level` (string, optional): Filter by log level - `all`, `log`, `error`, `warn`, `debug`, `verbose` (default: all)
- `context` (string, optional): Filter by context/module name (e.g., ProductService, SystemService)
- `startDate` (string, optional): Filter logs from this date (ISO 8601 format: `2025-10-08T00:00:00Z`)
- `endDate` (string, optional): Filter logs until this date (ISO 8601 format: `2025-10-08T23:59:59Z`)
- `search` (string, optional): Search term to filter messages and context

**Response (200 OK):**
```json
{
  "logs": [
    {
      "timestamp": "2025-10-08T14:23:45.123Z",
      "level": "log",
      "context": "ProductService",
      "message": "Product created successfully",
      "pid": 12345
    },
    {
      "timestamp": "2025-10-08T14:22:10.456Z",
      "level": "error",
      "context": "PaymentService",
      "message": "Payment verification failed",
      "stack": "Error: Connection timeout...",
      "pid": 12345
    },
    {
      "timestamp": "2025-10-08T14:20:33.789Z",
      "level": "warn",
      "context": "OrderService",
      "message": "Order processing delayed",
      "pid": 12345
    }
  ],
  "total": 856,
  "returned": 100,
  "filters": {
    "limit": 100,
    "level": "all",
    "context": null,
    "startDate": null,
    "endDate": null,
    "search": null
  },
  "stats": {
    "total": 856,
    "byLevel": {
      "log": 645,
      "error": 23,
      "warn": 156,
      "debug": 12,
      "verbose": 20
    },
    "oldestLog": "2025-10-08T12:15:00.000Z",
    "newestLog": "2025-10-08T14:23:45.123Z"
  },
  "meta": {
    "total": 856,
    "limit": 100
  }
}
```

---

### 7. Clear System Cache

```http
POST /admin/system/clear-cache
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "message": "Cache cleared successfully",
  "data": {
    "keysCleared": 1250,
    "clearedBy": "staff123",
    "clearedAt": "2025-10-07T19:45:00Z"
  }
}
```

---

### 8. Perform System Backup

```http
POST /admin/system/backup
Authorization: Bearer {accessToken}
```

**Role Required:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "message": "Backup initiated successfully",
  "data": {
    "backupId": "backup-20251007-194500",
    "status": "in_progress",
    "estimatedCompletion": "2025-10-07T20:00:00Z"
  }
}
```

---

## Subscription Plans

Base path: `/admin/subscription-plans`

### Overview

Manage vendor subscription plans and Paystack integration.

**Role Requirements:** ADMIN, SUPER_ADMIN

---

### 1. Get All Subscription Plans

```http
GET /admin/subscription-plans
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan123",
      "planName": "Basic Plan",
      "description": "Perfect for new vendors",
      "price": 5000.00,
      "currency": "NGN",
      "duration": "monthly",
      "features": [
        "50 product listings",
        "Basic analytics",
        "Email support"
      ],
      "isActive": true,
      "paystackPlanCode": "PLN_abc123",
      "subscribers": 35,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "plan456",
      "planName": "Premium Plan",
      "description": "For established vendors",
      "price": 15000.00,
      "currency": "NGN",
      "duration": "monthly",
      "features": [
        "Unlimited product listings",
        "Advanced analytics",
        "Priority support",
        "Featured placement"
      ],
      "isActive": true,
      "paystackPlanCode": "PLN_xyz789",
      "subscribers": 28,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Subscription Plan by ID

```http
GET /admin/subscription-plans/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "plan123",
    "planName": "Basic Plan",
    "description": "Perfect for new vendors",
    "price": 5000.00,
    "currency": "NGN",
    "duration": "monthly",
    "features": [
      "50 product listings",
      "Basic analytics",
      "Email support"
    ],
    "isActive": true,
    "paystackPlanCode": "PLN_abc123",
    "subscribers": 35,
    "revenue": 175000.00,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2025-09-20T14:30:00Z"
  }
}
```

---

### 3. Create Subscription Plan

```http
POST /admin/subscription-plans
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "planName": "Enterprise Plan",
  "description": "For large-scale vendors",
  "price": 50000.00,
  "currency": "NGN",
  "duration": "monthly",
  "features": [
    "Unlimited everything",
    "Dedicated account manager",
    "API access",
    "Custom integrations"
  ],
  "isActive": true
}
```

**Duration Options:** `monthly`, `quarterly`, `yearly`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": "plan789",
    "planName": "Enterprise Plan",
    "price": 50000.00,
    "duration": "monthly"
  }
}
```

> **Important Note - Paystack Integration:**
>
> Subscription plans are **NOT automatically synced to Paystack** when created. This is intentional to allow admins to review and configure plans before making them available for vendor subscriptions.
>
> **Required Workflow:**
> 1. Create the subscription plan using `POST /admin/subscription-plans` (creates in MongoDB only)
> 2. Review and verify plan details
> 3. Manually sync to Paystack using `POST /admin/subscription-plans/:id/sync-paystack`
> 4. Plan is now available for vendor subscriptions via Paystack
>
> Vendors cannot subscribe to a plan until it has been synced to Paystack (indicated by the `paystackPlanCode` field).

---

### 4. Update Subscription Plan

```http
PUT /admin/subscription-plans/:id
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "planName": "Premium Plus Plan",
  "price": 18000.00,
  "features": [
    "Unlimited product listings",
    "Advanced analytics",
    "Priority support",
    "Featured placement",
    "Social media integration"
  ],
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "id": "plan456",
    "planName": "Premium Plus Plan",
    "price": 18000.00
  }
}
```

---

### 5. Archive Subscription Plan

```http
DELETE /admin/subscription-plans/:id
Authorization: Bearer {accessToken}
```

**Role Required:** ADMIN, SUPER_ADMIN

**Note:** Cannot delete plans with active subscriptions.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plan archived successfully"
}
```

---

### 6. Sync Plan with Paystack

```http
POST /admin/subscription-plans/:id/sync-paystack
Authorization: Bearer {accessToken}
```

**Role Required:** ADMIN, SUPER_ADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plan created in Paystack",
  "data": {
    "planCode": "PLN_newplan123",
    "synced": true
  }
}
```

---

### 7. Get All Vendor Subscriptions

```http
GET /admin/vendor-subscriptions
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status - `active`, `pending`, `cancelled`, `expired`, `suspended`, `trial`
- `paymentStatus` (string, optional): Filter by payment status - `pending`, `paid`, `failed`, `refunded`
- `vendorId` (string, optional): Filter by specific vendor
- `planId` (string, optional): Filter by subscription plan
- `startDate` (string, optional): Filter subscriptions starting from date (ISO 8601)
- `endDate` (string, optional): Filter subscriptions ending before date (ISO 8601)

**Response (200 OK):**
```json
{
  "subscriptions": [
    {
      "id": "sub123",
      "vendorId": {
        "id": "vendor123",
        "businessName": "Tech Store Ltd",
        "email": "vendor@techstore.com",
        "phone": "+234801234567",
        "status": "active"
      },
      "planId": {
        "id": "plan456",
        "planName": "Premium Plan",
        "displayName": "Premium",
        "price": 15000.00,
        "duration": "monthly"
      },
      "status": "active",
      "paymentStatus": "paid",
      "amount": 15000.00,
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-11-01T00:00:00Z",
      "autoRenew": true,
      "trialPeriod": false,
      "paystackSubscriptionCode": "SUB_xyz789abc",
      "paystackCustomerCode": "CUS_abc123xyz",
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Subscription Status Values:**
- `active`: Currently active subscription
- `pending`: Payment pending or awaiting activation
- `cancelled`: Cancelled by admin or vendor
- `expired`: Subscription period ended
- `suspended`: Temporarily suspended
- `trial`: In trial period

**Payment Status Values:**
- `pending`: Payment not yet completed
- `paid`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

---

### 8. Get Vendor Subscription Details

```http
GET /admin/vendor-subscriptions/:id
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `id` (string, required): Subscription ID

**Response (200 OK):**
```json
{
  "id": "sub123",
  "vendorId": {
    "id": "vendor123",
    "businessName": "Tech Store Ltd",
    "email": "vendor@techstore.com",
    "phone": "+234801234567",
    "status": "active"
  },
  "planId": {
    "id": "plan456",
    "planName": "Premium Plan",
    "displayName": "Premium",
    "description": "For established vendors",
    "price": 15000.00,
    "currency": "NGN",
    "duration": "monthly",
    "features": [
      "Unlimited product listings",
      "Advanced analytics",
      "Priority support"
    ]
  },
  "paymentId": {
    "id": "payment789",
    "transactionReference": "TXN-20251001-ABC123",
    "amount": 15000.00,
    "status": "completed",
    "paymentMethod": "paystack",
    "paidAt": "2025-10-01T10:05:00Z"
  },
  "status": "active",
  "paymentStatus": "paid",
  "amount": 15000.00,
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-11-01T00:00:00Z",
  "autoRenew": true,
  "trialPeriod": false,
  "trialEndDate": null,
  "paystackSubscriptionCode": "SUB_xyz789abc",
  "paystackCustomerCode": "CUS_abc123xyz",
  "metadata": {
    "scheduledCancellation": false,
    "lastRenewal": "2025-10-01T00:00:00Z"
  },
  "notes": [
    {
      "timestamp": "2025-10-01T10:00:00Z",
      "action": "subscription_created",
      "note": "Initial subscription",
      "performedBy": "vendor123"
    }
  ],
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-01T10:00:00Z"
}
```

**Virtual Properties (Computed):**
- `isActive`: Boolean indicating if subscription is currently active
- `daysRemaining`: Number of days until expiration
- `formattedAmount`: Formatted currency string (e.g., "₦15,000.00")

**Error Responses:**
- `400 Bad Request`: Invalid subscription ID
- `404 Not Found`: Subscription not found

---

### 9. Cancel Vendor Subscription

```http
POST /admin/vendor-subscriptions/:id/cancel
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Path Parameters:**
- `id` (string, required): Subscription ID

**Request Body:**
```json
{
  "reason": "Vendor requested cancellation",
  "issueRefund": false,
  "cancelAtPeriodEnd": false
}
```

**Field Descriptions:**
- `reason` (string, optional): Cancellation reason (max 500 characters)
- `issueRefund` (boolean, optional): Whether to issue refund (default: false)
- `cancelAtPeriodEnd` (boolean, optional):
    - `false`: Cancel immediately (default)
    - `true`: Keep active until end date, then cancel

**Response (200 OK) - Immediate Cancellation:**
```json
{
  "message": "Subscription cancelled successfully",
  "subscription": {
    "id": "sub123",
    "vendorId": "vendor123",
    "status": "cancelled",
    "cancelledAt": "2025-10-07T15:00:00Z",
    "cancelledBy": "staff456"
  },
  "refund": null
}
```

**Response (200 OK) - Scheduled Cancellation:**
```json
{
  "message": "Subscription scheduled for cancellation",
  "subscription": {
    "id": "sub123",
    "vendorId": "vendor123",
    "status": "active",
    "autoRenew": false,
    "metadata": {
      "scheduledCancellation": true,
      "cancellationDate": "2025-11-01T00:00:00Z"
    }
  },
  "note": "Subscription will remain active until end date: 2025-11-01T00:00:00Z"
}
```

**Business Logic:**

**Immediate Cancellation (cancelAtPeriodEnd = false):**
- Subscription status changes to `cancelled`
- `cancelledAt` timestamp recorded
- Staff ID stored in `cancelledBy` field
- Optional refund can be issued
- Vendor loses subscription benefits immediately

**Scheduled Cancellation (cancelAtPeriodEnd = true):**
- Subscription remains `active` until end date
- Auto-renew disabled to prevent renewal
- Metadata flag `scheduledCancellation` set to true
- Cancellation note added to subscription history
- Vendor retains benefits until end date

**Audit Trail:**
- Cancellation reason stored in notes
- Staff member who performed action recorded
- Timestamp of cancellation logged
- All metadata preserved for reporting

**Use Cases:**
1. **Vendor Request**: Vendor wants to downgrade or leave platform
2. **Non-Payment**: Payment failed and vendor doesn't renew
3. **Policy Violation**: Admin cancels due to terms violation
4. **Grace Period**: Cancel at period end to allow vendor to finish current month

**Example: Immediate cancellation with refund**
```json
{
  "reason": "Vendor account closed",
  "issueRefund": true,
  "cancelAtPeriodEnd": false
}
```

**Example: Cancel at end of current period**
```json
{
  "reason": "Vendor switching to lower tier next month",
  "cancelAtPeriodEnd": true
}
```

**Error Responses:**
- `400 Bad Request`: Invalid subscription ID or already cancelled
- `404 Not Found`: Subscription not found

---

### 10. Get Subscription Plan Statistics

```http
GET /admin/subscription-plans/statistics
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "overview": {
    "totalSubscriptions": 85,
    "activeSubscriptions": 72,
    "cancelledSubscriptions": 8,
    "expiredSubscriptions": 5,
    "totalRevenue": 1275000.00,
    "monthlyRecurringRevenue": 1050000.00
  },
  "byPlan": [
    {
      "planId": "plan123",
      "planName": "Basic Plan",
      "displayName": "Basic",
      "price": 5000.00,
      "subscribers": 35,
      "revenue": 175000.00,
      "percentage": 41.2
    },
    {
      "planId": "plan456",
      "planName": "Premium Plan",
      "displayName": "Premium",
      "price": 15000.00,
      "subscribers": 28,
      "revenue": 420000.00,
      "percentage": 32.9
    },
    {
      "planId": "plan789",
      "planName": "Enterprise Plan",
      "displayName": "Enterprise",
      "price": 50000.00,
      "subscribers": 9,
      "revenue": 450000.00,
      "percentage": 10.6
    }
  ],
  "byStatus": {
    "active": 72,
    "pending": 3,
    "cancelled": 8,
    "expired": 5,
    "suspended": 2,
    "trial": 5
  },
  "recentSubscriptions": [
    {
      "id": "sub999",
      "vendorName": "New Vendor Store",
      "planName": "Premium Plan",
      "amount": 15000.00,
      "status": "active",
      "startDate": "2025-10-07T10:00:00Z"
    },
    {
      "id": "sub888",
      "vendorName": "Another Tech Shop",
      "planName": "Basic Plan",
      "amount": 5000.00,
      "status": "active",
      "startDate": "2025-10-06T14:30:00Z"
    }
  ]
}
```

**Metrics Explained:**

**Overview Metrics:**
- **totalSubscriptions**: All subscriptions (any status)
- **activeSubscriptions**: Currently active subscriptions
- **cancelledSubscriptions**: Cancelled by vendor or admin
- **expiredSubscriptions**: Subscription period ended without renewal
- **totalRevenue**: Total revenue from all subscriptions (all-time)
- **monthlyRecurringRevenue**: Expected monthly revenue from active subscriptions

**By Plan Breakdown:**
- **subscribers**: Number of active subscribers on this plan
- **revenue**: Total revenue generated by this plan
- **percentage**: Percentage of total subscribers

**By Status Breakdown:**
- Count of subscriptions in each status
- Helps identify churn and trial conversion rates

**Recent Subscriptions:**
- Shows last 10 new subscriptions
- Useful for monitoring growth trends
- Displays vendor name, plan, amount, and start date

**Use Cases:**
1. **Revenue Forecasting**: MRR calculation for financial planning
2. **Plan Performance**: Identify most popular plans
3. **Churn Analysis**: Track cancelled and expired subscriptions
4. **Growth Monitoring**: Recent subscriptions trend
5. **Plan Optimization**: Identify underperforming plans

**Business Insights:**
- High cancellation rate → Review pricing or features
- Low trial conversion → Improve onboarding
- High enterprise adoption → Expand premium features
- MRR growth → Healthy business trajectory

---

## Notifications Management

Base path: `/admin/notifications`

### Overview

Comprehensive notification management system for admins to monitor, create, broadcast, and manage all platform notifications.

**Role Requirements:** ADMIN, SUPER_ADMIN

**Key Features:**
- View all notifications across the platform
- Create broadcast notifications to users
- Filter and search notifications
- Get notification statistics
- Resend failed notifications
- Manage scheduled notifications

---

### 1. Get All Notifications

```http
GET /admin/notifications
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page, max 100 (default: 20)
- `userId` (string, optional): Filter by user ID
- `type` (string, optional): Filter by notification type
- `status` (string, optional): Filter by status (pending, sent, delivered, failed)
- `priority` (string, optional): Filter by priority (low, medium, high, urgent)
- `channel` (string, optional): Filter by channel (in_app, email, sms, push)
- `isRead` (boolean, optional): Filter by read status
- `startDate` (string, optional): Filter from date (ISO 8601)
- `endDate` (string, optional): Filter to date (ISO 8601)
- `search` (string, optional): Search in title and body

**Notification Types:**
- `order_status`, `payment_confirmation`, `system_announcement`, `promotion`, `security_alert`, `account_update`, `vendor_alert`, `product_update`, `review_notification`, `chat_message`

**Example Request:**
```http
GET /admin/notifications?page=1&limit=20&type=system_announcement&status=sent&startDate=2025-10-01T00:00:00Z
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "670dd4e5a1b2c3d4e5f67890",
      "notificationId": "NOTIF-2025-10-001",
      "userId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "vendor@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "vendor"
      },
      "type": "system_announcement",
      "priority": "high",
      "title": "System Maintenance Notice",
      "body": "System will be under maintenance on Sunday 10 PM - 12 AM",
      "channels": ["in_app", "email"],
      "status": "sent",
      "isRead": false,
      "actionUrl": "/announcements/maintenance-oct-2025",
      "actionText": "Read More",
      "imageUrl": "https://cdn.digimall.ng/images/maintenance.png",
      "channelStatus": {
        "in_app": "delivered",
        "email": "sent"
      },
      "metadata": {
        "broadcast": true,
        "adminCreated": true,
        "campaign": "Q4-2025"
      },
      "createdAt": "2025-10-07T10:00:00Z",
      "sentAt": "2025-10-07T10:00:05Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  }
}
```

---

### 2. Get Notification by ID

```http
GET /admin/notifications/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "670dd4e5a1b2c3d4e5f67890",
    "notificationId": "NOTIF-2025-10-001",
    "userId": {
      "_id": "68e4023434ca46ef9d41e1cf",
      "email": "vendor@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "vendor",
      "phone": "+2348012345678"
    },
    "type": "system_announcement",
    "priority": "high",
    "title": "System Maintenance Notice",
    "body": "System will be under maintenance on Sunday 10 PM - 12 AM",
    "channels": ["in_app", "email"],
    "status": "sent",
    "isRead": false,
    "channelStatus": {
      "in_app": "delivered",
      "email": "sent"
    },
    "channelTimestamps": {
      "in_app": "2025-10-07T10:00:05Z",
      "email": "2025-10-07T10:00:10Z"
    },
    "relatedEntityId": null,
    "relatedEntityType": null,
    "createdAt": "2025-10-07T10:00:00Z",
    "sentAt": "2025-10-07T10:00:05Z"
  }
}
```

---

### 3. Get Notification Statistics

```http
GET /admin/notifications/statistics
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (string, optional): Start date filter (ISO 8601)
- `endDate` (string, optional): End date filter (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalNotifications": 125000,
      "totalRead": 98750,
      "totalUnread": 26250,
      "readRate": "79.00%",
      "deliveryRate": "96.50%",
      "failureRate": "3.50%",
      "avgReadTimeMinutes": 45
    },
    "byStatus": {
      "pending": 150,
      "sent": 80000,
      "delivered": 40500,
      "failed": 4350
    },
    "byType": {
      "order_status": 45000,
      "payment_confirmation": 32000,
      "system_announcement": 8500,
      "promotion": 15000,
      "security_alert": 2500,
      "product_update": 12000,
      "chat_message": 10000
    },
    "byPriority": {
      "low": 45000,
      "medium": 60000,
      "high": 18000,
      "urgent": 2000
    },
    "byChannel": {
      "in_app": 125000,
      "email": 95000,
      "sms": 12000,
      "push": 85000
    }
  }
}
```

---

### 4. Create Broadcast Notification

```http
POST /admin/notifications/broadcast
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Flash Sale Alert!",
  "body": "Get 50% off on all electronics this weekend. Limited time offer!",
  "type": "promotion",
  "priority": "high",
  "channels": ["in_app", "email", "push"],
  "targetUserIds": ["68e4023434ca46ef9d41e1cf", "68da4c265e57ac800e37cc31"],
  "targetRole": "vendors",
  "actionUrl": "/promotions/flash-sale-oct-2025",
  "actionText": "Shop Now",
  "imageUrl": "https://cdn.digimall.ng/images/flash-sale.png",
  "scheduledAt": "2025-10-10T08:00:00Z",
  "expiresAt": "2025-10-12T23:59:59Z",
  "templateData": {
    "discount": "50",
    "category": "electronics",
    "endDate": "Oct 12, 2025"
  },
  "metadata": {
    "campaign": "Q4-2025-Flash-Sale",
    "source": "admin"
  }
}
```

**Field Descriptions:**
- `title` (required): Notification title
- `body` (required): Notification message
- `type` (required): Notification type
- `priority` (required): Priority level
- `channels` (required): Delivery channels array
- `targetUserIds` (optional): Specific user IDs to target (overrides targetRole)
- `targetRole` (optional): Target user role (vendors, customers, all)
- `actionUrl` (optional): URL for clickable notifications
- `actionText` (optional): Action button text
- `imageUrl` (optional): Image URL for notification
- `scheduledAt` (optional): Schedule for future delivery
- `expiresAt` (optional): Notification expiry date
- `templateData` (optional): Dynamic content data
- `metadata` (optional): Additional metadata

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Broadcast notification created successfully",
  "data": {
    "targetCount": 1250,
    "sentCount": 1247,
    "failedCount": 3,
    "scheduledAt": "2025-10-10T08:00:00Z"
  }
}
```

**Broadcasting Logic:**
1. If `targetUserIds` is provided → sends to specific users
2. If `targetRole` is provided → sends to all users with that role
3. If neither is provided → sends to all active users

---

### 5. Get Failed Notifications

```http
GET /admin/notifications/failed
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "670dd4e5a1b2c3d4e5f67891",
      "notificationId": "NOTIF-2025-10-002",
      "userId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "customer@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "type": "payment_confirmation",
      "title": "Payment Received",
      "body": "Your payment of ₦15,000 has been received",
      "channels": ["email", "sms"],
      "status": "failed",
      "channelErrors": {
        "email": "SMTP connection timeout",
        "sms": "Invalid phone number"
      },
      "createdAt": "2025-10-07T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 6. Get Scheduled Notifications

```http
GET /admin/notifications/scheduled
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "670dd4e5a1b2c3d4e5f67892",
      "notificationId": "NOTIF-2025-10-003",
      "userId": {
        "_id": "68e4023434ca46ef9d41e1cf",
        "email": "vendor@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "type": "system_announcement",
      "title": "Upcoming Feature Launch",
      "body": "New analytics dashboard launching next week!",
      "channels": ["in_app", "email"],
      "status": "pending",
      "scheduledAt": "2025-10-15T09:00:00Z",
      "createdAt": "2025-10-07T16:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 7. Resend Notification

```http
POST /admin/notifications/:id/resend
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "channels": ["email", "sms"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification queued for resending",
  "data": {
    "channels": ["email", "sms"]
  }
}
```

**Use Cases:**
- Retry failed notifications
- Resend to specific channels
- Re-attempt delivery after fixing issues

---

### 8. Delete Notification

```http
DELETE /admin/notifications/:id
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Note:** This is a soft delete (sets `isDeleted: true`). Notification remains in database for audit purposes.

---

### 9. Bulk Delete Notifications

```http
POST /admin/notifications/bulk-delete
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationIds": [
    "670dd4e5a1b2c3d4e5f67890",
    "670dd4e5a1b2c3d4e5f67891",
    "NOTIF-2025-10-003"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 notifications deleted successfully",
  "data": {
    "deletedCount": 3
  }
}
```

---

### Common Use Cases

**1. Monitor System Health**
```http
GET /admin/notifications/statistics
```
Check notification delivery rates and identify issues.

**2. Broadcast Urgent Announcements**
```http
POST /admin/notifications/broadcast
{
  "title": "Emergency Maintenance",
  "type": "system_announcement",
  "priority": "urgent",
  "channels": ["in_app", "email", "sms", "push"],
  "body": "Platform will be down for 30 minutes starting now"
}
```

**3. Target Specific User Segment**
```http
POST /admin/notifications/broadcast
{
  "title": "Vendor Training Webinar",
  "targetRole": "vendors",
  "channels": ["email"],
  "body": "Join us for a free training session on improving sales"
}
```

**4. Schedule Campaign Notifications**
```http
POST /admin/notifications/broadcast
{
  "title": "Black Friday Sale Coming Soon!",
  "scheduledAt": "2025-11-20T08:00:00Z",
  "expiresAt": "2025-11-30T23:59:59Z",
  "channels": ["in_app", "email", "push"]
}
```

**5. Investigate Failed Deliveries**
```http
GET /admin/notifications/failed?page=1&limit=50
```
Review failed notifications and resend after fixing issues.

---

## Admin Vendor Operations

Base path: `/admin/vendors`

### Overview

Admin-specific vendor operations including approvals and activation.

**Role Requirements:** ADMIN, SUPER_ADMIN

---

### 1. Get Pending Vendor Approvals

```http
GET /admin/vendors/pending
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (number, optional): Default 20
- `offset` (number, optional): Default 0

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "vendors": [
      {
        "id": "vendor789",
        "businessName": "New Electronics Store",
        "email": "newvendor@example.com",
        "phone": "+234809999999",
        "submittedAt": "2025-10-06T10:00:00Z",
        "documents": {
          "cac": "submitted",
          "bankStatement": "submitted",
          "idCard": "submitted"
        }
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 2. Get Vendor Details (Admin View)

```http
GET /admin/vendors/:vendorId
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "vendor789",
    "userId": "user999",
    "businessName": "New Electronics Store",
    "email": "newvendor@example.com",
    "phone": "+234809999999",
    "status": "pending_approval",
    "businessAddress": {
      "street": "789 Vendor Plaza",
      "city": "Abuja",
      "state": "FCT",
      "country": "Nigeria"
    },
    "documents": {
      "cac": {
        "status": "submitted",
        "url": "https://cdn.digimall.ng/docs/cac789.pdf",
        "submittedAt": "2025-10-06T10:00:00Z"
      },
      "bankStatement": {
        "status": "submitted",
        "url": "https://cdn.digimall.ng/docs/bank789.pdf",
        "submittedAt": "2025-10-06T10:00:00Z"
      }
    },
    "submittedAt": "2025-10-06T10:00:00Z"
  }
}
```

---

### 3. Approve/Reject Vendor

```http
POST /admin/vendors/:vendorId/approve
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Role Required:** ADMIN, SUPER_ADMIN

**Request Body (Approve):**
```json
{
  "approved": true,
  "comments": "All documents verified successfully"
}
```

**Request Body (Reject):**
```json
{
  "approved": false,
  "rejectionReason": "Invalid CAC certificate. Please submit a valid certificate."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vendor approved successfully",
  "data": {
    "vendorId": "vendor789",
    "businessName": "New Electronics Store",
    "status": "approved",
    "approvalDate": "2025-10-07T20:00:00Z"
  }
}
```

---

### 4. Activate Vendor

```http
PUT /admin/vendors/:vendorId/activate
Authorization: Bearer {accessToken}
```

**Role Required:** ADMIN, SUPER_ADMIN

**Note:** Vendor must be approved and have completed KYC verification.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vendor activated successfully",
  "data": {
    "vendorId": "vendor789",
    "businessName": "New Electronics Store",
    "status": "active",
    "kycStatus": "verified",
    "subscriptionStatus": "active"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

### Error Response Examples

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You do not have permission to perform this action"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Product with ID 'prod999' not found"
}
```

**422 Validation Error:**
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    },
    {
      "field": "stock",
      "message": "Stock cannot be negative"
    }
  ]
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse.

**Default Limits:**
- **60 requests per minute** per IP address
- **1000 requests per hour** per authenticated user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1696700000
```

**Rate Limit Exceeded Response (429):**
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded. Try again in 30 seconds."
}
```

---

## Testing & Integration

### Quick Start

1. **Authenticate:**
   ```bash
   curl -X POST http://localhost:4000/api/v1/staff/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@digimall.ng","password":"Blank@50"}'
   ```

2. **Save the access token from response**

3. **Make authenticated requests:**
   ```bash
   curl http://localhost:4000/api/v1/admin/products \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Frontend Integration Example (JavaScript/TypeScript)

```typescript
// api.ts
const BASE_URL = 'http://localhost:4000/api/v1';
let accessToken = '';

// Login
async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/staff/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  accessToken = data.accessToken;
  localStorage.setItem('adminToken', accessToken);
  return data;
}

// Authenticated request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = accessToken || localStorage.getItem('adminToken');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Example: Get products
async function getProducts(page = 1, limit = 20) {
  return apiRequest(`/admin/products?page=${page}&limit=${limit}`);
}

// Example: Approve product
async function approveProduct(productId: string, reason: string) {
  return apiRequest(`/admin/products/${productId}/approval`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'approved', reason })
  });
}
```

---

## Known Issues

~~All previously reported issues have been resolved.~~ ✅

**Status:** All 68 endpoints are functioning correctly with no known critical issues.

---

## Support

For API support and questions:
- **Email**: dev@digimall.ng
- **Documentation**: https://docs.digimall.ng
- **Status Page**: https://status.digimall.ng

---

## Changelog

### Version 1.5.0 (2025-10-11)
- **Major Feature Addition - Review Management System**:
    - Added complete platform-wide review management with 8 comprehensive admin endpoints
    - **Review Management** (8 new endpoints):
        - GET `/admin/reviews` - Platform-wide review listing with advanced filtering (type, status, rating, vendor, product, customer, flagged, search)
        - GET `/admin/reviews/:id` - Get detailed review information with full context
        - POST `/admin/reviews/:id/approve` - Approve review and make publicly visible
        - POST `/admin/reviews/:id/reject` - Reject review with reason
        - POST `/admin/reviews/:id/flag` - Flag review for investigation
        - DELETE `/admin/reviews/:id` - Permanently delete review
        - GET `/admin/reviews/stats` - Platform-wide review statistics and analytics
        - POST `/admin/reviews/bulk/moderate` - Bulk moderation operations (approve/reject/flag/delete multiple reviews)
    - **Additional Analytics Endpoints** (2 new endpoints):
        - GET `/admin/reviews/vendor/:vendorId/analytics` - Vendor-specific review analytics
        - GET `/admin/reviews/product/:productId/analytics` - Product-specific review analytics
    - **Key Features**:
        - Comprehensive filtering by type (PRODUCT/VENDOR), status (PENDING/APPROVED/REJECTED/FLAGGED), rating, dates
        - Full-text search in review content
        - Platform-wide statistics with rating distribution, vendor response rates, moderation metrics
        - Bulk moderation for efficient review management
        - Automatic product rating synchronization on approval/rejection
        - Complete audit trail with moderator information
        - Review moderation best practices guide included
    - **Business Impact**:
        - Enables quality control across all customer reviews
        - Protects platform integrity from fake or fraudulent reviews
        - Improves customer trust through moderated reviews
        - Provides insights into vendor and product performance
    - Total endpoints: 96 (88 existing + 8 new review endpoints)
    - All endpoints include full Swagger documentation, request/response examples, and error handling
    - Integration with existing customer review endpoints and vendor review management system

### Version 1.2.1 (2025-10-08)
- **Bug Fixes**:
    - Fixed Subscription Plans statistics endpoint route conflict causing 500 errors
        - Issue: Duplicate controller with same route path causing "statistics" to be matched by `:id` parameter
        - Solution: Removed orphaned `subscription-plans.controller.ts` file
        - Result: `GET /admin/subscription-plans/statistics` now works correctly
- **Documentation**:
    - Clarified Paystack sync workflow for subscription plans (manual sync required after creation)
    - Added detailed workflow instructions in subscription plans section

### Version 1.2.0 (2025-10-08)
- Added 10 new escrow management endpoints
- Fixed critical bugs in categories and staff activity endpoints
- **Escrow Management** (10 new endpoints):
    - GET `/admin/escrow` - List all escrow accounts with advanced filtering (pagination, status, date ranges, amounts)
    - GET `/admin/escrow/statistics` - Get comprehensive escrow statistics (totals, amounts, averages)
    - GET `/admin/escrow/disputed` - List escrow accounts with active disputes
    - GET `/admin/escrow/expiring-soon` - List escrow accounts expiring within 7 days
    - GET `/admin/escrow/:id` - Get detailed escrow account information
    - POST `/admin/escrow/:id/release` - Manually release funds to vendor (SUPER_ADMIN only)
    - POST `/admin/escrow/:id/refund` - Manually refund to customer (SUPER_ADMIN only)
    - POST `/admin/escrow/:id/resolve-dispute` - Resolve dispute with decision (SUPER_ADMIN only)
    - GET `/admin/escrow/:id/audit-log` - Get complete audit trail for escrow account
    - GET `/admin/escrow/:id/timeline` - Get chronological timeline of escrow events
- **Bug Fixes**:
    - Fixed Category endpoints route ordering issue causing "Cast to ObjectId failed for value 'statistics'" error
    - Fixed Category schema pre-save hook error "this.addSearchKeywords is not a function"
    - Fixed Staff activity endpoint to return correct `timestamp` and `ipAddress` fields instead of `createdAt` and nested metadata
- **Improvements**:
    - All escrow actions now create audit log entries for compliance tracking
    - Role-based access control: manual escrow operations require SUPER_ADMIN role
    - Comprehensive filtering and sorting for escrow queries
    - Activity logging for all admin escrow actions (release, refund, dispute resolution)
- Total endpoints: 68 (58 existing + 10 new escrow endpoints)
- All endpoints include full Swagger documentation, request/response examples, and error handling

### Version 1.1.0 (2025-10-07)
- Added 14 new admin endpoints
- **Categories Management** (4 endpoints):
    - GET `/admin/categories/:id` - Get category with product/subcategory counts
    - POST `/admin/categories` - Create with auto slug generation
    - PUT `/admin/categories/:id` - Update with slug validation
    - DELETE `/admin/categories/:id` - Soft delete with validation
- **Orders Management** (2 endpoints):
    - POST `/admin/orders/:id/cancel` - Cancel with optional refund
    - POST `/admin/orders/export` - Export with multiple formats
- **Vendors Management** (1 endpoint):
    - PUT `/admin/vendors/:id/suspension` - Suspend/unsuspend with duration
- **Analytics** (3 endpoints):
    - GET `/admin/analytics/traffic` - Traffic analytics (placeholder)
    - GET `/admin/analytics/conversion` - Conversion funnel
    - GET `/admin/analytics/comparison` - Period-over-period comparison
- **Vendor Subscriptions** (4 endpoints):
    - GET `/admin/vendor-subscriptions` - List with advanced filtering
    - GET `/admin/vendor-subscriptions/:id` - Detailed subscription info
    - POST `/admin/vendor-subscriptions/:id/cancel` - Cancel with refund options
    - GET `/admin/subscription-plans/statistics` - Plan statistics
- Total endpoints: 58 (44 existing + 14 new)
- All new endpoints include comprehensive documentation, examples, and error handling
- See `IMPLEMENTATION_COMPLETE.md` for technical implementation details

### Version 1.0.0 (2025-10-07)
- Initial admin API documentation
- 44 endpoints across 11 modules
- Comprehensive examples and error handling
- 93% test coverage (41/44 endpoints passing)
