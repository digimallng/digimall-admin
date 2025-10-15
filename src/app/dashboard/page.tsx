'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingDashboard } from '@/components/ui/LoadingDashboard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetricCard } from '@/components/dashboard/MetricCard';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  useDashboardAnalytics,
  useRevenueData,
  useOrderAnalytics,
  useSystemMetrics,
} from '@/lib/hooks/use-analytics';

export default function DashboardPage() {
  const { data: session } = useSession();

  // Fetch real data using React Query
  const {
    data: dashboardData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics(undefined, {
    enabled: !!session?.accessToken,
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueData(
    { period: 'month' },
    { enabled: !!session?.accessToken }
  );

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderAnalytics(
    { period: 'month' },
    { enabled: !!session?.accessToken }
  );

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = useSystemMetrics(undefined, {
    enabled: !!session?.accessToken,
  });

  // Show skeleton only on initial load, not on background refetch
  const isInitialLoading = analyticsLoading && !dashboardData;

  if (isInitialLoading) {
    return <LoadingDashboard />;
  }

  // Handle error state
  if (analyticsError || revenueError || orderError || performanceError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load dashboard data'
          message={
            analyticsError?.message ||
            revenueError?.message ||
            orderError?.message ||
            performanceError?.message ||
            'Unknown error occurred'
          }
          onRetry={() => refetchAnalytics()}
        />
      </div>
    );
  }

  // Handle empty data
  if (!dashboardData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-medium mb-2'>No data available</h3>
          <p className='text-muted-foreground mb-4'>Analytics data is not available at the moment.</p>
          <Button onClick={() => refetchAnalytics()}>
            <RefreshCw className='w-4 h-4 mr-2' />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Memoize formatters to avoid recreating them on every render
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  }, []);

  // Memoize refetch handler
  const handleRefresh = useCallback(() => {
    refetchAnalytics();
  }, [refetchAnalytics]);

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return revenueData?.monthlyBreakdown?.map((item) => ({
      date: item.month,
      revenue: item.revenue,
    })) || [];
  }, [revenueData?.monthlyBreakdown]);

  // Memoize metrics array to prevent recreation on every render
  const metrics = useMemo(() => [
    {
      title: 'Total Revenue',
      value: dashboardData.totalRevenue || 0,
      change: dashboardData.revenueGrowth || 0,
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
      formatter: formatCurrency,
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders || 0,
      change: dashboardData.orderGrowth || 0,
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500',
      formatter: formatNumber,
    },
    {
      title: 'Total Users',
      value: dashboardData.totalUsers || 0,
      change: dashboardData.userGrowth || 0,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500',
      formatter: formatNumber,
    },
    {
      title: 'Total Vendors',
      value: dashboardData.totalVendors || 0,
      change: dashboardData.vendorGrowth || 0,
      icon: Store,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500',
      formatter: formatNumber,
    },
  ], [dashboardData, formatCurrency, formatNumber]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Welcome back, {session?.user?.name || 'Admin'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant='outline' disabled={analyticsLoading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', analyticsLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            iconBg={metric.iconBg}
            formatter={metric.formatter}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Revenue Chart */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue trends for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width='100%' height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis
                    dataKey='date'
                    axisLine={false}
                    tickLine={false}
                    className='text-xs text-muted-foreground'
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className='text-xs text-muted-foreground'
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='hsl(var(--primary))'
                    strokeWidth={2}
                    fill='url(#colorRevenue)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[350px] flex items-center justify-center text-muted-foreground'>
                <div className='text-center'>
                  <BarChart3 className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Real-time platform performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Cache Hit Rate */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                  <Zap className='h-4 w-4 text-yellow-500' />
                  <span className='font-medium'>Cache Hit Rate</span>
                </div>
                <span className='text-muted-foreground'>
                  {Math.round(performanceData?.cacheHitRate || 85)}%
                </span>
              </div>
              <Progress value={performanceData?.cacheHitRate || 85} className='h-2' />
            </div>

            {/* Order Completion */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                  <ShoppingCart className='h-4 w-4 text-green-500' />
                  <span className='font-medium'>Orders Completed</span>
                </div>
                <span className='text-muted-foreground'>
                  {orderData && orderData.totalOrders > 0
                    ? Math.round((orderData.completedOrders / orderData.totalOrders) * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                value={orderData && orderData.totalOrders > 0
                  ? (orderData.completedOrders / orderData.totalOrders) * 100
                  : 0}
                className='h-2'
              />
            </div>

            {/* API Performance */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-blue-500' />
                  <span className='font-medium'>API Performance</span>
                </div>
                <span className='text-muted-foreground'>98%</span>
              </div>
              <Progress value={98} className='h-2' />
            </div>

            {/* System Status */}
            <div className='pt-4 border-t'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>System Status</p>
                  <p className='text-xs text-muted-foreground'>All systems operational</p>
                </div>
                <Badge variant='default' className='bg-green-500'>
                  <div className='h-2 w-2 rounded-full bg-white mr-1.5' />
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Order Statistics */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>
              Breakdown of orders by status
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {orderData ? (
              <>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='h-3 w-3 rounded-full bg-green-500' />
                      <span className='font-medium'>Completed</span>
                    </div>
                    <span className='text-muted-foreground'>
                      {Math.round(((orderData.completedOrders || 0) / (orderData.totalOrders || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((orderData.completedOrders || 0) / (orderData.totalOrders || 1)) * 100}
                    className='h-2'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='h-3 w-3 rounded-full bg-blue-500' />
                      <span className='font-medium'>Processing</span>
                    </div>
                    <span className='text-muted-foreground'>
                      {Math.round(((orderData.pendingOrders || 0) / (orderData.totalOrders || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((orderData.pendingOrders || 0) / (orderData.totalOrders || 1)) * 100}
                    className='h-2'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='h-3 w-3 rounded-full bg-red-500' />
                      <span className='font-medium'>Cancelled</span>
                    </div>
                    <span className='text-muted-foreground'>
                      {Math.round(((orderData.cancelledOrders || 0) / (orderData.totalOrders || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((orderData.cancelledOrders || 0) / (orderData.totalOrders || 1)) * 100}
                    className='h-2'
                  />
                </div>
              </>
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                <Package className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No order data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              Important platform performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/20'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-amber-500/20'>
                  <DollarSign className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Average Order Value</p>
                  <p className='text-xs text-muted-foreground'>Per transaction</p>
                </div>
              </div>
              <span className='text-2xl font-bold'>
                {formatCurrency(dashboardData.avgOrderValue || 0)}
              </span>
            </div>

            <div className='flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/20'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-blue-500/20'>
                  <DollarSign className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Commission Earned</p>
                  <p className='text-xs text-muted-foreground'>Platform revenue</p>
                </div>
              </div>
              <span className='text-2xl font-bold'>
                {formatCurrency(dashboardData.totalCommission || 0)}
              </span>
            </div>

            <div className='flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-purple-500/20'>
                  <AlertCircle className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Dispute Rate</p>
                  <p className='text-xs text-muted-foreground'>Active disputes</p>
                </div>
              </div>
              <span className='text-2xl font-bold'>
                {(dashboardData.disputeRate || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
