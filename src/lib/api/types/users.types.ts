/**
 * Users Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 6 user management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams, Address, AddressSchema } from './shared.types';
import { UserRoleSchema, UserStatusSchema } from './enums.types';

// ===== BACKEND TYPES (Actual API Response) =====

/**
 * Backend user structure (as returned by the API)
 * This matches the actual backend response, not the documentation
 */
export interface BackendUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: string; // Backend returns various statuses like 'verified', 'pending_verification', etc.
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  identityVerificationStatus?: string;
  is2FAEnabled: boolean;
  loginAttempts?: number;
  isVendorApproved?: boolean;
  pendingVendorApproval?: boolean;
  vendorApplicationDate?: string;
  vendorApprovalDate?: string;
  vendorApprovedBy?: string;
  vendorId?: string;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    recipientCode: string;
    isVerified: boolean;
    verifiedAt?: string;
    _id?: string;
  };
  timezone?: string;
  language?: string;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: string;
      showOnlineStatus: boolean;
    };
    marketing: {
      emailMarketing: boolean;
      smsMarketing: boolean;
    };
    _id?: string;
  };
  searchKeywords?: string[];
  socialProviders?: any[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string | null;
  __v?: number;
}

/**
 * Backend user list response structure
 */
export interface BackendUserListResponse {
  users: BackendUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== USER ENTITY =====

/**
 * User profile
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
}

export const UserProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  avatar: z.string().url().optional(),
});

/**
 * User preferences
 */
export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  marketing: {
    email: boolean;
    sms: boolean;
  };
}

export const UserPreferencesSchema = z.object({
  language: z.string(),
  currency: z.string(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  marketing: z.object({
    email: z.boolean(),
    sms: z.boolean(),
  }),
});

/**
 * User statistics
 */
export interface UserStatistics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  wishlistItems: number;
  cartItems: number;
}

export const UserStatisticsSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  completedOrders: z.number().int().nonnegative(),
  cancelledOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
  wishlistItems: z.number().int().nonnegative(),
  cartItems: z.number().int().nonnegative(),
});

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  profile: UserProfile;
  addresses: Address[];
  preferences: UserPreferences;
  statistics: UserStatistics;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  suspendedBy?: string;
  verifiedAt?: string;
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  profile: UserProfileSchema,
  addresses: z.array(AddressSchema),
  preferences: UserPreferencesSchema,
  statistics: UserStatisticsSchema,
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  lastLoginAt: z.string().datetime().optional(),
  lastLoginIp: z.string().optional(),
  suspendedAt: z.string().datetime().optional(),
  suspensionReason: z.string().optional(),
  suspendedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all users query parameters
 */
export interface GetAllUsersParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  role?: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  emailVerified?: boolean;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllUsersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  emailVerified: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get user statistics query parameters
 */
export interface GetUserStatisticsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const GetUserStatisticsParamsSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Update user request
 */
export interface UpdateUserRequest {
  profile?: Partial<UserProfile>;
  addresses?: Address[];
  preferences?: Partial<UserPreferences>;
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
}

export const UpdateUserRequestSchema = z.object({
  profile: UserProfileSchema.partial().optional(),
  addresses: z.array(AddressSchema).optional(),
  preferences: UserPreferencesSchema.partial().optional(),
  status: UserStatusSchema.optional(),
});

/**
 * Suspend/Unsuspend user request
 */
export interface UserSuspensionRequest {
  action: 'suspend' | 'unsuspend';
  reason: string;
  duration?: number;
  notifyUser?: boolean;
}

export const UserSuspensionRequestSchema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  reason: z.string().min(1),
  duration: z.number().int().positive().optional(),
  notifyUser: z.boolean().optional(),
});

/**
 * Delete user request
 */
export interface DeleteUserRequest {
  reason: string;
  deleteData?: boolean;
  notifyUser?: boolean;
}

