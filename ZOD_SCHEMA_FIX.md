# Zod Schema Runtime Error - Fixed ✅

## Error

```
TypeError: createUserSchema.partial is not a function
    at eval (schemas.ts:74:50)
```

## Problem

The application was calling `.partial()` on `createUserSchema`, but this schema was created using `.refine()`, which returns a `ZodEffects` type instead of a `ZodObject` type. The `.partial()` method only exists on `ZodObject`.

## Root Cause

**Before (Incorrect):**
```typescript
export const createUserSchema = z.object({
  // ... fields
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ❌ ERROR: createUserSchema is ZodEffects, which doesn't have .partial()
export const updateUserSchema = createUserSchema.partial().omit({
  password: true,
  confirmPassword: true,
});
```

### Why This Fails

1. `z.object({...})` creates a `ZodObject`
2. `.refine(...)` transforms it into a `ZodEffects` (adds validation logic)
3. `ZodEffects` doesn't have `.partial()` method
4. Calling `.partial()` on `ZodEffects` causes runtime error

## Solution

Restructure the schemas to separate the base schema from the refined schema:

**After (Correct):**
```typescript
// Base user schema without refinements (for deriving other schemas)
const baseUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  role: userRoleSchema,
  status: userStatusSchema.default('pending'),
  password: passwordSchema,
  confirmPassword: z.string(),
  profileImage: z.string().url().optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

// Create user schema with password confirmation refinement
export const createUserSchema = baseUserSchema.refine(
  data => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

// Update user schema (all fields optional, no password fields)
// ✅ Works because baseUserSchema is ZodObject
export const updateUserSchema = baseUserSchema.partial().omit({
  password: true,
  confirmPassword: true,
});
```

## Key Changes

### 1. Created Base Schema
- `baseUserSchema` is a private `ZodObject` without refinements
- This can be used to derive other schemas with `.partial()`, `.omit()`, `.pick()`, etc.

### 2. Export Refined Schema
- `createUserSchema` uses `baseUserSchema.refine()` for password validation
- This is the schema used for creating users

### 3. Derive Update Schema
- `updateUserSchema` is derived from `baseUserSchema` (not `createUserSchema`)
- Uses `.partial()` to make all fields optional
- Uses `.omit()` to remove password fields

## Schema Architecture

```
baseUserSchema (ZodObject)
    ├─> createUserSchema (ZodEffects with password validation)
    └─> updateUserSchema (ZodObject, partial, no passwords)
```

## Benefits

### Type Safety ✅
- All schemas properly typed
- No runtime type errors
- IntelliSense works correctly

### Reusability ✅
- Base schema can be reused for different purposes
- Easy to create variants (partial, pick, omit)

### Validation ✅
- Password validation only applied to create schema
- Update schema doesn't require password confirmation
- Cleaner separation of concerns

## File Modified

**`src/lib/validation/schemas.ts`** (lines 58-85)

## Testing

### Test Create User
```typescript
const result = createUserSchema.safeParse({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'customer',
  password: 'Password123!',
  confirmPassword: 'Password123!',
});
// ✅ Should succeed
```

### Test Update User
```typescript
const result = updateUserSchema.safeParse({
  firstName: 'John',
  // All fields optional, no password required
});
// ✅ Should succeed
```

### Test Password Mismatch
```typescript
const result = createUserSchema.safeParse({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'customer',
  password: 'Password123!',
  confirmPassword: 'DifferentPassword123!',
});
// ✅ Should fail with "Passwords don't match" error
```

## Related Schemas

The following schemas also use `.refine()` but don't have `.partial()` called on them:
- ✅ `changePasswordSchema` - Uses `.refine()` correctly
- ✅ `promotionSchema` - Uses `.refine()` for date validation correctly
- ✅ `deletionConfirmationSchema` - Uses `.refine()` for boolean validation correctly

No other schemas have this issue.

## Additional Notes

### Zod Method Availability

**ZodObject Methods:**
- `.partial()` - Make all fields optional ✅
- `.required()` - Make all fields required ✅
- `.pick()` - Select specific fields ✅
- `.omit()` - Remove specific fields ✅
- `.extend()` - Add fields ✅
- `.merge()` - Merge with another schema ✅
- `.refine()` - Add custom validation (returns ZodEffects) ⚠️

**ZodEffects Methods (after .refine()):**
- `.refine()` - Add more validation ✅
- `.transform()` - Transform data ✅
- ❌ `.partial()` - NOT AVAILABLE
- ❌ `.omit()` - NOT AVAILABLE
- ❌ `.pick()` - NOT AVAILABLE

### Best Practice

When you need to derive multiple schemas from a base schema:

**✅ Correct Pattern:**
```typescript
const baseSchema = z.object({...});
export const createSchema = baseSchema.refine(...);
export const updateSchema = baseSchema.partial();
```

**❌ Incorrect Pattern:**
```typescript
export const createSchema = z.object({...}).refine(...);
export const updateSchema = createSchema.partial(); // ERROR!
```

## Conclusion

**Status**: ✅ **FIXED**

The Zod schema error has been resolved by restructuring the user schemas to separate the base `ZodObject` from the refined `ZodEffects`. The `updateUserSchema` now correctly derives from `baseUserSchema` instead of `createUserSchema`, allowing `.partial()` to work as intended.

**Fix Date**: 2025-10-11
**Quality**: Production Ready
