import { z } from 'zod';

// ===== BASE VALIDATION SCHEMAS =====

// Common field validations
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number')
  .transform(phone => phone.startsWith('+234') ? phone : `+234${phone.slice(1)}`);

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const currencySchema = z.number()
  .min(0, 'Amount must be positive')
  .max(999999999.99, 'Amount is too large')
  .multipleOf(0.01, 'Amount can only have up to 2 decimal places');

export const percentageSchema = z.number()
  .min(0, 'Percentage must be positive')
  .max(100, 'Percentage cannot exceed 100%');

export const uuidSchema = z.string()
  .uuid('Invalid ID format');

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .max(2048, 'URL is too long');

export const dateSchema = z.string()
  .datetime('Invalid date format')
  .or(z.date());

export const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  type: z.string().min(1, 'File type is required'),
});

// ===== USER MANAGEMENT SCHEMAS =====

export const userStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending']);
export const userRoleSchema = z.enum(['admin', 'staff', 'customer', 'vendor']);

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
export const updateUserSchema = baseUserSchema.partial().omit({
  password: true,
  confirmPassword: true,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ===== VENDOR MANAGEMENT SCHEMAS =====

export const vendorStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended']);
export const vendorTierSchema = z.enum(['basic', 'premium', 'enterprise']);
export const businessTypeSchema = z.enum([
  'sole_proprietorship', 
  'partnership', 
  'limited_liability', 
  'corporation',
  'other'
]);

export const vendorSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name is too long'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters').max(1000, 'Description is too long'),
  businessType: businessTypeSchema,
  businessAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().default('Nigeria'),
    postalCode: z.string().optional(),
  }),
  businessPhone: phoneSchema,
  businessEmail: emailSchema,
  businessWebsite: urlSchema.optional(),
  taxId: z.string().optional(),
  status: vendorStatusSchema.default('pending'),
  tier: vendorTierSchema.default('basic'),
  commissionRate: percentageSchema.default(5),
  documents: z.array(z.object({
    type: z.enum(['business_registration', 'tax_certificate', 'id_document', 'bank_statement', 'other']),
    url: urlSchema,
    name: z.string(),
    verified: z.boolean().default(false),
    uploadedAt: dateSchema,
  })).optional(),
});

