// ===== ADMIN API TYPES =====
// Comprehensive TypeScript interfaces for digiMall Admin API
// Enhanced with 300+ endpoint coverage

// ===== CORE ENUM TYPES =====

export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  STAFF = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  DELETED = 'deleted',
}

export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum VendorTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  VIP = 'vip',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'confirmed',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'disputed',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'processing',
  PAID = 'PAID',
  COMPLETED = 'completed',
  FAILED = 'FAILED',
  CANCELLED = 'cancelled',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'disputed',
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  COMMISSION = 'commission',
  PAYOUT = 'payout',
  ESCROW = 'escrow',
  WALLET_CREDIT = 'wallet_credit',
  WALLET_DEBIT = 'wallet_debit',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
}

// ===== CUSTOMER SUPPORT ENUMS =====

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_CUSTOMER = 'pending_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
  ON_HOLD = 'on_hold',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  ACCOUNT_ISSUES = 'account_issues',
  ORDER_PROBLEMS = 'order_problems',
  PAYMENT_ISSUES = 'payment_issues',
  PRODUCT_INQUIRY = 'product_inquiry',
  VENDOR_COMPLAINT = 'vendor_complaint',
  TECHNICAL_SUPPORT = 'technical_support',
  REFUND_REQUEST = 'refund_request',
  BILLING_DISPUTE = 'billing_dispute',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  SECURITY_CONCERN = 'security_concern',
  PRIVACY_INQUIRY = 'privacy_inquiry',
  GENERAL_INQUIRY = 'general_inquiry',
}

export enum TicketType {
  CUSTOMER_INQUIRY = 'customer_inquiry',
  VENDOR_INQUIRY = 'vendor_inquiry',
  INTERNAL_ISSUE = 'internal_issue',
  ESCALATION = 'escalation',
  COMPLAINT = 'complaint',
  FEEDBACK = 'feedback',
}

export enum SupportChannel {
  EMAIL = 'email',
  CHAT = 'chat',
  PHONE = 'phone',
  WEB_FORM = 'web_form',
  SOCIAL_MEDIA = 'social_media',
  IN_APP = 'in_app',
  API = 'api',
}

export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  AWAY = 'away',
  OFFLINE = 'offline',
  IN_TRAINING = 'in_training',
}

export enum EscalationReason {
  TECHNICAL_COMPLEXITY = 'technical_complexity',
  CUSTOMER_REQUEST = 'customer_request',
  POLICY_EXCEPTION = 'policy_exception',
  HIGH_VALUE_CUSTOMER = 'high_value_customer',
  LEGAL_CONCERN = 'legal_concern',
  SECURITY_ISSUE = 'security_issue',
  URGENT_REQUEST = 'urgent_request',
  AGENT_UNAVAILABLE = 'agent_unavailable',
}

// ===== BASE INTERFACE TYPES =====

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletableEntity {
  deletedAt?: string | null;
}

// ===== USER MANAGEMENT TYPES =====

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  role: UserRole | 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: UserStatus | 'active' | 'inactive' | 'suspended' | 'deleted';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  loginCount?: number;
  avatar?: string;
  profileImage?: string;
  
  // Enhanced user fields
  dateOfBirth?: string;
  gender?: string | 'MALE' | 'FEMALE' | 'OTHER';
  nin?: string;
  bvn?: string;
  
  // Security fields
  password?: string;
  emailVerificationCode?: string;
  phoneVerificationCode?: string;
  emailVerificationExpiry?: string;
  phoneVerificationExpiry?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  
  // Notification preferences
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  
  // Relations
  profile?: UserProfile;
  preferences?: UserPreferences;
  addresses?: Address[];
  permissions?: Permission[];
  vendorId?: string;
  vendor?: any;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'male' | 'female' | 'other';
  bio?: string;
  website?: string;
  socialLinks?: SocialLinks;
  timezone?: string;
  language?: string;
  currency?: string;
  address?: Address;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Address extends BaseEntity {
  userId?: string;
  type?: 'home' | 'work' | 'billing' | 'shipping' | 'other';
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole | 'customer' | 'vendor' | 'admin' | 'super_admin';
  password?: string;
  sendWelcomeEmail?: boolean;
  permissions?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: UserStatus | 'active' | 'inactive' | 'suspended' | 'deleted';
  role?: UserRole | 'customer' | 'vendor' | 'admin' | 'super_admin';
  avatar?: string;
  preferences?: Partial<UserPreferences>;
  profile?: Partial<UserProfile>;
  permissions?: string[];
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  suspendedUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  averageSessionDuration: number;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
}

