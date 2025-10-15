# Subscription Plan API Documentation

## Overview

The Subscription Plan API allows administrators to create, manage, and configure subscription plans for vendors on the DigiMall platform. This API provides comprehensive control over plan features, pricing, limitations, and lifecycle management.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Create Subscription Plan](#create-subscription-plan)
  - [Get All Subscription Plans](#get-all-subscription-plans)
  - [Get Subscription Plan by ID](#get-subscription-plan-by-id)
  - [Update Subscription Plan](#update-subscription-plan)
  - [Archive Subscription Plan](#archive-subscription-plan)
  - [Sync Plan with Paystack](#sync-plan-with-paystack)
  - [Get Subscription Statistics](#get-subscription-statistics)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Authentication

All subscription plan endpoints require admin authentication using JWT Bearer tokens.

**Required Roles**:
- `ADMIN`
- `SUPER_ADMIN`

**Header Format**:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Base URL

```
https://api.digimall.ng/api/v1/admin/subscription-plans
```

**Local Development**:
```
http://localhost:4000/api/v1/admin/subscription-plans
```

---

## Endpoints

### Create Subscription Plan

Create a new subscription plan for vendors.

**Endpoint**: `POST /admin/subscription-plans`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "planName": "string",              // Required: Unique identifier (e.g., "professional")
  "displayName": "string",           // Required: User-facing name (e.g., "Professional Plan")
  "description": "string",           // Required: Detailed plan description
  "price": number,                   // Required: Price in kobo (NGN minor units)
  "originalPrice": number,           // Optional: Original price for showing discounts
  "currency": "string",              // Required: Currency code (default: "NGN")
  "duration": "string",              // Required: "monthly" | "quarterly" | "yearly"
  "durationDays": number,            // Optional: Auto-calculated if not provided
  "features": ["string"],            // Required: Array of feature descriptions
  "limitations": {                   // Required: Plan restrictions
    "maxProducts": number,           // Required: Max products vendor can list (min: 1)
    "maxOrdersPerMonth": number,     // Required: Max orders per month (min: 1)
    "maxStorageMB": number,          // Required: Max storage in MB (min: 1)
    "maxImagesPerProduct": number,   // Required: Max images per product (min: 1, max: 50)
    "canUsePremiumThemes": boolean,  // Required: Access to premium themes
    "canCreateCoupons": boolean,     // Required: Ability to create discount coupons
    "canAccessAnalytics": boolean,   // Required: Access to advanced analytics
    "prioritySupport": boolean,      // Required: Priority customer support
    "canBeFeatured": boolean         // Required: Eligibility for featured listings
  },
  "sortOrder": number,               // Optional: Display order (default: 0)
  "isRecommended": boolean,          // Optional: Mark as recommended (default: false)
  "isFree": boolean,                 // Optional: Is free plan (default: false)
  "badge": "string",                 // Optional: Badge text (e.g., "Most Popular")
  "iconUrl": "string",               // Optional: Icon/image URL
  "colorTheme": "string"             // Optional: Color theme hex code (default: "#007bff")
}
```

#### Field Details

**planName**
- **Type**: String
- **Required**: Yes
- **Validation**: Must be unique, non-empty
- **Description**: Internal identifier for the plan (lowercase, no spaces recommended)
- **Example**: `"starter"`, `"professional"`, `"enterprise"`

**displayName**
- **Type**: String
- **Required**: Yes
- **Validation**: Non-empty
- **Description**: User-facing name shown in UI
- **Example**: `"Professional Plan"`, `"Enterprise Suite"`

**description**
- **Type**: String
- **Required**: Yes
- **Validation**: Non-empty
- **Description**: Detailed description of plan benefits and target audience
- **Example**: `"Perfect for growing businesses with advanced features"`

**price**
- **Type**: Number
- **Required**: Yes
- **Validation**: Minimum 0
- **Unit**: Kobo (Nigerian minor currency unit)
- **Conversion**: ₦1 = 100 kobo
- **Examples**:
  - `500000` = ₦5,000.00
  - `2500000` = ₦25,000.00
  - `10000000` = ₦100,000.00

**originalPrice**
- **Type**: Number
- **Required**: No
- **Validation**: Minimum 0
- **Description**: Original price before discount (for displaying savings)
- **Note**: If provided, discount percentage is auto-calculated
- **Example**: If `price: 500000` and `originalPrice: 750000`, discount = 33%

**currency**
- **Type**: String
- **Required**: Yes
- **Default**: `"NGN"`
- **Allowed Values**: `"NGN"` (Nigerian Naira)
- **Description**: Currency code for the plan price

**duration**
- **Type**: Enum String
- **Required**: Yes
- **Allowed Values**:
  - `"monthly"` - 30 days subscription
  - `"quarterly"` - 90 days subscription
  - `"yearly"` - 365 days subscription
- **Description**: Billing cycle for the plan

**durationDays**
- **Type**: Number
- **Required**: No
- **Validation**: Minimum 1
- **Auto-calculated**:
  - `monthly` → 30 days
  - `quarterly` → 90 days
  - `yearly` → 365 days
- **Description**: Exact number of days for the subscription period

**features**
- **Type**: Array of Strings
- **Required**: Yes
- **Validation**: Each item must be a non-empty string
- **Description**: List of features included in the plan
- **Best Practices**:
  - Use clear, concise feature descriptions
  - Start with most important features
  - Highlight unique or premium features
- **Example**:
  ```json
  [
    "Unlimited product listings",
    "Advanced analytics dashboard",
    "Priority customer support",
    "Custom branding options",
    "API access"
  ]
  ```

**limitations**
- **Type**: Object
- **Required**: Yes
- **Description**: Technical limits and feature access controls

**limitations.maxProducts**
- **Type**: Number
- **Required**: Yes
- **Validation**: Minimum 1
- **Description**: Maximum number of products vendor can list
- **Examples**: `50`, `100`, `500`, `-1` (unlimited - use very large number)

**limitations.maxOrdersPerMonth**
- **Type**: Number
- **Required**: Yes
- **Validation**: Minimum 1
- **Description**: Maximum orders vendor can process per month
- **Examples**: `200`, `1000`, `10000`

**limitations.maxStorageMB**
- **Type**: Number
- **Required**: Yes
- **Validation**: Minimum 1
- **Unit**: Megabytes (MB)
- **Description**: Maximum storage for product images and files
- **Examples**: `5000` (5GB), `10000` (10GB), `50000` (50GB)

**limitations.maxImagesPerProduct**
- **Type**: Number
- **Required**: Yes
- **Validation**: Minimum 1, Maximum 50
- **Description**: Maximum images per product listing
- **Examples**: `5`, `10`, `20`

**limitations.canUsePremiumThemes**
- **Type**: Boolean
- **Required**: Yes
- **Description**: Access to premium store themes
- **Default**: `false` for basic plans, `true` for premium plans

**limitations.canCreateCoupons**
- **Type**: Boolean
- **Required**: Yes
- **Description**: Ability to create discount coupons
- **Default**: `false` for basic plans, `true` for premium plans

**limitations.canAccessAnalytics**
- **Type**: Boolean
- **Required**: Yes
- **Description**: Access to advanced analytics and reports
- **Default**: Basic plans may have `true` for basic analytics

**limitations.prioritySupport**
- **Type**: Boolean
- **Required**: Yes
- **Description**: Priority customer support queue
- **Default**: `false` for basic plans, `true` for premium plans

**limitations.canBeFeatured**
- **Type**: Boolean
- **Required**: Yes
- **Description**: Eligibility for featured store listings
- **Default**: `false` for basic plans, `true` for premium plans

**sortOrder**
- **Type**: Number
- **Required**: No
- **Default**: `0`
- **Description**: Display order for plan sorting (lower numbers appear first)
- **Example**: Use `1`, `2`, `3` for Starter, Professional, Enterprise

**isRecommended**
- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Description**: Mark plan as recommended choice
- **UI Display**: Shows "Recommended" badge

**isFree**
- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Description**: Indicates if plan is free
- **Note**: Free plans should have `price: 0`

**badge**
- **Type**: String
- **Required**: No
- **Description**: Badge text to display on plan card
- **Examples**: `"Most Popular"`, `"Best Value"`, `"New"`

**iconUrl**
- **Type**: String
- **Required**: No
- **Validation**: Valid URL
- **Description**: URL to plan icon or image
- **Example**: `"https://cdn.digimall.ng/icons/professional-plan.svg"`

**colorTheme**
- **Type**: String
- **Required**: No
- **Default**: `"#007bff"`
- **Validation**: Hex color code
- **Description**: Primary color for plan UI elements
- **Examples**: `"#10b981"`, `"#3b82f6"`, `"#8b5cf6"`

#### Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": "68e729a4dc0a5c6719cc495e",
    "deletedAt": null,
    "planName": "starter",
    "displayName": "Starter Plan",
    "description": "Perfect for small businesses getting started",
    "price": 500000,
    "originalPrice": 750000,
    "currency": "NGN",
    "duration": "monthly",
    "durationDays": 30,
    "status": "active",
    "features": [
      "Up to 50 product listings",
      "Basic analytics dashboard",
      "Email support",
      "Standard themes",
      "5GB storage"
    ],
    "limitations": {
      "maxProducts": 50,
      "maxOrdersPerMonth": 200,
      "maxStorageMB": 5000,
      "maxImagesPerProduct": 5,
      "canUsePremiumThemes": false,
      "canCreateCoupons": false,
      "canAccessAnalytics": true,
      "prioritySupport": false,
      "canBeFeatured": false
    },
    "sortOrder": 1,
    "isRecommended": false,
    "isFree": false,
    "badge": null,
    "iconUrl": null,
    "colorTheme": "#10b981",
    "paystackPlanCode": null,
    "activeSubscriptions": 0,
    "totalSubscriptions": 0,
    "createdAt": "2025-10-09T03:19:00.687Z",
    "updatedAt": "2025-10-09T03:19:00.687Z",
    "formattedPrice": "₦5,000.00",
    "hasDiscount": true,
    "discountPercentage": 33,
    "isPopular": false
  }
}
```

#### Response Fields (Auto-Generated)

**formattedPrice**
- **Type**: String
- **Description**: Price formatted with currency symbol
- **Format**: `₦{amount}` with thousand separators
- **Example**: `"₦5,000.00"`, `"₦25,000.00"`

**hasDiscount**
- **Type**: Boolean
- **Description**: Indicates if plan has a discount (originalPrice > price)
- **Calculation**: `originalPrice !== null && originalPrice > price`

**discountPercentage**
- **Type**: Number
- **Description**: Percentage discount from original price
- **Calculation**: `((originalPrice - price) / originalPrice) * 100`
- **Rounded**: To nearest integer
- **Example**: `33` for 33% off

**isPopular**
- **Type**: Boolean
- **Description**: Auto-calculated based on active subscriptions
- **Logic**: Plan with most active subscriptions is marked popular
- **Default**: `false` for new plans

**activeSubscriptions**
- **Type**: Number
- **Description**: Current number of active subscriptions
- **Default**: `0` for new plans
- **Updates**: Automatically when vendors subscribe/unsubscribe

**totalSubscriptions**
- **Type**: Number
- **Description**: Total number of subscriptions (all time)
- **Default**: `0` for new plans
- **Updates**: Increments with each new subscription

**paystackPlanCode**
- **Type**: String | null
- **Description**: Paystack subscription plan code
- **Default**: `null` (created after sync)
- **Format**: `"PLN_xxxxxxxxxxxxx"`
- **Note**: Required for processing payments via Paystack

---

### Get All Subscription Plans

Retrieve all subscription plans including inactive ones.

**Endpoint**: `GET /admin/subscription-plans`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Request

No request body required.

#### Query Parameters

None.

#### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "68e729a4dc0a5c6719cc495e",
      "deletedAt": null,
      "planName": "starter",
      "displayName": "Starter Plan",
      "description": "Perfect for small businesses getting started",
      "price": 500000,
      "originalPrice": 750000,
      "currency": "NGN",
      "duration": "monthly",
      "durationDays": 30,
      "status": "active",
      "features": [...],
      "limitations": {...},
      "sortOrder": 1,
      "isRecommended": false,
      "isFree": false,
      "colorTheme": "#10b981",
      "activeSubscriptions": 15,
      "totalSubscriptions": 45,
      "createdAt": "2025-10-09T03:19:00.687Z",
      "updatedAt": "2025-10-09T03:19:00.687Z",
      "formattedPrice": "₦5,000.00",
      "hasDiscount": true,
      "discountPercentage": 33,
      "isPopular": false
    },
    {
      "id": "68e729b5dc0a5c6719cc495f",
      "planName": "professional",
      "displayName": "Professional Plan",
      "price": 2500000,
      "duration": "monthly",
      "status": "active",
      "activeSubscriptions": 52,
      "isPopular": true,
      ...
    }
  ]
}
```

**Response Notes**:
- Plans are returned in `sortOrder` ascending order
- Includes both active and inactive plans
- Deleted plans (soft-deleted) are excluded by default

---

### Get Subscription Plan by ID

Retrieve detailed information about a specific subscription plan.

**Endpoint**: `GET /admin/subscription-plans/:id`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | String | Yes      | Subscription plan ID     |

#### Request Example

```
GET /admin/subscription-plans/68e729a4dc0a5c6719cc495e
```

#### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "68e729a4dc0a5c6719cc495e",
    "deletedAt": null,
    "planName": "starter",
    "displayName": "Starter Plan",
    "description": "Perfect for small businesses getting started",
    "price": 500000,
    "originalPrice": 750000,
    "currency": "NGN",
    "duration": "monthly",
    "durationDays": 30,
    "status": "active",
    "features": [
      "Up to 50 product listings",
      "Basic analytics dashboard",
      "Email support",
      "Standard themes",
      "5GB storage"
    ],
    "limitations": {
      "maxProducts": 50,
      "maxOrdersPerMonth": 200,
      "maxStorageMB": 5000,
      "maxImagesPerProduct": 5,
      "canUsePremiumThemes": false,
      "canCreateCoupons": false,
      "canAccessAnalytics": true,
      "prioritySupport": false,
      "canBeFeatured": false
    },
    "sortOrder": 1,
    "isRecommended": false,
    "isFree": false,
    "badge": null,
    "iconUrl": null,
    "colorTheme": "#10b981",
    "paystackPlanCode": "PLN_abc123xyz",
    "activeSubscriptions": 15,
    "totalSubscriptions": 45,
    "createdAt": "2025-10-09T03:19:00.687Z",
    "updatedAt": "2025-10-09T03:19:00.687Z",
    "formattedPrice": "₦5,000.00",
    "hasDiscount": true,
    "discountPercentage": 33,
    "isPopular": false
  }
}
```

---

### Update Subscription Plan

Update an existing subscription plan. All fields are optional.

**Endpoint**: `PUT /admin/subscription-plans/:id`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | String | Yes      | Subscription plan ID     |

#### Request Body

```json
{
  "displayName": "string",           // Optional
  "description": "string",           // Optional
  "price": number,                   // Optional
  "originalPrice": number,           // Optional
  "status": "string",                // Optional: "active" | "inactive" | "deprecated"
  "features": ["string"],            // Optional
  "limitations": {                   // Optional (if provided, all sub-fields required)
    "maxProducts": number,
    "maxOrdersPerMonth": number,
    "maxStorageMB": number,
    "maxImagesPerProduct": number,
    "canUsePremiumThemes": boolean,
    "canCreateCoupons": boolean,
    "canAccessAnalytics": boolean,
    "prioritySupport": boolean,
    "canBeFeatured": boolean
  },
  "sortOrder": number,               // Optional
  "isRecommended": boolean,          // Optional
  "badge": "string",                 // Optional
  "iconUrl": "string",               // Optional
  "colorTheme": "string"             // Optional
}
```

#### Update Rules

**Immutable Fields** (Cannot be updated):
- `planName` - Unique identifier, cannot be changed after creation
- `duration` - Billing cycle is fixed
- `currency` - Currency cannot be changed
- `isFree` - Free status cannot be toggled after creation

**Updatable Fields**:
- All display and pricing fields
- Features and limitations
- Status and metadata

**Important Notes**:
- Plan name (`planName`) cannot be updated to maintain data integrity
- Updating price does NOT affect existing subscriptions
- To modify existing subscriptions, vendors must renew at the new price
- Changing `status` to `inactive` prevents new subscriptions but keeps existing ones active

#### Status Values

| Status     | Description                                              |
|------------|----------------------------------------------------------|
| active     | Plan is available for new subscriptions                  |
| inactive   | Plan is hidden; no new subscriptions allowed             |
| deprecated | Plan is being phased out; existing subscriptions remain  |

#### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    // Updated plan object with all fields
  }
}
```

---

### Archive Subscription Plan

Archive (soft delete) a subscription plan.

**Endpoint**: `DELETE /admin/subscription-plans/:id`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | String | Yes      | Subscription plan ID     |

#### Validation Rules

**Cannot Delete If**:
- Plan has active subscriptions
- Must have `activeSubscriptions === 0`

**Effect**:
- Sets `deletedAt` timestamp (soft delete)
- Plan becomes invisible in standard queries
- Existing subscription data is preserved
- Can be restored by clearing `deletedAt`

#### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Subscription plan archived successfully"
}
```

**Error Response** (Has Active Subscriptions):

**Status Code**: `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": "Cannot delete plan with active subscriptions. Please wait for all subscriptions to expire or migrate users to another plan.",
  "error": "Bad Request"
}
```

---

### Sync Plan with Paystack

Create or update the subscription plan in Paystack's Subscriptions API.

**Endpoint**: `POST /admin/subscription-plans/:id/sync-paystack`

**Required Role**: `ADMIN`, `SUPER_ADMIN`

#### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | String | Yes      | Subscription plan ID     |

#### Process

**First Sync** (No `paystackPlanCode`):
1. Creates new plan in Paystack
2. Receives `plan_code` from Paystack
3. Updates local plan with `paystackPlanCode`
4. Returns success with plan code

**Subsequent Syncs** (Has `paystackPlanCode`):
1. Updates existing Paystack plan
2. Syncs current price, name, description
3. Maintains same `plan_code`
4. Returns success

#### Paystack Mapping

| DigiMall Field | Paystack Field | Mapping                          |
|----------------|----------------|----------------------------------|
| planName       | name           | Direct mapping                   |
| price          | amount         | Direct mapping (in kobo)         |
| description    | description    | Direct mapping                   |
| duration       | interval       | monthly → monthly                |
|                |                | quarterly → quarterly            |
|                |                | yearly → annually                |
| currency       | currency       | NGN → NGN                        |

#### Request

No request body required.

#### Response

**Status Code**: `200 OK`

**First Sync** (Created):
```json
{
  "success": true,
  "message": "Subscription plan created in Paystack",
  "data": {
    "planCode": "PLN_abc123xyz789",
    "synced": true
  }
}
```

**Subsequent Sync** (Updated):
```json
{
  "success": true,
  "message": "Subscription plan updated in Paystack",
  "data": {
    "planCode": "PLN_abc123xyz789",
    "synced": true
  }
}
```

#### Integration Notes

**Why Sync?**
- Enables automated recurring billing via Paystack
- Allows vendors to subscribe using Paystack payment methods
- Maintains consistency between DigiMall and Paystack systems

**When to Sync?**
- After creating a new plan (before accepting subscriptions)
- After updating plan price or details
- When migrating from manual to automated billing

**Paystack Plan Code**:
- Format: `PLN_` followed by alphanumeric characters
- Stored in `paystackPlanCode` field
- Required for processing subscriptions via Paystack
- Never changes once created (updates modify existing plan)

---

### Get Subscription Statistics

Retrieve comprehensive statistics about subscription plans and active subscriptions.

**Endpoint**: `GET /admin/subscription-plans/statistics`

**Required Role**: `ADMIN`, `SUPER_ADMIN`, `STAFF`

#### Request

No request body or parameters required.

#### Response

**Status Code**: `200 OK`

```json
{
  "totalPlans": 5,
  "activePlans": 4,
  "inactivePlans": 1,
  "totalActiveSubscriptions": 342,
  "totalRevenue": 85500000,
  "monthlyRecurringRevenue": 28500000,
  "planBreakdown": [
    {
      "planId": "68e729a4dc0a5c6719cc495e",
      "planName": "starter",
      "displayName": "Starter Plan",
      "activeSubscriptions": 125,
      "totalSubscriptions": 280,
      "revenue": 15625000,
      "percentageOfTotal": 36.5
    },
    {
      "planId": "68e729b5dc0a5c6719cc495f",
      "planName": "professional",
      "displayName": "Professional Plan",
      "activeSubscriptions": 180,
      "totalSubscriptions": 320,
      "revenue": 45000000,
      "percentageOfTotal": 52.6
    }
  ],
  "mostPopularPlan": {
    "planId": "68e729b5dc0a5c6719cc495f",
    "planName": "professional",
    "displayName": "Professional Plan",
    "activeSubscriptions": 180
  },
  "revenueByDuration": {
    "monthly": 28500000,
    "quarterly": 42000000,
    "yearly": 15000000
  },
  "conversionRate": 73.5,
  "churnRate": 8.2,
  "averageSubscriptionValue": 250000
}
```

#### Statistics Definitions

**totalPlans**
- Total number of subscription plans (active + inactive)
- Excludes deleted plans

**activePlans**
- Plans with `status: "active"`
- Available for new subscriptions

**inactivePlans**
- Plans with `status: "inactive"` or `"deprecated"`
- Not available for new subscriptions

**totalActiveSubscriptions**
- Current number of active vendor subscriptions
- Across all plans

**totalRevenue**
- Total revenue from all subscriptions (in kobo)
- Lifetime revenue

**monthlyRecurringRevenue (MRR)**
- Normalized monthly revenue from active subscriptions
- Calculation:
  - Monthly plans: `price * activeSubscriptions`
  - Quarterly plans: `(price / 3) * activeSubscriptions`
  - Yearly plans: `(price / 12) * activeSubscriptions`

**planBreakdown**
- Detailed statistics per plan
- Sorted by `activeSubscriptions` descending

**mostPopularPlan**
- Plan with highest number of active subscriptions
- Used to set `isPopular` flag

**revenueByDuration**
- Revenue segmented by billing cycle
- Helps understand pricing preferences

**conversionRate**
- Percentage of vendor registrations that subscribe
- `(totalSubscriptions / totalVendors) * 100`

**churnRate**
- Percentage of subscriptions cancelled/expired
- `(cancelledSubscriptions / totalSubscriptions) * 100`

**averageSubscriptionValue**
- Average revenue per subscription
- `totalRevenue / totalSubscriptions`

---

## Data Models

### PlanDuration Enum

```typescript
enum PlanDuration {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}
```

### PlanStatus Enum

```typescript
enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated'
}
```

### SubscriptionPlan Schema

```typescript
{
  _id: ObjectId,
  deletedAt: Date | null,
  planName: string,              // Unique identifier
  displayName: string,           // User-facing name
  description: string,
  price: number,                 // In kobo
  originalPrice?: number,        // In kobo
  currency: string,              // Default: "NGN"
  duration: PlanDuration,
  durationDays: number,
  status: PlanStatus,
  features: string[],
  limitations: {
    maxProducts: number,
    maxOrdersPerMonth: number,
    maxStorageMB: number,
    maxImagesPerProduct: number,
    canUsePremiumThemes: boolean,
    canCreateCoupons: boolean,
    canAccessAnalytics: boolean,
    prioritySupport: boolean,
    canBeFeatured: boolean
  },
  sortOrder: number,
  isRecommended: boolean,
  isFree: boolean,
  badge?: string,
  iconUrl?: string,
  colorTheme: string,
  paystackPlanCode?: string,
  activeSubscriptions: number,
  totalSubscriptions: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Virtual Fields (Computed)

These fields are calculated automatically and returned in API responses:

```typescript
{
  formattedPrice: string,        // "₦5,000.00"
  hasDiscount: boolean,          // true if originalPrice > price
  discountPercentage: number,    // 0-100
  isPopular: boolean             // true if most active subscriptions
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```
**Cause**: Missing or invalid JWT token

---

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```
**Cause**: User role doesn't have required permissions

---

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Subscription plan not found",
  "error": "Not Found"
}
```
**Cause**: Plan ID doesn't exist or is deleted

---

**409 Conflict**
```json
{
  "statusCode": 409,
  "message": "Plan with name 'starter' already exists",
  "error": "Conflict"
}
```
**Cause**: Attempting to create plan with duplicate `planName`

---

**400 Bad Request (Validation)**
```json
{
  "statusCode": 400,
  "message": [
    "price must not be less than 0",
    "features must be an array",
    "limitations.maxProducts must not be less than 1"
  ],
  "error": "Bad Request"
}
```
**Cause**: Invalid request body or validation failure

---

**400 Bad Request (Business Logic)**
```json
{
  "statusCode": 400,
  "message": "Cannot delete plan with active subscriptions",
  "error": "Bad Request"
}
```
**Cause**: Operation violates business rules

---

**500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
**Cause**: Unexpected server error

---

## Examples

### Example 1: Create Basic Starter Plan

**Request**:
```bash
curl -X POST "https://api.digimall.ng/api/v1/admin/subscription-plans" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "starter",
    "displayName": "Starter Plan",
    "description": "Perfect for small businesses just getting started",
    "price": 500000,
    "currency": "NGN",
    "duration": "monthly",
    "features": [
      "Up to 50 product listings",
      "Basic analytics",
      "Email support",
      "5GB storage"
    ],
    "limitations": {
      "maxProducts": 50,
      "maxOrdersPerMonth": 200,
      "maxStorageMB": 5000,
      "maxImagesPerProduct": 5,
      "canUsePremiumThemes": false,
      "canCreateCoupons": false,
      "canAccessAnalytics": true,
      "prioritySupport": false,
      "canBeFeatured": false
    },
    "sortOrder": 1,
    "colorTheme": "#10b981"
  }'