export const vendorApprovalSchema = z.object({
  vendorId: uuidSchema,
  action: z.enum(['approve', 'reject']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason is too long'),
  tier: vendorTierSchema.optional(),
  commissionRate: percentageSchema.optional(),
  conditions: z.array(z.string()).optional(),
});

// ===== PRODUCT MANAGEMENT SCHEMAS =====

export const productStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected', 'archived']);
export const productConditionSchema = z.enum(['new', 'used', 'refurbished']);

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  shortDescription: z.string().max(500, 'Short description is too long').optional(),
  categoryId: uuidSchema,
  vendorId: uuidSchema,
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU is too long'),
  slug: slugSchema,
  basePrice: currencySchema,
  comparePrice: currencySchema.optional(),
  costPrice: currencySchema.optional(),
  status: productStatusSchema.default('draft'),
  condition: productConditionSchema.default('new'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold cannot be negative').optional(),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  weight: z.number().min(0, 'Weight cannot be negative').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Length cannot be negative'),
    width: z.number().min(0, 'Width cannot be negative'),
    height: z.number().min(0, 'Height cannot be negative'),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  images: z.array(z.object({
    url: urlSchema,
    alt: z.string().max(200, 'Alt text is too long'),
    isPrimary: z.boolean().default(false),
  })).min(1, 'At least one image is required'),
  tags: z.array(z.string().max(50, 'Tag is too long')).max(20, 'Too many tags'),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const bulkProductUpdateSchema = z.object({
  productIds: z.array(uuidSchema).min(1, 'Select at least one product'),
  updates: z.object({
    status: productStatusSchema.optional(),
    categoryId: uuidSchema.optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
  reason: z.string().max(500, 'Reason is too long').optional(),
});

// ===== ORDER MANAGEMENT SCHEMAS =====

export const orderStatusSchema = z.enum([
  'pending', 
  'confirmed', 
  'processing', 
  'shipped', 
  'delivered', 
  'cancelled', 
  'refunded'
]);

export const paymentStatusSchema = z.enum([
  'pending', 
  'processing', 
  'completed', 
  'failed', 
  'cancelled', 
  'refunded'
]);

export const orderUpdateSchema = z.object({
  orderId: uuidSchema,
  status: orderStatusSchema,
  trackingNumber: z.string().max(100, 'Tracking number is too long').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  notifyCustomer: z.boolean().default(true),
  estimatedDelivery: dateSchema.optional(),
});

export const refundSchema = z.object({
  orderId: uuidSchema,
  amount: currencySchema,
  reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason is too long'),
  refundMethod: z.enum(['original_payment', 'store_credit', 'bank_transfer']),
  notifyCustomer: z.boolean().default(true),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

// ===== FINANCIAL MANAGEMENT SCHEMAS =====

export const commissionStatusSchema = z.enum(['pending', 'approved', 'paid', 'disputed']);

export const commissionSchema = z.object({
  orderId: uuidSchema,
  vendorId: uuidSchema,
  orderAmount: currencySchema,
  commissionRate: percentageSchema,
  commissionAmount: currencySchema,
  status: commissionStatusSchema.default('pending'),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export const payoutSchema = z.object({
  vendorId: uuidSchema,
  amount: currencySchema,
  method: z.enum(['bank_transfer', 'paystack', 'wallet']),
  bankAccount: z.object({
    accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
    bankCode: z.string().min(1, 'Bank code is required'),
    accountName: z.string().min(1, 'Account name is required'),
  }).optional(),
  scheduledFor: dateSchema.optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

// ===== CATEGORY MANAGEMENT SCHEMAS =====

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  slug: slugSchema,
  parentId: uuidSchema.optional(),
  image: urlSchema.optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, 'Sort order cannot be negative').default(0),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  commission: z.object({
    rate: percentageSchema,
    type: z.enum(['percentage', 'fixed']).default('percentage'),
  }).optional(),
});

// ===== SYSTEM SETTINGS SCHEMAS =====

export const systemSettingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(1, 'Site name is required').max(100, 'Site name is too long'),
    siteUrl: urlSchema,
    contactEmail: emailSchema,
    supportEmail: emailSchema,
    timezone: z.string().min(1, 'Timezone is required'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    language: z.string().length(2, 'Language must be 2 characters').default('en'),
    maintenanceMode: z.boolean().default(false),
    registrationEnabled: z.boolean().default(true),
    emailVerificationRequired: z.boolean().default(true),
    phoneVerificationRequired: z.boolean().default(false),
  }),
  security: z.object({
    sessionTimeout: z.number().int().min(300, 'Session timeout cannot be less than 5 minutes').max(86400, 'Session timeout cannot exceed 24 hours'),
    maxLoginAttempts: z.number().int().min(3, 'Must allow at least 3 login attempts').max(10, 'Too many login attempts allowed'),
    lockoutDuration: z.number().int().min(300, 'Lockout duration cannot be less than 5 minutes'),
    passwordMinLength: z.number().int().min(8, 'Password minimum length cannot be less than 8').max(128, 'Password minimum length is too long'),
    passwordRequireSpecialChars: z.boolean().default(true),
    twoFactorAuthEnabled: z.boolean().default(false),
    twoFactorAuthRequired: z.boolean().default(false),
    ipWhitelistEnabled: z.boolean().default(false),
    rateLimitEnabled: z.boolean().default(true),
    rateLimitRequests: z.number().int().min(1, 'Rate limit requests must be at least 1').max(1000, 'Rate limit requests is too high'),
    rateLimitWindow: z.number().int().min(60, 'Rate limit window cannot be less than 1 minute').max(3600, 'Rate limit window cannot exceed 1 hour'),
  }),
  payments: z.object({
    paystackEnabled: z.boolean().default(true),
    paystackPublicKey: z.string().min(1, 'Paystack public key is required'),
    walletEnabled: z.boolean().default(true),
    cryptoEnabled: z.boolean().default(false),
    escrowEnabled: z.boolean().default(true),
    commissionRate: percentageSchema.default(5),
    minimumPayout: currencySchema.default(1000),
  }),
});

// ===== SEARCH AND FILTER SCHEMAS =====

export const searchSchema = z.object({
  query: z.string().max(200, 'Search query is too long').optional(),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  sort: z.object({
    field: z.string().min(1, 'Sort field is required'),
    direction: z.enum(['asc', 'desc']).default('asc'),
  }).optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ===== BULK OPERATIONS SCHEMAS =====

export const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'update', 'export', 'archive']),
  entityType: z.enum(['users', 'vendors', 'products', 'orders', 'categories']),
  entityIds: z.array(uuidSchema).min(1, 'Select at least one item'),
  data: z.record(z.string(), z.any()).optional(),
  reason: z.string().max(500, 'Reason is too long').optional(),
  confirm: z.boolean().refine(val => val === true, {
    message: 'Please confirm this action',
  }),
});

// ===== API RESPONSE SCHEMAS =====

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean().optional(),
    hasPrevious: z.boolean().optional(),
  }),
  meta: z.object({
    totalCount: z.number().int().min(0),
    filteredCount: z.number().int().min(0),
  }).optional(),
});

// ===== FORM VALIDATION HELPERS =====

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type VendorForm = z.infer<typeof vendorSchema>;
export type VendorApprovalForm = z.infer<typeof vendorApprovalSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type BulkProductUpdateForm = z.infer<typeof bulkProductUpdateSchema>;
export type OrderUpdateForm = z.infer<typeof orderUpdateSchema>;
export type RefundForm = z.infer<typeof refundSchema>;
export type CommissionForm = z.infer<typeof commissionSchema>;
export type PayoutForm = z.infer<typeof payoutSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type SystemSettingsForm = z.infer<typeof systemSettingsSchema>;
export type SearchForm = z.infer<typeof searchSchema>;
export type DateRangeForm = z.infer<typeof dateRangeSchema>;
export type BulkOperationForm = z.infer<typeof bulkOperationSchema>;

// Export all schemas for external use
export const validationSchemas = {
  // Base schemas
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  currency: currencySchema,
  percentage: percentageSchema,
  uuid: uuidSchema,
  slug: slugSchema,
  url: urlSchema,
  date: dateSchema,
  file: fileSchema,

  // Entity schemas
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  changePassword: changePasswordSchema,
  vendor: vendorSchema,
  vendorApproval: vendorApprovalSchema,
  product: productSchema,
  bulkProductUpdate: bulkProductUpdateSchema,
  orderUpdate: orderUpdateSchema,
  refund: refundSchema,
  commission: commissionSchema,
  payout: payoutSchema,
  category: categorySchema,
  systemSettings: systemSettingsSchema,

  // Utility schemas
  search: searchSchema,
  dateRange: dateRangeSchema,
  bulkOperation: bulkOperationSchema,
  apiResponse: apiResponseSchema,
  paginatedResponse: paginatedResponseSchema,
};