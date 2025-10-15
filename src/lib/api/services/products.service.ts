/**
 * Products Management Service
 *
 * Service layer for all product-related API operations.
 * Implements all 7 product management endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Product,
  ProductListResponse,
  PendingApprovalsResponse,
  ProductApprovalRequest,
  ProductApprovalResponse,
  UpdateProductInventoryRequest,
  UpdateInventoryResponse,
  BulkProductActionRequest,
  BulkProductActionResponse,
  ProductStatisticsResponse,
  GetAllProductsParams,
  GetPendingApprovalsParams,
  GetProductStatisticsParams,
} from '../types';

// ===== PRODUCTS SERVICE CLASS =====

class ProductsService {
  // ===== CORE OPERATIONS =====

  /**
   * Get all products with optional filtering
   */
  async getAll(params?: GetAllProductsParams): Promise<ProductListResponse> {
    console.log('[ProductsService] Fetching products with params:', params);
    const response = await apiClient.get<any>(
      API_ENDPOINTS.PRODUCTS.GET_ALL,
      { params }
    );
    console.log('[ProductsService] Raw response:', response);
    console.log('[ProductsService] Response data:', response.data);
    console.log('[ProductsService] Response data type:', typeof response.data);
    console.log('[ProductsService] Response data keys:', response.data ? Object.keys(response.data) : 'null');

    // Helper function to normalize product data (convert _id to id)
    const normalizeProduct = (product: any): Product => {
      const { _id, categoryId, vendorId, title, __v, ...rest } = product;

      // Normalize main product
      const normalized: any = {
        ...rest,
        id: _id || product.id, // Use _id if exists, otherwise use id
        name: product.name || title || product.title, // Use name or title
        sku: product.sku || 'N/A', // Ensure SKU exists
      };

      // Normalize categoryId to category
      if (categoryId) {
        if (typeof categoryId === 'object') {
          const { _id: catId, ...catRest } = categoryId;
          normalized.category = {
            ...catRest,
            id: catId || categoryId.id || categoryId._id,
            name: catRest.name || 'Unknown',
          };
        } else {
          normalized.category = { id: categoryId, name: '' };
        }
      } else if (!normalized.category) {
        // Ensure category exists
        normalized.category = { id: '', name: 'Uncategorized' };
      }

      // Normalize vendorId to vendor
      if (vendorId) {
        if (typeof vendorId === 'object') {
          const { _id: venId, ...venRest } = vendorId;
          normalized.vendor = {
            ...venRest,
            id: venId || vendorId.id || vendorId._id,
            businessName: venRest.businessName || 'Unknown Vendor',
          };
        } else {
          normalized.vendor = { id: vendorId, businessName: '' };
        }
      } else if (!normalized.vendor) {
        // Ensure vendor exists (vendorId might be null)
        normalized.vendor = { id: '', businessName: 'No Vendor' };
      }

      // Normalize images array
      if (normalized.images && Array.isArray(normalized.images)) {
        normalized.images = normalized.images.map((img: any, index: number) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: index === 0 };
          }
          const { _id: imgId, ...imgRest } = img;
          return {
            url: imgRest.url || img.url,
            isPrimary: imgRest.isPrimary ?? (index === 0),
            alt: imgRest.alt || imgRest.title || normalized.name,
          };
        });
      } else {
        // Ensure images array exists
        normalized.images = [];
      }

      // Ensure required fields exist
      normalized.price = normalized.price || normalized.basePrice || 0;
      normalized.stock = normalized.stock || normalized.variants?.[0]?.inventory || 0;
      normalized.slug = normalized.slug || normalized.id;
      normalized.description = normalized.description || '';
      normalized.approvalStatus = normalized.approvalStatus || 'pending';

      // Remove MongoDB-specific fields
      delete normalized.__v;
      delete normalized._id;

      return normalized as Product;
    };

    // Handle different possible response structures
    let result: ProductListResponse;

    if (response.data?.data && Array.isArray(response.data.data)) {
      // Expected structure: { data: Product[], meta: {...} }
      result = {
        data: response.data.data.map(normalizeProduct),
        meta: response.data.meta,
      };
      console.log('[ProductsService] Using standard structure');
    } else if (Array.isArray(response.data)) {
      // Array directly: Product[]
      console.log('[ProductsService] Response is direct array, wrapping it');
      result = {
        data: response.data.map(normalizeProduct),
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / (params?.limit || 20)),
        },
      };
    } else if (response.data?.products && Array.isArray(response.data.products)) {
      // Alternative structure: { products: Product[], ... }
      console.log('[ProductsService] Response has products array');
      result = {
        data: response.data.products.map(normalizeProduct),
        meta: response.data.meta || {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: response.data.products.length,
          totalPages: Math.ceil(response.data.products.length / (params?.limit || 20)),
        },
      };
    } else {
      console.error('[ProductsService] Unexpected response structure:', response.data);
      result = {
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    console.log('[ProductsService] Final result:', result);
    return result;
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)
    );
    return response.data!;
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(
    params?: GetPendingApprovalsParams
  ): Promise<PendingApprovalsResponse> {
    const response = await apiClient.get<PendingApprovalsResponse>(
      API_ENDPOINTS.PRODUCTS.GET_PENDING_APPROVALS,
      { params }
    );
    return response.data!;
  }

  /**
   * Approve or reject product
   */
  async approveReject(
    id: string,
    data: ProductApprovalRequest
  ): Promise<ProductApprovalResponse> {
    const response = await apiClient.patch<ProductApprovalResponse>(
      API_ENDPOINTS.PRODUCTS.APPROVE_REJECT(id),
      data
    );
    return response.data!;
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    id: string,
    data: UpdateProductInventoryRequest
  ): Promise<UpdateInventoryResponse> {
    const response = await apiClient.patch<UpdateInventoryResponse>(
      API_ENDPOINTS.PRODUCTS.UPDATE_INVENTORY(id),
      data
    );
    return response.data!;
  }

  /**
   * Get product statistics
   */
  async getStatistics(
    params?: GetProductStatisticsParams
  ): Promise<ProductStatisticsResponse> {
    console.log('[ProductsService] Fetching statistics with params:', params);
    const response = await apiClient.get<any>(
      API_ENDPOINTS.PRODUCTS.GET_STATISTICS,
      { params }
    );
    console.log('[ProductsService] Statistics response:', response.data);
    console.log('[ProductsService] Statistics response keys:', response.data ? Object.keys(response.data) : 'null');

    // Handle different possible response structures
    let result: ProductStatisticsResponse;

    // Check if response has the expected structure
    if (response.data && typeof response.data === 'object' && 'totalProducts' in response.data) {
      result = response.data as ProductStatisticsResponse;
      console.log('[ProductsService] Using direct statistics structure');
    } else if (response.data?.data && typeof response.data.data === 'object') {
      // Nested structure: { data: { statistics... } }
      result = response.data.data as ProductStatisticsResponse;
      console.log('[ProductsService] Using nested statistics structure');
    } else {
      console.error('[ProductsService] Unexpected statistics response structure:', response.data);
      result = {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        pendingApproval: 0,
        rejectedProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        averagePrice: 0,
        totalValue: 0,
        byCategory: [],
        topVendors: [],
      };
    }

    console.log('[ProductsService] Final statistics:', result);
    return result;
  }

  /**
   * Bulk product action
   */
  async bulkAction(
    data: BulkProductActionRequest
  ): Promise<BulkProductActionResponse> {
    const response = await apiClient.post<BulkProductActionResponse>(
      API_ENDPOINTS.PRODUCTS.BULK_ACTION,
      data
    );
    return response.data!;
  }
}

// ===== SINGLETON INSTANCE =====

export const productsService = new ProductsService();
export default productsService;
