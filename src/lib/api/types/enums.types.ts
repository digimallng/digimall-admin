/**
 * Enumerations for DigiMall Admin API
 *
 * All enum types used across the application.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';

// ===== STAFF & AUTHENTICATION ENUMS =====

/**
 * Staff roles
 */
export enum StaffRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export const StaffRoleSchema = z.enum(['super_admin', 'admin', 'staff']);

export type StaffRoleType = z.infer<typeof StaffRoleSchema>;

/**
 * Staff status
 */
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export const StaffStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export type StaffStatusType = z.infer<typeof StaffStatusSchema>;

// ===== USER ENUMS =====

/**
 * User roles
 */
export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export const UserRoleSchema = z.enum(['customer', 'vendor', 'admin', 'super_admin']);

export type UserRoleType = z.infer<typeof UserRoleSchema>;

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export const UserStatusSchema = z.enum(['active', 'inactive', 'suspended', 'deleted']);

export type UserStatusType = z.infer<typeof UserStatusSchema>;

// ===== VENDOR ENUMS =====

/**
 * Vendor status
 */
export enum VendorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export const VendorStatusSchema = z.enum(['pending', 'active', 'suspended', 'inactive']);

export type VendorStatusType = z.infer<typeof VendorStatusSchema>;

/**
 * Vendor tier
 */
export enum VendorTier {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export const VendorTierSchema = z.enum(['basic', 'silver', 'gold', 'platinum']);

export type VendorTierType = z.infer<typeof VendorTierSchema>;

/**
 * KYC status
 */
export enum KycStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export const KycStatusSchema = z.enum(['verified', 'pending', 'rejected']);

export type KycStatusType = z.infer<typeof KycStatusSchema>;

// ===== PRODUCT ENUMS =====

/**
 * Product status
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export const ProductStatusSchema = z.enum(['active', 'inactive', 'pending', 'rejected']);

export type ProductStatusType = z.infer<typeof ProductStatusSchema>;

/**
 * Product approval status
 */
export enum ProductApprovalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const ProductApprovalStatusSchema = z.enum(['approved', 'rejected']);

export type ProductApprovalStatusType = z.infer<typeof ProductApprovalStatusSchema>;

// ===== ORDER ENUMS =====

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export const OrderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export type OrderStatusType = z.infer<typeof OrderStatusSchema>;

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const PaymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);

export type PaymentStatusType = z.infer<typeof PaymentStatusSchema>;

/**
 * Payment method
 */
export enum PaymentMethod {
  PAYSTACK = 'paystack',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

export const PaymentMethodSchema = z.enum(['paystack', 'card', 'bank_transfer', 'wallet']);

export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>;

// ===== CATEGORY ENUMS =====

/**
 * Category status
 */
export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const CategoryStatusSchema = z.enum(['active', 'inactive']);

export type CategoryStatusType = z.infer<typeof CategoryStatusSchema>;

// ===== SECURITY & AUDIT ENUMS =====

/**
 * Security event type
 */
export enum SecurityEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  PERMISSION_CHANGE = 'permission_change',
  IP_BLOCKED = 'ip_blocked',
}

export const SecurityEventTypeSchema = z.enum([
  'login',
  'logout',
  'failed_login',
  'permission_change',
  'ip_blocked',
]);

export type SecurityEventTypeType = z.infer<typeof SecurityEventTypeSchema>;

/**
 * Security event severity
 */
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const SecurityEventSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export type SecurityEventSeverityType = z.infer<typeof SecurityEventSeveritySchema>;

/**
 * Alert status
 */
export enum AlertStatus {
  ACTIVE = 'active',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
}

export const AlertStatusSchema = z.enum(['active', 'investigating', 'resolved']);

export type AlertStatusType = z.infer<typeof AlertStatusSchema>;

/**
 * Alert type
 */
export enum AlertType {
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

export const AlertTypeSchema = z.enum([
  'brute_force_attempt',
  'suspicious_activity',
  'unauthorized_access',
]);

export type AlertTypeType = z.infer<typeof AlertTypeSchema>;

// ===== AUDIT ENUMS =====

/**
 * Audit action
 */
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
  USER_SUSPENDED = 'user_suspended',
  PRODUCT_APPROVED = 'product_approved',
}

export const AuditActionSchema = z.enum([
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'approve',
  'reject',
  'suspend',
  'activate',
  'user_suspended',
  'product_approved',
]);

export type AuditActionType = z.infer<typeof AuditActionSchema>;

