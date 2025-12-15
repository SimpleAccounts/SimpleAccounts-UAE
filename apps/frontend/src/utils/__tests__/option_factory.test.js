/**
 * Tests for option factory utilities
 */

import { renderOptions } from '../option_factory';

describe('Option Factory', () => {
  describe('renderOptions', () => {
    const mockData = [
      { id: 1, name: 'Option 1', code: 'OPT1' },
      { id: 2, name: 'Option 2', code: 'OPT2' },
      { id: 3, name: 'Option 3', code: 'OPT3' },
    ];

    it('should render options with label and value', () => {
      const result = renderOptions('name', 'id', mockData);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        label: 'Option 1',
        value: 1,
      });
      expect(result[1]).toEqual({
        label: 'Option 2',
        value: 2,
      });
    });

    it('should include additional fields when valueArr is provided', () => {
      const result = renderOptions('name', 'id', mockData, null, ['code']);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        label: 'Option 1',
        value: 1,
        code: 'OPT1',
      });
    });

    it('should include multiple additional fields', () => {
      const extendedData = [
        { id: 1, name: 'Option 1', code: 'OPT1', category: 'A' },
        { id: 2, name: 'Option 2', code: 'OPT2', category: 'B' },
      ];

      const result = renderOptions('name', 'id', extendedData, null, ['code', 'category']);

      expect(result[0]).toEqual({
        label: 'Option 1',
        value: 1,
        code: 'OPT1',
        category: 'A',
      });
    });

    it('should handle empty data array', () => {
      const result = renderOptions('name', 'id', []);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle placeholder parameter (even if not used)', () => {
      const result = renderOptions('name', 'id', mockData, 'Select option');

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('Option 1');
    });

    it('should handle different value types', () => {
      const dataWithStrings = [
        { id: 'a', name: 'Option A' },
        { id: 'b', name: 'Option B' },
      ];

      const result = renderOptions('name', 'id', dataWithStrings);

      expect(result[0].value).toBe('a');
      expect(result[1].value).toBe('b');
    });

    it('should handle numeric values', () => {
      const dataWithNumbers = [
        { id: 100, name: 'Option 100' },
        { id: 200, name: 'Option 200' },
      ];

      const result = renderOptions('name', 'id', dataWithNumbers);

      expect(result[0].value).toBe(100);
      expect(result[1].value).toBe(200);
    });
  });
});