// ===== VENDOR MANAGEMENT TYPES =====

export interface Vendor extends BaseEntity {
  userId?: string;
  user?: User;
  businessName: string;
  businessDescription?: string;
  businessType: string;
  businessCategory?: string;
  status: VendorStatus | 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  documentVerificationStatus?: 'pending' | 'verified' | 'rejected';
  tier?: VendorTier | string;
  verificationLevel?: number;
  rating?: number;
  averageRating?: string;
  reviewCount?: number;
  totalReviews?: number;
  totalSales?: number | string;
  totalOrders?: number;
  commission?: number;
  commissionRate?: string;
  
  // Business Information
  registrationNumber?: string;
  cacNumber?: string;
  taxId?: string;
  website?: string;
  businessWebsite?: string;
  establishedYear?: number;
  
  // Contact Information
  primaryPhone?: string;
  businessPhone?: string;
  alternativePhone?: string;
  supportEmail?: string;
  businessEmail?: string;
  
  // Address Information
  businessAddress?: string | Address;
  businessCity?: string;
  businessState?: string;
  pickupAddress?: Address;
  
  // Verification and Approval
  documentsSubmitted?: boolean;
  documentsVerified?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  submissionDate?: string;
  notes?: string;
  
  // Documents and Financial
  documents?: VendorDocument[];
  bankAccount?: BankAccount;
  paymentMethods?: PaymentMethod[];
  
  // Operational Settings
  operatingHours?: OperatingHours;
  shippingSettings?: ShippingSettings;
  returnPolicy?: string;
  
  // Analytics and Performance
  analytics?: VendorAnalytics;
  performance?: VendorPerformance;
  subscription?: VendorSubscription;
}

export interface VendorDocument extends BaseEntity {
  vendorId: string;
  type: 'CAC' | 'TAX_ID' | 'BANK_STATEMENT' | 'ID_CARD' | 'OTHER' | 'business_registration' | 'tax_certificate' | 'identity' | 'bank_statement' | 'utility_bill' | 'other';
  title?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'pending' | 'verified' | 'rejected';
  uploadedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  expiryDate?: string;
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'mobile_money' | 'card' | 'paypal' | 'crypto';
  provider: string;
  accountDetails: Record<string, any>;
  isDefault: boolean;
  isActive: boolean;
}

export interface OperatingHours {
  timezone: string;
  schedule: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      description?: string;
    }>;
  }>;
  holidays: Array<{
    date: string;
    description: string;
  }>;
}

export interface ShippingSettings {
  freeShippingThreshold?: number;
  domesticShipping: {
    enabled: boolean;
    cost: number;
    estimatedDays: number;
  };
  internationalShipping: {
    enabled: boolean;
    cost: number;
    estimatedDays: number;
    countries: string[];
  };
  expressShipping: {
    enabled: boolean;
    cost: number;
    estimatedDays: number;
  };
  pickupOption: {
    enabled: boolean;
    instructions?: string;
    location?: Address;
  };
}

export interface VendorAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    salesCount: number;
    revenue: number;
  }>;
  recentSales: Array<{
    date: string;
    amount: number;
  }>;
}

export interface VendorSubscription {
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: string[];
  limits: Record<string, number>;
}

export interface VendorPerformance {
  vendorId: string;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  responseTime: number; // in minutes
  lastUpdated: string;
}

export interface CreateVendorRequest {
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessType: string;
  businessCategory?: string;
  primaryPhone?: string;
  businessPhone?: string;
  businessAddress?: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateVendorRequest {
  businessName?: string;
  businessDescription?: string;
  businessType?: string;
  businessCategory?: string;
  primaryPhone?: string;
  businessPhone?: string;
  alternativePhone?: string;
  supportEmail?: string;
  businessEmail?: string;
  website?: string;
  tier?: VendorTier | string;
  commission?: number;
  commissionRate?: string;
  returnPolicy?: string;
  operatingHours?: OperatingHours;
  shippingSettings?: ShippingSettings;
}

export interface VendorApprovalRequest {
  status: VendorStatus | 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  notes?: string;
  tier?: VendorTier | string;
  commission?: number;
  commissionRate?: string;
  verificationLevel?: number;
}

export interface VendorStatistics {
  totalVendors: number;
  activeVendors: number;
  pendingApprovals: number;
  verifiedVendors: number;
  suspendedVendors: number;
  vendorsByStatus: Record<string, number>;
  vendorsByTier: Record<string, number>;
  topVendorsByRevenue: Array<{
    vendorId: string;
    businessName: string;
    revenue: number;
    orderCount: number;
  }>;
  averageApprovalTime: number;
  monthlyRegistrations: Array<{
    month: string;
    count: number;
  }>;
}

// ===== PRODUCT MANAGEMENT TYPES =====

export interface Product extends BaseEntity {
  vendorId: string;
  vendor?: Vendor;
  categoryId: string;
  category?: Category;
  
