'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  usePlatformMetrics,
  useVendorPerformanceData,
  useTopVendors,
  useCategoryDistribution,
  useVendorStatusDistribution,
  useExportReport,
} from '@/lib/hooks/use-reports';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  // Determine period from date range
  const getPeriod = (range: string) => {
    switch (range) {
      case '7': return 'week';
      case '30': return 'month';
      case '90': return 'month'; // 3 months
      case '365': return 'year';
      default: return 'month';
    }
  };

  const period = getPeriod(dateRange);

  // API hooks
  const {
    data: platformMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = usePlatformMetrics({ period });

  const {
    data: vendorPerformanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = useVendorPerformanceData({ period });

  const {
    data: topVendorsByRevenue,
    isLoading: topVendorsLoading,
    error: topVendorsError,
  } = useTopVendors({ limit: 5, period, sortBy: 'revenue' });

  const {
    data: categoryDistribution,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoryDistribution({ period });

  const {
    data: vendorStatusDistribution,
    isLoading: statusLoading,
    error: statusError,
  } = useVendorStatusDistribution();

  const exportReportMutation = useExportReport();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-NG').format(value);
  };

  const exportReport = (type: string) => {
    const reportTypeMap: Record<string, 'revenue' | 'vendors' | 'analytics' | 'issues'> = {
      'Revenue Report': 'revenue',
      'Vendor Report': 'vendors',
      'Analytics Report': 'analytics',
      'Issues Report': 'issues',
    };

    exportReportMutation.mutate({
      reportType: reportTypeMap[type] || 'analytics',
      format: 'pdf',
      period: period as any,
    }, {
      onSuccess: (data) => {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onError: (error) => {
        console.error('Export failed:', error);
        // TODO: Show error toast/notification
      },
    });
  };

  // Loading state
  if (metricsLoading || performanceLoading || topVendorsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (metricsError || performanceError || topVendorsError) {
    const error = metricsError || performanceError || topVendorsError;
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorMessage 
          title="Failed to load reports data" 
          message={error?.message || 'Unknown error occurred'} 
        />
      </div>
    );
  }

  // Fallback to empty arrays if data is not available
  const safeVendorPerformanceData = vendorPerformanceData || [];
  const safeTopVendors = topVendorsByRevenue || [];
  const safeCategoryDistribution = categoryDistribution || [];
  const safeVendorStatusDistribution = vendorStatusDistribution || [];
  const safePlatformMetrics = platformMetrics || {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalCommission: 0,
    commissionGrowth: 0,
    totalVendors: 0,
    vendorGrowth: 0,
    totalCustomers: 0,
    customerGrowth: 0,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Platform Reports
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Comprehensive platform analytics and insights
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className='rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='7'>Last 7 days</option>
                <option value='30'>Last 30 days</option>
                <option value='90'>Last 90 days</option>
                <option value='365'>Last year</option>
              </select>
              <GlowingButton 
                size='sm' 
                variant='primary'
                onClick={() => exportReport('Analytics Report')}
                disabled={exportReportMutation.isPending}
              >
                <Download className='h-4 w-4 mr-2' />
                {exportReportMutation.isPending ? 'Exporting...' : 'Export All'}
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <AnimatedCard delay={0}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-blue-500 to-purple-600'>
                <DollarSign className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm font-semibold text-green-500'>
                  +{safePlatformMetrics.revenueGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Platform Revenue</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={safePlatformMetrics.totalRevenue} prefix='₦' />
              </p>
              <p className='text-xs text-gray-500'>vs previous period</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600'>
                <Target className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm font-semibold text-green-500'>
                  +{safePlatformMetrics.commissionGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Commission</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={safePlatformMetrics.totalCommission} prefix='₦' />
              </p>
              <p className='text-xs text-gray-500'>Platform earnings</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-orange-500 to-red-600'>
                <Store className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm font-semibold text-green-500'>
                  +{safePlatformMetrics.vendorGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Active Vendors</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={safePlatformMetrics.totalVendors} />
              </p>
              <p className='text-xs text-gray-500'>Approved & selling</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-purple-500 to-pink-600'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm font-semibold text-green-500'>
                  +{safePlatformMetrics.customerGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Customers</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={safePlatformMetrics.totalCustomers} />
              </p>
              <p className='text-xs text-gray-500'>Registered users</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Platform Performance Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <AnimatedCard delay={400} className='lg:col-span-2'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Platform Performance</h3>
                <p className='text-sm text-gray-600'>Revenue and commission trends</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                  <span className='text-sm text-gray-600'>Revenue</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-gray-600'>Commission</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={320}>
              <AreaChart data={safeVendorPerformanceData}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id='colorCommission' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10B981' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#10B981' stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='name' axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#3B82F6'
                  fill='url(#colorRevenue)'
                  strokeWidth={2}
                />
                <Area
                  type='monotone'
                  dataKey='commission'
                  stroke='#10B981'
                  fill='url(#colorCommission)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Vendor Status</h3>
                <p className='text-sm text-gray-600'>Current vendor distribution</p>
              </div>
            </div>
            <div className='space-y-4'>
              {safeVendorStatusDistribution.map((item, index) => (
                <div key={item.status} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className='text-sm font-medium text-gray-900'>{item.status}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-20 bg-gray-200 rounded-full h-2'>
                      <div
                        className='h-2 rounded-full transition-all duration-1000'
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 w-12 text-right'>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Top Vendors Performance */}
      <AnimatedCard delay={600}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Top Performing Vendors</h3>
              <p className='text-sm text-gray-600'>Highest revenue generators</p>
            </div>
            <GlowingButton size='sm' variant='secondary'>
              <FileText className='h-4 w-4 mr-2' />
              Detailed Report
            </GlowingButton>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Revenue</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Commission</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Orders</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Growth</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {safeTopVendors.map((vendor, index) => (
                  <tr key={vendor.name} className='hover:bg-gray-50'>
                    <td className='py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xs font-medium'>{index + 1}</span>
                        </div>
                        <span className='font-medium text-gray-900'>{vendor.name}</span>
                      </div>
                    </td>
                    <td className='py-4 font-medium text-gray-900'>
                      {formatCurrency(vendor.revenue)}
                    </td>
                    <td className='py-4 text-gray-600'>{formatCurrency(vendor.commission)}</td>
                    <td className='py-4 text-gray-600'>{formatNumber(vendor.orders)}</td>
                    <td className='py-4'>
                      <div className='flex items-center gap-1'>
                        <TrendingUp className='h-4 w-4 text-green-500' />
                        <span className='text-sm font-medium text-green-500'>
                          +{vendor.growth}%
                        </span>
                      </div>
                    </td>
                    <td className='py-4'>
                      <button className='text-blue-600 hover:text-blue-800 font-medium'>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <GlowingButton 
          variant='primary' 
          className='h-12 justify-center'
          onClick={() => exportReport('Revenue Report')}
          disabled={exportReportMutation.isPending}
        >
          <Download className='h-4 w-4 mr-2' />
          {exportReportMutation.isPending ? 'Exporting...' : 'Revenue Report'}
        </GlowingButton>
        <GlowingButton 
          variant='secondary' 
          className='h-12 justify-center'
          onClick={() => exportReport('Vendor Report')}
          disabled={exportReportMutation.isPending}
        >
          <FileText className='h-4 w-4 mr-2' />
          Vendor Report
        </GlowingButton>
        <GlowingButton 
          variant='success' 
          className='h-12 justify-center'
          onClick={() => exportReport('Analytics Report')}
          disabled={exportReportMutation.isPending}
        >
          <BarChart3 className='h-4 w-4 mr-2' />
          Analytics Report
        </GlowingButton>
        <GlowingButton 
          variant='danger' 
          className='h-12 justify-center'
          onClick={() => exportReport('Issues Report')}
          disabled={exportReportMutation.isPending}
        >
          <AlertTriangle className='h-4 w-4 mr-2' />
          Issues Report
        </GlowingButton>
      </div>
    </div>
  );
}
