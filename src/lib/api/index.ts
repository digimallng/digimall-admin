/**
 * API Integration Layer - Main Export
 *
 * This is the central export point for the entire API integration system.
 * Import from this file to access types, services, hooks, validation, and utilities.
 *
 * @example
 * ```typescript
 * import { staffService, useStaff, StaffRole } from '@/lib/api';
 * ```
 */

// ===== TYPES =====
// Export all type definitions
export * from './types';

// ===== SERVICES =====
// Export all API service instances
export * from './services';

// ===== HOOKS =====
// Export all React Query hooks
export * from './hooks';

// ===== VALIDATION =====
// Export all Zod validation schemas
export * from './validation';

// ===== CONFIGURATION =====
// Export configuration and constants
export * from './config';

// ===== UTILITIES =====
// Export utility functions
export * from './utils';

// ===== CORE API CLIENT =====
// Export core API client for advanced usage
export { apiClient } from './core';
