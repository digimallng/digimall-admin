/**
 * Staff Validation Tests
 * Example tests for staff validation schemas
 */

import {
  CreateStaffRequestSchema,
  UpdateStaffRequestSchema,
  StaffLoginRequestSchema,
  ChangePasswordRequestSchema,
} from '../../validation';

describe('Staff Validation', () => {
  describe('CreateStaffRequestSchema', () => {
    it('should validate valid staff creation data', () => {
      const validData = {
        email: 'staff@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      const result = CreateStaffRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      const result = CreateStaffRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'staff@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      const result = CreateStaffRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'staff@example.com',
        password: 'password123',
      };

      const result = CreateStaffRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        email: 'staff@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        phoneNumber: '+2348012345678',
        department: 'Operations',
        permissions: ['dashboard:view'],
      };

      const result = CreateStaffRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('UpdateStaffRequestSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        firstName: 'Updated',
      };

      const result = UpdateStaffRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = UpdateStaffRequestSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should validate multiple fields', () => {
      const validData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+2348012345678',
        department: 'Sales',
      };

      const result = UpdateStaffRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('StaffLoginRequestSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'staff@example.com',
        password: 'password123',
      };

      const result = StaffLoginRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = StaffLoginRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'staff@example.com',
        password: '',
      };

      const result = StaffLoginRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('ChangePasswordRequestSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      const result = ChangePasswordRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject short new password', () => {
      const invalidData = {
        currentPassword: 'oldpassword',
        newPassword: 'short',
      };

      const result = ChangePasswordRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should require both passwords', () => {
      const invalidData = {
        currentPassword: 'oldpassword',
      };

      const result = ChangePasswordRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
