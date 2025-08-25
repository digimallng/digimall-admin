'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDashboardAnalytics,
  useRevenueData,
  useCategoryStats,
  useUserAnalytics,
  useVendorAnalytics,
  useProductAnalytics,
  useOrderAnalytics,
  useSystemMetrics,
} from '@/lib/hooks/use-analytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
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
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Store,
  Package,
  Clock,
  Target,
  Award,
  Activity,
  Download,
  RefreshCw,
  MessageSquare,
  Star,
  Percent,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Fetch real data using React Query hooks
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useDashboardAnalytics();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData({ period });
  const { data: categoryData, isLoading: categoryLoading } = useCategoryStats({ limit: 6, period });
  const { data: userAnalytics } = useUserAnalytics({ period });
  const { data: vendorAnalytics } = useVendorAnalytics({ period });
  const { data: productAnalytics } = useProductAnalytics({ period });
  const { data: orderAnalytics } = useOrderAnalytics({ period });
  const { data: systemMetrics } = useSystemMetrics();

  useEffect(() => {
    // Update period based on date range
    const days = parseInt(dateRange);
    if (days <= 7) setPeriod('day');
    else if (days <= 30) setPeriod('week');
    else if (days <= 90) setPeriod('month');
    else setPeriod('year');
  }, [dateRange]);

  // Handle loading states
  if (analyticsLoading || revenueLoading || categoryLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error states
  if (analyticsError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ErrorMessage title="Failed to load analytics" message={analyticsError.message} />
      </div>
    );
  }

  // Use real data from API
  const monthlyGrowthData = revenueData || [];

  // Use real system metrics if available, fallback to basic performance data
  const performanceData = systemMetrics ? [
    { subject: 'System Health', current: systemMetrics.cpuUsage || 75, previous: 70, fullMark: 100 },
    { subject: 'Database', current: systemMetrics.dbConnections || 45, previous: 40, fullMark: 100 },
    { subject: 'API Performance', current: systemMetrics.responseTime || 85, previous: 90, fullMark: 100 },
    { subject: 'Active Sessions', current: systemMetrics.activeSessions || 92, previous: 88, fullMark: 100 },
  ] : [
    { subject: 'Sales', current: analytics?.totalOrders || 0, previous: (analytics?.totalOrders || 0) * 0.9, fullMark: (analytics?.totalOrders || 100) * 1.2 },
    { subject: 'Users', current: analytics?.totalUsers || 0, previous: (analytics?.totalUsers || 0) * 0.95, fullMark: (analytics?.totalUsers || 100) * 1.1 },
  ];

  // Use real vendor analytics data
  const topVendorsData = vendorAnalytics?.topVendors || [];

  // Use real user analytics data
  const userAnalyticsData = userAnalytics?.registrationData || [];

  // Use real analytics data where available, fallback to computed values
  const deviceUsageData = userAnalytics?.deviceBreakdown || [
    { device: 'Mobile', users: Math.floor((analytics?.activeUsers || 0) * 0.65), sessions: Math.floor((analytics?.activeUsers || 0) * 2.1) },
    { device: 'Desktop', users: Math.floor((analytics?.activeUsers || 0) * 0.28), sessions: Math.floor((analytics?.activeUsers || 0) * 1.4) },
    { device: 'Tablet', users: Math.floor((analytics?.activeUsers || 0) * 0.07), sessions: Math.floor((analytics?.activeUsers || 0) * 0.5) },
  ];

  const trafficSourcesData = userAnalytics?.trafficSources || [
    { source: 'Organic Search', percentage: 45, users: Math.floor((analytics?.activeUsers || 0) * 0.45) },
    { source: 'Direct', percentage: 25, users: Math.floor((analytics?.activeUsers || 0) * 0.25) },
    { source: 'Social Media', percentage: 15, users: Math.floor((analytics?.activeUsers || 0) * 0.15) },
    { source: 'Email Marketing', percentage: 10, users: Math.floor((analytics?.activeUsers || 0) * 0.10) },
    { source: 'Referrals', percentage: 5, users: Math.floor((analytics?.activeUsers || 0) * 0.05) },
  ];

  // Use real product analytics data
  const bargainAnalyticsData = orderAnalytics?.bargainData || [];
  const topProductsData = productAnalytics?.topProducts || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Key metrics calculations - using real data with fallbacks
  const overviewMetrics = [
    {
      title: 'Total Revenue',
      value: analytics?.totalRevenue || 0,
      change: revenueData?.[0]?.growth || 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      prefix: '₦',
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      change: orderAnalytics?.growthRate || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Users',
      value: analytics?.totalUsers || 0,
      change: userAnalytics?.growthRate || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Vendors',
      value: analytics?.totalVendors || 0,
      change: vendorAnalytics?.growthRate || 0,
      icon: Store,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive platform insights and performance metrics"
        icon={BarChart3}
        actions={[
          {
            label: 'Export Report',
            icon: Download,
            variant: 'secondary',
          },
          {
            label: 'Refresh Data',
            icon: RefreshCw,
            variant: 'secondary',
          },
        ]}
      />

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bargaining">Bargaining</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {overviewMetrics.map((metric, index) => (
              <Card key={metric.title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={cn('rounded-full p-3', metric.bgColor)}>
                      <metric.icon className={cn('h-6 w-6', metric.color)} />
                    </div>
                    <div className="flex items-center gap-1">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          metric.change > 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.prefix}
                      {formatNumber(metric.value)}
                    </p>
                    <p className="text-xs text-gray-500">vs last period</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData?.chartData || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="sales"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Sales']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Current Period"
                    dataKey="current"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Previous Period"
                    dataKey="previous"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatsCard
              title="Total Revenue"
              value={analytics?.totalRevenue || 0}
              change={analytics?.revenueGrowth || 0}
              icon={DollarSign}
              prefix="₦"
            />
            <StatsCard
              title="Monthly Revenue"
              value={
                revenueData && Array.isArray(revenueData) 
                  ? revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0)
                  : 0
              }
              change={
                revenueData && Array.isArray(revenueData) && revenueData.length >= 2
                  ? Math.round(((revenueData[revenueData.length - 1]?.revenue || 0) - (revenueData[revenueData.length - 2]?.revenue || 0)) / (revenueData[revenueData.length - 2]?.revenue || 1) * 100)
                  : 0
              }
              icon={TrendingUp}
              prefix="₦"
            />
            <StatsCard
              title="Avg Order Value"
              value={
                orderAnalytics?.averageOrderValue || 
                (analytics?.totalRevenue && analytics?.totalOrders 
                  ? Math.round(analytics.totalRevenue / analytics.totalOrders)
                  : 0
                )
              }
              change={orderAnalytics?.avgOrderValueGrowth || 0}
              icon={Award}
              prefix="₦"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <StatsCard 
              title="Total Users" 
              value={analytics?.totalUsers || 0} 
              change={userAnalytics?.growthRate || 0} 
              icon={Users} 
            />
            <StatsCard 
              title="New Users" 
              value={analytics?.newUsersToday || 0} 
              change={userAnalytics?.newUserGrowth || 0} 
              icon={Users} 
            />
            <StatsCard 
              title="Active Users" 
              value={analytics?.activeUsers || 0} 
              change={userAnalytics?.activeUserGrowth || 0} 
              icon={Activity} 
            />
            <StatsCard 
              title="Retention Rate" 
              value={userAnalytics?.retentionRate || 0} 
              change={userAnalytics?.retentionGrowth || 0} 
              icon={Target} 
              suffix="%" 
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" name="New Users" />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#10B981"
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceUsageData.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.device === 'Mobile' ? (
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      ) : device.device === 'Desktop' ? (
                        <Monitor className="h-5 w-5 text-green-600" />
                      ) : (
                        <Monitor className="h-5 w-5 text-purple-600" />
                      )}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            device.device === 'Mobile'
                              ? 'bg-blue-600'
                              : device.device === 'Desktop'
                                ? 'bg-green-600'
                                : 'bg-purple-600'
                          )}
                          style={{ width: `${device.users}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{device.users}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatsCard 
              title="Total Vendors" 
              value={analytics?.totalVendors || 0} 
              change={vendorAnalytics?.growthRate || 0} 
              icon={Store} 
            />
            <StatsCard 
              title="Active Vendors" 
              value={vendorAnalytics?.activeVendors || 0} 
              change={vendorAnalytics?.activeVendorGrowth || 0} 
              icon={Activity} 
            />
            <StatsCard 
              title="Avg Rating" 
              value={vendorAnalytics?.averageRating || 0} 
              change={vendorAnalytics?.ratingGrowth || 0} 
              icon={Star} 
              suffix="/5" 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendorsData.map((vendor, index) => (
                  <div
                    key={vendor.name}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded">
                        <span className="text-primary text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-gray-600">
                          {vendor.orders} orders • {vendor.rating}★
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(vendor.sales)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatsCard 
              title="Total Products" 
              value={analytics?.totalProducts || 0} 
              change={productAnalytics?.growthRate || 0} 
              icon={Package} 
            />
            <StatsCard 
              title="Best Sellers" 
              value={productAnalytics?.bestSellers?.length || 0} 
              change={productAnalytics?.bestSellerGrowth || 0} 
              icon={TrendingUp} 
            />
            <StatsCard 
              title="Out of Stock" 
              value={productAnalytics?.outOfStock || 0} 
              change={productAnalytics?.outOfStockChange || 0} 
              icon={Package} 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded">
                        <span className="text-primary text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.sales} sales • {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bargaining" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <StatsCard 
              title="Total Sessions" 
              value={orderAnalytics?.bargainSessions || 0} 
              change={orderAnalytics?.bargainSessionGrowth || 0} 
              icon={MessageSquare} 
            />
            <StatsCard 
              title="Success Rate" 
              value={orderAnalytics?.bargainSuccessRate || 0} 
              change={orderAnalytics?.successRateChange || 0} 
              icon={Target} 
              suffix="%" 
            />
            <StatsCard 
              title="Avg Discount" 
              value={orderAnalytics?.averageDiscount || 0} 
              change={orderAnalytics?.discountChange || 0} 
              icon={Percent} 
              suffix="%" 
            />
            <StatsCard
              title="Savings Generated"
              value={orderAnalytics?.totalSavings || 0}
              change={orderAnalytics?.savingsGrowth || 0}
              icon={DollarSign}
              prefix="₦"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bargaining Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={bargainAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="#3B82F6" name="Total Sessions" />
                  <Line type="monotone" dataKey="successful" stroke="#10B981" name="Successful" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
