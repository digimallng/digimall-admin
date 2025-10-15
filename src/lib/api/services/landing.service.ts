/**
 * Landing Page Management Service
 *
 * Service for managing landing page content based on ADMIN_API_DOCUMENTATION.md
 * Lines 4082-4420: Landing Page Management section
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  // Hero Slides
  HeroSlide,
  HeroSlidesResponse,
  HeroSlideResponse,
  CreateHeroSlideRequest,
  UpdateHeroSlideRequest,
  // Platform Statistics
  PlatformStatistics,
  PlatformStatisticsResponse,
  UpdatePlatformStatisticsRequest,
  // Banners
  Banner,
  BannerListResponse,
  BannerResponse,
  CreateBannerRequest,
  UpdateBannerRequest,
  // Category Deals
  CategoryDeal,
  CategoryDealsResponse,
  CategoryDealResponse,
  CreateCategoryDealRequest,
  UpdateCategoryDealRequest,
  // Featured Vendors
  FeaturedVendor,
  FeaturedVendorsResponse,
  UpdateFeaturedVendorsRequest,
} from '../types/landing.types';

/**
 * Landing Service Class
 */
class LandingService {
  // ===== HERO SLIDES =====

  /**
   * Get all hero slides
   * GET /admin/landing/hero-slides
   * @role ADMIN, SUPER_ADMIN
   */
  async getHeroSlides(): Promise<HeroSlidesResponse> {
    const response = await apiClient.get<HeroSlidesResponse>(
      API_ENDPOINTS.LANDING.GET_HERO_SLIDES
    );
    return response.data!;
  }

  /**
   * Get hero slide by ID
   * GET /admin/landing/hero-slides/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async getHeroSlide(id: string): Promise<HeroSlideResponse> {
    const response = await apiClient.get<HeroSlideResponse>(
      API_ENDPOINTS.LANDING.GET_HERO_SLIDE(id)
    );
    return response.data!;
  }

  /**
   * Create hero slide
   * POST /admin/landing/hero-slides
   * @role ADMIN, SUPER_ADMIN
   */
  async createHeroSlide(data: CreateHeroSlideRequest): Promise<HeroSlideResponse> {
    const response = await apiClient.post<HeroSlideResponse>(
      API_ENDPOINTS.LANDING.CREATE_HERO_SLIDE,
      data
    );
    return response.data!;
  }

  /**
   * Update hero slide
   * PUT /admin/landing/hero-slides/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async updateHeroSlide(
    id: string,
    data: UpdateHeroSlideRequest
  ): Promise<HeroSlideResponse> {
    const response = await apiClient.put<HeroSlideResponse>(
      API_ENDPOINTS.LANDING.UPDATE_HERO_SLIDE(id),
      data
    );
    return response.data!;
  }

  /**
   * Delete hero slide
   * DELETE /admin/landing/hero-slides/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async deleteHeroSlide(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LANDING.DELETE_HERO_SLIDE(id));
  }

  // ===== PLATFORM STATISTICS =====

  /**
   * Get current platform statistics
   * GET /admin/landing/statistics
   * @role ADMIN, SUPER_ADMIN
   */
  async getStatistics(): Promise<PlatformStatisticsResponse> {
    const response = await apiClient.get<PlatformStatisticsResponse>(
      API_ENDPOINTS.LANDING.GET_STATISTICS
    );
    return response.data!;
  }

  /**
   * Update platform statistics
   * POST /admin/landing/statistics
   * @role ADMIN, SUPER_ADMIN
   */
  async updateStatistics(
    data: UpdatePlatformStatisticsRequest
  ): Promise<PlatformStatisticsResponse> {
    const response = await apiClient.post<PlatformStatisticsResponse>(
      API_ENDPOINTS.LANDING.UPDATE_STATISTICS,
      data
    );
    return response.data!;
  }

  // ===== PROMOTIONAL BANNERS =====

  /**
   * Get all banners
   * GET /admin/landing/banners
   * @role ADMIN, SUPER_ADMIN
   */
  async getBanners(): Promise<BannerListResponse> {
    const response = await apiClient.get<BannerListResponse>(
      API_ENDPOINTS.LANDING.GET_BANNERS
    );
    return response.data!;
  }

  /**
   * Get banner by ID
   * GET /admin/landing/banners/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async getBanner(id: string): Promise<BannerResponse> {
    const response = await apiClient.get<BannerResponse>(
      API_ENDPOINTS.LANDING.GET_BANNER(id)
    );
    return response.data!;
  }

  /**
   * Create new banner
   * POST /admin/landing/banners
   * @role ADMIN, SUPER_ADMIN
   */
  async createBanner(data: CreateBannerRequest): Promise<BannerResponse> {
    const response = await apiClient.post<BannerResponse>(
      API_ENDPOINTS.LANDING.CREATE_BANNER,
      data
    );
    return response.data!;
  }