```

---

### Example 2: Create Premium Plan with Discount

**Request**:
```bash
curl -X POST "https://api.digimall.ng/api/v1/admin/subscription-plans" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "professional",
    "displayName": "Professional Plan",
    "description": "Advanced features for growing businesses",
    "price": 2000000,
    "originalPrice": 2500000,
    "currency": "NGN",
    "duration": "monthly",
    "features": [
      "Unlimited product listings",
      "Advanced analytics & reports",
      "Priority 24/7 support",
      "Premium themes",
      "20GB storage",
      "Discount coupons",
      "Featured store placement"
    ],
    "limitations": {
      "maxProducts": 500,
      "maxOrdersPerMonth": 2000,
      "maxStorageMB": 20000,
      "maxImagesPerProduct": 15,
      "canUsePremiumThemes": true,
      "canCreateCoupons": true,
      "canAccessAnalytics": true,
      "prioritySupport": true,
      "canBeFeatured": true
    },
    "sortOrder": 2,
    "isRecommended": true,
    "badge": "Most Popular",
    "colorTheme": "#3b82f6"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": "68e729b5dc0a5c6719cc495f",
    "planName": "professional",
    "displayName": "Professional Plan",
    "price": 2000000,
    "originalPrice": 2500000,
    "formattedPrice": "₦20,000.00",
    "hasDiscount": true,
    "discountPercentage": 20,
    "isRecommended": true,
    "badge": "Most Popular",
    ...
  }
}
```

---

### Example 3: Update Plan Price

**Request**:
```bash
curl -X PUT "https://api.digimall.ng/api/v1/admin/subscription-plans/68e729b5dc0a5c6719cc495f" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1800000,
    "originalPrice": 2500000
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "id": "68e729b5dc0a5c6719cc495f",
    "price": 1800000,
    "originalPrice": 2500000,
    "formattedPrice": "₦18,000.00",
    "hasDiscount": true,
    "discountPercentage": 28,
    ...
  }
}
```

---

### Example 4: Sync Plan with Paystack

**Request**:
```bash
curl -X POST "https://api.digimall.ng/api/v1/admin/subscription-plans/68e729b5dc0a5c6719cc495f/sync-paystack" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (First Sync):
```json
{
  "success": true,
  "message": "Subscription plan created in Paystack",
  "data": {
    "planCode": "PLN_gx2wn530m0i3w3m",
    "synced": true
  }
}
```

