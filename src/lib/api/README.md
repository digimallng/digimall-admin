# DigiMall Admin API Integration Layer

A comprehensive, enterprise-level API integration system built with TypeScript, React Query, and Zod validation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Overview

This API integration layer provides:

- **100% Type Safety**: Full TypeScript coverage with branded types and discriminated unions
- **Runtime Validation**: Zod schemas for all request/response types
- **Smart Caching**: Intelligent caching with React Query
- **Error Handling**: Comprehensive error handling with automatic retries
- **Testing**: Complete testing infrastructure with mock utilities

### Key Features

✅ **44 API Endpoints** fully implemented
✅ **11 Service Modules** (Staff, Analytics, Products, Vendors, Orders, Users, Categories, Security, System, Subscriptions, Admin Vendor)
✅ **11 React Query Hook Modules** with cache invalidation
✅ **Zod Validation Schemas** for all request/response types
✅ **Permission System** with role-based access control
✅ **Formatting Utilities** for currency, dates, numbers, etc.
✅ **Testing Infrastructure** with mock utilities and example tests

## Architecture

```
src/lib/api/
├── types/              # TypeScript type definitions
│   ├── shared.types.ts        # Common types and interfaces
│   ├── enums.types.ts         # Enum definitions with Zod schemas
│   ├── staff.types.ts         # Staff management types
│   ├── analytics.types.ts     # Analytics types
│   ├── products.types.ts      # Product management types
│   ├── vendors.types.ts       # Vendor management types
│   ├── orders.types.ts        # Order management types
│   ├── users.types.ts         # User management types
│   ├── categories.types.ts    # Category management types
│   ├── security.types.ts      # Security types
│   ├── system.types.ts        # System management types
│   ├── subscription-plans.types.ts  # Subscription types
│   ├── admin-vendor.types.ts  # Admin vendor operations types
│   └── index.ts               # Type exports
│
├── core/               # Core API infrastructure
│   ├── api-client.ts          # HTTP client with interceptors
│   ├── client-instance.ts     # Configured client instance
│   ├── api-config.ts          # Endpoint configurations
│   └── index.ts               # Core exports
│
├── services/           # API service layer
│   ├── staff.service.ts       # Staff management service
│   ├── analytics.service.ts   # Analytics service
│   ├── products.service.ts    # Product management service
│   ├── vendors.service.ts     # Vendor management service
│   ├── orders.service.ts      # Order management service
│   ├── users.service.ts       # User management service
│   ├── categories.service.ts  # Category management service
│   ├── security.service.ts    # Security service
│   ├── system.service.ts      # System management service
│   ├── subscription-plans.service.ts  # Subscription service
│   ├── admin-vendor.service.ts # Admin vendor operations service
│   └── index.ts               # Service exports
│
├── hooks/              # React Query hooks
│   ├── use-staff.ts           # Staff management hooks
│   ├── use-analytics.ts       # Analytics hooks
│   ├── use-products.ts        # Product management hooks
│   ├── use-vendors.ts         # Vendor management hooks
│   ├── use-orders.ts          # Order management hooks
│   ├── use-users.ts           # User management hooks
│   ├── use-categories.ts      # Category management hooks
│   ├── use-security.ts        # Security hooks
│   ├── use-system.ts          # System management hooks
│   ├── use-subscription-plans.ts  # Subscription hooks
│   ├── use-admin-vendor.ts    # Admin vendor operations hooks
│   └── index.ts               # Hook exports
│
├── validation/         # Zod validation schemas
│   ├── staff.validation.ts    # Staff validation
│   ├── analytics.validation.ts # Analytics validation
│   ├── products.validation.ts # Product validation
│   ├── vendors.validation.ts  # Vendor validation
│   ├── orders.validation.ts   # Order validation
│   ├── users.validation.ts    # User validation
│   ├── categories.validation.ts # Category validation
│   ├── security.validation.ts # Security validation
│   ├── system.validation.ts   # System validation
│   ├── subscription-plans.validation.ts  # Subscription validation
│   ├── admin-vendor.validation.ts # Admin vendor validation
│   ├── validator.ts           # Generic validator utility
│   └── index.ts               # Validation exports
│
├── config/             # Configuration
│   ├── constants.ts           # API constants and configuration
│   ├── query-client.ts        # React Query configuration
│   └── index.ts               # Config exports
│
├── utils/              # Utility functions
│   ├── permissions.ts         # Permission checking utilities
│   ├── formatters.ts          # Data formatting utilities
│   ├── helpers.ts             # General helper functions
│   └── index.ts               # Utility exports
│
├── __tests__/          # Testing infrastructure
│   ├── setup.ts               # Test configuration
│   ├── test-utils.tsx         # Testing utilities
│   ├── services/              # Service tests
│   ├── hooks/                 # Hook tests
│   ├── validation/            # Validation tests
│   ├── utils/                 # Utility tests
│   └── README.md              # Testing documentation
│
└── index.ts            # Main export point
```

