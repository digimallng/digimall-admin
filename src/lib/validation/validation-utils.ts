import { z } from 'zod';
import { ApiError } from '@/lib/api/client';

// ===== VALIDATION RESULT TYPES =====

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  fieldErrors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// ===== VALIDATION UTILITIES =====

/**
 * Safely validates data against a Zod schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  options: {
    abortEarly?: boolean;
    stripUnknown?: boolean;
  } = {}
): ValidationResult<T> {
  const { abortEarly = false, stripUnknown = true } = options;

  try {
    const parsedData = schema.parse(data);
    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      const errors: ValidationError[] = [];

      error.errors.forEach(issue => {
        const field = issue.path.join('.');
        const message = issue.message;
        const code = issue.code;
        const value = issue.received;

        // Add to errors array
        errors.push({ field, message, code, value });

        // Group by field for easier form handling
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(message);

        // If abort early is enabled, stop after first error
        if (abortEarly) return;
      });

      return {
        success: false,
        errors,
        fieldErrors,
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      errors: [{
        field: 'root',
        message: error instanceof Error ? error.message : 'Validation failed',
        code: 'unknown_error',
      }],
    };
  }
}

/**
 * Safely parses data with a Zod schema, returning null on error
 */
export function safeParseData<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): T | null {
  const result = validateData(schema, data);
  return result.success ? result.data! : null;
}

/**
 * Validates partial data against a schema (useful for updates)
 */
export function validatePartialData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<Partial<T>> {
  // Create a partial version of the schema
  const partialSchema = schema.partial();
  return validateData(partialSchema, data);
}

/**
 * Validates an array of data against a schema
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  dataArray: unknown[]
): ValidationResult<T[]> {
  const arraySchema = z.array(schema);
  return validateData(arraySchema, dataArray);
}

/**
 * Validates form data with specific handling for FormData objects
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData | Record<string, any>
): ValidationResult<T> {
  let data: Record<string, any>;

  if (formData instanceof FormData) {
    // Convert FormData to plain object
    data = {};
    for (const [key, value] of formData.entries()) {
      if (key.endsWith('[]')) {
        // Handle array fields
        const arrayKey = key.slice(0, -2);
        if (!data[arrayKey]) data[arrayKey] = [];
        data[arrayKey].push(value);
      } else if (data[key]) {
        // Handle multiple values for same key
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
  } else {
    data = formData;
  }

  // Convert string values to appropriate types
  const processedData = preprocessFormData(data);
  
  return validateData(schema, processedData);
}

/**
 * Preprocesses form data to convert strings to appropriate types
 */
function preprocessFormData(data: Record<string, any>): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      processed[key] = value.map(v => convertValue(v));
    } else {
      processed[key] = convertValue(value);
    }
  }

  return processed;
}

/**
 * Converts string values to appropriate types
 */
function convertValue(value: any): any {
  if (typeof value !== 'string') return value;
  
  // Handle empty strings
  if (value === '') return undefined;
  
  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Handle numbers
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // Handle dates (ISO format)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  
  return value;
}

// ===== API ERROR VALIDATION =====

/**
 * Extracts validation errors from API error responses
 */
export function extractApiValidationErrors(error: any): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  if (error instanceof ApiError && error.data?.details) {
    if (Array.isArray(error.data.details)) {
      error.data.details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          if (!fieldErrors[detail.field]) {
            fieldErrors[detail.field] = [];
          }
          fieldErrors[detail.field].push(detail.message);
        }
      });
    }
  }

  return fieldErrors;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  if (error instanceof ApiError) {
    return error.status === 422 || error.status === 400;
  }
  return false;
}

// ===== CUSTOM VALIDATORS =====

/**
 * Creates a conditional validator
 */
export function createConditionalValidator<T>(
  condition: (data: any) => boolean,
  schema: z.ZodSchema<T>
) {
  return z.any().superRefine((data, ctx) => {
    if (condition(data)) {
      const result = schema.safeParse(data);
      if (!result.success) {
        result.error.errors.forEach(error => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            path: error.path,
          });
        });
      }
    }
  });
}