  // Basic Information
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  slug?: string;
  
  // Pricing
  price: number;
  basePrice?: number;
  salePrice?: number;
  comparePrice?: number;
  costPrice?: number;
  currency?: string;
  taxable?: boolean;
  taxRate?: number;
  
  // Inventory
  quantity: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackQuantity: boolean;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  reservedQuantity?: number;
  soldQuantity?: number;
  
  // Status and Visibility
  status: ProductStatus | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  isVisible?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  
  // Media and Content
  images: ProductImage[];
  videos?: ProductVideo[];
  documents?: ProductDocument[];
  
  // Attributes and Variants
  attributes: ProductAttribute[];
  variants?: ProductVariant[];
  tags: string[];
  
  // SEO
  seo?: ProductSEO;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Shipping and Dimensions
  weight?: number;
  dimensions?: ProductDimensions;
  shippingClass?: string;
  
  // Analytics
  viewCount?: number;
  wishlistCount?: number;
  rating?: number;
  reviewCount?: number;
  
  // Timestamps
  publishedAt?: string;
  lastViewAt?: string;
  
  // Approval and Moderation
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  moderationNotes?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isMain: boolean;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  sortOrder: number;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  isVisible: boolean;
  featured?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  color?: string;
  
  // Statistics (computed fields)
  productCount?: number;
  totalSales?: number;
  averageRating?: number;
  topVendors?: string[];
}

export interface CategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

// Plan types
export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  sortOrder: number;
  maxProducts: number;
  maxOrders: number;
  commissionRate: number;
  color: string | null;
  icon: string;
  badge?: string;
  maxImages: number;
  maxVideos: number;
  maxStorageGB: number;
  maxSupportTickets: number;
  hasAnalytics: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
  hasAdvancedReporting: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields
  subscribers?: number;
  revenue?: number;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'WALLET';
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  customer: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  vendorId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
  vendor: Vendor;
}

// Analytics types
export interface DashboardAnalytics {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersToday: number;
  pendingVerifications: number;
  // Optional fields that may be computed on frontend
  userGrowth?: number;
  vendorGrowth?: number;
  productGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  recentOrders?: Order[];
  topCategories?: CategoryStats[];
  revenueData?: RevenueData[];
  userRegistrations?: UserRegistrationData[];
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  productCount: number;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  growth?: number;
}

export interface UserRegistrationData {
  date: string;
  customers: number;
  vendors: number;
}

// ===== ESCROW MANAGEMENT TYPES =====

export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  ACTIVE = 'active',
  PENDING = 'pending',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum EscrowType {
  ORDER_PAYMENT = 'order_payment',
  SERVICE_PAYMENT = 'service_payment',
  DEPOSIT = 'deposit',
  MILESTONE = 'milestone',
  CUSTOM = 'custom'
}

export enum EscrowAction {
  RELEASE = 'release',
  REFUND = 'refund',
  EXTEND = 'extend',
  CANCEL = 'cancel',
  DISPUTE = 'dispute',
  FORCE_RELEASE = 'force_release',
  PARTIAL_RELEASE = 'partial_release'
}

export enum DisputeReason {
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_DAMAGED = 'product_damaged',
  PRODUCT_NOT_AS_DESCRIBED = 'product_not_as_described',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  SERVICE_UNSATISFACTORY = 'service_unsatisfactory',
  FRAUDULENT_ACTIVITY = 'fraudulent_activity',
  BILLING_DISPUTE = 'billing_dispute',
  OTHER = 'other'
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export enum DisputeResolution {
  RELEASE_TO_VENDOR = 'release_to_vendor',
  REFUND_TO_CUSTOMER = 'refund_to_customer',
  PARTIAL_REFUND = 'partial_refund',
  NO_ACTION = 'no_action'
}

export interface Escrow {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  type: EscrowType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  metadata?: Record<string, any>;
  