// ===== SUBSCRIPTION PLAN ENUMS =====

/**
 * Subscription plan duration
 */
export enum PlanDuration {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export const PlanDurationSchema = z.enum(['monthly', 'quarterly', 'yearly']);

export type PlanDurationType = z.infer<typeof PlanDurationSchema>;

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export const SubscriptionStatusSchema = z.enum(['active', 'inactive', 'cancelled', 'expired']);

export type SubscriptionStatusType = z.infer<typeof SubscriptionStatusSchema>;

// ===== SYSTEM ENUMS =====

/**
 * Service status
 */
export enum ServiceStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded',
}

export const ServiceStatusSchema = z.enum(['up', 'down', 'degraded']);

export type ServiceStatusType = z.infer<typeof ServiceStatusSchema>;

/**
 * Log level
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

export const LogLevelSchema = z.enum(['info', 'warn', 'error', 'debug']);

export type LogLevelType = z.infer<typeof LogLevelSchema>;

// ===== ANALYTICS ENUMS =====

/**
 * Analytics period
 */
export enum AnalyticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export const AnalyticsPeriodSchema = z.enum(['today', 'week', 'month', 'year']);

export type AnalyticsPeriodType = z.infer<typeof AnalyticsPeriodSchema>;

/**
 * Analytics interval
 */
export enum AnalyticsInterval {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export const AnalyticsIntervalSchema = z.enum(['hour', 'day', 'week', 'month']);

export type AnalyticsIntervalType = z.infer<typeof AnalyticsIntervalSchema>;

/**
 * Report format
 */
export enum ReportFormat {
  JSON = 'json',
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export const ReportFormatSchema = z.enum(['json', 'csv', 'excel', 'pdf']);

export type ReportFormatType = z.infer<typeof ReportFormatSchema>;

// ===== BULK ACTION ENUMS =====

/**
 * Bulk action type
 */
export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  UNSUSPEND = 'unsuspend',
}

export const BulkActionTypeSchema = z.enum([
  'activate',
  'deactivate',
  'delete',
  'approve',
  'reject',
  'suspend',
  'unsuspend',
]);

export type BulkActionTypeType = z.infer<typeof BulkActionTypeSchema>;

// ===== NOTIFICATION ENUMS =====

/**
 * Notification type
 */
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export const NotificationTypeSchema = z.enum(['email', 'sms', 'push', 'in_app']);

export type NotificationTypeType = z.infer<typeof NotificationTypeSchema>;

// ===== COMMISSION ENUMS =====

/**
 * Commission type
 */
export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export const CommissionTypeSchema = z.enum(['percentage', 'fixed']);

export type CommissionTypeType = z.infer<typeof CommissionTypeSchema>;

// ===== EXPORT ALL SCHEMAS =====

/**
 * All enum schemas for validation
 */
export const EnumSchemas = {
  StaffRole: StaffRoleSchema,
  StaffStatus: StaffStatusSchema,
  UserRole: UserRoleSchema,
  UserStatus: UserStatusSchema,
  VendorStatus: VendorStatusSchema,
  VendorTier: VendorTierSchema,
  KycStatus: KycStatusSchema,
  ProductStatus: ProductStatusSchema,
  ProductApprovalStatus: ProductApprovalStatusSchema,
  OrderStatus: OrderStatusSchema,
  PaymentStatus: PaymentStatusSchema,
  PaymentMethod: PaymentMethodSchema,
  CategoryStatus: CategoryStatusSchema,
  SecurityEventType: SecurityEventTypeSchema,
  SecurityEventSeverity: SecurityEventSeveritySchema,
  AlertStatus: AlertStatusSchema,
  AlertType: AlertTypeSchema,
  AuditAction: AuditActionSchema,
  PlanDuration: PlanDurationSchema,
  SubscriptionStatus: SubscriptionStatusSchema,
  ServiceStatus: ServiceStatusSchema,
  LogLevel: LogLevelSchema,
  AnalyticsPeriod: AnalyticsPeriodSchema,
  AnalyticsInterval: AnalyticsIntervalSchema,
  ReportFormat: ReportFormatSchema,
  BulkActionType: BulkActionTypeSchema,
  NotificationType: NotificationTypeSchema,
  CommissionType: CommissionTypeSchema,
} as const;

/**
 * Type helper to get all enum types
 */
export type AllEnums = typeof EnumSchemas;

/**
 * Type helper to get specific enum type
 */
export type EnumType<K extends keyof AllEnums> = z.infer<AllEnums[K]>;
