/**
 * Vendors Management Service
 *
 * Service layer for all vendor-related API operations.
 * Implements all 6 vendor management endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Vendor,
  VendorListResponse,
  VendorApprovalRequest,
  VendorApprovalResponse,
  UpdateVendorTierRequest,
  VendorSuspensionRequest,
  VendorStatisticsResponse,
  GetAllVendorsParams,
  GetVendorStatisticsParams,
} from '../types';

// ===== BACKEND RESPONSE TYPES =====

interface BackendVendor {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
  };
  businessName: string;
  businessType: string;
  businessDescription?: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  } | string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    transferRecipientCode?: string;
  };
  kycStatus: 'verified' | 'pending' | 'rejected';
  kycVerificationDate?: string;
  status: 'pending' | 'pending_approval' | 'active' | 'suspended' | 'inactive';
  subscriptionStatus?: string;
  trialEndDate?: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalRatings: number;
  isFeatured: boolean;
  performanceMetrics?: {
    responseTime: number;
    fulfillmentRate: number;
    onTimeDelivery: number;
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  approvalDate?: string;
  approvedBy?: string;
  tier?: 'basic' | 'silver' | 'gold' | 'platinum';
  commissionRate?: number;
  suspendedAt?: string;
  suspensionReason?: string;
}

interface BackendVendorDetailResponse {
  vendor: BackendVendor;
  userInfo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
  };
  products: {
    total: number;
    active: number;
    draft: number;
    outOfStock: number;
    inactive: number;
    recentProducts: any[];
    topSellingProducts: any[];
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    completionRate: string;
    cancellationRate: string;
    recentOrders: any[];
    ordersByStatus: Record<string, number>;
  };
  financial: {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: string;
    averageOrderValue: number;
    wallet: any;
  };
  performance: {
    averageRating: number;
    totalRatings: number;
    performanceMetrics: {
      responseTime: number;
      fulfillmentRate: number;
      onTimeDelivery: number;
    };
    completionRate: number;
    cancellationRate: number;
    responseTime: number;
    fulfillmentRate: number;
    onTimeDelivery: number;
  };
  subscription: {
    status: string;
    trialEndDate?: string;
    isTrialActive: boolean;
    canSell: boolean;
    needsSubscription: boolean;
  };
}

interface BackendVendorListResponse {
  vendors: BackendVendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== VENDORS SERVICE CLASS =====

class VendorsService {
  /**
   * Transform backend vendor to frontend Vendor type
   */
  private transformVendor(backendVendor: BackendVendor, userInfo?: any, products?: any, orders?: any, financial?: any, performance?: any): Vendor {
    const businessAddressStr = typeof backendVendor.businessAddress === 'string'
      ? backendVendor.businessAddress
      : `${backendVendor.businessAddress.street}, ${backendVendor.businessAddress.city}, ${backendVendor.businessAddress.state}`;

    // Extract user info from userId if it's an object
    const userInfoData = typeof backendVendor.userId === 'object' ? backendVendor.userId : userInfo;
    const userId = typeof backendVendor.userId === 'object' ? backendVendor.userId._id : backendVendor.userId;

    // Map status - handle 'pending_approval' to 'pending'
    const status = backendVendor.status === 'pending_approval' ? 'pending' : backendVendor.status;

    return {
      id: backendVendor._id,
      userId: userId,
      email: userInfoData?.email || '',
      phone: userInfoData?.phone || '',
      businessInfo: {
        businessName: backendVendor.businessName,
        businessAddress: businessAddressStr,
        businessType: backendVendor.businessType,
        description: backendVendor.businessDescription,
        registrationNumber: undefined,
        taxId: undefined,
        address: typeof backendVendor.businessAddress === 'object' ? backendVendor.businessAddress : undefined,
      },
      status: status as 'pending' | 'active' | 'suspended' | 'inactive',
      tier: backendVendor.tier || 'basic',
      kyc: {
        status: backendVendor.kycStatus,
        verifiedBy: backendVendor.approvedBy,
        verifiedAt: backendVendor.kycVerificationDate || backendVendor.approvalDate,
      },
      bankAccount: backendVendor.bankDetails ? {
        accountName: backendVendor.bankDetails.accountName,
        accountNumber: backendVendor.bankDetails.accountNumber,
        bankName: backendVendor.bankDetails.bankName,
        bankCode: backendVendor.bankDetails.bankCode,
      } : undefined,
      metrics: {
        totalProducts: products?.total || 0,
        activeProducts: products?.active || 0,
        totalOrders: orders?.total || 0,
        completedOrders: orders?.delivered || 0,
        totalRevenue: financial?.totalRevenue || backendVendor.totalRevenue,
        averageRating: performance?.averageRating || backendVendor.averageRating,
        reviewCount: performance?.totalRatings || backendVendor.totalRatings,
        responseRate: performance?.responseTime || backendVendor.performanceMetrics?.responseTime || 0,
        fulfillmentRate: performance?.fulfillmentRate || backendVendor.performanceMetrics?.fulfillmentRate || 0,
        totalReviews: performance?.totalRatings || backendVendor.totalRatings,
      },
      commissionRate: backendVendor.commissionRate || 0,
      balance: financial?.wallet?.balance || 0,
      pendingBalance: financial?.wallet?.pendingBalance || 0,
      lastActiveAt: undefined,
      approvedBy: backendVendor.approvedBy,
      approvedAt: backendVendor.approvalDate,
      suspendedAt: backendVendor.suspendedAt,
      suspensionReason: backendVendor.suspensionReason,
      createdAt: backendVendor.createdAt,
      updatedAt: backendVendor.updatedAt,
      deletedAt: backendVendor.deletedAt,
    };
  }

  /**
   * Get all vendors with optional filtering
   */
  async getAll(params?: GetAllVendorsParams): Promise<VendorListResponse> {
    const response = await apiClient.get<BackendVendorListResponse>(
      API_ENDPOINTS.VENDORS.GET_ALL,
      { params }
    );

    const backendData = response.data!;

    return {
      data: backendData.vendors.map(v => this.transformVendor(v)),
      meta: {
        page: backendData.pagination.page,
        limit: backendData.pagination.limit,
        total: backendData.pagination.total,
        totalPages: backendData.pagination.totalPages,
      },
    };
  }

  /**
   * Get vendor by ID
   */
  async getById(id: string): Promise<Vendor> {
    const response = await apiClient.get<BackendVendorDetailResponse>(
      API_ENDPOINTS.VENDORS.GET_BY_ID(id)
    );

    const data = response.data!;

    // Transform the detailed response
    return this.transformVendor(
      data.vendor,
      data.userInfo,
      data.products,
      data.orders,
      data.financial,
      data.performance
    );
  }

  /**
   * Approve or reject vendor
   * POST /admin/vendors/:vendorId/approve
   */
  async approveReject(
    id: string,
    data: VendorApprovalRequest
  ): Promise<VendorApprovalResponse> {
    const response = await apiClient.post<VendorApprovalResponse>(
      API_ENDPOINTS.VENDORS.APPROVE_REJECT(id),
      data
    );
    return response.data!;
  }

  /**
   * Update vendor tier
   * PUT /admin/vendors/:id/tier
   */
  async updateTier(id: string, data: UpdateVendorTierRequest): Promise<Vendor> {
    const response = await apiClient.put<Vendor>(
      API_ENDPOINTS.VENDORS.UPDATE_TIER(id),
      data
    );
    return response.data!;
  }

  /**
   * Suspend or unsuspend vendor
   */
  async suspendUnsuspend(
    id: string,
    data: VendorSuspensionRequest
  ): Promise<Vendor> {
    const response = await apiClient.patch<Vendor>(
      API_ENDPOINTS.VENDORS.SUSPEND_UNSUSPEND(id),
      data
    );
    return response.data!;
  }

  /**
   * Get vendor statistics
   * Note: This endpoint doesn't accept any query parameters
   */
  async getStatistics(
    params?: GetVendorStatisticsParams
  ): Promise<VendorStatisticsResponse> {
    const response = await apiClient.get<VendorStatisticsResponse>(
      API_ENDPOINTS.VENDORS.GET_STATISTICS
      // Don't pass params - this endpoint doesn't accept them
    );
    return response.data!;
  }

  /**
   * Get vendor performance metrics
   */
  async getPerformance(id: string): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.VENDORS.GET_PERFORMANCE(id)
    );
    return response.data!;
  }

  /**
   * Bulk tier update for multiple vendors
   */
  async bulkTierUpdate(data: {
    vendorIds: string[];
    tier: 'basic' | 'silver' | 'gold' | 'platinum';
    commission: number;
    reason: string;
  }): Promise<{ message: string; successful: number; failed: number }> {
    const response = await apiClient.post(
      API_ENDPOINTS.VENDORS.BULK_TIER_UPDATE,
      data
    );
    return response.data!;
  }
}

// ===== SINGLETON INSTANCE =====

export const vendorsService = new VendorsService();
export default vendorsService;
