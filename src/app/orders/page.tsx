'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { OrderDetailModal } from '@/components/modals/OrderDetailModal';
import { orderService } from '@/lib/api/services/order.service';
import { Order, OrderFilter, OrderStatus, PaymentStatus, OrderDetail } from '@/types/order';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  MoreVertical,
  ShoppingCart,
  Download,
  TrendingUp,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterPayment]);

  const orderFilter: OrderFilter = useMemo(
    () => ({
      search: debouncedSearchTerm || undefined,
      status: filterStatus !== 'all' ? (filterStatus as OrderStatus) : undefined,
      paymentStatus: filterPayment !== 'all' ? (filterPayment as PaymentStatus) : undefined,
      page: currentPage,
      limit: 10,
    }),
    [debouncedSearchTerm, filterStatus, filterPayment, currentPage]
  );

  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['orders', orderFilter],
    queryFn: () => orderService.getOrders(orderFilter),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch order statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => orderService.getOrderStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      reason,
      note,
    }: {
      orderId: string;
      status: OrderStatus;
      reason?: string;
      note?: string;
    }) => orderService.updateOrderStatus(orderId, { status, reason, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update order status');
    },
  });

  // Process refund mutation
  const refundMutation = useMutation({
    mutationFn: ({
      orderId,
      amount,
      reason,
      note,
    }: {
      orderId: string;
      amount: number;
      reason: string;
      note?: string;
    }) => orderService.processRefund(orderId, { amount, reason, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast.success('Refund processed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to process refund');
    },
  });

  const handleOrderClick = async (order: Order) => {
    setIsLoading(true);
    try {
      const orderDetails = await orderService.getOrderById(order.id);
      setSelectedOrder(orderDetails);
      setOrderModalOpen(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = (orderId: string, status: string, reason?: string, note?: string) => {
    updateStatusMutation.mutate({
      orderId,
      status: status as OrderStatus,
      reason,
      note,
    });
  };

  const handleOrderRefund = (
    orderId: string,
    amount: number,
    reason: string = 'Admin refund',
    note?: string
  ) => {
    refundMutation.mutate({ orderId, amount, reason, note });
  };

  const handleContactCustomer = (order: OrderDetail) => {
    // Open email client or notification system
    const email = order.customer?.email;
    if (email) {
      window.location.href = `mailto:${email}?subject=Regarding Order ${order.orderNumber}`;
    } else {
      toast.error('Customer email not available');
    }
  };

  const handleEditOrder = (order: OrderDetail) => {
    // Navigate to order edit page or open edit modal
    console.log('Edit order:', order.id);
    toast.info('Order editing functionality coming soon');
  };

  const handleExport = async () => {
    try {
      const blob = await orderService.exportOrders({
        status: filterStatus !== 'all' ? (filterStatus as OrderStatus) : undefined,
        format: 'xlsx',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Orders exported successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export orders');
    }
  };

  // Handle loading and error states
  if (ordersError) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>Failed to load orders</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'delivery_failed':
        return 'bg-red-100 text-red-800';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
      case 'ready_for_pickup':
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'partial_refund':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Orders Management'
        description='Track and manage customer orders'
        icon={ShoppingCart}
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: () => {
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['order-stats'] });
            },
          },
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
            onClick: handleExport,
          },
        ]}
      />

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5'>
        <StatsCard
          title='Total Orders'
          value={stats?.total || 0}
          icon={ShoppingCart}
          gradient='from-blue-500 to-purple-600'
          delay={0}
          loading={statsLoading}
        />
        <StatsCard
          title='Pending'
          value={stats?.pending || 0}
          icon={Clock}
          gradient='from-yellow-500 to-orange-600'
          delay={100}
          loading={statsLoading}
        />
        <StatsCard
          title='Processing'
          value={stats?.processing || 0}
          icon={TrendingUp}
          gradient='from-blue-500 to-indigo-600'
          delay={200}
          loading={statsLoading}
        />
        <StatsCard
          title='Delivered'
          value={stats?.delivered || 0}
          icon={Truck}
          gradient='from-green-500 to-emerald-600'
          delay={300}
          loading={statsLoading}
        />
        <StatsCard
          title='Revenue'
          value={stats?.totalRevenue || 0}
          format='currency'
          icon={DollarSign}
          gradient='from-emerald-500 to-green-600'
          delay={400}
          loading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>All Orders</CardTitle>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='search'
                  placeholder='Search orders...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-500' />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='pending'>Pending</option>
                  <option value='processing'>Processing</option>
                  <option value='ready_for_pickup'>Ready for Pickup</option>
                  <option value='picked_up'>Picked Up</option>
                  <option value='in_transit'>In Transit</option>
                  <option value='out_for_delivery'>Out for Delivery</option>
                  <option value='delivered'>Delivered</option>
                  <option value='cancelled'>Cancelled</option>
                  <option value='refunded'>Refunded</option>
                  <option value='delivery_failed'>Delivery Failed</option>
                </select>

                <select
                  value={filterPayment}
                  onChange={e => setFilterPayment(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Payment</option>
                  <option value='pending'>Pending</option>
                  <option value='paid'>Paid</option>
                  <option value='completed'>Completed</option>
                  <option value='failed'>Failed</option>
                  <option value='refunded'>Refunded</option>
                  <option value='partial_refund'>Partial Refund</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Order ID</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Customer</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Vendor</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Total</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Payment</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Date</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {ordersLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className='animate-pulse'>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-24'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-32'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-28'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-20'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-16'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-16'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-24'></div>
                      </td>
                      <td className='py-4'>
                        <div className='h-4 bg-gray-200 rounded w-8'></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='py-12 text-center text-gray-500'>
                      <ShoppingCart className='mx-auto h-12 w-12 text-gray-300 mb-4' />
                      <p>No orders found</p>
                      <p className='text-sm'>Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr
                      key={order.id}
                      className='hover:bg-gray-50 cursor-pointer'
                      onClick={() => handleOrderClick(order)}
                    >
                      <td className='py-4 font-medium text-gray-900'>
                        #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className='py-4 text-gray-600'>
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : 'Unknown Customer'}
                      </td>
                      <td className='py-4 text-gray-600'>
                        {order.vendor?.businessName || 'Unknown Vendor'}
                      </td>
                      <td className='py-4 font-medium text-gray-900'>
                        {formatCurrency(order.total)}
                      </td>
                      <td className='py-4'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {formatStatusDisplay(order.status)}
                        </span>
                      </td>
                      <td className='py-4'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {formatStatusDisplay(order.paymentStatus)}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className='py-4'>
                        <button
                          className='rounded p-1 text-gray-600 hover:bg-gray-100'
                          onClick={e => {
                            e.stopPropagation();
                            // Add dropdown menu or actions here
                          }}
                        >
                          <MoreVertical className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalOrders)} of{' '}
              {totalOrders} results
            </p>
            <div className='flex gap-2'>
              <button
                className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || ordersLoading}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, ordersData?.totalPages || 1) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`rounded px-3 py-1 text-sm ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={ordersLoading}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className='rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={() =>
                  setCurrentPage(prev => Math.min(ordersData?.totalPages || 1, prev + 1))
                }
                disabled={currentPage === (ordersData?.totalPages || 1) || ordersLoading}
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

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
