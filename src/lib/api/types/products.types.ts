/**
 * Products Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 7 product management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams, PaginatedResponse } from './shared.types';
import { ProductStatusSchema, ProductApprovalStatusSchema } from './enums.types';

// ===== PRODUCT ENTITY =====

/**
 * Product image interface
 */
export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export const ProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
});

/**
 * Product specification
 */
export interface ProductSpecification {
  name: string;
  value: string;
}

export const ProductSpecificationSchema = z.object({
  name: z.string(),
  value: z.string(),
});

/**
 * Product variant option
 */
export interface ProductVariantOption {
  name: string;
  options: string[];
}

export const ProductVariantOptionSchema = z.object({
  name: z.string(),
  options: z.array(z.string()),
});

/**
 * Product shipping info
 */
export interface ProductShipping {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export const ProductShippingSchema = z.object({
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
});

/**
 * Product SEO
 */
export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export const ProductSEOSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
});

/**
 * Product vendor info
 */
export interface ProductVendor {
  id: string;
  businessName: string;
}

export const ProductVendorSchema = z.object({
  id: z.string(),
  businessName: z.string(),
});

/**
 * Product category info
 */
export interface ProductCategory {
  id: string;
  name: string;
  path?: string;
}

export const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string().optional(),
});

/**
 * Approved by info
 */
export interface ApprovedBy {
  staffId: string;
  staffName: string;
  approvedAt: string;
}

export const ApprovedBySchema = z.object({
  staffId: z.string(),
  staffName: z.string(),
  approvedAt: z.string().datetime(),
});

/**
 * Product entity
 */
export interface Product extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  approvalStatus: 'approved' | 'rejected' | 'pending';
  stock: number;
  lowStockThreshold?: number;
  vendor: ProductVendor;
  category: ProductCategory;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  variants?: ProductVariantOption[];
  shipping?: ProductShipping;
  seo?: ProductSEO;
  rating?: number;
  reviewCount?: number;
  sales?: number;
  views?: number;
  approvedBy?: ApprovedBy;
}

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  status: ProductStatusSchema,
  approvalStatus: ProductApprovalStatusSchema.or(z.literal('pending')),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  vendor: ProductVendorSchema,
  category: ProductCategorySchema,
  images: z.array(ProductImageSchema),
  specifications: z.array(ProductSpecificationSchema).optional(),
  variants: z.array(ProductVariantOptionSchema).optional(),
  shipping: ProductShippingSchema.optional(),
  seo: ProductSEOSchema.optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  sales: z.number().int().nonnegative().optional(),
  views: z.number().int().nonnegative().optional(),
  approvedBy: ApprovedBySchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all products query parameters
 * Updated to match backend AdminProductFiltersDto
 */
export interface GetAllProductsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  status?: 'active' | 'inactive' | 'archived';
  vendorId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  isFeatured?: boolean;
  searchTerm?: string;
  sortBy?: 'createdAt' | 'price' | 'stock' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllProductsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minStock: z.number().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
  searchTerm: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'stock', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get pending approvals query parameters
 */
export interface GetPendingApprovalsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
}

export const GetPendingApprovalsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * Get product statistics query parameters
 */
export interface GetProductStatisticsParams {
  vendorId?: string;
  categoryId?: string;
}

