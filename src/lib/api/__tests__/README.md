## API Testing Infrastructure

This directory contains the testing infrastructure for the API integration layer.

### Test Structure

```
__tests__/
├── setup.ts                 # Test setup and configuration
├── test-utils.tsx           # Testing utilities and helpers
├── services/               # Service layer tests
│   └── staff.service.test.ts
├── hooks/                  # React Query hooks tests
│   └── use-staff.test.tsx
├── validation/             # Validation schema tests
│   └── staff.validation.test.ts
└── utils/                  # Utility function tests
    └── formatters.test.ts
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test staff.service.test.ts
```

### Writing Tests

#### Service Tests

Test API service functions:

```typescript
import { staffService } from '../../services';
import { mockFetch, resetMocks } from '../setup';

describe('StaffService', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should fetch all staff', async () => {
    mockFetch({ success: true, data: mockData });
    const result = await staffService.getAll();
    expect(result).toEqual(mockData);
  });
});
```

#### Hook Tests

Test React Query hooks:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useStaff } from '../../hooks';
import { mockFetch } from '../setup';

describe('useStaff', () => {
  it('should fetch staff list', async () => {
    mockFetch({ success: true, data: mockData });
    const { result } = renderHook(() => useStaff());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

#### Validation Tests

Test Zod validation schemas:

```typescript
import { CreateStaffRequestSchema } from '../../validation';

describe('CreateStaffRequestSchema', () => {
  it('should validate valid data', () => {
    const result = CreateStaffRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

### Test Utilities

#### Mock Functions

- `mockFetch(response, status)` - Mock fetch with response
- `mockFetchError(error)` - Mock fetch error
- `resetMocks()` - Reset all mocks

#### Mock Data Creators

- `createMockStaff(overrides)` - Create mock staff data
- `createMockVendor(overrides)` - Create mock vendor data
- `createMockProduct(overrides)` - Create mock product data
- `createMockOrder(overrides)` - Create mock order data
- `createMockUser(overrides)` - Create mock user data

#### Render Utilities

- `renderWithProviders(component, options)` - Render with React Query provider

### Best Practices

1. **Reset Mocks**: Always reset mocks in `beforeEach` to ensure test isolation
2. **Use Mock Data**: Use provided mock data creators for consistency
3. **Test Error Cases**: Always test both success and error scenarios
4. **Wait for Async**: Use `waitFor` for async operations
5. **Descriptive Names**: Use descriptive test names that explain what is being tested
6. **Test Coverage**: Aim for high test coverage, especially for critical paths
7. **Mock External Dependencies**: Always mock API calls and external services
8. **Keep Tests Simple**: One assertion per test when possible
9. **Use TypeScript**: Ensure type safety in tests
10. **Document Edge Cases**: Document and test edge cases

### Coverage Goals

- **Services**: > 80% coverage
- **Hooks**: > 70% coverage
- **Validation**: > 90% coverage
- **Utils**: > 80% coverage

### CI/CD Integration

Tests run automatically on:
- Pre-commit hook
- Pull request creation
- Main branch merges
- Deployment pipeline

Failed tests will block deployments.
