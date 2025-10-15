/**
 * Categories Validation Schemas
 */

import { z } from 'zod';

export const GetAllCategoriesParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    parentId: z.string().trim().optional(),
    active: z.boolean().optional(),
    sortBy: z.enum(['name', 'order', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const CreateCategoryRequestSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().min(1, 'Slug is required'),
    description: z.string().trim().optional(),
    parentId: z.string().trim().optional(),
    image: z.string().url().optional(),
    icon: z.string().optional(),
    order: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().trim().optional(),
        description: z.string().trim().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .strict();

export const UpdateCategoryRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    parentId: z.string().trim().optional(),
    image: z.string().url().optional(),
    icon: z.string().optional(),
    order: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().trim().optional(),
        description: z.string().trim().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .strict();

export const ReorderCategoriesRequestSchema = z
  .object({
    categories: z
      .array(
        z.object({
          id: z.string(),
          order: z.number().int().min(0),
        })
      )
      .min(1, 'At least one category is required'),
  })
  .strict();