  /**
   * Update banner
   * PUT /admin/landing/banners/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async updateBanner(id: string, data: UpdateBannerRequest): Promise<BannerResponse> {
    const response = await apiClient.put<BannerResponse>(
      API_ENDPOINTS.LANDING.UPDATE_BANNER(id),
      data
    );
    return response.data!;
  }

  /**
   * Delete banner
   * DELETE /admin/landing/banners/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async deleteBanner(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LANDING.DELETE_BANNER(id));
  }

  // ===== CATEGORY DEALS =====

  /**
   * Get all category deals
   * GET /admin/landing/category-deals
   * @role ADMIN, SUPER_ADMIN
   */
  async getCategoryDeals(): Promise<CategoryDealsResponse> {
    const response = await apiClient.get<CategoryDealsResponse>(
      API_ENDPOINTS.LANDING.GET_CATEGORY_DEALS
    );
    return response.data!;
  }

  /**
   * Get category deal by ID
   * GET /admin/landing/category-deals/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async getCategoryDeal(id: string): Promise<CategoryDealResponse> {
    const response = await apiClient.get<CategoryDealResponse>(
      API_ENDPOINTS.LANDING.GET_CATEGORY_DEAL(id)
    );
    return response.data!;
  }

  /**
   * Create category deal
   * POST /admin/landing/category-deals
   * @role ADMIN, SUPER_ADMIN
   */
  async createCategoryDeal(
    data: CreateCategoryDealRequest
  ): Promise<CategoryDealResponse> {
    const response = await apiClient.post<CategoryDealResponse>(
      API_ENDPOINTS.LANDING.CREATE_CATEGORY_DEAL,
      data
    );
    return response.data!;
  }

  /**
   * Update category deal
   * PUT /admin/landing/category-deals/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async updateCategoryDeal(
    id: string,
    data: UpdateCategoryDealRequest
  ): Promise<CategoryDealResponse> {
    const response = await apiClient.put<CategoryDealResponse>(
      API_ENDPOINTS.LANDING.UPDATE_CATEGORY_DEAL(id),
      data
    );
    return response.data!;
  }

  /**
   * Delete category deal
   * DELETE /admin/landing/category-deals/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async deleteCategoryDeal(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LANDING.DELETE_CATEGORY_DEAL(id));
  }

  // ===== FEATURED VENDORS =====

  /**
   * Get all featured vendors
   * GET /admin/landing/featured-vendors
   * @role ADMIN, SUPER_ADMIN
   */
  async getFeaturedVendors(): Promise<FeaturedVendorsResponse> {
    const response = await apiClient.get<FeaturedVendorsResponse>(
      API_ENDPOINTS.LANDING.GET_FEATURED_VENDORS
    );
    return response.data!;
  }

  /**
   * Update featured vendors
   * PUT /admin/landing/featured-vendors
   * @role ADMIN, SUPER_ADMIN
   */
  async updateFeaturedVendors(
    data: UpdateFeaturedVendorsRequest
  ): Promise<FeaturedVendorsResponse> {
    const response = await apiClient.put<FeaturedVendorsResponse>(
      API_ENDPOINTS.LANDING.UPDATE_FEATURED_VENDORS,
      data
    );
    return response.data!;
  }

  // ===== VALIDATION HELPERS =====

  /**
   * Validate hero slide data
   */
  validateHeroSlide(data: CreateHeroSlideRequest | UpdateHeroSlideRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('headline' in data && (!data.headline || data.headline.trim().length === 0)) {
      errors.push('Headline is required');
    }

    if ('description' in data && (!data.description || data.description.trim().length === 0)) {
      errors.push('Description is required');
    }

    if ('heroImage' in data && (!data.heroImage || !this.isValidUrl(data.heroImage))) {
      errors.push('Valid hero image URL is required');
    }

    if ('ctaButtons' in data && (!data.ctaButtons || data.ctaButtons.length === 0)) {
      errors.push('At least one CTA button is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate banner data
   */
  validateBanner(data: CreateBannerRequest | UpdateBannerRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push('Banner title is required');
    }

    if ('imageUrl' in data && (!data.imageUrl || !this.isValidUrl(data.imageUrl))) {
      errors.push('Valid banner image URL is required');
    }

    if ('link' in data && data.link && !this.isValidUrl(data.link)) {
      errors.push('Link must be a valid URL');
    }

    if ('order' in data && data.order !== undefined && data.order < 0) {
      errors.push('Banner order must be a non-negative number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate category deal data
   */
  validateCategoryDeal(data: CreateCategoryDealRequest | UpdateCategoryDealRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push('Title is required');
    }

    if ('description' in data && (!data.description || data.description.trim().length === 0)) {
      errors.push('Description is required');
    }

    if ('imageUrl' in data && (!data.imageUrl || !this.isValidUrl(data.imageUrl))) {
      errors.push('Valid image URL is required');
    }

    if (
      'discountPercentage' in data &&
      (data.discountPercentage === undefined ||
        data.discountPercentage < 0 ||
        data.discountPercentage > 100)
    ) {
      errors.push('Discount percentage must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Allow relative URLs
      return url.startsWith('/');
    }
  }
}

// Export singleton instance
export const landingService = new LandingService();

// Export class for testing
export { LandingService };
