export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'delivery_failed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial_refund'
  | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vendor?: {
    id: string;
    businessName: string;
    user?: {
      id: string;
      email: string;
    };
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    images?: string[];
  };
  vendor?: {
    id: string;
    businessName: string;
  };
  quantity: number;
  price: number;
  total: number;
  status?: string;
}

export interface OrderDetail extends Order {
  billingAddress?: Address;
  shippingAddress?: Address;
  payment?: {
    id: string;
    method: string;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
  };
  timeline?: OrderEvent[];
  refunds?: Refund[];
  orderDate?: string;
  confirmedDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  expectedDeliveryDate?: string;
  shippingProvider?: string;
  customerNotes?: string;
  adminNotes?: string;
  statusHistory?: StatusHistory[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderEvent {
  id: string;
  event: string;
  description: string;
  createdAt: string;
  performedBy?: string;
}

export interface Refund {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

export interface StatusHistory {
  status: OrderStatus;
  date: string;
  updatedBy: string;
  note?: string;
}

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface OrderBulkAction {
  orderIds: string[];
  action: 'cancel' | 'process' | 'ship';
  reason?: string;
}

export interface OrderExport {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
  fields?: string[];
}

export interface RefundRequest {
  amount: number;
  reason: string;
  itemIds?: string[];
  note?: string;
}
