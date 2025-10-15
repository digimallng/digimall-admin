'use client';

import { useState } from 'react';
import { apiTestClient, TestResponse } from '@/lib/api/test-client';
import { TestButton } from '@/components/api-test/TestButton';
import { TestSection } from '@/components/api-test/TestSection';
import { OutputConsole } from '@/components/api-test/OutputConsole';
import {
  Shield,
  LogIn,
  Users,
  Store,
  Package,
  ShoppingCart,
  UserCheck,
  BarChart3,
  Settings,
  FolderTree,
  Lock,
  CreditCard,
} from 'lucide-react';

export default function ApiTestPage() {
  const [outputs, setOutputs] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [testData, setTestData] = useState({
    email: 'admin@digimall.ng',
    password: 'Admin@123',
    setupToken: 'DIGIMALL_SUPER_SETUP_2024_SECURE_TOKEN_X9K2M8P5',
  });

  const addOutput = (output: TestResponse) => {
    setOutputs((prev) => [...prev, output]);
  };

  const clearOutputs = () => {
    setOutputs([]);
  };

  const handleTest = async (
    testFn: () => Promise<TestResponse>,
    testName: string
  ) => {
    setLoading(testName);
    try {
      const result = await testFn();
      addOutput(result);

      // Auto-set token on successful login
      if (testName === 'login' && result.success && result.data.accessToken) {
        const accessToken = result.data.accessToken;
        setToken(accessToken);
        apiTestClient.setToken(accessToken);
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin API Test Suite</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive testing interface for all admin endpoints
        </p>

        {/* Auth Status */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              token
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {token ? 'Authenticated' : 'Not Authenticated'}
          </div>
          {token && (
            <button
              onClick={() => {
                setToken(null);
                apiTestClient.clearToken();
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear Token
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6 p-6" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - Test Controls */}
        <div className="col-span-5 overflow-y-auto pr-2 space-y-4">
          {/* 1. Setup & Authentication */}
          <TestSection
            title="1. Setup & Authentication"
            description="Public endpoints for initial setup and login"
            defaultOpen={true}
          >
            <TestButton
              variant="public"
              icon={<Shield className="w-4 h-4" />}
              loading={loading === 'verify-setup'}
              onClick={() =>
                handleTest(() => apiTestClient.verifySetup(), 'verify-setup')
              }
            >
              Verify Setup Status
            </TestButton>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Test Credentials</div>
              <input
                type="email"
                placeholder="Email"
                value={testData.email}
                onChange={(e) => setTestData({ ...testData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={testData.password}
                onChange={(e) => setTestData({ ...testData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <TestButton
              variant="public"
              icon={<LogIn className="w-4 h-4" />}
              loading={loading === 'login'}
              onClick={() =>
                handleTest(
                  () => apiTestClient.login(testData.email, testData.password),
                  'login'
                )
              }
            >
              Staff Login
            </TestButton>

            <TestButton
              variant="admin"
              icon={<LogIn className="w-4 h-4" />}
              loading={loading === 'logout'}
              onClick={() => handleTest(() => apiTestClient.logout(), 'logout')}
            >
              Logout
            </TestButton>
          </TestSection>

          {/* 2. Staff Management */}
          <TestSection title="2. Staff Management" description="Staff CRUD and analytics">
            <TestButton
              variant="admin"
              icon={<Users className="w-4 h-4" />}
              loading={loading === 'get-staff'}
              onClick={() => handleTest(() => apiTestClient.getStaff(), 'get-staff')}
            >
              Get All Staff
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'staff-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getStaffAnalytics(), 'staff-analytics')
              }
            >
              Get Staff Analytics
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'security-audit'}
              onClick={() =>
                handleTest(() => apiTestClient.getSecurityAudit(), 'security-audit')
              }
            >
              Get Security Audit
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'role-permissions'}
              onClick={() =>
                handleTest(() => apiTestClient.getRolePermissions(), 'role-permissions')
              }
            >
              Get Role Permissions
            </TestButton>
          </TestSection>

          {/* 3. Vendor Management */}
          <TestSection title="3. Vendor Management">
            <TestButton
              variant="admin"
              icon={<Store className="w-4 h-4" />}
              loading={loading === 'get-vendors'}
              onClick={() => handleTest(() => apiTestClient.getVendors(), 'get-vendors')}
            >
              Get All Vendors
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'vendor-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getVendorStatistics(), 'vendor-stats')
              }
            >
              Get Vendor Statistics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'pending-vendors'}
              onClick={() =>
                handleTest(() => apiTestClient.getPendingVendors(), 'pending-vendors')
              }
            >
              Get Pending Vendors
            </TestButton>
          </TestSection>

          {/* 4. Product Management */}
          <TestSection title="4. Product Management">
            <TestButton
              variant="admin"
              icon={<Package className="w-4 h-4" />}
              loading={loading === 'get-products'}
              onClick={() =>
                handleTest(() => apiTestClient.getProducts(), 'get-products')
              }
            >
              Get All Products
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'pending-products'}
              onClick={() =>
                handleTest(() => apiTestClient.getPendingProducts(), 'pending-products')
              }
            >
              Get Pending Products
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'product-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getProductStatistics(), 'product-stats')
              }
            >
              Get Product Statistics
            </TestButton>
          </TestSection>

          {/* 5. Order Management */}
          <TestSection title="5. Order Management">
            <TestButton
              variant="admin"
              icon={<ShoppingCart className="w-4 h-4" />}
              loading={loading === 'get-orders'}
              onClick={() => handleTest(() => apiTestClient.getOrders(), 'get-orders')}
            >
              Get All Orders
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'order-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getOrderStatistics(), 'order-stats')
              }
            >
              Get Order Statistics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'order-count'}
              onClick={() =>
                handleTest(() => apiTestClient.getOrderCount(), 'order-count')
              }
            >
              Get Order Count
            </TestButton>
          </TestSection>

          {/* 6. User Management */}
          <TestSection title="6. User Management">
            <TestButton
              variant="admin"
              icon={<UserCheck className="w-4 h-4" />}
              loading={loading === 'get-users'}
              onClick={() => handleTest(() => apiTestClient.getUsers(), 'get-users')}
            >
              Get All Users
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'user-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getUserStatistics(), 'user-stats')
              }
            >
              Get User Statistics
            </TestButton>
          </TestSection>

          {/* 7. Analytics */}
          <TestSection title="7. Analytics">
            <TestButton
              variant="admin"
              icon={<BarChart3 className="w-4 h-4" />}
              loading={loading === 'dashboard-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getDashboardAnalytics(), 'dashboard-analytics')
              }
            >
              Dashboard Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'user-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getUserAnalytics(), 'user-analytics')
              }
            >
              User Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'vendor-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getVendorAnalytics(), 'vendor-analytics')
              }
            >
              Vendor Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'product-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getProductAnalytics(), 'product-analytics')
              }
            >
              Product Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'order-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getOrderAnalytics(), 'order-analytics')
              }
            >
              Order Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'revenue-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getRevenueAnalytics(), 'revenue-analytics')
              }
            >
              Revenue Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'category-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getCategoryAnalytics(), 'category-analytics')
              }
            >
              Category Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'system-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getSystemAnalytics(), 'system-analytics')
              }
            >
              System Analytics
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'performance-analytics'}
              onClick={() =>
                handleTest(
                  () => apiTestClient.getPerformanceAnalytics(),
                  'performance-analytics'
                )
              }
            >
              Performance Analytics
            </TestButton>
          </TestSection>

          {/* 8. System Management */}
          <TestSection title="8. System Management">
            <TestButton
              variant="super_admin"
              icon={<Settings className="w-4 h-4" />}
              loading={loading === 'system-config'}
              onClick={() =>
                handleTest(() => apiTestClient.getSystemConfig(), 'system-config')
              }
            >
              Get System Config
            </TestButton>

            <TestButton
              variant="public"
              loading={loading === 'system-health'}
              onClick={() =>
                handleTest(() => apiTestClient.getSystemHealth(), 'system-health')
              }
            >
              System Health Check
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'system-metrics'}
              onClick={() =>
                handleTest(() => apiTestClient.getSystemMetrics(), 'system-metrics')
              }
            >
              Get System Metrics
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'database-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getDatabaseStats(), 'database-stats')
              }
            >
              Get Database Stats
            </TestButton>

            <TestButton
              variant="utility"
              loading={loading === 'clear-cache'}
              onClick={() =>
                handleTest(() => apiTestClient.clearCache(), 'clear-cache')
              }
            >
              Clear Cache
            </TestButton>
          </TestSection>

          {/* 9. Category Management */}
          <TestSection title="9. Category Management">
            <TestButton
              variant="admin"
              icon={<FolderTree className="w-4 h-4" />}
              loading={loading === 'category-hierarchy'}
              onClick={() =>
                handleTest(() => apiTestClient.getCategoryHierarchy(), 'category-hierarchy')
              }
            >
              Get Category Hierarchy
            </TestButton>

            <TestButton
              variant="admin"
              loading={loading === 'category-stats'}
              onClick={() =>
                handleTest(() => apiTestClient.getCategoryStatistics(), 'category-stats')
              }
            >
              Get Category Statistics
            </TestButton>
          </TestSection>

          {/* 10. Security */}
          <TestSection title="10. Security">
            <TestButton
              variant="super_admin"
              icon={<Lock className="w-4 h-4" />}
              loading={loading === 'security-events'}
              onClick={() =>
                handleTest(() => apiTestClient.getSecurityEvents(), 'security-events')
              }
            >
              Get Security Events
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'security-alerts'}
              onClick={() =>
                handleTest(() => apiTestClient.getSecurityAlerts(), 'security-alerts')
              }
            >
              Get Security Alerts
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'audit-log'}
              onClick={() =>
                handleTest(() => apiTestClient.getAuditLog(), 'audit-log')
              }
            >
              Get Audit Log
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'fraud-detection'}
              onClick={() =>
                handleTest(() => apiTestClient.getFraudDetection(), 'fraud-detection')
              }
            >
              Get Fraud Detection
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'login-analytics'}
              onClick={() =>
                handleTest(() => apiTestClient.getLoginAnalytics(), 'login-analytics')
              }
            >
              Get Login Analytics
            </TestButton>

            <TestButton
              variant="super_admin"
              loading={loading === 'blocked-ips'}
              onClick={() =>
                handleTest(() => apiTestClient.getBlockedIPs(), 'blocked-ips')
              }
            >
              Get Blocked IPs
            </TestButton>
          </TestSection>

          {/* 11. Subscription Management */}
          <TestSection title="11. Subscription Management">
            <TestButton
              variant="super_admin"
              icon={<CreditCard className="w-4 h-4" />}
              loading={loading === 'subscription-plans'}
              onClick={() =>
                handleTest(() => apiTestClient.getSubscriptionPlans(), 'subscription-plans')
              }
            >
              Get Subscription Plans
            </TestButton>
          </TestSection>
        </div>

        {/* Right Panel - Output Console */}
        <div className="col-span-7">
          <OutputConsole outputs={outputs} onClear={clearOutputs} />
        </div>
      </div>
    </div>
  );
}
