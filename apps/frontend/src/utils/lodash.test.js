/**
 * Tests for lodash utility functions.
 * These tests verify that lodash utilities work correctly before/after lodash upgrades.
 *
 * Covers: lodash 4.17.15 → 4.17.21 upgrade (security patches)
 */
import { upperFirst, capitalize, isEqual, cloneDeep, get, set, merge, debounce, throttle, isEmpty } from 'lodash';

describe('Lodash Utility Functions', () => {
  // ============ String Functions ============

  describe('String Functions', () => {
    it('should uppercase first character with upperFirst', () => {
      expect(upperFirst('hello')).toBe('Hello');
      expect(upperFirst('HELLO')).toBe('HELLO');
      expect(upperFirst('hello world')).toBe('Hello world');
      expect(upperFirst('')).toBe('');
    });

    it('should capitalize correctly', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });
  });

  // ============ Object Functions ============

  describe('Object Functions', () => {
    it('should deep clone objects', () => {
      const original = {
        name: 'Test',
        nested: { value: 123 },
        array: [1, 2, 3]
      };
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.array).not.toBe(original.array);
    });

    it('should get nested values safely', () => {
      const obj = {
        a: { b: { c: 'value' } }
      };

      expect(get(obj, 'a.b.c')).toBe('value');
      expect(get(obj, 'a.b.d')).toBeUndefined();
      expect(get(obj, 'a.b.d', 'default')).toBe('default');
      expect(get(obj, 'x.y.z', 'default')).toBe('default');
    });

    it('should get array values', () => {
      const obj = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }]
      };

      expect(get(obj, 'items[0].id')).toBe(1);
      expect(get(obj, 'items[2].id')).toBe(3);
      expect(get(obj, 'items[10].id')).toBeUndefined();
    });

    it('should set nested values', () => {
      const obj = {};
      set(obj, 'a.b.c', 'value');

      expect(obj.a.b.c).toBe('value');
    });

    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const result = merge({}, obj1, obj2);

      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should check equality deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const obj3 = { a: 1, b: { c: 3 } };

      expect(isEqual(obj1, obj2)).toBe(true);
      expect(isEqual(obj1, obj3)).toBe(false);
    });

    it('should check isEmpty correctly', () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty('hello')).toBe(false);
    });
  });

  // ============ Array Functions ============

  describe('Array Functions', () => {
    it('should handle array cloning', () => {
      const original = [{ id: 1 }, { id: 2 }];
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
    });
  });

  // ============ Function Utilities ============

  describe('Function Utilities', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      // Use trailing: false to test basic throttle behavior without trailing calls
      const throttledFn = throttle(mockFn, 100, { trailing: false });

      throttledFn();
      throttledFn();
      throttledFn();

      // Only the first call should execute immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();

      // After waiting, the next call should execute
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  // ============ Security: Prototype Pollution Prevention ============

  describe('Security Tests (Prototype Pollution)', () => {
    it('should not allow __proto__ pollution via merge', () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
      const target = {};

      merge(target, malicious);

      // After lodash 4.17.21, prototype pollution should be prevented
      expect(({}).polluted).toBeUndefined();
    });

    it('should not allow constructor pollution via merge', () => {
      const malicious = { constructor: { prototype: { polluted: true } } };
      const target = {};

      merge(target, malicious);

      expect(({}).polluted).toBeUndefined();
    });

    it('should handle safe nested paths', () => {
      const obj = {};
      // This should NOT pollute Object.prototype
      set(obj, '__proto__.polluted', true);

      expect(({}).polluted).toBeUndefined();
    });
  });

  // ============ Edge Cases ============

  describe('Edge Cases', () => {
    it('should handle null and undefined in get', () => {
      expect(get(null, 'a.b')).toBeUndefined();
      expect(get(undefined, 'a.b')).toBeUndefined();
      expect(get(null, 'a.b', 'default')).toBe('default');
    });

    it('should handle circular references in cloneDeep', () => {
      const obj = { a: 1 };
      obj.self = obj;

      const cloned = cloneDeep(obj);

      expect(cloned.a).toBe(1);
      expect(cloned.self).toBe(cloned); // Self-reference preserved
      expect(cloned.self).not.toBe(obj); // But different object
    });

    it('should handle special characters in paths', () => {
      const obj = { 'special.key': 'value' };
      expect(get(obj, ['special.key'])).toBe('value');
    });
  });
});