/**
 * Creates a dependent field validator
 */
export function createDependentValidator<T>(
  dependentField: string,
  dependentValue: any,
  schema: z.ZodSchema<T>
) {
  return createConditionalValidator(
    (data) => data[dependentField] === dependentValue,
    schema
  );
}

/**
 * Creates a cross-field validator
 */
export function createCrossFieldValidator(
  field1: string,
  field2: string,
  validator: (value1: any, value2: any) => boolean,
  message: string
) {
  return z.any().superRefine((data, ctx) => {
    const value1 = data[field1];
    const value2 = data[field2];
    
    if (!validator(value1, value2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [field2],
      });
    }
  });
}

// ===== VALIDATION MIDDLEWARE =====

/**
 * Creates a validation middleware for API routes
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateData(schema, data);
    
    if (!result.success) {
      throw new ApiError(
        'Validation failed',
        422,
        {
          message: 'Validation failed',
          statusCode: 422,
          timestamp: new Date().toISOString(),
          path: '/validation',
          details: result.errors,
        }
      );
    }
    
    return result.data!;
  };
}

// ===== RUNTIME TYPE CHECKING =====

/**
 * Type guard for checking if a value matches a schema
 */
export function isOfType<T>(schema: z.ZodSchema<T>, value: unknown): value is T {
  const result = schema.safeParse(value);
  return result.success;
}

/**
 * Asserts that a value matches a schema, throwing if not
 */
export function assertType<T>(schema: z.ZodSchema<T>, value: unknown): asserts value is T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Type assertion failed: ${result.error.message}`);
  }
}

// ===== VALIDATION HELPERS FOR SPECIFIC SCENARIOS =====

/**
 * Validates file uploads
 */
export function validateFileUpload(
  file: File, 
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): ValidationResult<File> {
  const { 
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  const errors: ValidationError[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push({
      field: 'file',
      message: `File size cannot exceed ${(maxSize / (1024 * 1024)).toFixed(1)}MB`,
      code: 'file_too_large',
      value: file.size,
    });
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `File type ${file.type} is not allowed`,
      code: 'invalid_file_type',
      value: file.type,
    });
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push({
        field: 'file',
        message: `File extension .${extension} is not allowed`,
        code: 'invalid_file_extension',
        value: extension,
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: file };
}

/**
 * Validates bulk operations
 */
export function validateBulkOperation<T>(
  items: unknown[],
  schema: z.ZodSchema<T>,
  options: {
    maxItems?: number;
    continueOnError?: boolean;
  } = {}
): ValidationResult<T[]> {
  const { maxItems = 1000, continueOnError = false } = options;

  if (items.length > maxItems) {
    return {
      success: false,
      errors: [{
        field: 'items',
        message: `Cannot process more than ${maxItems} items at once`,
        code: 'too_many_items',
        value: items.length,
      }],
    };
  }

  const validItems: T[] = [];
  const errors: ValidationError[] = [];

  items.forEach((item, index) => {
    const result = validateData(schema, item);
    
    if (result.success) {
      validItems.push(result.data!);
    } else {
      // Add index to error field paths
      const indexedErrors = result.errors!.map(error => ({
        ...error,
        field: `items[${index}].${error.field}`,
      }));
      
      errors.push(...indexedErrors);
      
      if (!continueOnError) {
        return {
          success: false,
          errors,
        };
      }
    }
  });

  if (errors.length > 0 && !continueOnError) {
    return { success: false, errors };
  }

  return {
    success: errors.length === 0,
    data: validItems,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ===== SANITIZATION UTILITIES =====

/**
 * Sanitizes HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitizes user input by trimming and removing unwanted characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitizes file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^\w\s.-]/g, '') // Keep only word chars, spaces, dots, hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[.-]|[.-]$/g, '') // Remove leading/trailing dots and hyphens
    .toLowerCase();
}