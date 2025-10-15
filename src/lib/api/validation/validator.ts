/**
 * Generic Validator Utility
 * Provides runtime validation using Zod schemas
 */

import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'An unknown validation error occurred',
        },
      ],
    };
  }
}

/**
 * Validate data and throw error if invalid
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = validate(schema, data);

  if (!result.success) {
    const errorMessage = result.errors
      ?.map((err) => `${err.field}: ${err.message}`)
      .join(', ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  return result.data!;
}

/**
 * Safe parse that returns null on error
 */
export function safeParse<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = validate(schema, data);
  return result.success ? result.data! : null;
}

/**
 * Validate partial data (useful for updates)
 */
export function validatePartial<T extends z.ZodObject<any>>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const partialSchema = schema.partial();
  return validate(partialSchema, data);
}
