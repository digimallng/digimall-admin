/**
 * Formatter Tests
 * Tests for formatting utility functions
 */

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  truncate,
  capitalize,
  camelToTitle,
  getInitials,
} from '../../utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousands separator', () => {
      const result = formatNumber(1000000);
      expect(result).toBe('1,000,000');
    });

    it('should handle zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      const result = formatPercentage(15.5);
      expect(result).toBe('15.50%');
    });

    it('should handle custom decimals', () => {
      const result = formatPercentage(15.555, 1);
      expect(result).toBe('15.6%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is a ...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalize('hello world')).toBe('Hello World');
      expect(capitalize('test case')).toBe('Test Case');
    });
  });

  describe('camelToTitle', () => {
    it('should convert camelCase to Title Case', () => {
      expect(camelToTitle('camelCase')).toBe('Camel Case');
      expect(camelToTitle('testCaseExample')).toBe('Test Case Example');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Mary Smith')).toBe('JS');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('JO');
    });

    it('should handle names with extra spaces', () => {
      expect(getInitials('  John  Doe  ')).toBe('JD');
    });
  });
});