---

### Example 5: Get All Plans

**Request**:
```bash
curl -X GET "https://api.digimall.ng/api/v1/admin/subscription-plans" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "68e729a4dc0a5c6719cc495e",
      "planName": "starter",
      "displayName": "Starter Plan",
      "price": 500000,
      "formattedPrice": "₦5,000.00",
      "sortOrder": 1,
      "activeSubscriptions": 125,
      "isPopular": false,
      ...
    },
    {
      "id": "68e729b5dc0a5c6719cc495f",
      "planName": "professional",
      "displayName": "Professional Plan",
      "price": 2000000,
      "formattedPrice": "₦20,000.00",
      "sortOrder": 2,
      "activeSubscriptions": 180,
      "isPopular": true,
      "isRecommended": true,
      "badge": "Most Popular",
      ...
    }
  ]
}
```

---

### Example 6: Archive Plan (Soft Delete)

**Request**:
```bash
curl -X DELETE "https://api.digimall.ng/api/v1/admin/subscription-plans/68e729a4dc0a5c6719cc495e" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Subscription plan archived successfully"
}
```

**Response** (Error - Has Active Subscriptions):
```json
{
  "statusCode": 400,
  "message": "Cannot delete plan with active subscriptions",
  "error": "Bad Request"
}
```

---