## Getting Started

### Installation

The API integration layer is already integrated into the project. No additional installation needed.

### Basic Usage

```typescript
import { staffService, useStaff, StaffRole } from '@/lib/api';

// Using services directly (for server components)
const staff = await staffService.getAll({ page: 1, limit: 20 });

// Using hooks (for client components)
function StaffList() {
  const { data, isLoading, error } = useStaff({ page: 1, limit: 20 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render staff list */}</div>;
}
```

## Core Concepts

### 1. Type System

All types are defined with TypeScript interfaces and Zod schemas:

```typescript
// TypeScript interface
export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  status: StaffStatus;
  permissions: Permission[];
}

// Zod schema for runtime validation
export const StaffSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: StaffRoleSchema,
  status: StaffStatusSchema,
  permissions: z.array(PermissionSchema),
});
```

### 2. Service Layer

Services handle all API communication:

```typescript
class StaffService {
  async getAll(params?: GetAllStaffParams): Promise<StaffListResponse> {
    const response = await apiClient.get<StaffListResponse>(
      API_ENDPOINTS.STAFF.GET_ALL,
      { params }
    );
    return response.data!;
  }

  async create(data: CreateStaffRequest): Promise<Staff> {
    const response = await apiClient.post<Staff>(
      API_ENDPOINTS.STAFF.CREATE,
      data
    );
    return response.data!;
  }
}

export const staffService = new StaffService();
```

### 3. React Query Hooks

Hooks provide caching, loading states, and automatic refetching:

```typescript
export function useStaff(params?: GetAllStaffParams) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffRequest) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}
```

### 4. Validation

Runtime validation with Zod:

```typescript
import { validate, validateOrThrow } from '@/lib/api';
import { CreateStaffRequestSchema } from '@/lib/api';

// Safe validation
const result = validate(CreateStaffRequestSchema, data);
if (!result.success) {
  console.error('Validation errors:', result.errors);
}

// Validate or throw
try {
  const validData = validateOrThrow(CreateStaffRequestSchema, data);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Usage Examples

### Example 1: Fetching Staff List

```typescript
'use client';

import { useStaff } from '@/lib/api';

