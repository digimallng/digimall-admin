/**
 * Categories Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 5 category management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams } from './shared.types';
import { CategoryStatusSchema } from './enums.types';

// ===== CATEGORY ENTITY =====

/**
 * Category image
 */
export interface CategoryImage {
  url: string;
  alt?: string;
}

export const CategoryImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

/**
 * Category SEO
 */
export interface CategorySEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
}

export const CategorySEOSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  slug: z.string(),
});

/**
 * Category statistics
 */
export interface CategoryStatistics {
  productCount: number;
  activeProductCount: number;
  totalSales: number;
  totalRevenue: number;
  viewCount: number;
}

export const CategoryStatisticsSchema = z.object({
  productCount: z.number().int().nonnegative(),
  activeProductCount: z.number().int().nonnegative(),
  totalSales: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  viewCount: z.number().int().nonnegative(),
});

/**
 * Category entity
 */
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  level: number;
  path: string;
  image?: string;  // CloudFront/S3 URL for category image
  bannerImage?: string;  // CloudFront/S3 URL for banner image
  isEnabled: boolean;  // Replaces status field
  isFeatured: boolean;  // Category featured status
  sortOrder: number;
  seoTitle?: string;  // SEO title (max 200 chars)
  seoDescription?: string;  // SEO description (max 300 chars)
  statistics?: CategoryStatistics;  // Optional for simpler backend responses
  children?: Category[];

  // Computed/Alias properties for backward compatibility
  status?: 'active' | 'inactive';  // Computed from isEnabled
  featured?: boolean;  // Alias for isFeatured
  displayOrder?: number;  // Alias for sortOrder
  productCount?: number;  // Alias for statistics?.productCount
  icon?: string;  // Deprecated - kept for backward compatibility
}

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  parentName: z.string().optional(),
  level: z.number().int().nonnegative(),
  path: z.string(),
  image: z.string().url().optional(),
  bannerImage: z.string().url().optional(),
  isEnabled: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  statistics: CategoryStatisticsSchema.optional(),
  children: z.lazy(() => z.array(CategorySchema)).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all categories query parameters
 */
export interface GetAllCategoriesParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  parentId?: string;
  level?: number;
  featured?: boolean;
  includeChildren?: boolean;
  search?: string;
  sortBy?: 'name' | 'displayOrder' | 'productCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllCategoriesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: CategoryStatusSchema.optional(),
  parentId: z.string().optional(),
  level: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
  includeChildren: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'displayOrder', 'productCount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ===== REQUEST TYPES =====

/**
 * Create category request
 */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;  // CloudFront/S3 URL
  bannerImage?: string;  // CloudFront/S3 URL
  isEnabled: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().url().optional(),
  bannerImage: z.string().url().optional(),
  isEnabled: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().nonnegative().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

/**
 * Update category request
 */
export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  image?: string;  // CloudFront/S3 URL
  bannerImage?: string;  // CloudFront/S3 URL
  isEnabled?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().url().optional(),
  bannerImage: z.string().url().optional(),
  isEnabled: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

/**
 * Reorder categories request
 */
export interface ReorderCategoriesRequest {
  categories: {
    id: string;
    displayOrder: number;
  }[];
}

export const ReorderCategoriesRequestSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number().int().nonnegative(),
    })
  ).min(1),
});

// ===== RESPONSE TYPES =====

/**
 * Category list response
 */
export interface CategoryListResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const CategoryListResponseSchema = z.object({
  data: z.array(CategorySchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Category tree response
 */
export interface CategoryTreeResponse {
  data: Category[];
}

export const CategoryTreeResponseSchema = z.object({
  data: z.array(CategorySchema),
});

/**
 * Create category response
 */
export interface CreateCategoryResponse {
  message: string;
  data: Category;
}

export const CreateCategoryResponseSchema = z.object({
  message: z.string(),
  data: CategorySchema,
});

/**
 * Update category response
 */
export interface UpdateCategoryResponse {
  message: string;
  data: Category;
}

export const UpdateCategoryResponseSchema = z.object({
  message: z.string(),
  data: CategorySchema,
});

/**
 * Delete category response
 */
export interface DeleteCategoryResponse {
  message: string;
  data: {
    id: string;
    name: string;
    deletedAt: string;
  };
}

export const DeleteCategoryResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    deletedAt: z.string().datetime(),
  }),
});

