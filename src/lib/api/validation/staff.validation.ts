/**
 * Staff Validation Schemas
 */

import { z } from 'zod';
import {
  StaffRoleSchema,
  StaffStatusSchema,
  PermissionSchema,
  PaginationParamsSchema,
} from '../types';

export const GetAllStaffParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    role: StaffRoleSchema.optional(),
    status: StaffStatusSchema.optional(),
    sortBy: z.enum(['createdAt', 'name', 'email', 'role', 'lastLogin']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const CreateStaffRequestSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    role: StaffRoleSchema,
    permissions: z.array(PermissionSchema).optional(),
    phoneNumber: z.string().trim().optional(),
    department: z.string().trim().optional(),
  })
  .strict();

export const UpdateStaffRequestSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    phoneNumber: z.string().trim().optional(),
    department: z.string().trim().optional(),
    role: StaffRoleSchema.optional(),
  })
  .strict();

export const StaffLoginRequestSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  })
  .strict();

export const UpdateStaffStatusRequestSchema = z
  .object({
    status: StaffStatusSchema,
    reason: z.string().trim().optional(),
  })
  .strict();

export const UpdateStaffPermissionsRequestSchema = z
  .object({
    permissions: z.array(PermissionSchema).min(1, 'At least one permission is required'),
  })
  .strict();
