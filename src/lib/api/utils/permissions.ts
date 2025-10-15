/**
 * Permission Utilities
 * Helper functions for checking user permissions
 */

import { PERMISSIONS, ROLE_PERMISSIONS } from '../config';
import type { StaffRole, Permission } from '../types';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: StaffRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: StaffRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a user is a super admin
 */
export function isSuperAdmin(role: StaffRole): boolean {
  return role === 'super_admin';
}

/**
 * Check if a user is an admin (admin or super_admin)
 */
export function isAdmin(role: StaffRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

/**
 * Check if a user can access a resource
 */
export function canAccessResource(
  userRole: StaffRole,
  requiredPermission: Permission
): boolean {
  // Super admins have access to everything
  if (isSuperAdmin(userRole)) {
    return true;
  }

  // Check specific permission
  return hasPermission(userRole, requiredPermission);
}
