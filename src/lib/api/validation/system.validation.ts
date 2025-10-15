/**
 * System Validation Schemas
 */

import { z } from 'zod';

export const GetSystemLogsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
    service: z.string().trim().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'level']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const UpdateSystemConfigurationRequestSchema = z
  .object({
    value: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
    description: z.string().trim().optional(),
  })
  .strict();

export const ClearCacheRequestSchema = z
  .object({
    type: z.enum(['all', 'queries', 'mutations', 'sessions', 'static']).optional(),
    key: z.string().trim().optional(),
  })
  .strict();

export const ToggleMaintenanceModeRequestSchema = z
  .object({
    enabled: z.boolean(),
    message: z.string().trim().optional(),
    estimatedDuration: z.number().int().positive().optional(),
  })
  .strict();
