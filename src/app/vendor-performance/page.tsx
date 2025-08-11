'use client';

import { useState, useEffect } from 'react';
import {
  AnimatedCard,
  GlowingButton,
  AnimatedNumber,
  ProgressRing,
} from '@/components/ui/AnimatedCard';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Zap,
  Target,
  Gauge,
  Activity,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percent,
  Heart,
  Flag,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface VendorPerformance {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  category: string;
  joinDate: Date;
  lastActive: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';

  // Performance Metrics
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  conversionRate: number;
  customerRating: number;
  totalReviews: number;
  responseTime: number; // in hours
  fulfillmentRate: number;
  returnRate: number;

  // Growth Metrics
  salesGrowth: number;
  orderGrowth: number;
  ratingTrend: 'up' | 'down' | 'stable';

  // Compliance
  policyViolations: number;
  disputeCount: number;
  onTimeDelivery: number;

  // Financial
  commissionEarned: number;
  pendingPayouts: number;

  // Contact
  email: string;
  phone: string;
  location: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const mockVendorPerformance: VendorPerformance[] = [
  {
    id: '1',
    vendorId: 'V001',
    vendorName: 'John Doe',
    businessName: 'TechHub Nigeria',
    category: 'Electronics',
    joinDate: new Date('2023-01-15'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'active',
    totalSales: 2500000,
    totalOrders: 156,
    totalProducts: 45,
    avgOrderValue: 16025,
    conversionRate: 3.2,
    customerRating: 4.8,
    totalReviews: 234,
    responseTime: 2.5,
    fulfillmentRate: 96.2,
    returnRate: 2.1,
    salesGrowth: 15.3,
    orderGrowth: 12.8,
    ratingTrend: 'up',
    policyViolations: 0,
    disputeCount: 1,
    onTimeDelivery: 94.5,
    commissionEarned: 125000,
    pendingPayouts: 45000,
    email: 'john@techhubnigeria.com',
    phone: '+234 812 345 6789',
    location: 'Lagos, Nigeria',
  },
  {
    id: '2',
    vendorId: 'V002',
    vendorName: 'Jane Smith',
    businessName: 'Fashion Forward',
    category: 'Fashion',
    joinDate: new Date('2023-03-20'),
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'active',
    totalSales: 1800000,
    totalOrders: 298,
    totalProducts: 89,
    avgOrderValue: 6040,
    conversionRate: 2.8,
    customerRating: 4.6,
    totalReviews: 187,
    responseTime: 4.2,
    fulfillmentRate: 92.3,
    returnRate: 3.8,
    salesGrowth: 8.7,
    orderGrowth: 22.1,
    ratingTrend: 'stable',
    policyViolations: 1,
    disputeCount: 3,
    onTimeDelivery: 89.2,
    commissionEarned: 99000,
    pendingPayouts: 32000,
    email: 'jane@fashionforward.ng',
    phone: '+234 809 876 5432',
    location: 'Abuja, Nigeria',
  },
  {
    id: '3',
    vendorId: 'V003',
    vendorName: 'Mike Johnson',
    businessName: 'Home Essentials',
    category: 'Home & Garden',
    joinDate: new Date('2023-05-10'),
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'inactive',
    totalSales: 950000,
    totalOrders: 78,
    totalProducts: 23,
    avgOrderValue: 12179,
    conversionRate: 1.9,
    customerRating: 4.2,
    totalReviews: 98,
    responseTime: 8.5,
    fulfillmentRate: 87.2,
    returnRate: 5.1,
    salesGrowth: -2.3,
    orderGrowth: -5.8,
    ratingTrend: 'down',
    policyViolations: 2,
    disputeCount: 5,
    onTimeDelivery: 78.4,
    commissionEarned: 47500,
    pendingPayouts: 18000,
    email: 'mike@homeessentials.ng',
    phone: '+234 701 234 5678',
    location: 'Kano, Nigeria',
  },
  {
    id: '4',
    vendorId: 'V004',
    vendorName: 'Sarah Williams',
    businessName: 'Beauty Plus',
    category: 'Beauty & Health',
    joinDate: new Date('2023-07-05'),
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'active',
    totalSales: 3200000,
    totalOrders: 445,
    totalProducts: 127,
    avgOrderValue: 7191,
    conversionRate: 4.1,
    customerRating: 4.9,
    totalReviews: 389,
    responseTime: 1.8,
    fulfillmentRate: 98.7,
    returnRate: 1.2,
    salesGrowth: 28.4,
    orderGrowth: 31.2,
    ratingTrend: 'up',
    policyViolations: 0,
    disputeCount: 0,
    onTimeDelivery: 97.8,
    commissionEarned: 176000,
    pendingPayouts: 58000,
    email: 'sarah@beautyplus.ng',
    phone: '+234 802 345 6789',
    location: 'Port Harcourt, Nigeria',
  },
];

export default function VendorPerformancePage() {
  const [vendors, setVendors] = useState<VendorPerformance[]>(mockVendorPerformance);
  const [selectedVendor, setSelectedVendor] = useState<VendorPerformance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'sales' | 'orders' | 'rating' | 'growth'>('sales');
  const [showDetails, setShowDetails] = useState(false);

  const performanceData = [
    { month: 'Jan', sales: 1200000, orders: 89, rating: 4.3 },
    { month: 'Feb', sales: 1450000, orders: 112, rating: 4.4 },
    { month: 'Mar', sales: 1680000, orders: 134, rating: 4.5 },
    { month: 'Apr', sales: 1920000, orders: 156, rating: 4.6 },
    { month: 'May', sales: 2100000, orders: 178, rating: 4.7 },
    { month: 'Jun', sales: 2350000, orders: 201, rating: 4.8 },
  ];

  const topPerformers = vendors
    .filter(v => v.status === 'active')
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedVendors = filteredVendors.sort((a, b) => {
    switch (sortBy) {
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'orders':
        return b.totalOrders - a.totalOrders;
      case 'rating':
        return b.customerRating - a.customerRating;
      case 'growth':
        return b.salesGrowth - a.salesGrowth;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return Clock;
      case 'suspended':
        return XCircle;
      case 'pending':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return ArrowUp;
      case 'down':
        return ArrowDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const platformMetrics = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'active').length,
    totalSales: vendors.reduce((sum, v) => sum + v.totalSales, 0),
    avgRating: vendors.reduce((sum, v) => sum + v.customerRating, 0) / vendors.length,
    totalOrders: vendors.reduce((sum, v) => sum + v.totalOrders, 0),
    avgFulfillmentRate: vendors.reduce((sum, v) => sum + v.fulfillmentRate, 0) / vendors.length,
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
                Vendor Performance Analytics
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Monitor and analyze vendor performance across the platform
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton size='sm' variant='secondary' icon={<Download className='h-4 w-4' />}>
                Export Report
              </GlowingButton>
              <GlowingButton size='sm' variant='primary' icon={<RefreshCw className='h-4 w-4' />}>
                Refresh Data
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'>
        <AnimatedCard delay={0}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-blue-500 to-purple-600'>
                <Users className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Vendors</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalVendors} />
              </p>
              <p className='text-xs text-gray-500'>Registered</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600'>
                <CheckCircle className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Active Vendors</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.activeVendors} />
              </p>
              <p className='text-xs text-gray-500'>Currently selling</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-yellow-500 to-orange-600'>
                <DollarSign className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Sales</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalSales} prefix='₦' />
              </p>
              <p className='text-xs text-gray-500'>All time</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-purple-500 to-pink-600'>
                <Star className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Avg Rating</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.avgRating} decimals={1} />
              </p>
              <p className='text-xs text-gray-500'>Out of 5.0</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-indigo-500 to-blue-600'>
                <ShoppingCart className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Orders</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalOrders} />
              </p>
              <p className='text-xs text-gray-500'>Processed</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-teal-500 to-cyan-600'>
                <Target className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Fulfillment Rate</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber
                  value={platformMetrics.avgFulfillmentRate}
                  decimals={1}
                  suffix='%'
                />
              </p>
              <p className='text-xs text-gray-500'>Average</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Performance Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <AnimatedCard delay={600}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Platform Performance Trends</h3>
                <p className='text-sm text-gray-600'>Monthly sales, orders, and ratings</p>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='month' axisLine={false} tickLine={false} />
                <YAxis yAxisId='left' axisLine={false} tickLine={false} />
                <YAxis yAxisId='right' orientation='right' axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='sales'
                  stroke='#3B82F6'
                  strokeWidth={3}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='orders'
                  stroke='#10B981'
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={700}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Top Performing Vendors</h3>
                <p className='text-sm text-gray-600'>Based on total sales</p>
              </div>
            </div>
            <div className='space-y-4'>
              {topPerformers.map((vendor, index) => (
                <div
                  key={vendor.id}
                  className='flex items-center justify-between p-4 rounded-lg bg-gray-50'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{vendor.businessName}</p>
                      <p className='text-sm text-gray-600'>{vendor.category}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900'>
                      {formatCurrency(vendor.totalSales)}
                    </p>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 text-yellow-400 fill-current' />
                      <span className='text-sm text-gray-600'>{vendor.customerRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Categories</option>
              <option value='Electronics'>Electronics</option>
              <option value='Fashion'>Fashion</option>
              <option value='Home & Garden'>Home & Garden</option>
              <option value='Beauty & Health'>Beauty & Health</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='suspended'>Suspended</option>
            <option value='pending'>Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='sales'>Sort by Sales</option>
            <option value='orders'>Sort by Orders</option>
            <option value='rating'>Sort by Rating</option>
            <option value='growth'>Sort by Growth</option>
          </select>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search vendors...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Vendor Performance Table */}
      <AnimatedCard delay={800}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Vendor Performance</h3>
              <p className='text-sm text-gray-600'>Detailed performance metrics for all vendors</p>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Sales</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Orders</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Rating</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Fulfillment</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Growth</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {sortedVendors.map(vendor => {
                  const StatusIcon = getStatusIcon(vendor.status);
                  const TrendIcon = getTrendIcon(vendor.ratingTrend);

                  return (
                    <tr key={vendor.id} className='hover:bg-gray-50'>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{vendor.businessName}</p>
                          <p className='text-sm text-gray-600'>{vendor.vendorName}</p>
                          <p className='text-xs text-gray-500'>{vendor.category}</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                            getStatusColor(vendor.status)
                          )}
                        >
                          <StatusIcon className='h-3 w-3' />
                          {vendor.status}
                        </span>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {formatCurrency(vendor.totalSales)}
                          </p>
                          <p className='text-xs text-gray-500'>{vendor.totalProducts} products</p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>{vendor.totalOrders}</p>
                          <p className='text-xs text-gray-500'>
                            {formatCurrency(vendor.avgOrderValue)} avg
                          </p>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            <Star className='h-4 w-4 text-yellow-400 fill-current' />
                            <span className='font-medium text-gray-900'>
                              {vendor.customerRating}
                            </span>
                          </div>
                          <TrendIcon className={cn('h-3 w-3', getTrendColor(vendor.ratingTrend))} />
                        </div>
                        <p className='text-xs text-gray-500'>{vendor.totalReviews} reviews</p>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-16 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-green-500 h-2 rounded-full transition-all duration-500'
                              style={{ width: `${Math.min(vendor.fulfillmentRate, 100)}%` }}
                            />
                          </div>
                          <span className='text-sm font-medium text-gray-900'>
                            {vendor.fulfillmentRate}%
                          </span>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-1'>
                          {vendor.salesGrowth > 0 ? (
                            <ArrowUp className='h-4 w-4 text-green-600' />
                          ) : (
                            <ArrowDown className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={cn(
                              'font-medium',
                              vendor.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {vendor.salesGrowth > 0 ? '+' : ''}
                            {vendor.salesGrowth}%
                          </span>
                        </div>
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowDetails(true);
                            }}
                            className='text-blue-600 hover:text-blue-800 font-medium'
                          >
                            View Details
                          </button>
                          <button className='text-green-600 hover:text-green-800 font-medium'>
                            Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedVendors.length === 0 && (
            <div className='text-center py-12'>
              <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No vendors found</h3>
              <p className='text-gray-600'>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Vendor Details Modal */}
      {showDetails && selectedVendor && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>Vendor Performance Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <XCircle className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Vendor Information</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Business Name:</strong> {selectedVendor.businessName}
                    </p>
                    <p>
                      <strong>Owner:</strong> {selectedVendor.vendorName}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedVendor.category}
                    </p>
                    <p>
                      <strong>Join Date:</strong> {format(selectedVendor.joinDate, 'MMM dd, yyyy')}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={cn(
                          'ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                          getStatusColor(selectedVendor.status)
                        )}
                      >
                        {selectedVendor.status}
                      </span>
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedVendor.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedVendor.phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedVendor.location}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Performance Summary</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Total Sales:</strong> {formatCurrency(selectedVendor.totalSales)}
                    </p>
                    <p>
                      <strong>Total Orders:</strong> {selectedVendor.totalOrders}
                    </p>
                    <p>
                      <strong>Products Listed:</strong> {selectedVendor.totalProducts}
                    </p>
                    <p>
                      <strong>Average Order Value:</strong>{' '}
                      {formatCurrency(selectedVendor.avgOrderValue)}
                    </p>
                    <p>
                      <strong>Customer Rating:</strong> {selectedVendor.customerRating}/5.0 (
                      {selectedVendor.totalReviews} reviews)
                    </p>
                    <p>
                      <strong>Fulfillment Rate:</strong> {selectedVendor.fulfillmentRate}%
                    </p>
                    <p>
                      <strong>Return Rate:</strong> {selectedVendor.returnRate}%
                    </p>
                    <p>
                      <strong>Response Time:</strong> {selectedVendor.responseTime} hours
                    </p>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Growth Metrics</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Sales Growth:</strong>
                      <span
                        className={cn(
                          'ml-2',
                          selectedVendor.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {selectedVendor.salesGrowth > 0 ? '+' : ''}
                        {selectedVendor.salesGrowth}%
                      </span>
                    </p>
                    <p>
                      <strong>Order Growth:</strong>
                      <span
                        className={cn(
                          'ml-2',
                          selectedVendor.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {selectedVendor.orderGrowth > 0 ? '+' : ''}
                        {selectedVendor.orderGrowth}%
                      </span>
                    </p>
                    <p>
                      <strong>Rating Trend:</strong> {selectedVendor.ratingTrend}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Compliance & Financial</h3>
                  <div className='space-y-2'>
                    <p>
                      <strong>Policy Violations:</strong> {selectedVendor.policyViolations}
                    </p>
                    <p>
                      <strong>Dispute Count:</strong> {selectedVendor.disputeCount}
                    </p>
                    <p>
                      <strong>On-time Delivery:</strong> {selectedVendor.onTimeDelivery}%
                    </p>
                    <p>
                      <strong>Commission Earned:</strong>{' '}
                      {formatCurrency(selectedVendor.commissionEarned)}
                    </p>
                    <p>
                      <strong>Pending Payouts:</strong>{' '}
                      {formatCurrency(selectedVendor.pendingPayouts)}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-3'>
                <GlowingButton variant='secondary' onClick={() => setShowDetails(false)}>
                  Close
                </GlowingButton>
                <GlowingButton variant='primary' icon={<Mail className='h-4 w-4' />}>
                  Contact Vendor
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