## Best Practices

### Plan Creation

1. **Unique Plan Names**: Use lowercase, underscore-separated names (e.g., `starter`, `professional`, `enterprise`)

2. **Pricing Strategy**:
   - Use kobo (minor units) for all prices
   - Set `originalPrice` to show discounts
   - Consider psychological pricing (e.g., ₦4,999.00 instead of ₦5,000.00)

3. **Features List**:
   - Start with most important features
   - Be specific and quantifiable
   - Use action-oriented language
   - Limit to 5-10 key features

4. **Limitations**:
   - Set realistic limits based on infrastructure capacity
   - Consider gradual increases between tiers
   - Use `-1` or very large numbers for "unlimited" features

5. **Sort Order**:
   - Use incremental numbers (1, 2, 3) for natural ordering
   - Lower numbers appear first in UI
   - Recommended order: Basic → Professional → Enterprise

### Plan Updates

1. **Price Changes**:
   - Only affect new subscriptions
   - Existing subscriptions maintain original price until renewal
   - Communicate changes to users in advance

2. **Feature Updates**:
   - Consider impact on existing subscribers
   - Avoid removing features from active plans
   - Create new plan versions instead of modifying popular plans

3. **Status Management**:
   - Set to `inactive` to prevent new subscriptions
   - Use `deprecated` for phasing out old plans
   - Never delete plans with active subscriptions

