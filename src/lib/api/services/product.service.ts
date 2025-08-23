import { apiClient } from '../client';
import type { ApiResponse, ProductsPaginatedResponse } from '../types';
import { Product } from '../types';


export interface ProductQuery {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  allowBargaining?: boolean;
  tags?: string[];
  sortBy?: 'name' | 'price' | 'createdAt' | 'averageRating' | 'soldQuantity' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  includeVendor?: boolean;
  includeCategory?: boolean;
  includeImages?: boolean;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  outOfStock: number;
  lowStock: number;
  featured: number;
  totalViews: number;
  totalSales: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminProductActions {
  approve: (id: string) => Promise<Product>;
  suspend: (id: string, reason?: string) => Promise<Product>;
  feature: (id: string) => Promise<Product>;
  unfeature: (id: string) => Promise<Product>;
  updateStatus: (id: string, status: Product['status']) => Promise<Product>;
}

export class ProductService {
  private readonly baseUrl = '/products';

  async findAll(query: ProductQuery = {}): Promise<ProductsPaginatedResponse> {
    const params = new URLSearchParams();
    
    // Filter out include parameters that are not supported by the API
    const { includeVendor, includeCategory, includeImages, ...supportedQuery } = query;
    
    Object.entries(supportedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get<{ products: Product[]; total: number; page: number; limit: number; totalPages: number }>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    return {
      products: response.products,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.pages || response.totalPages || 0,
    };
  }

  async findOne(id: string, options: {
    includeVendor?: boolean;
    includeCategory?: boolean;
    includeImages?: boolean;
    includeReviews?: boolean;
  } = {}): Promise<Product> {
    const response = await apiClient.get<Product>(
      `${this.baseUrl}/${id}`
    );
    return response;
  }

  async getStats(): Promise<ProductStats> {
    const allProducts = await this.findAll({ 
      limit: 10000
    });
    
    const products = allProducts.products;
    
    return {
      total: allProducts.total,
      active: products.filter(p => p.status === 'ACTIVE').length,
      inactive: products.filter(p => p.status === 'INACTIVE').length,
      draft: products.filter(p => p.status === 'DRAFT').length,
      outOfStock: products.filter(p => p.status === 'OUT_OF_STOCK').length,
      lowStock: products.filter(p => 
        p.trackInventory && p.stockQuantity <= (p.lowStockThreshold || 5)
      ).length,
      featured: products.filter(p => p.isFeatured).length,
      totalViews: products.reduce((sum, p) => sum + (p.viewCount || 0), 0),
      totalSales: products.reduce((sum, p) => sum + (p.soldQuantity || 0), 0),
    };
  }

  async getFeatured(limit?: number): Promise<Product[]> {
    const inventory = await this.getInventory();
    return inventory.products.filter(p => p.isFeatured).slice(0, limit);
  }

  async getInventory(): Promise<{ summary: any; products: Product[] }> {
    const response = await apiClient.get<{ summary: any; products: Product[] }>(
      `${this.baseUrl}/inventory`
    );
    return response;
  }

  // Admin-specific actions
  async updateStatus(id: string, status: Product['status'], reason?: string): Promise<Product> {
    const response = await apiClient.put<Product>(
      `${this.baseUrl}/${id}/status`,
      { status, reason }
    );
    return response;
  }

  async approveProduct(id: string): Promise<Product> {
    const response = await apiClient.post<Product>(
      `${this.baseUrl}/${id}/approve`,
      { approved: true }
    );
    return response;
  }

  async suspendProduct(id: string, reason?: string): Promise<Product> {
    return this.updateStatus(id, 'INACTIVE', reason);
  }

  async featureProduct(id: string): Promise<Product> {
    const response = await apiClient.put<Product>(
      `${this.baseUrl}/${id}`,
      { isFeatured: true }
    );
    return response;
  }

  async unfeatureProduct(id: string): Promise<Product> {
    const response = await apiClient.put<Product>(
      `${this.baseUrl}/${id}`,
      { isFeatured: false }
    );
    return response;
  }

  async bulkUpdateStatus(ids: string[], status: Product['status'], reason?: string): Promise<void> {
    let action: string;
    switch (status) {
      case 'ACTIVE':
        action = 'approve';
        break;
      case 'INACTIVE':
        action = 'deactivate';
        break;
      default:
        action = 'deactivate';
    }
    
    await apiClient.post(`${this.baseUrl}/bulk-action`, {
      productIds: ids,
      action,
      reason
    });
  }

  async getVendorProducts(vendorId: string, query: ProductQuery = {}): Promise<AdminPaginatedResponse<Product>> {
    return this.findAll({ ...query, vendorId });
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post(`${this.baseUrl}/bulk-action`, {
      productIds: ids,
      action: 'delete'
    });
  }
}

export const productService = new ProductService();