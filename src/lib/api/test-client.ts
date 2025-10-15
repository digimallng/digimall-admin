/**
 * API Test Client
 * Centralized client for testing admin endpoints
 */

export interface TestResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  timestamp: string;
  duration: number;
  success: boolean;
}

export class ApiTestClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api/proxy') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    requiresAuth: boolean = false
  ): Promise<TestResponse> {
    const startTime = performance.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const duration = performance.now() - startTime;
      let responseData;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: responseHeaders,
        timestamp: new Date().toISOString(),
        duration: Math.round(duration),
        success: response.ok,
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      return {
        status: 0,
        statusText: 'Network Error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to connect to backend',
        },
        headers: {},
        timestamp: new Date().toISOString(),
        duration: Math.round(duration),
        success: false,
      };
    }
  }

  // Setup Endpoints
  async verifySetup() {
    return this.request('POST', 'staff/setup/verify-setup');
  }

  async createSuperAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    setupToken: string;
  }) {
    return this.request('POST', 'staff/setup/create-super-admin', data);
  }

  // Authentication Endpoints
  async login(email: string, password: string) {
    return this.request('POST', 'staff/auth/login', { email, password });
  }

  async refreshToken(refreshToken: string) {
    return this.request('POST', 'staff/auth/refresh-token', { refreshToken });
  }

  async logout(sessionId?: string) {
    return this.request('POST', 'staff/auth/logout', { sessionId }, true);
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('PUT', 'staff/auth/change-password', { oldPassword, newPassword }, true);
  }

  // Staff Management
  async getStaff(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `staff${query}`, undefined, true);
  }

  async getStaffById(id: string) {
    return this.request('GET', `staff/${id}`, undefined, true);
  }

  async createStaff(data: any) {
    return this.request('POST', 'staff', data, true);
  }

  async updateStaff(id: string, data: any) {
    return this.request('PUT', `staff/${id}`, data, true);
  }

  async deleteStaff(id: string) {
    return this.request('DELETE', `staff/${id}`, undefined, true);
  }

  async inviteStaff(data: any) {
    return this.request('POST', 'staff/invite', data, true);
  }

  async bulkStaffAction(data: any) {
    return this.request('PUT', 'staff/bulk-action', data, true);
  }

  async getStaffSessions(id: string) {
    return this.request('GET', `staff/${id}/sessions`, undefined, true);
  }

  async revokeSession(sessionId: string) {
    return this.request('PUT', `staff/auth/sessions/${sessionId}`, undefined, true);
  }

  async getStaffActivity(id: string, page?: number, limit?: number) {
    const query = new URLSearchParams();
    if (page) query.append('page', page.toString());
    if (limit) query.append('limit', limit.toString());
    return this.request('GET', `staff/${id}/activity?${query}`, undefined, true);
  }

  async getStaffAnalytics() {
    return this.request('GET', 'staff/analytics/overview', undefined, true);
  }

  async getSecurityAudit(days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.request('GET', `staff/analytics/security-audit${query}`, undefined, true);
  }

  async getProductivityMetrics(staffId?: string) {
    const query = staffId ? `?staffId=${staffId}` : '';
    return this.request('GET', `staff/analytics/productivity${query}`, undefined, true);
  }

  async updateStaffPermissions(id: string, data: any) {
    return this.request('PUT', `staff/${id}/permissions`, data, true);
  }

  async getRolePermissions() {
    return this.request('GET', 'staff/roles/permissions', undefined, true);
  }

  // Vendor Management
  async getVendors(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/vendors${query}`, undefined, true);
  }

  async getVendorStatistics() {
    return this.request('GET', 'admin/vendors/statistics', undefined, true);
  }

  async getVendorById(id: string) {
    return this.request('GET', `admin/vendors/${id}`, undefined, true);
  }

  async getVendorPerformance(id: string) {
    return this.request('GET', `admin/vendors/${id}/performance`, undefined, true);
  }

  async getPendingVendors() {
    return this.request('GET', 'admin/vendors/pending', undefined, true);
  }

  async approveVendor(vendorId: string, data: any) {
    return this.request('POST', `admin/vendors/${vendorId}/approve`, data, true);
  }

  async activateVendor(vendorId: string) {
    return this.request('PUT', `admin/vendors/${vendorId}/activate`, undefined, true);
  }

  async updateVendorTier(id: string, data: any) {
    return this.request('PUT', `admin/vendors/${id}/tier`, data, true);
  }

  async bulkVendorTierUpdate(data: any) {
    return this.request('POST', 'admin/vendors/bulk-tier-update', data, true);
  }

  // Product Management
  async getProducts(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/products${query}`, undefined, true);
  }

  async getPendingProducts() {
    return this.request('GET', 'admin/products/pending-approvals', undefined, true);
  }

  async getProductStatistics() {
    return this.request('GET', 'admin/products/statistics', undefined, true);
  }

  async getProductById(id: string) {
    return this.request('GET', `admin/products/${id}`, undefined, true);
  }

  async approveProduct(id: string, data: any) {
    return this.request('PUT', `admin/products/${id}/approval`, data, true);
  }

  async updateProductInventory(id: string, data: any) {
    return this.request('PUT', `admin/products/${id}/inventory`, data, true);
  }

  async bulkProductAction(data: any) {
    return this.request('POST', 'admin/products/bulk-action', data, true);
  }

  // Order Management
  async getOrders(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/orders${query}`, undefined, true);
  }

  async getOrderStatistics() {
    return this.request('GET', 'admin/orders/statistics', undefined, true);
  }

  async getOrderCount(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/orders/count${query}`, undefined, true);
  }

  async getOrderById(id: string) {
    return this.request('GET', `admin/orders/${id}`, undefined, true);
  }

  async updateOrderStatus(id: string, data: any) {
    return this.request('PUT', `admin/orders/${id}/status`, data, true);
  }

  async processRefund(id: string, data: any) {
    return this.request('POST', `admin/orders/${id}/refund`, data, true);
  }

  async bulkOrderAction(data: any) {
    return this.request('POST', 'admin/orders/bulk-action', data, true);
  }

  // User Management
  async getUsers(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/users${query}`, undefined, true);
  }

  async getUserStatistics() {
    return this.request('GET', 'admin/users/statistics', undefined, true);
  }

  async getUserById(id: string) {
    return this.request('GET', `admin/users/${id}`, undefined, true);
  }

  async getUserActivity(id: string) {
    return this.request('GET', `admin/users/${id}/activity`, undefined, true);
  }

  async updateUserStatus(id: string, data: any) {
    return this.request('PUT', `admin/users/${id}/status`, data, true);
  }

  async bulkUserAction(data: any) {
    return this.request('POST', 'admin/users/bulk-action', data, true);
  }

  // Analytics
  async getDashboardAnalytics() {
    return this.request('GET', 'analytics/dashboard', undefined, true);
  }

  async getUserAnalytics() {
    return this.request('GET', 'analytics/users', undefined, true);
  }

  async getVendorAnalytics() {
    return this.request('GET', 'analytics/vendors', undefined, true);
  }

  async getProductAnalytics() {
    return this.request('GET', 'analytics/products', undefined, true);
  }

  async getOrderAnalytics() {
    return this.request('GET', 'analytics/orders', undefined, true);
  }

  async getRevenueAnalytics() {
    return this.request('GET', 'analytics/revenue', undefined, true);
  }

  async getCategoryAnalytics() {
    return this.request('GET', 'analytics/categories', undefined, true);
  }

  async getSystemAnalytics() {
    return this.request('GET', 'analytics/system', undefined, true);
  }

  async getPerformanceAnalytics() {
    return this.request('GET', 'analytics/performance', undefined, true);
  }

  async exportAnalytics(data: any) {
    return this.request('POST', 'analytics/export', data, true);
  }

  // System Management
  async getSystemConfig() {
    return this.request('GET', 'admin/system/config', undefined, true);
  }

  async updateSystemConfig(data: any) {
    return this.request('PUT', 'admin/system/config', data, true);
  }

  async getSystemHealth() {
    return this.request('GET', 'admin/system/health', undefined, true);
  }

  async getSystemMetrics() {
    return this.request('GET', 'admin/system/metrics', undefined, true);
  }

  async getDatabaseStats() {
    return this.request('GET', 'admin/system/database-stats', undefined, true);
  }

  async getSystemLogs(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/system/logs${query}`, undefined, true);
  }

  async clearCache() {
    return this.request('POST', 'admin/system/clear-cache', undefined, true);
  }

  async createBackup() {
    return this.request('POST', 'admin/system/backup', undefined, true);
  }

  // Category Management
  async getCategoryHierarchy() {
    return this.request('GET', 'admin/categories/hierarchy', undefined, true);
  }

  async getCategoryStatistics() {
    return this.request('GET', 'admin/categories/statistics', undefined, true);
  }

  async getCategoryPerformance(id: string) {
    return this.request('GET', `admin/categories/${id}/performance`, undefined, true);
  }

  async reorderCategories(data: any) {
    return this.request('POST', 'admin/categories/reorder', data, true);
  }

  async mergeCategories(sourceId: string, targetId: string) {
    return this.request('PUT', `admin/categories/${sourceId}/merge/${targetId}`, undefined, true);
  }

  // Security
  async getSecurityEvents(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/security/events${query}`, undefined, true);
  }

  async getSecurityAlerts() {
    return this.request('GET', 'admin/security/alerts', undefined, true);
  }

  async getAuditLog(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request('GET', `admin/security/audit-log${query}`, undefined, true);
  }

  async getFraudDetection() {
    return this.request('GET', 'admin/security/fraud-detection', undefined, true);
  }

  async getThreatIntelligence() {
    return this.request('GET', 'admin/security/threat-intelligence', undefined, true);
  }

  async getLoginAnalytics() {
    return this.request('GET', 'admin/security/login-analytics', undefined, true);
  }

  async getBlockedIPs() {
    return this.request('GET', 'admin/security/blocked-ips', undefined, true);
  }

  async blockIP(data: any) {
    return this.request('POST', 'admin/security/block-ip', data, true);
  }

  async unblockIP(ipAddress: string) {
    return this.request('DELETE', `admin/security/unblock-ip/${ipAddress}`, undefined, true);
  }

  // Subscription Management
  async getSubscriptionPlans() {
    return this.request('GET', 'admin/subscription-plans', undefined, true);
  }

  async getSubscriptionPlanById(id: string) {
    return this.request('GET', `admin/subscription-plans/${id}`, undefined, true);
  }

  async createSubscriptionPlan(data: any) {
    return this.request('POST', 'admin/subscription-plans', data, true);
  }

  async updateSubscriptionPlan(id: string, data: any) {
    return this.request('PUT', `admin/subscription-plans/${id}`, data, true);
  }

  async deleteSubscriptionPlan(id: string) {
    return this.request('DELETE', `admin/subscription-plans/${id}`, undefined, true);
  }

  async syncPlanWithPaystack(id: string) {
    return this.request('POST', `admin/subscription-plans/${id}/sync-paystack`, undefined, true);
  }
}

export const apiTestClient = new ApiTestClient();
