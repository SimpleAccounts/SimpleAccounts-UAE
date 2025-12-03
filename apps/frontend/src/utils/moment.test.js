/**
 * Tests for moment.js date handling.
 * These tests verify that date formatting/parsing works correctly before/after moment upgrades.
 *
 * Covers: moment 2.24.0 → 2.30.1 upgrade
 */
import moment from 'moment';

describe('Moment.js Date Handling', () => {
  // ============ Basic Formatting ============

  describe('Date Formatting', () => {
    it('should format dates with YYYY-MM-DD pattern', () => {
      const date = moment('2024-01-15');
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('should format dates with DD/MM/YYYY pattern', () => {
      const date = moment('2024-01-15');
      expect(date.format('DD/MM/YYYY')).toBe('15/01/2024');
    });

    it('should format dates with time', () => {
      const date = moment('2024-01-15T14:30:00');
      expect(date.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 14:30:00');
    });

    it('should format month names', () => {
      const date = moment('2024-01-15');
      expect(date.format('MMMM')).toBe('January');
      expect(date.format('MMM')).toBe('Jan');
    });

    it('should format day names', () => {
      const date = moment('2024-01-15'); // Monday
      expect(date.format('dddd')).toBe('Monday');
      expect(date.format('ddd')).toBe('Mon');
    });
  });

  // ============ Date Parsing ============

  describe('Date Parsing', () => {
    it('should parse ISO 8601 dates', () => {
      const date = moment('2024-01-15T10:30:00.000Z');
      expect(date.isValid()).toBe(true);
      expect(date.year()).toBe(2024);
      expect(date.month()).toBe(0); // 0-indexed
      expect(date.date()).toBe(15);
    });

    it('should parse dates with format specifier', () => {
      const date = moment('15-01-2024', 'DD-MM-YYYY');
      expect(date.isValid()).toBe(true);
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('should handle invalid dates', () => {
      // Suppress moment's deprecation warning for invalid date test
      const originalWarn = console.warn;
      console.warn = jest.fn();

      const invalidDate = moment('invalid-date');
      expect(invalidDate.isValid()).toBe(false);

      console.warn = originalWarn;
    });

    it('should handle edge case dates', () => {
      // Feb 29 on leap year
      const leapYear = moment('2024-02-29');
      expect(leapYear.isValid()).toBe(true);

      // Feb 29 on non-leap year should be invalid
      const nonLeapYear = moment('2023-02-29', 'YYYY-MM-DD', true);
      expect(nonLeapYear.isValid()).toBe(false);
    });
  });

  // ============ Date Arithmetic ============

  describe('Date Arithmetic', () => {
    it('should add days correctly', () => {
      const date = moment('2024-01-15');
      const result = date.clone().add(10, 'days');
      expect(result.format('YYYY-MM-DD')).toBe('2024-01-25');
    });

    it('should subtract days correctly', () => {
      const date = moment('2024-01-15');
      const result = date.clone().subtract(10, 'days');
      expect(result.format('YYYY-MM-DD')).toBe('2024-01-05');
    });

    it('should add months correctly', () => {
      const date = moment('2024-01-15');
      const result = date.clone().add(1, 'month');
      expect(result.format('YYYY-MM-DD')).toBe('2024-02-15');
    });

    it('should handle month-end edge cases', () => {
      // Adding 1 month to Jan 31 -> Feb 29 (leap year) or Feb 28
      const date = moment('2024-01-31');
      const result = date.clone().add(1, 'month');
      expect(result.format('YYYY-MM-DD')).toBe('2024-02-29'); // 2024 is leap year
    });

    it('should subtract months correctly', () => {
      const date = moment('2024-01-15');
      const result = date.clone().subtract(1, 'month');
      expect(result.format('YYYY-MM-DD')).toBe('2023-12-15');
    });
  });

  // ============ Date Comparisons ============

  describe('Date Comparisons', () => {
    it('should calculate difference in days', () => {
      const date1 = moment('2024-01-15');
      const date2 = moment('2024-01-25');
      expect(date2.diff(date1, 'days')).toBe(10);
    });

    it('should calculate difference in months', () => {
      const date1 = moment('2024-01-15');
      const date2 = moment('2024-04-15');
      expect(date2.diff(date1, 'months')).toBe(3);
    });

    it('should check isBefore correctly', () => {
      const date1 = moment('2024-01-15');
      const date2 = moment('2024-01-20');
      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);
    });

    it('should check isAfter correctly', () => {
      const date1 = moment('2024-01-15');
      const date2 = moment('2024-01-20');
      expect(date2.isAfter(date1)).toBe(true);
      expect(date1.isAfter(date2)).toBe(false);
    });

    it('should check isSame correctly', () => {
      const date1 = moment('2024-01-15');
      const date2 = moment('2024-01-15');
      expect(date1.isSame(date2, 'day')).toBe(true);
    });
  });

  // ============ Start/End of Period ============

  describe('Start/End of Period', () => {
    it('should get start of week', () => {
      const date = moment('2024-01-15'); // Monday
      const startOfWeek = date.clone().startOf('week');
      // Sunday is default start of week
      expect(startOfWeek.format('dddd')).toBe('Sunday');
    });

    it('should get end of week', () => {
      const date = moment('2024-01-15');
      const endOfWeek = date.clone().endOf('week');
      expect(endOfWeek.format('dddd')).toBe('Saturday');
    });

    it('should get start of month', () => {
      const date = moment('2024-01-15');
      const startOfMonth = date.clone().startOf('month');
      expect(startOfMonth.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    it('should get end of month', () => {
      const date = moment('2024-01-15');
      const endOfMonth = date.clone().endOf('month');
      expect(endOfMonth.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    it('should get start of year', () => {
      const date = moment('2024-06-15');
      const startOfYear = date.clone().startOf('year');
      expect(startOfYear.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    it('should get end of year', () => {
      const date = moment('2024-06-15');
      const endOfYear = date.clone().endOf('year');
      expect(endOfYear.format('YYYY-MM-DD')).toBe('2024-12-31');
    });
  });

  // ============ Current Time ============

  describe('Current Time', () => {
    it('should create current moment', () => {
      const now = moment();
      expect(now.isValid()).toBe(true);
    });

    it('should format relative time', () => {
      const pastDate = moment().subtract(5, 'days');
      expect(pastDate.fromNow()).toContain('5 days ago');
    });
  });

  // ============ Dashboard Date Range Patterns ============

  describe('Dashboard Date Range Patterns (as used in codebase)', () => {
    it('should calculate last 6 days range', () => {
      const today = moment('2024-01-15');
      const sixDaysAgo = today.clone().subtract(6, 'days');
      expect(sixDaysAgo.format('YYYY-MM-DD')).toBe('2024-01-09');
    });

    it('should calculate week range', () => {
      const today = moment('2024-01-15');
      const weekStart = today.clone().startOf('week');
      const weekEnd = today.clone().endOf('week');

      expect(weekStart.format('YYYY-MM-DD')).toBe('2024-01-14'); // Sunday
      expect(weekEnd.format('YYYY-MM-DD')).toBe('2024-01-20'); // Saturday
    });

    it('should calculate month range', () => {
      const today = moment('2024-01-15');
      const monthStart = today.clone().startOf('month');
      const monthEnd = today.clone().endOf('month');

      expect(monthStart.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(monthEnd.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    it('should calculate last month range', () => {
      const today = moment('2024-01-15');
      const lastMonth = today.clone().subtract(1, 'month');
      const lastMonthStart = lastMonth.clone().startOf('month');
      const lastMonthEnd = lastMonth.clone().endOf('month');

      expect(lastMonthStart.format('YYYY-MM-DD')).toBe('2023-12-01');
      expect(lastMonthEnd.format('YYYY-MM-DD')).toBe('2023-12-31');
    });
  });
});