  // Related entities
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  vendor?: {
    id: string;
    name: string;
    email: string;
    businessName?: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  dispute?: EscrowDispute;
  transactions?: EscrowTransaction[];
}

export interface EscrowDispute {
  id: string;
  escrowId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  description: string;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  
  // Evidence
  customerEvidence?: DisputeEvidence[];
  vendorEvidence?: DisputeEvidence[];
  adminNotes?: string;
}

export interface DisputeEvidence {
  id: string;
  type: 'image' | 'document' | 'text';
  url?: string;
  content?: string;
  description?: string;
  uploadedAt: string;
}

export interface EscrowTransaction {
  id: string;
  escrowId: string;
  type: 'fund' | 'release' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface EscrowFilters {
  search?: string;
  status?: EscrowStatus;
  type?: EscrowType;
  customerId?: string;
  vendorId?: string;
  minAmount?: number;
  maxAmount?: number;
  createdAfter?: string;
  createdBefore?: string;
  startDate?: string;
  endDate?: string;
  expiringWithinHours?: number;
  disputedOnly?: boolean;
  overdueOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EscrowActionRequest {
  action: EscrowAction;
  amount?: number; // For partial releases/refunds
  reason?: string;
  notes?: string;
  expiryExtension?: number; // In days
  metadata?: Record<string, any>;
}

export interface CreateDisputeRequest {
  escrowId: string;
  reason: DisputeReason;
  description: string;
  evidence?: Array<{
    type: 'image' | 'document' | 'text';
    url?: string;
    content?: string;
    description?: string;
  }>;
}

export interface BulkEscrowActionRequest {
  escrowIds: string[];
  action: EscrowAction;
  reason?: string;
  notes?: string;
}

export interface EscrowStatistics {
  total: number;
  totalValue: number;
  byStatus: Record<EscrowStatus, { count: number; value: number }>;
  byType: Record<EscrowType, { count: number; value: number }>;
  averageAmount: number;
  averageProcessingTime: number; // In hours
  disputeRate: number; // Percentage
  expiringSoon: number; // Count of escrows expiring within 24 hours
  monthlyTrend: Array<{
    month: string;
    count: number;
    value: number;
    disputes: number;
  }>;
}

export interface EscrowDashboard {
  statistics: EscrowStatistics;
  recentActivity: {
    newEscrows: Escrow[];
    recentReleases: Escrow[];
    recentDisputes: EscrowDispute[];
    expiringSoon: Escrow[];
  };
  performance: {
    averageProcessingTime: number;
    successRate: number;
    disputeResolutionTime: number;
    customerSatisfaction: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    escrowId?: string;
    createdAt: string;
  }>;
}

export interface EscrowAnalytics {
  performance: {
    totalProcessed: number;
    averageProcessingTime: number;
    successRate: number;
    volumeTrend: Array<{
      date: string;
      count: number;
      value: number;
    }>;
  };
  disputes: {
    totalDisputes: number;
    disputeRate: number;
    averageResolutionTime: number;
    resolutionBreakdown: Record<DisputeResolution, number>;
    reasonBreakdown: Record<DisputeReason, number>;
    trend: Array<{
      date: string;
      disputes: number;
      resolved: number;
    }>;
  };
  timeouts: {
    totalTimeouts: number;
    timeoutRate: number;
    averageTimeToExpiry: number;
    preventionActions: number;
    trend: Array<{
      date: string;
      timeouts: number;
      prevented: number;
    }>;
  };
}

export interface EscrowComplianceReport {
  reportId: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalEscrows: number;
    totalValue: number;
    complianceScore: number;
    issuesFound: number;
  };
  metrics: {
    averageHoldTime: number;
    disputeResolutionCompliance: number;
    timeoutCompliance: number;
    documentationCompliance: number;
  };
  issues: Array<{
    escrowId: string;
    type: 'timeout' | 'documentation' | 'process' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  recommendations: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit?: number;
  // Additional fields for compatibility
  currentPage?: number;
  totalPages?: number;
}

export interface UsersPaginatedResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

export interface VendorsPaginatedResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  pages: number;
}

export interface CategoriesPaginatedResponse {
  categories: Category[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductsPaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface UserFilters {
  role?: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  query?: string; // Changed from search to query to match API
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface VendorFilters {
  status?: 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  businessType?: string;
  search?: string;
  businessName?: string;
  email?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProductFilters {
  vendorId?: string;
  categoryId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  search?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryFilters {
  parentId?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface OrderFilters {
  customerId?: string;
  vendorId?: string;
  status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: 'CARD' | 'BANK_TRANSFER' | 'WALLET';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PlanFilters {
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ===== CUSTOMER SUPPORT TYPES =====

export interface SupportTicket extends BaseEntity {
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  type: TicketType;
  channel: SupportChannel;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  assignedAgentId?: string;
  teamId?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  tags: string[];
  orderId?: string;
  productId?: string;
  vendorId?: string;
  attachments: string[];
  responses: TicketResponse[];
  internalNotes?: string;
  slaBreached: boolean;
  escalationLevel: number;
  followUpDate?: string;
  metadata?: Record<string, any>;
  customerTimezone?: string;
  preferredContactMethod?: SupportChannel;
  expectedResolutionHours?: number;
}

export interface TicketResponse extends BaseEntity {
  ticketId: string;
  content: string;
  responseType: 'public' | 'internal';
  agentId: string;
  agentName?: string;
  attachments: string[];
  scheduledAt?: string;
  templateId?: string;
}

export interface SupportAgent extends BaseEntity {
  name: string;
  email: string;
  status: AgentStatus;
  teamId?: string;
  skills: string[];
  currentWorkload: number;
  maxWorkload: number;
  averageResolutionTime: number;
  customerSatisfactionRating: number;
  totalTicketsResolved: number;
  activeTickets: string[];
  timezone: string;
  languagesSpoken: string[];
  certifications: string[];
  joinedAt: string;
  lastActiveAt: string;
}

export interface SupportTeam extends BaseEntity {
  name: string;
  description: string;
  isActive: boolean;
  leadAgentId?: string;
  agentIds: string[];
  skills: string[];
  currentWorkload: number;
  maxWorkload: number;
  averageResolutionTime: number;
  customerSatisfactionRating: number;
  totalTicketsResolved: number;
  operatingHours: {
    timezone: string;
    schedule: Record<string, { start: string; end: string; isActive: boolean }>;
  };
}

export interface KnowledgeBaseArticle extends BaseEntity {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  priority: number;
  relatedFAQs: string[];
  audience: 'customer' | 'agent' | 'both';
  viewCount: number;
  helpfulCount: number;
  authorId: string;
  authorName?: string;
  lastReviewedAt?: string;
  publishedAt?: string;
}

export interface SLAConfiguration extends BaseEntity {
  name: string;
  description: string;
  firstResponseTimeHours: number;
  resolutionTimeHours: number;
  escalationTimeHours?: number;
  applicablePriorities: TicketPriority[];
  applicableCategories: TicketCategory[];
  customerTiers?: string[];
  isActive: boolean;
  businessHoursOnly: boolean;
  businessHours?: {
    timezone: string;
    schedule: Record<string, { start: string; end: string; isActive: boolean }>;
  };
}

export interface CustomerSatisfactionRating extends BaseEntity {
  ticketId: string;
  rating: number;
  feedback?: string;
  agentRating?: number;
  responseTimeRating?: number;
  resolutionQualityRating?: number;
  wouldRecommend?: boolean;
  customerId: string;
  agentId?: string;
}

export interface ResponseTemplate extends BaseEntity {
  name: string;
  subject?: string;
  content: string;
  category: TicketCategory;
  isActive: boolean;
  usageCount: number;
  authorId: string;
  authorName?: string;
  variables: string[];
  tags: string[];
}

export interface SupportDashboard {
  overview: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    escalatedTickets: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    customerSatisfactionScore: number;
    slaComplianceRate: number;
  };
  recentActivity: {
    recentTickets: SupportTicket[];
    recentResolutions: SupportTicket[];
    urgentTickets: SupportTicket[];
  };
  teamMetrics: {
    agentsOnline: number;
    totalAgents: number;
    avgAgentWorkload: number;
    topPerformingAgents: SupportAgent[];
  };
  trends: {
    ticketVolumeByDate: Array<{ date: string; count: number }>;
    resolutionTimeByDate: Array<{ date: string; avgTime: number }>;
    satisfactionByDate: Array<{ date: string; avgRating: number }>;
    channelDistribution: Array<{ channel: SupportChannel; count: number; percentage: number }>;
  };
}

export interface SupportAnalytics {
  period: {
    startDate: string;
    endDate: string;
    groupBy: 'hour' | 'day' | 'week' | 'month';
  };
  ticketMetrics: {
    totalTickets: number;
    ticketsByStatus: Record<TicketStatus, number>;
    ticketsByPriority: Record<TicketPriority, number>;
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByChannel: Record<SupportChannel, number>;
    trendsData: Array<{
      date: string;
      totalTickets: number;
      resolvedTickets: number;
      avgResolutionTime: number;
      avgResponseTime: number;
    }>;
  };
  performanceMetrics: {
    avgResponseTime: number;
    avgResolutionTime: number;
    firstContactResolutionRate: number;
    escalationRate: number;
    reopenRate: number;
    slaComplianceRate: number;
  };
  satisfactionMetrics: {
    avgSatisfactionRating: number;
    responseDistribution: Record<number, number>;
    wouldRecommendRate: number;
    feedbackCount: number;
  };
  agentMetrics: {
    totalAgents: number;
    agentsAvailable: number;
    avgAgentWorkload: number;
    topPerformers: SupportAgent[];
    workloadDistribution: Array<{
      agentId: string;
      agentName: string;
      activeTickets: number;
      resolvedToday: number;
      avgResolutionTime: number;
      satisfactionRating: number;
    }>;
  };
}

// Filter and Query Interfaces
export interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  type?: TicketType;
  channel?: SupportChannel;
  customerId?: string;
  assignedAgentId?: string;
  teamId?: string;
  createdAfter?: string;
  createdBefore?: string;
  unassignedOnly?: boolean;
  overdueOnly?: boolean;
  escalatedOnly?: boolean;
  followUpRequired?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AgentFilters {
  search?: string;
  status?: AgentStatus;
  teamId?: string;
  skills?: string[];
  availableOnly?: boolean;
  hasCapacity?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SupportAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  teamId?: string;
  agentId?: string;
  includeSatisfaction?: boolean;
  includeResolutionTime?: boolean;
  includeWorkload?: boolean;
}

// Request/Response DTOs
export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  type: TicketType;
  channel: SupportChannel;
  priority?: TicketPriority;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  orderId?: string;
  productId?: string;
  vendorId?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
  customerTimezone?: string;
  preferredContactMethod?: SupportChannel;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedAgentId?: string;
  teamId?: string;
  internalNotes?: string;
  tags?: string[];
  expectedResolutionHours?: number;
  followUpDate?: string;
}

export interface TicketResponseRequest {
  content: string;
  responseType?: 'public' | 'internal';
  attachments?: string[];
  autoClose?: boolean;
  notifyCustomer?: boolean;
  scheduledAt?: string;
  templateId?: string;
}

export interface EscalateTicketRequest {
  reason: EscalationReason;
  notes: string;
  escalateTo?: string;
  newPriority?: TicketPriority;
  urgentNotification?: boolean;
}

export interface BulkTicketActionRequest {
  ticketIds: string[];
  action: 'assign' | 'close' | 'escalate' | 'update_priority' | 'add_tags' | 'update_status';
  actionParams?: Record<string, any>;
  reason: string;
  notifyCustomers?: boolean;
}

// ===== CATEGORIES MANAGEMENT =====

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  banner?: string;
  parentId?: string;
  level: number;
  position: number;
  sortOrder: number;
  status: CategoryStatus;
  isActive: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  allowProducts: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  commissionRate?: number;
  productCount: number;
  activeProductCount: number;
  attributes?: Record<string, any>;
  filters?: Record<string, any>;
  customFields?: Record<string, any>;
  adminNotes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relationships
  parent?: Category;
  children?: Category[];
  
  // Computed properties
  fullPath: string;
  breadcrumb: string[];
  hasChildren: boolean;
  isLeaf: boolean;
  isRoot: boolean;
  depth: number;
  displayName: string;
  productDensity: number;
  isPopular: boolean;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
  featured?: boolean;
  showInMenu?: boolean;
  showInHomepage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
  parentId?: string;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
  featured?: boolean;
  showInMenu?: boolean;
  showInHomepage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  metadata?: Record<string, any>;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  includeChildren?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryBulkActionDto {
  categoryIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature';
}

export interface CategoryReorderDto {
  categoryId: string;
  newPosition: number;
  parentId?: string;
}

export interface CategoryMoveDto {
  parentId?: string;
}

export interface CategoryStatistics {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  totalProducts: number;
  totalSales: number;
  categoriesGrowth: number;
  productsGrowth: number;
  salesGrowth: number;
}

export interface CategoryPerformance {
  sales: number;
  orders: number;
  products: number;
  growth: number;
  topProducts: any[];
  salesTrend: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  level: number;
  children: CategoryTree[];
  productCount: number;
  isActive: boolean;
  sortOrder: number;
}

export interface UploadResponse {
  url: string;
  cdnUrl: string;
  key: string;
  bucket: string;
  size: number;
}