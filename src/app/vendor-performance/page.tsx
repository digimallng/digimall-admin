'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Award,
  RefreshCw,
  Package,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import { useVendors, useVendorStatistics } from '@/lib/api/hooks/use-vendors';

export default function VendorPerformancePage() {
  // Fetch vendors and statistics from real API
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useVendors({
    status: 'active',
    limit: 100,
    sortBy: 'totalRevenue', // Backend expects: 'createdAt', 'businessName', or 'totalRevenue'
    sortOrder: 'desc',
  });

  const {
    data: statistics,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useVendorStatistics();

  const vendors = vendorsData?.data || [];
  const isLoading = vendorsLoading || statsLoading;
  const hasError = vendorsError || statsError;

  const handleRefresh = () => {
    refetchVendors();
    refetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor Performance</h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze vendor performance metrics</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {hasError && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Failed to load vendor data
              </h3>
              <p className="text-muted-foreground mb-4">
                {(vendorsError as any)?.message || (statsError as any)?.message || 'An error occurred'}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !statistics && !hasError && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Statistics Overview Cards */}
      {statistics && !hasError && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Vendors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Vendors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalVendors}</div>
                <p className="text-xs text-green-600 mt-1">
                  {statistics.activeVendors} active
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{(statistics?.totalRevenue ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: ₦{statistics?.totalVendors ? ((statistics?.totalRevenue ?? 0) / statistics.totalVendors).toFixed(0) : '0'}
                </p>
              </CardContent>
            </Card>

            {/* Average Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Revenue/Vendor
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{(statistics?.averageRevenuePerVendor ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per active vendor
                </p>
              </CardContent>
            </Card>

            {/* Pending Approval */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Approval
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics?.pendingApproval ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {statistics?.suspendedVendors ?? 0} suspended
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tier Distribution Chart */}
          {statistics?.byTier && (
            <Card>
              <CardHeader>
                <CardTitle>Vendors by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(statistics.byTier).map(([tierName, count]) => (
                    <div
                      key={tierName}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground capitalize mb-1">
                          {tierName}
                        </p>
                        <p className="text-2xl font-bold mb-1">{count}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {statistics?.totalVendors ? ((count / statistics.totalVendors) * 100).toFixed(1) : '0'}% of total
                        </p>
                      </div>
                      <Award
                        className={`h-10 w-10 ${
                          tierName === 'platinum'
                            ? 'text-purple-500'
                            : tierName === 'gold'
                            ? 'text-yellow-500'
                            : tierName === 'silver'
                            ? 'text-gray-400'
                            : 'text-blue-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performing Vendors */}
          {statistics?.topPerformers && statistics.topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performing Vendors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics.topPerformers.slice(0, 10).map((vendor, index) => (
                    <div
                      key={vendor.vendorId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : index === 1
                              ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              : index === 2
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {vendor.businessName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">
                                {vendor.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">
                          ₦{vendor.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Active Vendors Summary */}
          {vendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Vendors Summary ({vendors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendors.slice(0, 20).map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {vendor.businessInfo.businessName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                vendor.tier === 'platinum'
                                  ? 'bg-purple-100 text-purple-700'
                                  : vendor.tier === 'gold'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : vendor.tier === 'silver'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              <Award className="h-2.5 w-2.5" />
                              {vendor.tier}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">
                                {vendor.metrics.averageRating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 lg:gap-6 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Products</p>
                          <p className="font-medium">
                            {vendor.metrics.totalProducts}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Orders</p>
                          <p className="font-medium">
                            {vendor.metrics.totalOrders}
                          </p>
                        </div>
                        <div className="text-right min-w-[100px] lg:min-w-[120px]">
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-bold">
                            ₦{vendor.metrics.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {vendors.length > 20 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Showing top 20 of {vendors.length} active vendors
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !statistics && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vendor data available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