export function StaffListPage() {
  const { data, isLoading, error, refetch } = useStaff({
    page: 1,
    limit: 20,
    role: 'admin',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <table>
        {data?.data.map((staff) => (
          <tr key={staff.id}>
            <td>{staff.firstName} {staff.lastName}</td>
            <td>{staff.email}</td>
            <td>{staff.role}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Example 2: Creating a Staff Member

```typescript
'use client';

import { useCreateStaff } from '@/lib/api';
import { toast } from 'sonner';

export function CreateStaffForm() {
  const createStaff = useCreateStaff();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createStaff.mutateAsync({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: 'staff',
      });

      toast.success('Staff member created successfully');
    } catch (error) {
      toast.error('Failed to create staff member');
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Example 3: Permission Checking

```typescript
import { hasPermission, canAccessResource, PERMISSIONS } from '@/lib/api';

function AdminDashboard({ userRole }: { userRole: StaffRole }) {
  const canManageStaff = hasPermission(userRole, PERMISSIONS.STAFF_MANAGE_PERMISSIONS);
  const canViewAnalytics = hasPermission(userRole, PERMISSIONS.ANALYTICS_VIEW);

  return (
    <div>
      {canManageStaff && <StaffManagementSection />}
      {canViewAnalytics && <AnalyticsSection />}
    </div>
  );
}
```

### Example 4: Formatting Data

```typescript
import { formatCurrency, formatDate, formatFileSize } from '@/lib/api';

function OrderDetails({ order }: { order: Order }) {
  return (
    <div>
      <p>Amount: {formatCurrency(order.totalAmount)}</p>
      <p>Date: {formatDate(order.createdAt)}</p>
      <p>Size: {formatFileSize(order.attachmentSize)}</p>
    </div>
  );
}
```

## API Reference

### Services

#### Staff Service

```typescript
staffService.getAll(params?: GetAllStaffParams): Promise<StaffListResponse>
staffService.getById(id: string): Promise<Staff>
staffService.create(data: CreateStaffRequest): Promise<Staff>
staffService.update(id: string, data: UpdateStaffRequest): Promise<Staff>
staffService.delete(id: string): Promise<void>
staffService.login(data: StaffLoginRequest): Promise<StaffAuthResponse>
staffService.logout(): Promise<void>
staffService.changePassword(id: string, data: ChangePasswordRequest): Promise<void>
staffService.updateStatus(id: string, data: UpdateStaffStatusRequest): Promise<Staff>
staffService.updatePermissions(id: string, data: UpdateStaffPermissionsRequest): Promise<Staff>
staffService.getSessions(id: string): Promise<StaffSession[]>
staffService.revokeSession(id: string, sessionId: string): Promise<void>
staffService.getActivity(id: string): Promise<StaffActivity[]>
staffService.getAnalytics(): Promise<StaffAnalytics>
staffService.getProductivity(id: string): Promise<StaffProductivity>
staffService.getSecurityAudit(): Promise<SecurityAudit>
staffService.getRolePermissions(role: string): Promise<Permission[]>
```

### Hooks

#### Staff Hooks

```typescript
useStaff(params?: GetAllStaffParams)
useStaffById(id: string, enabled?: boolean)
useStaffSessions(id: string)
useStaffActivity(id: string)
useStaffAnalytics()
useStaffProductivity(id: string)
useStaffSecurityAudit()
useRolePermissions(role: string)
useCreateStaff()
useUpdateStaff()
useDeleteStaff()
useStaffLogin()
useStaffLogout()
useChangePassword()
useUpdateStaffStatus()
useUpdateStaffPermissions()
useRevokeStaffSession()
```

### Configuration

```typescript
// API Configuration
API_CONFIG.BASE_URL         // API base URL
API_CONFIG.TIMEOUT          // Request timeout (30s)
API_CONFIG.RETRY_ATTEMPTS   // Retry attempts (3)
API_CONFIG.RETRY_DELAY      // Retry delay (1s)

// Cache Times
CACHE_TIMES.SHORT          // 1 minute
CACHE_TIMES.MEDIUM         // 2 minutes
CACHE_TIMES.LONG           // 5 minutes
CACHE_TIMES.EXTRA_LONG     // 10 minutes

// Pagination
PAGINATION.DEFAULT_PAGE    // 1
PAGINATION.DEFAULT_LIMIT   // 20
PAGINATION.MAX_LIMIT       // 100
```

## Testing

See [Testing Documentation](./__tests__/README.md) for detailed testing guide.

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Best Practices

### 1. Always Use Hooks in Client Components

```typescript
'use client';

import { useStaff } from '@/lib/api';

export function StaffList() {
  const { data } = useStaff();
  // ...
}
```

### 2. Use Services in Server Components

```typescript
import { staffService } from '@/lib/api';

export async function StaffList() {
  const staff = await staffService.getAll();
  // ...
}
```

### 3. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useStaff();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### 4. Validate User Input

```typescript
import { validate, CreateStaffRequestSchema } from '@/lib/api';

const result = validate(CreateStaffRequestSchema, formData);
if (!result.success) {
  // Show validation errors
  return;
}
```

### 5. Use Optimistic Updates

```typescript
const updateStaff = useUpdateStaff();

await updateStaff.mutateAsync(
  { id, data },
  {
    onMutate: async (variables) => {
      // Optimistically update UI
    },
    onError: (error, variables, context) => {
      // Rollback on error
    },
  }
);
```

### 6. Implement Proper Error Handling

```typescript
try {
  await staffService.create(data);
  toast.success('Staff created successfully');
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### 7. Use Permission Checks

```typescript
import { hasPermission, PERMISSIONS } from '@/lib/api';

if (!hasPermission(userRole, PERMISSIONS.STAFF_CREATE)) {
  return <Unauthorized />;
}
```

---

## Support

For questions or issues:
1. Check the [API Documentation](./ADMIN_API_DOCUMENTATION.md)
2. Review example tests in `./__tests__/`
3. Contact the development team

## License

Proprietary - DigiMall Admin Application
