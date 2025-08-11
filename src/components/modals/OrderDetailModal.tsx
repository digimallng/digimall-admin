'use client';

import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import {
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  CreditCard,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  FileText,
  Edit,
  RefreshCw,
  Download,
  Eye,
  Shield,
  Flag,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';

// Safe date formatting helper
const formatDate = (date: string | Date | null | undefined, formatStr: string): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return format(dateObj, formatStr);
  } catch {
    return 'N/A';
  }
};
import { cn } from '@/lib/utils/cn';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  vendorId: string;
  vendorName: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_money' | 'cash_on_delivery';

  // Order Details
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;

  // Addresses
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Dates
  orderDate: Date;
  confirmedDate?: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  expectedDeliveryDate?: Date;

  // Tracking
  trackingNumber?: string;
  shippingProvider?: string;

  // Notes
  customerNotes?: string;
  adminNotes?: string;

  // Status History
  statusHistory: Array<{
    status: string;
    date: Date;
    note?: string;
    updatedBy: string;
  }>;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  onUpdateStatus?: (orderId: string, status: string) => void;
  onRefund?: (orderId: string, amount: number) => void;
  onContact?: (order: OrderDetails) => void;
  onEdit?: (order: OrderDetails) => void;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onRefund,
  onContact,
  onEdit,
}: OrderDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'details' | 'items' | 'payment' | 'shipping' | 'history'
  >('details');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  if (!order) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'returned':
        return RefreshCw;
      default:
        return Info;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - ${order.orderNumber}`}
      size='xl'
    >
      <ModalBody className='p-0'>
        {/* Order Header */}
        <div className='p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-2xl font-bold text-gray-900'>{order.orderNumber}</h3>
              <p className='text-gray-600'>
                {order.customer
                  ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() ||
                    'Unknown Customer'
                  : 'Unknown Customer'}
              </p>
              <div className='flex items-center gap-4 mt-3'>
                <div className='flex items-center gap-2'>
                  <StatusIcon className='h-4 w-4 text-gray-500' />
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      getStatusColor(order.status)
                    )}
                  >
                    {order.status}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4 text-gray-500' />
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      getPaymentStatusColor(order.paymentStatus)
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Order Total</p>
              <p className='text-3xl font-bold text-gray-900'>{formatCurrency(order.total || 0)}</p>
              <p className='text-sm text-gray-500 mt-1'>
                {formatDate(order.createdAt, 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: 'details', label: 'Details', icon: Info },
              { id: 'items', label: 'Items', icon: Package },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'shipping', label: 'Shipping', icon: Truck },
              { id: 'history', label: 'History', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'details' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Customer Information</h4>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-700'>
                        {order.customer
                          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() ||
                            'Unknown Customer'
                          : 'Unknown Customer'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-700'>
                        {order.customerEmail || 'No email provided'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-700'>
                        {order.customerPhone || 'No phone provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Order Summary</h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='font-medium'>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Shipping</span>
                      <span className='font-medium'>{formatCurrency(order.shippingFee || 0)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Tax</span>
                      <span className='font-medium'>{formatCurrency(order.tax || 0)}</span>
                    </div>
                    {order.discount && order.discount > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Discount</span>
                        <span className='font-medium text-green-600'>
                          -{formatCurrency(order.discount)}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between font-bold text-lg border-t pt-2'>
                      <span>Total</span>
                      <span>{formatCurrency(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Billing Address</h4>
                  <div className='text-gray-700'>
                    {order.billingAddress ? (
                      <>
                        <p>{order.billingAddress.street}</p>
                        <p>
                          {order.billingAddress.city}, {order.billingAddress.state}{' '}
                          {order.billingAddress.zipCode}
                        </p>
                        <p>{order.billingAddress.country}</p>
                      </>
                    ) : (
                      <p className='text-gray-500 italic'>No billing address provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Shipping Address</h4>
                  <div className='text-gray-700'>
                    {order.shippingAddress ? (
                      <>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </>
                    ) : (
                      <p className='text-gray-500 italic'>No shipping address provided</p>
                    )}
                  </div>
                </div>
              </div>

              {order.customerNotes && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Customer Notes</h4>
                  <p className='text-gray-700 bg-gray-50 p-3 rounded-lg'>{order.customerNotes}</p>
                </div>
              )}

              {order.adminNotes && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Admin Notes</h4>
                  <p className='text-gray-700 bg-blue-50 p-3 rounded-lg'>{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'items' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-semibold text-gray-900'>Order Items</h4>
                <span className='text-sm text-gray-500'>
                  {order.items ? order.items.length : 0} items
                </span>
              </div>
              <div className='space-y-4'>
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <div key={item.id} className='flex items-center gap-4 p-4 border rounded-lg'>
                      <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center'>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className='w-full h-full object-cover rounded-lg'
                          />
                        ) : (
                          <Package className='h-8 w-8 text-gray-400' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <h5 className='font-medium text-gray-900'>
                          {item.productName || 'Unknown Product'}
                        </h5>
                        <p className='text-sm text-gray-600'>
                          Vendor: {item.vendorName || 'Unknown Vendor'}
                        </p>
                        <p className='text-sm text-gray-600'>Quantity: {item.quantity || 0}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium text-gray-900'>
                          {formatCurrency(item.total || 0)}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {formatCurrency(item.price || 0)} each
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-center text-gray-500 italic'>No items in this order</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Payment Information</h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Payment Method</span>
                      <span className='font-medium capitalize'>
                        {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Payment Status</span>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-semibold rounded-full',
                          getPaymentStatusColor(order.paymentStatus)
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Amount Paid</span>
                      <span className='font-medium'>{formatCurrency(order.total || 0)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Transaction Details</h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Order Date</span>
                      <span className='font-medium'>
                        {formatDate(order.createdAt, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {order.confirmedAt && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Confirmed Date</span>
                        <span className='font-medium'>
                          {formatDate(order.confirmedAt, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {order.paymentStatus === 'paid' && (
                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                    <span className='font-medium text-green-800'>Payment Confirmed</span>
                  </div>
                  <p className='text-sm text-green-700 mt-1'>
                    Payment has been successfully processed and confirmed.
                  </p>
                </div>
              )}

              {order.paymentStatus === 'refunded' && (
                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                  <div className='flex items-center gap-2'>
                    <RefreshCw className='h-5 w-5 text-blue-600' />
                    <span className='font-medium text-blue-800'>Payment Refunded</span>
                  </div>
                  <p className='text-sm text-blue-700 mt-1'>
                    Full refund has been processed for this order.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Shipping Information</h4>
                  <div className='space-y-2'>
                    {order.shippingProvider && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Shipping Provider</span>
                        <span className='font-medium'>{order.shippingProvider}</span>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Tracking Number</span>
                        <span className='font-medium'>{order.trackingNumber}</span>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Shipping Fee</span>
                      <span className='font-medium'>{formatCurrency(order.shippingFee || 0)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-900 mb-3'>Delivery Timeline</h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Order Date</span>
                      <span className='font-medium'>
                        {formatDate(order.createdAt, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {order.shippedAt && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Shipped Date</span>
                        <span className='font-medium'>
                          {formatDate(order.shippedAt, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {order.expectedDeliveryAt && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Expected Delivery</span>
                        <span className='font-medium'>
                          {formatDate(order.expectedDeliveryAt, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Delivered Date</span>
                        <span className='font-medium'>
                          {formatDate(order.deliveredAt, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-semibold text-gray-900 mb-3'>Delivery Address</h4>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <div className='flex items-start gap-2'>
                    <MapPin className='h-4 w-4 text-gray-500 mt-1' />
                    <div>
                      <p className='font-medium text-gray-900'>
                        {order.customer
                          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() ||
                            'Unknown Customer'
                          : 'Unknown Customer'}
                      </p>
                      {order.shippingAddress ? (
                        <>
                          <p className='text-gray-700'>{order.shippingAddress.street}</p>
                          <p className='text-gray-700'>
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p className='text-gray-700'>{order.shippingAddress.country}</p>
                        </>
                      ) : (
                        <p className='text-gray-500 italic'>No shipping address provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className='space-y-4'>
              <h4 className='font-semibold text-gray-900'>Order Status History</h4>
              <div className='space-y-4'>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((entry, index) => (
                    <div key={index} className='flex items-start gap-4 p-4 border rounded-lg'>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <Clock className='h-4 w-4 text-blue-600' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <p className='font-medium text-gray-900 capitalize'>
                            {entry.status.replace('_', ' ')}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {formatDate(entry.date, 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <p className='text-sm text-gray-600'>Updated by: {entry.updatedBy}</p>
                        {entry.note && <p className='text-sm text-gray-600 mt-1'>{entry.note}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-center text-gray-500 italic'>
                    No status history available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <GlowingButton variant='secondary' onClick={onClose}>
          Close
        </GlowingButton>

        {onContact && (
          <GlowingButton
            variant='primary'
            icon={<MessageSquare className='h-4 w-4' />}
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).startChatConversation) {
                (window as any).startChatConversation(
                  {
                    id: order.customerId,
                    name: order.customer
                      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() ||
                        'Unknown Customer'
                      : 'Unknown Customer',
                    email: order.customerEmail,
                    type: 'customer',
                    isOnline: Math.random() > 0.5,
                    lastSeen: new Date(Date.now() - Math.random() * 86400000),
                  },
                  `Hi ${order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Customer' : 'Customer'}, I'm reaching out regarding your order ${order.orderNumber}. How can I help you today?`
                );
              } else {
                onContact(order);
              }
            }}
          >
            Contact Customer
          </GlowingButton>
        )}

        {onEdit && (
          <GlowingButton
            variant='primary'
            icon={<Edit className='h-4 w-4' />}
            onClick={() => onEdit(order)}
          >
            Edit Order
          </GlowingButton>
        )}

        {order.paymentStatus === 'paid' && onRefund && (
          <GlowingButton
            variant='danger'
            icon={<RefreshCw className='h-4 w-4' />}
            onClick={() => {
              setRefundAmount(order.total || 0);
              setShowRefundModal(true);
            }}
          >
            Process Refund
          </GlowingButton>
        )}

        {order.status === 'pending' && onUpdateStatus && (
          <GlowingButton
            variant='success'
            icon={<CheckCircle className='h-4 w-4' />}
            onClick={() => order.id && onUpdateStatus && onUpdateStatus(order.id, 'confirmed')}
          >
            Confirm Order
          </GlowingButton>
        )}

        {order.status === 'confirmed' && onUpdateStatus && (
          <GlowingButton
            variant='primary'
            icon={<Package className='h-4 w-4' />}
            onClick={() => order.id && onUpdateStatus && onUpdateStatus(order.id, 'processing')}
          >
            Start Processing
          </GlowingButton>
        )}

        {order.status === 'processing' && onUpdateStatus && (
          <GlowingButton
            variant='primary'
            icon={<Truck className='h-4 w-4' />}
            onClick={() => order.id && onUpdateStatus && onUpdateStatus(order.id, 'shipped')}
          >
            Mark as Shipped
          </GlowingButton>
        )}
      </ModalFooter>

      {/* Refund Modal */}
      {showRefundModal && (
        <Modal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          title='Process Refund'
          size='sm'
        >
          <ModalBody>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Refund Amount
                </label>
                <input
                  type='number'
                  value={refundAmount}
                  onChange={e => setRefundAmount(parseFloat(e.target.value))}
                  max={order.total || 0}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Maximum refund amount: {formatCurrency(order.total || 0)}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Refund Reason
                </label>
                <textarea
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  rows={3}
                  placeholder='Enter reason for refund...'
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <GlowingButton variant='secondary' onClick={() => setShowRefundModal(false)}>
              Cancel
            </GlowingButton>
            <GlowingButton
              variant='danger'
              onClick={() => {
                if (onRefund && order.id) {
                  onRefund(order.id, refundAmount);
                }
                setShowRefundModal(false);
              }}
            >
              Process Refund
            </GlowingButton>
          </ModalFooter>
        </Modal>
      )}
    </Modal>
  );
}
