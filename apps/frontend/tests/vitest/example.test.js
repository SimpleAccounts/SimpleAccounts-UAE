/**
 * Example Vitest test file
 *
 * This demonstrates the Vitest syntax for new tests.
 * New tests should use Vitest syntax (vi.mock, vi.fn, etc.)
 *
 * To run Vitest tests: npm run test
 * To run legacy Jest tests: npm run test:legacy
 */

import { describe, it, expect, vi } from 'vitest';

describe('Vitest Configuration', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support mocking with vi.fn()', () => {
    const mockFn = vi.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('async result');
    expect(result).toBe('async result');
  });

  it('should have access to globals', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should have localStorage mock available', () => {
    expect(window.localStorage).toBeDefined();
    window.localStorage.setItem('test', 'value');
    expect(window.localStorage.getItem('test')).toBe('value');
  });
});

describe('Vitest Matchers', () => {
  it('should support jest-dom matchers', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    document.body.appendChild(div);

    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello');

    document.body.removeChild(div);
  });
});
