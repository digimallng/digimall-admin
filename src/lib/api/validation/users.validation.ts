/**
 * Users Validation Schemas
 */

import { z } from 'zod';
import { UserRoleSchema } from '../types';

export const GetAllUsersParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    role: UserRoleSchema.optional(),
    verified: z.boolean().optional(),
    suspended: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'name', 'email', 'lastLogin']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetUserStatisticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    role: UserRoleSchema.optional(),
  })
  .strict();

export const UpdateUserRequestSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    phoneNumber: z.string().trim().optional(),
    email: z.string().email().optional(),
    verified: z.boolean().optional(),
  })
  .strict();

export const UserSuspensionRequestSchema = z
  .object({
    action: z.enum(['suspend', 'unsuspend']),
    reason: z.string().trim().min(1, 'Reason is required'),
    duration: z.number().int().positive().optional(),
  })
  .strict();