export const DeleteUserRequestSchema = z.object({
  reason: z.string().min(1),
  deleteData: z.boolean().optional(),
  notifyUser: z.boolean().optional(),
});

/**
 * Verify user email request
 */
export interface VerifyUserEmailRequest {
  userId: string;
  manualVerification?: boolean;
}

export const VerifyUserEmailRequestSchema = z.object({
  userId: z.string(),
  manualVerification: z.boolean().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * User list response
 */
export interface UserListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const UserListResponseSchema = z.object({
  data: z.array(UserSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Update user response
 */
export interface UpdateUserResponse {
  message: string;
  data: {
    id: string;
    email: string;
    updatedFields: string[];
    updatedBy: string;
    updatedAt: string;
  };
}

export const UpdateUserResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    email: z.string().email(),
    updatedFields: z.array(z.string()),
    updatedBy: z.string(),
    updatedAt: z.string().datetime(),
  }),
});

/**
 * User suspension response
 */
export interface UserSuspensionResponse {
  message: string;
  data: {
    id: string;
    email: string;
    status: string;
    suspendedAt?: string;
    suspensionReason?: string;
    suspendedBy?: string;
  };
}

export const UserSuspensionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    email: z.string().email(),
    status: z.string(),
    suspendedAt: z.string().datetime().optional(),
    suspensionReason: z.string().optional(),
    suspendedBy: z.string().optional(),
  }),
});

/**
 * Delete user response
 */
export interface DeleteUserResponse {
  message: string;
  data: {
    id: string;
    email: string;
    deletedAt: string;
    deletedBy: string;
  };
}

export const DeleteUserResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    email: z.string().email(),
    deletedAt: z.string().datetime(),
    deletedBy: z.string(),
  }),
});

/**
 * User statistics by role
 */
export interface UserStatisticsByRole {
  role: string;
  count: number;
  percentage: number;
  activeCount: number;
}

export const UserStatisticsByRoleSchema = z.object({
  role: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
  activeCount: z.number().int().nonnegative(),
});

/**
 * User growth data
 */
export interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export const UserGrowthDataSchema = z.object({
  date: z.string(),
  newUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
});

/**
 * User statistics response
 */
export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  verifiedEmails: number;
  verifiedPhones: number;
  roleDistribution: {
    customer?: number;
    vendor?: number;
    admin?: number;
    super_admin?: number;
    [key: string]: number | undefined;
  };
  deletedUsers?: number;
  verifiedUsers?: number;
  unverifiedUsers?: number;
  byRole?: UserStatisticsByRole[];
  growth?: {
    current: number;
    previous: number;
    growthRate: number;
    trend: UserGrowthData[];
  };
  engagement?: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
}

export const UserStatisticsResponseSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  inactiveUsers: z.number().int().nonnegative(),
  suspendedUsers: z.number().int().nonnegative(),
  bannedUsers: z.number().int().nonnegative(),
  verifiedEmails: z.number().int().nonnegative(),
  verifiedPhones: z.number().int().nonnegative(),
  roleDistribution: z.record(z.number().int().nonnegative()),
  deletedUsers: z.number().int().nonnegative().optional(),
  verifiedUsers: z.number().int().nonnegative().optional(),
  unverifiedUsers: z.number().int().nonnegative().optional(),
  byRole: z.array(UserStatisticsByRoleSchema).optional(),
  growth: z.object({
    current: z.number(),
    previous: z.number(),
    growthRate: z.number(),
    trend: z.array(UserGrowthDataSchema),
  }).optional(),
  engagement: z.object({
    dailyActive: z.number().int().nonnegative(),
    weeklyActive: z.number().int().nonnegative(),
    monthlyActive: z.number().int().nonnegative(),
  }).optional(),
});

// ===== TYPE EXPORTS =====

export type {
  User,
  UserListResponse,
  UpdateUserResponse,
  UserSuspensionResponse,
  DeleteUserResponse,
  UserStatisticsResponse,
};
