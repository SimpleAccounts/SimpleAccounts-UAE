/**
 * Tests for Day.js date utility wrapper
 * Verifies that all plugins are loaded and basic functionality works
 */
import dayjs from '@/utils/date';

describe('Day.js Date Utility', () => {
  // ============ Basic Functionality ============

  describe('Basic Date Operations', () => {
    it('should create current date', () => {
      const date = dayjs();
      expect(date.isValid()).toBe(true);
    });

    it('should parse ISO date string', () => {
      const date = dayjs('2024-01-15');
      expect(date.isValid()).toBe(true);
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('should format dates correctly', () => {
      const date = dayjs('2024-01-15');
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(date.format('DD/MM/YYYY')).toBe('15/01/2024');
    });
  });

  // ============ Plugin: customParseFormat ============

  describe('Custom Parse Format Plugin', () => {
    it('should parse dates with format string', () => {
      const date = dayjs('15-01-2024', 'DD-MM-YYYY');
      expect(date.isValid()).toBe(true);
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
    });
  });

  // ============ Plugin: relativeTime ============

  describe('Relative Time Plugin', () => {
    it('should display relative time', () => {
      const pastDate = dayjs().subtract(5, 'days');
      expect(pastDate.fromNow()).toContain('ago');
    });

    it('should display future relative time', () => {
      const futureDate = dayjs().add(5, 'days');
      expect(futureDate.fromNow()).toContain('in');
    });
  });

  // ============ Date Arithmetic ============

  describe('Date Arithmetic', () => {
    it('should add days correctly', () => {
      const date = dayjs('2024-01-15');
      const result = date.add(10, 'days');
      expect(result.format('YYYY-MM-DD')).toBe('2024-01-25');
    });

    it('should subtract days correctly', () => {
      const date = dayjs('2024-01-15');
      const result = date.subtract(10, 'days');
      expect(result.format('YYYY-MM-DD')).toBe('2024-01-05');
    });

    it('should add months correctly', () => {
      const date = dayjs('2024-01-15');
      const result = date.add(1, 'month');
      expect(result.format('YYYY-MM-DD')).toBe('2024-02-15');
    });
  });

  // ============ Date Comparisons ============

  describe('Date Comparisons', () => {
    it('should calculate difference in days', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-25');
      expect(date2.diff(date1, 'days')).toBe(10);
    });

    it('should check isBefore correctly', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-20');
      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);
    });

    it('should check isAfter correctly', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-20');
      expect(date2.isAfter(date1)).toBe(true);
      expect(date1.isAfter(date2)).toBe(false);
    });

    it('should check isSame correctly', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-15');
      expect(date1.isSame(date2, 'day')).toBe(true);
    });
  });

  // ============ Plugin: isSameOrBefore/isSameOrAfter ============

  describe('Comparison Plugins', () => {
    it('should check isSameOrBefore', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-20');
      expect(date1.isSameOrBefore(date2)).toBe(true);
      expect(date1.isSameOrBefore(date1)).toBe(true);
    });

    it('should check isSameOrAfter', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = dayjs('2024-01-20');
      expect(date2.isSameOrAfter(date1)).toBe(true);
      expect(date1.isSameOrAfter(date1)).toBe(true);
    });
  });

  // ============ Start/End of Period ============

  describe('Start/End of Period', () => {
    it('should get start of month', () => {
      const date = dayjs('2024-01-15');
      const startOfMonth = date.startOf('month');
      expect(startOfMonth.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    it('should get end of month', () => {
      const date = dayjs('2024-01-15');
      const endOfMonth = date.endOf('month');
      expect(endOfMonth.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    it('should get start of year', () => {
      const date = dayjs('2024-06-15');
      const startOfYear = date.startOf('year');
      expect(startOfYear.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    it('should get end of year', () => {
      const date = dayjs('2024-06-15');
      const endOfYear = date.endOf('year');
      expect(endOfYear.format('YYYY-MM-DD')).toBe('2024-12-31');
    });
  });

  // ============ Clone ============

  describe('Clone Operations', () => {
    it('should clone date instance', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = date1.clone();
      expect(date1.format('YYYY-MM-DD')).toBe(date2.format('YYYY-MM-DD'));
      expect(date1).not.toBe(date2);
    });

    it('should modify clone without affecting original', () => {
      const date1 = dayjs('2024-01-15');
      const date2 = date1.clone().add(10, 'days');
      expect(date1.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(date2.format('YYYY-MM-DD')).toBe('2024-01-25');
    });
  });

  // ============ Invalid Dates ============

  describe('Invalid Date Handling', () => {
    it('should handle invalid dates', () => {
      const invalidDate = dayjs('invalid-date');
      expect(invalidDate.isValid()).toBe(false);
    });
  });
});
