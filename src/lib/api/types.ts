// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  // Additional fields from API
  password?: string;
  emailVerificationCode?: string;
  phoneVerificationCode?: string;
  emailVerificationExpiry?: string;
  phoneVerificationExpiry?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: string;
  nin?: string;
  bvn?: string;
  lastLoginIp?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  preferences?: any;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  vendorId?: string;
  vendor?: any;
  addresses?: any[];
}

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: Address;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Vendor types
export interface Vendor {
  id: string;
  userId?: string;
  businessName: string;
  businessType: string;
  businessDescription?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  taxId?: string;
  registrationNumber?: string;
  cacNumber?: string;
  website?: string;
  status: 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  documentVerificationStatus?: 'pending' | 'verified' | 'rejected';
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
  tier?: string;
  totalSales?: string;
  totalOrders?: number;
  averageRating?: string;
  totalReviews?: number;
  commissionRate?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  documents?: VendorDocument[];
  performance?: VendorPerformance;
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  type: 'CAC' | 'TAX_ID' | 'BANK_STATEMENT' | 'ID_CARD' | 'OTHER';
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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

// Product types
export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
  tags: string[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  seo?: ProductSEO;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  category: Category;
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