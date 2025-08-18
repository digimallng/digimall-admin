// ===== VALIDATION SYSTEM EXPORTS =====

// Core validation schemas
export * from './schemas';

// Validation utilities and helpers
export * from './validation-utils';

// Form validation hooks
export {
  useFormValidation,
  useFieldValidation,
  useAsyncValidation,
  useFormPersistence,
  useBulkValidation,
  useValidationState,
} from '../../hooks/use-form-validation';

// Form components
export {
  ValidatedInput,
  PasswordInput,
  ValidatedSelect,
  ValidatedSwitch,
  FileUpload,
  FormSubmitButton,
  FormValidationSummary,
} from '../../components/forms/validated-form-components';

// Example forms
export { ExampleUserForm } from '../../components/forms/example-user-form';

// Re-export commonly used types
export type {
  CreateUserForm,
  UpdateUserForm,
  ChangePasswordForm,
  VendorForm,
  VendorApprovalForm,
  ProductForm,
  BulkProductUpdateForm,
  OrderUpdateForm,
  RefundForm,
  CommissionForm,
  PayoutForm,
  CategoryForm,
  SystemSettingsForm,
  SearchForm,
  DateRangeForm,
  BulkOperationForm,
} from './schemas';

export type {
  ValidationResult,
  ValidationError,
} from './validation-utils';

// Validation constants and configurations
export const VALIDATION_CONFIG = {
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Form validation settings
  DEBOUNCE_DELAY: 300,
  ASYNC_VALIDATION_DELAY: 500,
  MAX_FORM_ERRORS: 10,
  AUTO_SAVE_DELAY: 1000,
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  
  // Phone number settings
  PHONE_COUNTRY_CODE: '+234',
  PHONE_MIN_LENGTH: 11,
  PHONE_MAX_LENGTH: 14,
  
  // Business validation
  MAX_BUSINESS_NAME_LENGTH: 100,
  MAX_BUSINESS_DESCRIPTION_LENGTH: 1000,
  MAX_PRODUCT_NAME_LENGTH: 200,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 5000,
  MAX_CATEGORY_NAME_LENGTH: 100,
  
  // Currency and financial
  MAX_CURRENCY_AMOUNT: 999999999.99,
  CURRENCY_DECIMAL_PLACES: 2,
  MIN_COMMISSION_RATE: 0,
  MAX_COMMISSION_RATE: 100,
  
  // System limits
  MAX_TAGS_PER_PRODUCT: 20,
  MAX_TAG_LENGTH: 50,
  MAX_SEARCH_QUERY_LENGTH: 200,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 20,
  
  // SEO limits
  MAX_SEO_TITLE_LENGTH: 60,
  MAX_SEO_DESCRIPTION_LENGTH: 160,
  MAX_SLUG_LENGTH: 100,
  
  // Session and security
  SESSION_TIMEOUT_MIN: 300, // 5 minutes
  SESSION_TIMEOUT_MAX: 86400, // 24 hours
  MAX_LOGIN_ATTEMPTS: 10,
  MIN_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION_MIN: 300, // 5 minutes
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Nigerian phone number',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password cannot exceed ${VALIDATION_CONFIG.PASSWORD_MAX_LENGTH} characters`,
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number, and special character',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DATE: 'Please enter a valid date',
  FILE_TOO_LARGE: `File size cannot exceed ${VALIDATION_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'File type is not allowed',
  TOO_MANY_FILES: `Cannot upload more than ${VALIDATION_CONFIG.MAX_FILES_PER_UPLOAD} files`,
  AMOUNT_TOO_LARGE: `Amount cannot exceed ${VALIDATION_CONFIG.MAX_CURRENCY_AMOUNT}`,
  NEGATIVE_AMOUNT: 'Amount must be positive',
  INVALID_PERCENTAGE: 'Percentage must be between 0 and 100',
  TEXT_TOO_LONG: 'Text is too long',
  INVALID_UUID: 'Invalid ID format',
  INVALID_SLUG: 'Slug can only contain lowercase letters, numbers, and hyphens',
  END_DATE_BEFORE_START: 'End date must be after start date',
  SELECT_AT_LEAST_ONE: 'Please select at least one item',
  CONFIRM_ACTION: 'Please confirm this action',
} as const;

// Helper function to create custom validation messages
export function createValidationMessage(template: string, ...args: (string | number)[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return args[parseInt(index)] !== undefined ? String(args[parseInt(index)]) : match;
  });
}

// Quick validation helpers
export const quickValidators = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPhone: (phone: string) => /^(\+234|0)[789][01]\d{8}$/.test(phone),
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  isValidUuid: (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
  isValidSlug: (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
  isStrongPassword: (password: string) => {
    return password.length >= VALIDATION_CONFIG.PASSWORD_MIN_LENGTH &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
  },
} as const;