### Paystack Integration

1. **Sync Timing**:
   - Sync immediately after creating plan
   - Sync after any price or name changes
   - Verify sync before activating plan

2. **Plan Codes**:
   - Store `paystackPlanCode` securely
   - Never modify Paystack plan codes manually
   - Use sync endpoint for all Paystack updates

3. **Testing**:
   - Test with Paystack test mode first
   - Verify subscription webhooks
   - Confirm payment flows end-to-end

### Monitoring & Analytics

1. **Track Metrics**:
   - Monitor `activeSubscriptions` per plan
   - Calculate conversion rates
   - Track churn rates

2. **Revenue Analysis**:
   - Use MRR for financial forecasting
   - Segment revenue by plan tier
   - Identify most profitable plans

3. **User Behavior**:
   - Analyze plan popularity
   - Monitor upgrade/downgrade patterns
   - Identify pricing sweet spots

---

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Limit**: 100 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Exceeded Response**:
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

---

## Versioning

Current API Version: **v1**

Version is included in the base URL: `/api/v1/admin/subscription-plans`

Breaking changes will result in a new version (v2, v3, etc.) with parallel support for older versions during deprecation period.

---

## Support

For API support and questions:
- **Email**: api-support@digimall.ng
- **Documentation**: https://docs.digimall.ng
- **Status Page**: https://status.digimall.ng

---

## Changelog

### Version 1.0.0 (2025-10-09)
- Initial release of Subscription Plan API
- Support for plan CRUD operations
- Paystack integration
- Statistics and analytics endpoints

---

**Last Updated**: October 9, 2025
**API Version**: 1.0.0
**Document Version**: 1.0.0
