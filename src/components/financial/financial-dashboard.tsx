'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { useFinancialStats, useFinancialAnalytics } from '@/lib/hooks/useFinancial';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { Download, TrendingUp, TrendingDown, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import { FinancialTransactionsTable } from './financial-transactions-table';
import { CommissionsTable } from './commissions-table';
import { PayoutsTable } from './payouts-table';
import { FinancialChart } from './financial-chart';

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'commissions' | 'payouts'>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useFinancialStats();
  const { data: analytics, isLoading: analyticsLoading } = useFinancialAnalytics({
    period: timeRange,
    includeProjections: true
  });

  const handleExportReport = async (type: 'revenue' | 'commissions' | 'payouts' | 'transactions') => {
    try {
      // This would use the financial service to generate and download reports
      console.log(`Exporting ${type} report...`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Health Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
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
      </Card>

      {/* Revenue Chart */}
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
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        {analytics && <FinancialChart data={analytics.trends} />}
      </Card>

      {/* Top Vendors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Vendors</h3>
        <div className="space-y-3">
          {analytics?.topVendors.slice(0, 5).map((vendor, index) => (
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
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'transactions', label: 'Transactions', count: stats?.overview.totalTransactions },
    { id: 'commissions', label: 'Commissions', count: null },
    { id: 'payouts', label: 'Payouts', count: null },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Monitor transactions, commissions, and payouts</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetchStats()}
            disabled={statsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleExportReport('revenue')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {formatNumber(tab.count)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && <FinancialTransactionsTable />}
        {activeTab === 'commissions' && <CommissionsTable />}
        {activeTab === 'payouts' && <PayoutsTable />}
      </div>
    </div>
  );
}