export const GetProductStatisticsParamsSchema = z.object({
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Approve/Reject product request
 */
export interface ProductApprovalRequest {
  status: 'approved' | 'rejected';
  reason: string;
}

export const ProductApprovalRequestSchema = z.object({
  status: ProductApprovalStatusSchema,
  reason: z.string().min(1),
});

/**
 * Update product inventory request
 */
export interface UpdateProductInventoryRequest {
  stock: number;
  lowStockThreshold: number;
  reason: string;
}

export const UpdateProductInventoryRequestSchema = z.object({
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  reason: z.string().min(1),
});

/**
 * Bulk product action request
 */
export interface BulkProductActionRequest {
  productIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'approve' | 'reject';
  reason?: string;
}

export const BulkProductActionRequestSchema = z.object({
  productIds: z.array(z.string()).min(1),
  action: z.enum(['activate', 'deactivate', 'delete', 'approve', 'reject']),
  reason: z.string().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Product list response
 */
export interface ProductListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Pending product
 */
export interface PendingProduct {
  id: string;
  name: string;
  price: number;
  vendor: ProductVendor;
  submittedAt: string;
  status: string;
}

export const PendingProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  vendor: ProductVendorSchema,
  submittedAt: z.string().datetime(),
  status: z.string(),
});

/**
 * Pending approvals response
 */
export interface PendingApprovalsResponse {
  data: PendingProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const PendingApprovalsResponseSchema = z.object({
  data: z.array(PendingProductSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

/**
 * Product approval response
 */
export interface ProductApprovalResponse {
  message: string;
  data: {
    id: string;
    name: string;
    approvalStatus: string;
    approvedBy: string;
    approvedAt: string;
  };
}

export const ProductApprovalResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    approvalStatus: z.string(),
    approvedBy: z.string(),
    approvedAt: z.string().datetime(),
  }),
});

/**
 * Update inventory response
 */
export interface UpdateInventoryResponse {
  message: string;
  data: {
    id: string;
    stock: number;
    lowStockThreshold: number;
    updatedBy: string;
    updatedAt: string;
  };
}

export const UpdateInventoryResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    stock: z.number().int().nonnegative(),
    lowStockThreshold: z.number().int().nonnegative(),
    updatedBy: z.string(),
    updatedAt: z.string().datetime(),
  }),
});

/**
 * Top vendor by product
 */
export interface TopVendorByProduct {
  vendorId: string;
  businessName: string;
  productCount: number;
  totalSales: number;
}

export const TopVendorByProductSchema = z.object({
  vendorId: z.string(),
  businessName: z.string(),
  productCount: z.number().int().nonnegative(),
  totalSales: z.number().nonnegative(),
});

/**
 * Product statistics by category
 */
export interface ProductStatisticsByCategory {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

export const ProductStatisticsByCategorySchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
});

/**
 * Product statistics response
 */
export interface ProductStatisticsResponse {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  pendingApproval: number;
  rejectedProducts: number;
  outOfStock: number;
  lowStock: number;
  averagePrice: number;
  totalValue: number;
  totalViews?: number;
  totalSales?: number;
  byCategory: ProductStatisticsByCategory[];
  topVendors: TopVendorByProduct[];
}

export const ProductStatisticsResponseSchema = z.object({
  totalProducts: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  inactiveProducts: z.number().int().nonnegative(),
  pendingApproval: z.number().int().nonnegative(),
  rejectedProducts: z.number().int().nonnegative(),
  outOfStock: z.number().int().nonnegative(),
  lowStock: z.number().int().nonnegative(),
  averagePrice: z.number().nonnegative(),
  totalValue: z.number().nonnegative(),
  totalViews: z.number().int().nonnegative().optional(),
  totalSales: z.number().int().nonnegative().optional(),
  byCategory: z.array(ProductStatisticsByCategorySchema),
  topVendors: z.array(TopVendorByProductSchema),
});

/**
 * Bulk action details
 */
export interface BulkActionDetail {
  productId: string;
  status: 'success' | 'failed';
  message?: string;
}

export const BulkActionDetailSchema = z.object({
  productId: z.string(),
  status: z.enum(['success', 'failed']),
  message: z.string().optional(),
});

/**
 * Bulk product action response
 */
export interface BulkProductActionResponse {
  message: string;
  successful: number;
  failed: number;
  details: BulkActionDetail[];
}

export const BulkProductActionResponseSchema = z.object({
  message: z.string(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  details: z.array(BulkActionDetailSchema),
});

// ===== TYPE EXPORTS =====

export type {
  Product,
  ProductListResponse,
  PendingApprovalsResponse,
  ProductApprovalResponse,
  UpdateInventoryResponse,
  ProductStatisticsResponse,
  BulkProductActionResponse,
};
