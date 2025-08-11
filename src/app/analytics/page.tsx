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

  // Enhanced mock data
  const monthlyGrowthData = [
    { month: 'Jan', revenue: 4500000, orders: 450, users: 120, vendors: 45 },
    { month: 'Feb', revenue: 5200000, orders: 520, users: 150, vendors: 52 },
    { month: 'Mar', revenue: 4800000, orders: 480, users: 180, vendors: 58 },
    { month: 'Apr', revenue: 6100000, orders: 610, users: 220, vendors: 64 },
    { month: 'May', revenue: 7300000, orders: 730, users: 280, vendors: 71 },
    { month: 'Jun', revenue: 8900000, orders: 890, users: 350, vendors: 78 },
  ];

  const performanceData = [
    { subject: 'Sales', current: 120, previous: 110, fullMark: 150 },
    { subject: 'Marketing', current: 98, previous: 130, fullMark: 150 },
    { subject: 'Customer Service', current: 99, previous: 100, fullMark: 150 },
    { subject: 'Operations', current: 85, previous: 90, fullMark: 150 },
    { subject: 'Tech Support', current: 105, previous: 95, fullMark: 150 },
    { subject: 'Logistics', current: 92, previous: 88, fullMark: 150 },
  ];

  const topVendorsData = [
    { name: 'TechStore Nigeria', sales: 12500000, orders: 1245, rating: 4.8 },
    { name: 'Fashion Hub Lagos', sales: 9800000, orders: 890, rating: 4.6 },
    { name: 'Home Essentials', sales: 8700000, orders: 756, rating: 4.7 },
    { name: 'Sports Arena', sales: 7600000, orders: 634, rating: 4.5 },
    { name: 'Book Paradise', sales: 6500000, orders: 523, rating: 4.9 },
  ];

  const userAnalyticsData = [
    { date: '1 week ago', newUsers: 145, activeUsers: 2340, retention: 68 },
    { date: '6 days ago', newUsers: 167, activeUsers: 2456, retention: 71 },
    { date: '5 days ago', newUsers: 134, activeUsers: 2389, retention: 69 },
    { date: '4 days ago', newUsers: 189, activeUsers: 2567, retention: 73 },
    { date: '3 days ago', newUsers: 156, activeUsers: 2445, retention: 70 },
    { date: '2 days ago', newUsers: 178, activeUsers: 2678, retention: 74 },
    { date: 'Yesterday', newUsers: 203, activeUsers: 2789, retention: 76 },
  ];

  const deviceUsageData = [
    { device: 'Mobile', users: 65, sessions: 8945 },
    { device: 'Desktop', users: 28, sessions: 3456 },
    { device: 'Tablet', users: 7, sessions: 892 },
  ];

  const trafficSourcesData = [
    { source: 'Organic Search', percentage: 45, users: 5678 },
    { source: 'Direct', percentage: 25, users: 3145 },
    { source: 'Social Media', percentage: 15, users: 1887 },
    { source: 'Email Marketing', percentage: 10, users: 1258 },
    { source: 'Referrals', percentage: 5, users: 629 },
  ];

  const bargainAnalyticsData = [
    { date: 'Mon', sessions: 45, successful: 32, avgDiscount: 12.5 },
    { date: 'Tue', sessions: 52, successful: 38, avgDiscount: 14.2 },
    { date: 'Wed', sessions: 48, successful: 35, avgDiscount: 11.8 },
    { date: 'Thu', sessions: 61, successful: 44, avgDiscount: 13.6 },
    { date: 'Fri', sessions: 55, successful: 41, avgDiscount: 15.1 },
    { date: 'Sat', sessions: 67, successful: 49, avgDiscount: 12.9 },
    { date: 'Sun', sessions: 58, successful: 43, avgDiscount: 13.7 },
  ];

  const topProductsData = [
    { name: 'iPhone 15 Pro', sales: 156, revenue: 234000000, category: 'Electronics' },
    { name: 'MacBook Air M2', sales: 89, revenue: 890000000, category: 'Electronics' },
    { name: 'Samsung Galaxy S24', sales: 134, revenue: 1206000000, category: 'Electronics' },
    { name: 'Nike Air Max', sales: 278, revenue: 55600000, category: 'Fashion' },
    { name: 'Wireless Headphones', sales: 345, revenue: 69000000, category: 'Electronics' },
  ];

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
              value={analytics.totalRevenue || 15420000}
              change={analytics.revenueGrowth || 12.5}
              icon={DollarSign}
              prefix="₦"
            />
            <StatsCard
              title="Monthly Revenue"
              value={7300000}
              change={18.3}
              icon={TrendingUp}
              prefix="₦"
            />
            <StatsCard
              title="Avg Order Value"
              value={85000}
              change={-2.1}
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
            <StatsCard title="Total Users" value={12450} change={15.3} icon={Users} />
            <StatsCard title="New Users" value={203} change={22.1} icon={Users} />
            <StatsCard title="Active Users" value={2789} change={8.7} icon={Activity} />
            <StatsCard title="Retention Rate" value={76} change={3.2} icon={Target} suffix="%" />
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
            <StatsCard title="Total Vendors" value={456} change={6.8} icon={Store} />
            <StatsCard title="Active Vendors" value={389} change={4.2} icon={Activity} />
            <StatsCard title="Avg Rating" value={4.6} change={1.8} icon={Star} suffix="/5" />
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
            <StatsCard title="Total Products" value={12450} change={5.8} icon={Package} />
            <StatsCard title="Best Sellers" value={234} change={12.3} icon={TrendingUp} />
            <StatsCard title="Out of Stock" value={89} change={-15.2} icon={Package} />
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
            <StatsCard title="Total Sessions" value={1234} change={18.5} icon={MessageSquare} />
            <StatsCard title="Success Rate" value={73} change={5.3} icon={Target} suffix="%" />
            <StatsCard title="Avg Discount" value={13} change={-2.1} icon={Percent} suffix="%" />
            <StatsCard
              title="Savings Generated"
              value={2450000}
              change={15.2}
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
