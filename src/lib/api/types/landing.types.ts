/**
 * Landing Page Management Types
 *
 * Type definitions for landing page content based on ADMIN_API_DOCUMENTATION.md
 * Lines 4082-4420: Landing Page Management section
 */

// ===== HERO SLIDES =====

export interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline';
  icon?: string;
}

export interface FloatingProduct {
  imageUrl: string;
  link: string;
  alt: string;
  position: string;
}

export interface HeroSlide {
  _id: string;
  eventBadge?: string;
  headline: string;
  description: string;
  ctaButtons: CTAButton[];
  heroImage: string;
  mobileImage?: string;
  floatingProducts?: FloatingProduct[];
  theme: 'light' | 'dark' | 'colorful';
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  analytics?: {
    views: number;
    clicks: number;
    ctr: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlidesResponse {
  success: boolean;
  data: HeroSlide[];
  total: number;
}

export interface HeroSlideResponse {
  success: boolean;
  data: HeroSlide;
}

export interface CreateHeroSlideRequest {
  eventBadge?: string;
  headline: string;
  description: string;
  ctaButtons: CTAButton[];
  heroImage: string;
  mobileImage?: string;
  floatingProducts?: FloatingProduct[];
  theme: 'light' | 'dark' | 'colorful';
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface UpdateHeroSlideRequest {
  eventBadge?: string;
  headline?: string;
  description?: string;
  ctaButtons?: CTAButton[];
  heroImage?: string;
  mobileImage?: string;
  floatingProducts?: FloatingProduct[];
  theme?: 'light' | 'dark' | 'colorful';
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
}

// ===== PLATFORM STATISTICS =====

export interface PlatformStatistics {
  _id: string;
  totalVendors: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeDeals: number;
  averageRating: number;
  totalReviews: number;
  orderGrowthRate: number;
  revenueGrowthRate: number;
  vendorGrowthRate: number;
  customerGrowthRate: number;
  citiesCovered: number;
  averageDeliveryTime: number;
  customerSatisfactionRate: number;
  periodLabel: string;
  notes?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStatisticsResponse {
  success: boolean;
  data: PlatformStatistics;
}

export interface UpdatePlatformStatisticsRequest {
  totalVendors?: number;
  totalCustomers?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  activeDeals?: number;
  averageRating?: number;
  totalReviews?: number;
  orderGrowthRate?: number;
  revenueGrowthRate?: number;
  vendorGrowthRate?: number;
  customerGrowthRate?: number;
  citiesCovered?: number;
  averageDeliveryTime?: number;
  customerSatisfactionRate?: number;
  periodLabel?: string;
  notes?: string;
}

// ===== PROMOTIONAL BANNERS =====

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  type: 'full_width' | 'half_width' | 'sidebar' | 'floating';
  position: 'top' | 'middle' | 'bottom' | 'sidebar_right' | 'sidebar_left';
  imageUrl: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  link?: string;
  linkTarget: '_self' | '_blank';
  ctaText?: string;
  backgroundColor?: string;
  textColor?: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience: 'all' | 'new_users' | 'returning_users' | 'premium_users';
  categoryId?: string;
  isDismissible: boolean;
  maxImpressions?: number;
  animationType?: 'fade-in' | 'slide-in' | 'zoom-in' | 'none';
  analytics?: {
    views: number;
    clicks: number;
    ctr: number;
    impressions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BannerListResponse {
  success: boolean;
  data: Banner[];
  total: number;
}

export interface BannerResponse {
  success: boolean;
  data: Banner;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  type: 'full_width' | 'half_width' | 'sidebar' | 'floating';
  position: 'top' | 'middle' | 'bottom' | 'sidebar_right' | 'sidebar_left';
  imageUrl: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  link?: string;
  linkTarget?: '_self' | '_blank';
  ctaText?: string;
  backgroundColor?: string;
  textColor?: string;
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience?: 'all' | 'new_users' | 'returning_users' | 'premium_users';
  categoryId?: string;
  isDismissible?: boolean;
  maxImpressions?: number;
  animationType?: 'fade-in' | 'slide-in' | 'zoom-in' | 'none';
}

export interface UpdateBannerRequest {
  title?: string;
  subtitle?: string;
  type?: 'full_width' | 'half_width' | 'sidebar' | 'floating';
  position?: 'top' | 'middle' | 'bottom' | 'sidebar_right' | 'sidebar_left';
  imageUrl?: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  link?: string;
  linkTarget?: '_self' | '_blank';
  ctaText?: string;
  backgroundColor?: string;
  textColor?: string;
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience?: 'all' | 'new_users' | 'returning_users' | 'premium_users';
  categoryId?: string;
  isDismissible?: boolean;
  maxImpressions?: number;
  animationType?: 'fade-in' | 'slide-in' | 'zoom-in' | 'none';
}

// ===== CATEGORY DEALS =====

export interface CategoryDeal {
  _id: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  };
  title: string;
  description: string;
  discountPercentage: number;
  imageUrl: string;
  mobileImageUrl?: string;
  thumbnailUrl?: string;
  link: string;
  badgeType: 'hot' | 'new' | 'sale' | 'limited' | 'exclusive';
  customBadgeText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  productCount: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  backgroundColor?: string;
  textColor?: string;
  termsAndConditions?: string;
  participatingVendors?: string[];
  analytics?: {
    views: number;
    clicks: number;
    ctr: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDealsResponse {
  success: boolean;
  data: CategoryDeal[];
  total: number;
}

export interface CategoryDealResponse {
  success: boolean;
  data: CategoryDeal;
}

export interface CreateCategoryDealRequest {
  categoryId: string;
  title: string;
  description: string;
  discountPercentage: number;
  imageUrl: string;
  mobileImageUrl?: string;
  thumbnailUrl?: string;
  link: string;
  badgeType: 'hot' | 'new' | 'sale' | 'limited' | 'exclusive';
  customBadgeText?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  productCount?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  backgroundColor?: string;
  textColor?: string;
  termsAndConditions?: string;
  participatingVendors?: string[];
}

export interface UpdateCategoryDealRequest {
  categoryId?: string;
  title?: string;
  description?: string;
  discountPercentage?: number;
  imageUrl?: string;
  mobileImageUrl?: string;
  thumbnailUrl?: string;
  link?: string;
  badgeType?: 'hot' | 'new' | 'sale' | 'limited' | 'exclusive';
  customBadgeText?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  productCount?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  backgroundColor?: string;
  textColor?: string;
  termsAndConditions?: string;
  participatingVendors?: string[];
}

// ===== FEATURED VENDORS =====

export interface TrendingScoreBreakdown {
  salesGrowth: { score: number; weight: number };
  customerAcquisition: { score: number; weight: number };
  reviews: { score: number; weight: number };
  responseRate: { score: number; weight: number };
  viewGrowth: { score: number; weight: number };
}

export interface VendorPerformanceMetrics {
  salesGrowth: number;
  customerAcquisitionRate: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  viewGrowth: number;
}

export interface FeaturedVendor {
  _id: string;
  vendorId: {
    _id: string;
    businessInfo: {
      businessName: string;
      logo?: string;
      description?: string;
    };
    rating: number;
    totalReviews: number;
  };
  trendingScore: number;
  trendingGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  performanceLevel: 'Excellent' | 'Good' | 'Average' | 'Below Average';
  performanceMetrics: VendorPerformanceMetrics;
  scoreBreakdown: TrendingScoreBreakdown;
  isManuallyFeatured: boolean;
  manualFeatureOrder?: number;
  manualFeatureExpiry?: string;
  lastCalculated: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedVendorsResponse {
  success: boolean;
  data: FeaturedVendor[];
  total: number;
  algorithmInfo: {
    lastRun: string;
    nextRun: string;
    weights: {
      salesGrowth: number;
      customerAcquisition: number;
      reviews: number;
      responseRate: number;
      viewGrowth: number;
    };
  };
}

export interface UpdateFeaturedVendorsRequest {
  vendorIds?: string[];
  manualFeatures?: {
    vendorId: string;
    order: number;
    expiry?: string;
  }[];
}
