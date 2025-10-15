'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
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
  Eye,
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
      <div className='space-y-6'>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className='text-center'>
              <ShoppingCart className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className='text-lg font-medium mb-4'>Failed to load orders</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{formatStatusDisplay(status)}</Badge>;
      case 'cancelled':
      case 'delivery_failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{formatStatusDisplay(status)}</Badge>;
      case 'in_transit':
      case 'out_for_delivery':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{formatStatusDisplay(status)}</Badge>;
      case 'processing':
      case 'ready_for_pickup':
      case 'picked_up':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{formatStatusDisplay(status)}</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{formatStatusDisplay(status)}</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{formatStatusDisplay(status)}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{formatStatusDisplay(status)}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{formatStatusDisplay(status)}</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{formatStatusDisplay(status)}</Badge>;
      case 'partial_refund':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{formatStatusDisplay(status)}</Badge>;
      default:
        return <Badge variant="secondary">{formatStatusDisplay(status)}</Badge>;
    }
  };

  const formatStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['order-stats'] });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All orders</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.processing || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Being processed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.delivered || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total revenue</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="delivery_failed">Delivery Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partial_refund">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
              <p className="text-lg font-medium mb-2">No orders found</p>
              <p className='text-sm text-muted-foreground'>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow
                        key={order.id}
                        className='cursor-pointer'
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell className="font-medium">
                          #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : 'Unknown Customer'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.vendor?.businessName || 'Unknown Vendor'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={e => {
                                e.stopPropagation();
                                handleOrderClick(order);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className='flex items-center justify-between p-4 border-t'>
                <p className='text-sm text-muted-foreground'>
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalOrders)} of{' '}
                  {totalOrders} results
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || ordersLoading}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, ordersData?.totalPages || 1) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={ordersLoading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(prev => Math.min(ordersData?.totalPages || 1, prev + 1))
                    }
                    disabled={currentPage === (ordersData?.totalPages || 1) || ordersLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
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
