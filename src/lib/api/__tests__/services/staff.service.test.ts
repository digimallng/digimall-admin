/**
 * Staff Service Tests
 * Example tests for the staff service
 */

import { staffService } from '../../services';
import { mockFetch, mockFetchError, resetMocks } from '../setup';
import { createMockStaff } from '../test-utils';
import type { StaffListResponse } from '../../types';

describe('StaffService', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('getAll', () => {
    it('should fetch all staff members', async () => {
      const mockData: StaffListResponse = {
        data: [createMockStaff()],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockFetch({ success: true, data: mockData });

      const result = await staffService.getAll();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/staff'),
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      mockFetchError(new Error('Network error'));

      await expect(staffService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch a single staff member', async () => {
      const mockStaff = createMockStaff();
      mockFetch({ success: true, data: mockStaff });

      const result = await staffService.getById('staff-1');

      expect(result).toEqual(mockStaff);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/staff/staff-1'),
        expect.any(Object)
      );
    });
  });

  describe('create', () => {
    it('should create a new staff member', async () => {
      const newStaff = {
        email: 'newstaff@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Staff',
        role: 'staff' as const,
      };

      const mockCreated = createMockStaff(newStaff);
      mockFetch({ success: true, data: mockCreated });

      const result = await staffService.create(newStaff);

      expect(result).toEqual(mockCreated);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/staff'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('update', () => {
    it('should update a staff member', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUpdated = createMockStaff(updates);
      mockFetch({ success: true, data: mockUpdated });

      const result = await staffService.update('staff-1', updates);

      expect(result).toEqual(mockUpdated);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/staff/staff-1'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a staff member', async () => {
      mockFetch({ success: true, message: 'Staff deleted successfully' });

      await staffService.delete('staff-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/staff/staff-1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
