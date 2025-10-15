/**
 * Analytics Validation Schemas
 */

import { z } from 'zod';

export const GetAnalyticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    granularity: z.enum(['hour', 'day', 'week', 'month']).optional(),
    timezone: z.string().optional(),
  })
  .strict();
