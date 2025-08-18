'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  AnimatedCard,
  AnimatedNumber,
  GlowingButton,
  ProgressRing,
} from '@/components/ui/AnimatedCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderDetailModal } from '@/components/modals/OrderDetailModal';
import { LoadingDashboard } from '@/components/ui/LoadingDashboard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
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
  Eye,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import {
  useDashboardAnalytics,
  useRevenueData,
  useOrderAnalytics,
} from '@/lib/hooks/use-analytics';
import { Order } from '@/lib/api/types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Fetch real data using React Query
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics({
    enabled: !!session?.accessToken,
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueData({ period: 'day' }, { enabled: !!session?.accessToken });

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderAnalytics({ period: 'month' }, {
    enabled: !!session?.accessToken,
  } as any);

  // Handle loading state
  if (analyticsLoading || revenueLoading || orderLoading) {
    return <LoadingDashboard />;
  }

  // Handle error state
  if (analyticsError || revenueError || orderError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load dashboard data'
          message={
            analyticsError?.message ||
            revenueError?.message ||
            orderError?.message ||
            'Unknown error occurred'
          }
          onRetry={() => refetchAnalytics()}
        />
      </div>
    );
  }

  // Handle empty data
  if (!analytics) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No data available</h3>
          <p className='text-gray-600 mb-4'>Analytics data is not available at the moment.</p>
          <button
            onClick={() => refetchAnalytics()}
            className='inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleOrderClick = (order: Order) => {
    // Transform order data if needed for the modal
    const orderDetails = {
      ...order,
      orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      customerId: order.customerId,
      customerEmail: order.customer?.email || 'N/A',
      customerPhone: order.customer?.phone || 'N/A',
      paymentMethod: order.paymentMethod || 'card',
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      tax: order.tax,
      discount: order.discount,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      orderDate: new Date(order.createdAt),
      statusHistory: [
        {
          status: order.status,
          date: new Date(order.createdAt),
          updatedBy: 'System',
          note: 'Order placed successfully',
        },
      ],
    };
    setSelectedOrder(orderDetails);
    setOrderModalOpen(true);
  };

  const handleOrderUpdate = (orderId: string, status: Order['status']) => {
    console.log('Updating order:', orderId, 'to status:', status);
    // TODO: Implement real order update API call
  };

  const handleOrderRefund = (orderId: string, amount: number) => {
    console.log('Processing refund for order:', orderId, 'amount:', amount);
    // TODO: Implement real refund API call
  };

  const handleContactCustomer = (order: any) => {
    console.log('Contacting customer for order:', order.id);
    // TODO: Implement customer contact functionality
  };

  const handleEditOrder = (order: any) => {
    console.log('Editing order:', order.id);
    // TODO: Implement order editing functionality
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };


  const metrics = [
    {
      title: 'Total Revenue',
      value: analytics.totalRevenue,
      change: analytics.revenueGrowth || 0,
      icon: DollarSign,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-500/10 to-purple-600/10',
      prefix: '₦',
      suffix: '',
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      change: analytics.orderGrowth || 0,
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      prefix: '',
      suffix: '',
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      change: analytics.userGrowth || Math.floor(Math.random() * 20), // Simulate growth
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/10 to-pink-600/10',
      prefix: '',
      suffix: '',
    },
    {
      title: 'Total Vendors',
      value: analytics.totalVendors,
      change: analytics.vendorGrowth || 0,
      icon: Store,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-500/10 to-red-600/10',
      prefix: '',
      suffix: '',
    },
  ];

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Dashboard Overview'
        description={`Welcome back, ${session?.user?.name || 'Admin'}`}
        icon={Activity}
        actions={[
          {
            label: 'Refresh Data',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: () => refetchAnalytics(),
          },
        ]}
      />

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric, index) => (
          <AnimatedCard key={metric.title} delay={index * 100} className='group cursor-pointer'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div
                  className={cn(
                    'rounded-xl p-3 bg-gradient-to-r transition-all duration-300',
                    metric.gradient,
                    'group-hover:scale-110 group-hover:rotate-3'
                  )}
                >
                  <metric.icon className='h-6 w-6 text-white' />
                </div>
                <div className='flex items-center gap-1'>
                  {metric.change > 0 ? (
                    <ArrowUpRight className='h-4 w-4 text-green-500' />
                  ) : (
                    <ArrowDownLeft className='h-4 w-4 text-red-500' />
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

              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-600'>{metric.title}</p>
                <p className='text-3xl font-bold text-gray-900'>
                  <AnimatedNumber
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                </p>
                <p className='text-xs text-gray-500'>vs last month</p>
              </div>

              {/* Progress bar */}
              <div className='mt-4 h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className={cn(
                    'h-full bg-gradient-to-r transition-all duration-1000 delay-300',
                    metric.gradient
                  )}
                  style={{ width: `${Math.min(Math.abs(metric.change) * 2, 100)}%` }}
                />
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Revenue Chart */}
        <AnimatedCard delay={400} className='lg:col-span-2'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Revenue Overview</h3>
                <p className='text-sm text-gray-600'>Daily revenue trends</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-primary rounded-full'></div>
                  <span className='text-sm text-gray-600'>Revenue</span>
                </div>
              </div>
            </div>
            {revenueData ? (
              <ResponsiveContainer width='100%' height={320}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis
                    dataKey='date'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='#3B82F6'
                    strokeWidth={3}
                    fill='url(#colorRevenue)'
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3B82F6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-80 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <BarChart3 className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Performance Ring */}
        <AnimatedCard delay={500}>
          <div className='p-6'>
            <div className='text-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>Performance</h3>
              <p className='text-sm text-gray-600'>Overall platform health</p>
            </div>
            <div className='flex justify-center mb-6'>
              <ProgressRing progress={85} size={140} strokeWidth={8} color='#3B82F6' />
            </div>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Orders</span>
                <div className='flex items-center gap-2'>
                  <div className='w-full bg-gray-200 rounded-full h-2 w-16'>
                    <div className='bg-green-500 h-2 rounded-full' style={{ width: '78%' }}></div>
                  </div>
                  <span className='text-sm font-medium'>78%</span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Users</span>
                <div className='flex items-center gap-2'>
                  <div className='w-full bg-gray-200 rounded-full h-2 w-16'>
                    <div className='bg-primary h-2 rounded-full' style={{ width: '92%' }}></div>
                  </div>
                  <span className='text-sm font-medium'>92%</span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Revenue</span>
                <div className='flex items-center gap-2'>
                  <div className='w-full bg-gray-200 rounded-full h-2 w-16'>
                    <div className='bg-purple-500 h-2 rounded-full' style={{ width: '85%' }}></div>
                  </div>
                  <span className='text-sm font-medium'>85%</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Categories and Recent Orders */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Order Statistics */}
        <AnimatedCard delay={600}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Order Statistics</h3>
                <p className='text-sm text-gray-600'>Monthly order performance</p>
              </div>
            </div>
            {orderData ? (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 rounded-full bg-green-500' />
                    <span className='text-sm font-medium text-gray-900'>Completed Orders</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full transition-all duration-1000'
                        style={{ width: '85%' }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 w-12 text-right'>85%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 rounded-full bg-primary' />
                    <span className='text-sm font-medium text-gray-900'>Processing Orders</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-primary h-2 rounded-full transition-all duration-1000'
                        style={{ width: '10%' }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 w-12 text-right'>10%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 rounded-full bg-red-500' />
                    <span className='text-sm font-medium text-gray-900'>Cancelled Orders</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-red-500 h-2 rounded-full transition-all duration-1000'
                        style={{ width: '5%' }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 w-12 text-right'>5%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className='py-8 text-center text-gray-500'>
                <Package className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No order data available</p>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Recent Orders */}
        <AnimatedCard delay={700}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Recent Orders</h3>
                <p className='text-sm text-gray-600'>Latest customer orders</p>
              </div>
              <GlowingButton size='sm' variant='secondary'>
                View All
              </GlowingButton>
            </div>
            {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
              <div className='space-y-4'>
                {analytics.recentOrders.slice(0, 5).map((order, index) => (
                  <div
                    key={order.id}
                    className='flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-all duration-200 cursor-pointer'
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
                        <span className='text-white text-sm font-medium'>
                          {order.customer?.firstName?.charAt(0) || order.orderNumber.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : 'Customer'}
                        </p>
                        <p className='text-xs text-gray-500'>#{order.orderNumber}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900'>
                        {formatCurrency(order.total)}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                            order.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : order.status === 'SHIPPED'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {order.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center text-gray-500'>
                <ShoppingCart className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleOrderUpdate}
        onRefund={handleOrderRefund}
        onContact={handleContactCustomer}
        onEdit={handleEditOrder}
      />
    </div>
  );
}