/**
 * Reorder categories response
 */
export interface ReorderCategoriesResponse {
  message: string;
  data: {
    updated: number;
    categories: {
      id: string;
      name: string;
      displayOrder: number;
    }[];
  };
}

export const ReorderCategoriesResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    updated: z.number().int().nonnegative(),
    categories: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        displayOrder: z.number().int().nonnegative(),
      })
    ),
  }),
});

// ===== CATEGORY STATISTICS =====

/**
 * Top category by metrics
 */
export interface TopCategory {
  categoryId: string;
  name: string;
  products: number;
  revenue: number;
  orders: number;
}

export const TopCategorySchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  products: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
});

/**
 * Category hierarchy stats
 */
export interface CategoryHierarchy {
  topLevel: number;
  secondLevel: number;
  thirdLevel: number;
}

export const CategoryHierarchySchema = z.object({
  topLevel: z.number().int().nonnegative(),
  secondLevel: z.number().int().nonnegative(),
  thirdLevel: z.number().int().nonnegative(),
});

/**
 * Category statistics response
 */
export interface CategoryStatisticsResponse {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithProducts: number;
  emptyCategories: number;
  topCategories: TopCategory[];
  hierarchy: CategoryHierarchy;
}

export const CategoryStatisticsResponseSchema = z.object({
  totalCategories: z.number().int().nonnegative(),
  activeCategories: z.number().int().nonnegative(),
  inactiveCategories: z.number().int().nonnegative(),
  categoriesWithProducts: z.number().int().nonnegative(),
  emptyCategories: z.number().int().nonnegative(),
  topCategories: z.array(TopCategorySchema),
  hierarchy: CategoryHierarchySchema,
});

// ===== ADDITIONAL OPERATION TYPES =====

/**
 * Category bulk action request
 */
export interface CategoryBulkActionDto {
  action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature';
  categoryIds: string[];
}

export const CategoryBulkActionDtoSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'feature', 'unfeature']),
  categoryIds: z.array(z.string()).min(1),
});

/**
 * Category reorder request (single item)
 */
export interface CategoryReorderDto {
  id: string;
  displayOrder: number;
}

export const CategoryReorderDtoSchema = z.object({
  id: z.string(),
  displayOrder: z.number().int().nonnegative(),
});

/**
 * Category move request
 */
export interface CategoryMoveDto {
  newParentId?: string | null;
  displayOrder?: number;
}

export const CategoryMoveDtoSchema = z.object({
  newParentId: z.string().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

/**
 * Category performance metrics
 */
export interface CategoryPerformance {
  categoryId: string;
  name: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalViews: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  trends: {
    orders: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    revenue: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    views: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  };
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export const CategoryPerformanceSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  metrics: z.object({
    totalProducts: z.number().int().nonnegative(),
    activeProducts: z.number().int().nonnegative(),
    totalOrders: z.number().int().nonnegative(),
    totalRevenue: z.number().nonnegative(),
    totalViews: z.number().int().nonnegative(),
    conversionRate: z.number().nonnegative(),
    averageOrderValue: z.number().nonnegative(),
  }),
  trends: z.object({
    orders: z.object({
      value: z.number(),
      change: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
    }),
    revenue: z.object({
      value: z.number(),
      change: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
    }),
    views: z.object({
      value: z.number(),
      change: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
    }),
  }),
  topProducts: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      sales: z.number().int().nonnegative(),
      revenue: z.number().nonnegative(),
    })
  ),
});

// ===== TYPE ALIASES FOR BACKWARD COMPATIBILITY =====

/**
 * Type aliases used by hooks and services
 */
export type CategoryFilters = GetAllCategoriesParams;
export type CreateCategoryDto = CreateCategoryRequest;
export type UpdateCategoryDto = UpdateCategoryRequest;
export type CategoryTree = Category[];
export type { FileUploadResponse as UploadResponse } from './shared.types';

// ===== TYPE EXPORTS =====

export type {
  Category,
  CategoryListResponse,
  CategoryTreeResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  ReorderCategoriesResponse,
  CategoryStatisticsResponse,
};
