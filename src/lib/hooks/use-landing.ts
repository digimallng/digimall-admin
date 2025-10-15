/**
 * Landing Page Management Hooks
 *
 * React Query hooks for landing page data management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landingService } from '../api/services/landing.service';
import type {
  // Hero Slides
  CreateHeroSlideRequest,
  UpdateHeroSlideRequest,
  // Platform Statistics
  UpdatePlatformStatisticsRequest,
  // Banners
  CreateBannerRequest,
  UpdateBannerRequest,
  // Category Deals
  CreateCategoryDealRequest,
  UpdateCategoryDealRequest,
  // Featured Vendors
  UpdateFeaturedVendorsRequest,
} from '../api/types/landing.types';

// ===== QUERY KEYS =====

export const landingKeys = {
  all: ['landing'] as const,
  heroSlides: () => [...landingKeys.all, 'hero-slides'] as const,
  heroSlide: (id: string) => [...landingKeys.heroSlides(), id] as const,
  statistics: () => [...landingKeys.all, 'statistics'] as const,
  banners: () => [...landingKeys.all, 'banners'] as const,
  banner: (id: string) => [...landingKeys.banners(), id] as const,
  categoryDeals: () => [...landingKeys.all, 'category-deals'] as const,
  categoryDeal: (id: string) => [...landingKeys.categoryDeals(), id] as const,
  featuredVendors: () => [...landingKeys.all, 'featured-vendors'] as const,
};

// ===== HERO SLIDES HOOKS =====

/**
 * Get all hero slides
 */
export function useHeroSlides() {
  return useQuery({
    queryKey: landingKeys.heroSlides(),
    queryFn: () => landingService.getHeroSlides(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get hero slide by ID
 */
export function useHeroSlide(id: string) {
  return useQuery({
    queryKey: landingKeys.heroSlide(id),
    queryFn: () => landingService.getHeroSlide(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create hero slide
 */
export function useCreateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHeroSlideRequest) => landingService.createHeroSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.heroSlides() });
    },
  });
}

/**
 * Update hero slide
 */
export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHeroSlideRequest }) =>
      landingService.updateHeroSlide(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.heroSlides() });
      queryClient.invalidateQueries({ queryKey: landingKeys.heroSlide(variables.id) });
    },
  });
}

/**
 * Delete hero slide
 */
export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landingService.deleteHeroSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.heroSlides() });
    },
  });
}

// ===== PLATFORM STATISTICS HOOKS =====

/**
 * Get platform statistics
 */
export function usePlatformStatistics() {
  return useQuery({
    queryKey: landingKeys.statistics(),
    queryFn: () => landingService.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Update platform statistics
 */
export function useUpdateStatistics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePlatformStatisticsRequest) =>
      landingService.updateStatistics(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.statistics() });
    },
  });
}

// ===== PROMOTIONAL BANNERS HOOKS =====

/**
 * Get all banners
 */
export function useBanners() {
  return useQuery({
    queryKey: landingKeys.banners(),
    queryFn: () => landingService.getBanners(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get banner by ID
 */
export function useBanner(id: string) {
  return useQuery({
    queryKey: landingKeys.banner(id),
    queryFn: () => landingService.getBanner(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create banner
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerRequest) => landingService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.banners() });
    },
  });
}

/**
 * Update banner
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerRequest }) =>
      landingService.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.banners() });
      queryClient.invalidateQueries({ queryKey: landingKeys.banner(variables.id) });
    },
  });
}

/**
 * Delete banner
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landingService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.banners() });
    },
  });
}

// ===== CATEGORY DEALS HOOKS =====

/**
 * Get all category deals
 */
export function useCategoryDeals() {
  return useQuery({
    queryKey: landingKeys.categoryDeals(),
    queryFn: () => landingService.getCategoryDeals(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get category deal by ID
 */
export function useCategoryDeal(id: string) {
  return useQuery({
    queryKey: landingKeys.categoryDeal(id),
    queryFn: () => landingService.getCategoryDeal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create category deal
 */
export function useCreateCategoryDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDealRequest) => landingService.createCategoryDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.categoryDeals() });
    },
  });
}

/**
 * Update category deal
 */
export function useUpdateCategoryDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDealRequest }) =>
      landingService.updateCategoryDeal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.categoryDeals() });
      queryClient.invalidateQueries({ queryKey: landingKeys.categoryDeal(variables.id) });
    },
  });
}

/**
 * Delete category deal
 */
export function useDeleteCategoryDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landingService.deleteCategoryDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.categoryDeals() });
    },
  });
}

// ===== FEATURED VENDORS HOOKS =====

/**
 * Get all featured vendors
 */
export function useFeaturedVendors() {
  return useQuery({
    queryKey: landingKeys.featuredVendors(),
    queryFn: () => landingService.getFeaturedVendors(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update featured vendors
 */
export function useUpdateFeaturedVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFeaturedVendorsRequest) =>
      landingService.updateFeaturedVendors(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landingKeys.featuredVendors() });
    },
  });
}
