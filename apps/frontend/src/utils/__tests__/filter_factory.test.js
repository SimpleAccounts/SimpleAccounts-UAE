/**
 * Tests for filter factory utilities
 */

import { compareString, filterDataList } from '../filter_factory';

describe('Filter Factory', () => {
  describe('compareString', () => {
    it('should return true when filter is empty string', () => {
      expect(compareString('', 'any value', 'contain')).toBe(true);
      expect(compareString('', 'any value', 'match')).toBe(true);
    });

    it('should match strings with contain option', () => {
      expect(compareString('test', 'this is a test string', 'contain')).toBe(true);
      expect(compareString('test', 'TEST STRING', 'contain')).toBe(false); // case sensitive
      expect(compareString('xyz', 'this is a test string', 'contain')).toBe(false);
    });

    it('should match exact strings with match option', () => {
      expect(compareString('test', 'test', 'match')).toBe(true);
      expect(compareString('test', 'Test', 'match')).toBe(false); // case sensitive
      expect(compareString('test', 'testing', 'match')).toBe(false);
    });

    it('should return true for unknown option', () => {
      expect(compareString('test', 'any value', 'unknown')).toBe(true);
    });

    it('should handle empty value string', () => {
      expect(compareString('test', '', 'contain')).toBe(false);
      expect(compareString('', '', 'match')).toBe(true);
    });
  });

  describe('filterDataList', () => {
    const mockData = [
      { id: 1, name: 'Apple', category: 'Fruit' },
      { id: 2, name: 'Banana', category: 'Fruit' },
      { id: 3, name: 'Carrot', category: 'Vegetable' },
      { id: 4, name: 'Apple Pie', category: 'Dessert' },
    ];

    it('should filter data with contain option', () => {
      const result = filterDataList('Apple', 'name', 'contain', mockData);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Apple Pie');
    });

    it('should filter data with match option', () => {
      const result = filterDataList('Apple', 'name', 'match', mockData);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Apple');
    });

    it('should return all data when filter is empty', () => {
      const result = filterDataList('', 'name', 'contain', mockData);

      expect(result).toHaveLength(4);
    });

    it('should filter by different keys', () => {
      const result = filterDataList('Fruit', 'category', 'match', mockData);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Fruit');
      expect(result[1].category).toBe('Fruit');
    });

    it('should return empty array when no matches found', () => {
      const result = filterDataList('XYZ', 'name', 'contain', mockData);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty data', () => {
      const result = filterDataList('test', 'name', 'contain', []);

      expect(result).toHaveLength(0);
    });

    it('should preserve all properties in filtered results', () => {
      const result = filterDataList('Apple', 'name', 'match', mockData);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('category');
      expect(result[0].id).toBe(1);
    });

    it('should handle case-sensitive filtering', () => {
      const result = filterDataList('apple', 'name', 'contain', mockData);

      expect(result).toHaveLength(0); // case sensitive, no match
    });
  });
});

