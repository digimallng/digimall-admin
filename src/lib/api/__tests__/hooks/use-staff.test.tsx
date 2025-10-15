/**
 * Staff Hooks Tests
 * Example tests for staff React Query hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockStaff } from '../test-utils';
import { useStaff, useStaffById, useCreateStaff } from '../../hooks';
import { mockFetch, resetMocks } from '../setup';
import type { StaffListResponse } from '../../types';

describe('Staff Hooks', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('useStaff', () => {
    it('should fetch staff list', async () => {
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

      const { result, queryClient } = renderWithProviders(
        <div>Test Component</div>,
        {}
      );

      const { result: hookResult } = renderHook(() => useStaff(), {
        wrapper: ({ children }) => (
          <div>
            {children}
          </div>
        ),
      });

      await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));

      expect(hookResult.current.data).toEqual(mockData);
    });

    it('should handle loading state', () => {
      mockFetch({ success: true, data: [] });

      const { result: hookResult } = renderHook(() => useStaff());

      expect(hookResult.current.isLoading).toBe(true);
    });

    it('should handle error state', async () => {
      mockFetch({ success: false, error: 'Failed to fetch' }, 500);

      const { result: hookResult } = renderHook(() => useStaff());

      await waitFor(() => expect(hookResult.current.isError).toBe(true));
    });
  });

  describe('useStaffById', () => {
    it('should fetch a single staff member', async () => {
      const mockStaff = createMockStaff();
      mockFetch({ success: true, data: mockStaff });

      const { result: hookResult } = renderHook(() => useStaffById('staff-1'));

      await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));

      expect(hookResult.current.data).toEqual(mockStaff);
    });

    it('should not fetch when enabled is false', () => {
      const { result: hookResult } = renderHook(() =>
        useStaffById('staff-1', false)
      );

      expect(hookResult.current.fetchStatus).toBe('idle');
    });
  });

  describe('useCreateStaff', () => {
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

      const { result: hookResult } = renderHook(() => useCreateStaff());

      await hookResult.current.mutateAsync(newStaff);

      await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));

      expect(hookResult.current.data).toEqual(mockCreated);
    });

    it('should handle mutation error', async () => {
      mockFetch({ success: false, error: 'Failed to create' }, 400);

      const { result: hookResult } = renderHook(() => useCreateStaff());

      await expect(
        hookResult.current.mutateAsync({
          email: 'test@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          role: 'staff',
        })
      ).rejects.toThrow();
    });
  });
});
