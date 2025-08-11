'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
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

  // Mock data for platform-wide reports
  const platformMetrics = {
    totalRevenue: 45000000,
    revenueGrowth: 23.5,
    totalCommission: 2250000,
    commissionGrowth: 18.2,
    totalVendors: 247,
    vendorGrowth: 12.8,
    totalCustomers: 15647,
    customerGrowth: 31.4,
    totalOrders: 8934,
    orderGrowth: 19.7,
    avgOrderValue: 87500,
    avgOrderGrowth: 8.3,
    disputeRate: 2.3,
    disputeChange: -15.2,
    vendorSatisfaction: 4.2,
    satisfactionChange: 5.1,
  };

  const vendorPerformanceData = [
    { name: 'Jan', revenue: 3200000, commission: 160000, vendors: 198, orders: 1245 },
    { name: 'Feb', revenue: 3800000, commission: 190000, vendors: 210, orders: 1456 },
    { name: 'Mar', revenue: 4100000, commission: 205000, vendors: 225, orders: 1598 },
    { name: 'Apr', revenue: 4600000, commission: 230000, vendors: 235, orders: 1789 },
    { name: 'May', revenue: 5200000, commission: 260000, vendors: 242, orders: 1923 },
    { name: 'Jun', revenue: 5800000, commission: 290000, vendors: 247, orders: 2134 },
  ];

  const topVendorsByRevenue = [
    { name: 'TechHub Nigeria', revenue: 2100000, commission: 105000, orders: 567, growth: 34.2 },
    { name: 'Fashion Forward', revenue: 1850000, commission: 92500, orders: 423, growth: 28.7 },
    { name: 'Home Essentials', revenue: 1620000, commission: 81000, orders: 389, growth: 22.1 },
    { name: 'Sports Arena', revenue: 1480000, commission: 74000, orders: 312, growth: 19.8 },
    { name: 'Book Paradise', revenue: 1350000, commission: 67500, orders: 298, growth: 15.3 },
  ];

  const categoryDistribution = [
    { category: 'Electronics', value: 35, revenue: 15750000 },
    { category: 'Fashion', value: 25, revenue: 11250000 },
    { category: 'Home & Garden', value: 18, revenue: 8100000 },
    { category: 'Sports', value: 12, revenue: 5400000 },
    { category: 'Books', value: 10, revenue: 4500000 },
  ];

  const vendorStatusDistribution = [
    { status: 'Active', count: 198, percentage: 80.2 },
    { status: 'Pending', count: 23, percentage: 9.3 },
    { status: 'Suspended', count: 15, percentage: 6.1 },
    { status: 'Under Review', count: 11, percentage: 4.5 },
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
    return new Intl.NumberFormat('en-NG').format(value);
  };

  const exportReport = (type: string) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
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
              <GlowingButton size='sm' variant='primary'>
                <Download className='h-4 w-4 mr-2' />
                Export All
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
                  +{platformMetrics.revenueGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Platform Revenue</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalRevenue} prefix='₦' />
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
                  +{platformMetrics.commissionGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Commission</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalCommission} prefix='₦' />
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
                  +{platformMetrics.vendorGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Active Vendors</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalVendors} />
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
                  +{platformMetrics.customerGrowth}%
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Total Customers</p>
              <p className='text-3xl font-bold text-gray-900'>
                <AnimatedNumber value={platformMetrics.totalCustomers} />
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
              <AreaChart data={vendorPerformanceData}>
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
              {vendorStatusDistribution.map((item, index) => (
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
                {topVendorsByRevenue.map((vendor, index) => (
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
        <GlowingButton variant='primary' className='h-12 justify-center'>
          <Download className='h-4 w-4 mr-2' />
          Revenue Report
        </GlowingButton>
        <GlowingButton variant='secondary' className='h-12 justify-center'>
          <FileText className='h-4 w-4 mr-2' />
          Vendor Report
        </GlowingButton>
        <GlowingButton variant='success' className='h-12 justify-center'>
          <BarChart3 className='h-4 w-4 mr-2' />
          Analytics Report
        </GlowingButton>
        <GlowingButton variant='danger' className='h-12 justify-center'>
          <AlertTriangle className='h-4 w-4 mr-2' />
          Issues Report
        </GlowingButton>
      </div>
    </div>
  );
}
