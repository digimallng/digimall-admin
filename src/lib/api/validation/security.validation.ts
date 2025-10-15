/**
 * Security Validation Schemas
 */

import { z } from 'zod';
import { SecurityEventTypeSchema, SecurityAlertStatusSchema } from '../types';

export const GetSecurityEventsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    type: SecurityEventTypeSchema.optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    resolved: z.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'severity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetSecurityAlertsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    status: SecurityAlertStatusSchema.optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'severity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetBlockedIPsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    active: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'expiresAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const ResolveSecurityEventRequestSchema = z
  .object({
    resolution: z.string().trim().min(1, 'Resolution is required'),
    notes: z.string().trim().optional(),
  })
  .strict();

export const UpdateSecurityAlertRequestSchema = z
  .object({
    status: SecurityAlertStatusSchema,
    notes: z.string().trim().optional(),
  })
  .strict();

export const BlockIPRequestSchema = z
  .object({
    ip: z.string().ip('Invalid IP address'),
    reason: z.string().trim().min(1, 'Reason is required'),
    duration: z.number().int().positive().optional(),
    permanent: z.boolean().optional(),
  })
  .strict();
