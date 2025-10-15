'use client';

import React, { useState, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { useFinancialStats, useFinancialAnalytics } from '@/lib/hooks/useFinancial';
import { useErrorHandling, useAsyncOperation } from '@/lib/hooks/use-error-handling';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { ErrorBoundaryWrapper } from '@/components/error/error-boundary';
import { ErrorState, InlineError } from '@/components/error/error-states';
import { 
  DashboardLoading, 
  StatsCardSkeleton, 
  CardSkeleton, 
  InlineLoading,
  DataLoadingState,
  LoadingOverlay
} from '@/components/loading/loading-states';
import { FinancialTransactionsTable } from './financial-transactions-table';
import { CommissionsTable } from './commissions-table';
import { PayoutsTable } from './payouts-table';
import { FinancialChart } from './financial-chart';

export function EnhancedFinancialDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'commissions' | 'payouts'>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');

  // Enhanced error handling
  const { 
    error: statsError, 
    isLoading: statsLoading, 
    retry: retryStats,
    clearError: clearStatsError,
    handleAsync: handleStatsAsync
  } = useErrorHandling({ maxRetries: 3, showToast: true });

  const { 
    error: analyticsError, 
    isLoading: analyticsLoading, 
    retry: retryAnalytics,
    clearError: clearAnalyticsError,
    handleAsync: handleAnalyticsAsync
  } = useErrorHandling({ maxRetries: 3 });

  // Data fetching with error handling
  const { 
    data: stats, 
    isLoading: statsDataLoading, 
    error: statsDataError,
    refetch: refetchStats 
  } = useFinancialStats();

  const { 
    data: analytics, 
    isLoading: analyticsDataLoading,
    error: analyticsDataError 
  } = useFinancialAnalytics({
    period: timeRange,
    includeProjections: true
  });

  // Export operation handling
  const { 
    data: exportData, 
    isLoading: exportLoading, 
    error: exportError, 
    execute: executeExport 
  } = useAsyncOperation();

  const handleExportReport = async (type: 'revenue' | 'commissions' | 'payouts' | 'transactions') => {
    const result = await executeExport(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, use financial service
      // return await financialService.generateReport({ type, format: 'xlsx' });
      
      return { downloadUrl: `#${type}-report`, type };
    });

    if (result) {
      // Handle successful export
      console.log(`Export successful:`, result);
    }
  };

  const handleRefreshStats = async () => {
    clearStatsError();
    await handleStatsAsync(async () => {
      await refetchStats();
    });
  };

  const renderLoadingState = () => {
    if (statsLoading || analyticsLoading || statsDataLoading || analyticsDataLoading) {
      return <DashboardLoading />;
    }
    return null;
  };

  const renderErrorState = () => {
    // Critical errors that prevent the entire dashboard from functioning
    const criticalError = statsError || statsDataError;
    
    if (criticalError) {
      return (
        <ErrorState
          type={statsError?.type || 'server'}
          message={criticalError.message}
          retry={retryStats}
          goHome={() => window.location.href = '/dashboard'}
          showDetails={process.env.NODE_ENV === 'development'}
          details={criticalError.details}
        />
      );
    }
    
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards with Error Handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDataLoading ? (
          <StatsCardSkeleton />
        ) : statsDataError ? (
          <Card className="p-6 col-span-full">
            <InlineError
              message="Failed to load financial statistics"
              type="server"
              onDismiss={clearStatsError}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshStats}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </Card>
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats?.overview.totalRevenue || 0, 'NGN')}
              change={stats?.growth.revenueGrowth || 0}
              trend={stats?.growth.revenueGrowth >= 0 ? 'up' : 'down'}
              icon={DollarSign}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(stats?.overview.monthlyRevenue || 0, 'NGN')}
              change={stats?.growth.transactionGrowth || 0}
              trend={stats?.growth.transactionGrowth >= 0 ? 'up' : 'down'}
              icon={TrendingUp}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
            />
            <StatsCard
              title="Total Transactions"
              value={formatNumber(stats?.overview.totalTransactions || 0)}
              change={stats?.growth.commissionGrowth || 0}
              trend={stats?.growth.commissionGrowth >= 0 ? 'up' : 'down'}
              icon={CreditCard}
              className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200"
            />
            <StatsCard
              title="Pending Payouts"
              value={formatCurrency(stats?.overview.pendingPayouts || 0, 'NGN')}
              change={stats?.growth.payoutGrowth || 0}
              trend={stats?.growth.payoutGrowth >= 0 ? 'up' : 'down'}
              icon={RefreshCw}
              className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
            />
          </>
        )}
      </div>

      {/* Health Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
        {statsDataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : statsDataError ? (
          <DataLoadingState 
            type="error" 
            message="Failed to load health metrics"
            retry={handleRefreshStats}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatPercentage(stats?.health.paymentSuccessRate || 0)}
              </div>
              <div className="text-sm text-gray-600">Payment Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPercentage(stats?.health.refundRate || 0)}
              </div>
              <div className="text-sm text-gray-600">Refund Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats?.health.averageProcessingTime || 0}s
              </div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
            </div>
          </div>
        )}
      </Card>

      {/* Revenue Chart with Error Handling */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Revenue Trends</h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'quarter', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={timeRange === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(period)}
                className="capitalize"
                disabled={analyticsDataLoading}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {analyticsDataLoading ? (
          <DataLoadingState type="default" message="Loading chart data..." />
        ) : analyticsDataError ? (
          <DataLoadingState 
            type="error" 
            message="Failed to load analytics data"
            retry={retryAnalytics}
          />
        ) : analyticsError ? (
          <InlineError
            message={analyticsError.message}
            type={analyticsError.type}
            onDismiss={clearAnalyticsError}
          />
        ) : analytics ? (
          <ErrorBoundaryWrapper level="component">
            <FinancialChart data={analytics.trends} />
          </ErrorBoundaryWrapper>
        ) : (
          <DataLoadingState type="empty" message="No chart data available" />
        )}
      </Card>

      {/* Top Vendors with Graceful Degradation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Vendors</h3>
        {analyticsDataLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : analytics?.topVendors?.length ? (
          <div className="space-y-3">
            {analytics.topVendors.slice(0, 5).map((vendor, index) => (
              <div key={vendor.vendorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                    {vendor.rank}
                  </div>
                  <div>
                    <div className="font-medium">{vendor.vendorName}</div>
                    <div className="text-sm text-gray-600">{formatNumber(vendor.transactionCount)} transactions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(vendor.revenue, 'NGN')}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(vendor.commissions, 'NGN')} commissions</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataLoadingState type="empty" message="No vendor data available" />
        )}
      </Card>
    </div>
  );

  // Show loading state for initial load
  const loadingState = renderLoadingState();
  if (loadingState) return loadingState;

  // Show error state for critical errors
  const errorState = renderErrorState();
  if (errorState) return errorState;

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'transactions', label: 'Transactions', count: stats?.overview.totalTransactions },
    { id: 'commissions', label: 'Commissions', count: null },
    { id: 'payouts', label: 'Payouts', count: null },
  ] as const;

  return (
    <ErrorBoundaryWrapper level="page">
      <div className="space-y-6">
        {/* Export Loading Overlay */}
        <LoadingOverlay 
          visible={exportLoading} 
          message="Generating report..."
          blocking={false}
        />

        {/* Export Error */}
        {exportError && (
          <InlineError
            message={`Export failed: ${exportError.message}`}
            type="server"
            onDismiss={() => exportError && clearStatsError()}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600">Monitor transactions, commissions, and payouts</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefreshStats}
              disabled={statsLoading || statsDataLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(statsLoading || statsDataLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => handleExportReport('revenue')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              {exportLoading ? (
                <InlineLoading text="Exporting..." size="sm" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={statsDataLoading}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${statsDataLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab.label}
                {tab.count !== null && !statsDataLoading && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {formatNumber(tab.count)}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content with Error Boundaries */}
        <div className="min-h-96">
          <Suspense fallback={<CardSkeleton rows={6} />}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'transactions' && (
              <ErrorBoundaryWrapper level="component">
                <FinancialTransactionsTable />
              </ErrorBoundaryWrapper>
            )}
            {activeTab === 'commissions' && (
              <ErrorBoundaryWrapper level="component">
                <CommissionsTable />
              </ErrorBoundaryWrapper>
            )}
            {activeTab === 'payouts' && (
              <ErrorBoundaryWrapper level="component">
                <PayoutsTable />
              </ErrorBoundaryWrapper>
            )}
          </Suspense>
        </div>
      </div>
    </ErrorBoundaryWrapper>
  );
}