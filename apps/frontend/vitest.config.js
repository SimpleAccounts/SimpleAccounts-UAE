import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

// Plugin to transform Jest APIs to Vitest APIs for backward compatibility
const jestToVitestPlugin = {
  name: 'jest-to-vitest-transform',
  enforce: 'pre',
  transform(code, id) {
    // Only transform test files
    if (!id.match(/\.(test|spec)\.(js|jsx|ts|tsx)$/)) {
      return null;
    }

    // Replace Jest APIs with Vitest APIs
    let transformedCode = code
      // Replace jest.fn with vi.fn
      .replace(/\bjest\.fn\b/g, 'vi.fn')
      // Replace jest.mock with vi.mock
      .replace(/\bjest\.mock\b/g, 'vi.mock')
      // Replace jest.unmock with vi.unmock
      .replace(/\bjest\.unmock\b/g, 'vi.unmock')
      // Replace jest.spyOn with vi.spyOn
      .replace(/\bjest\.spyOn\b/g, 'vi.spyOn')
      // Replace jest.clearAllMocks with vi.clearAllMocks
      .replace(/\bjest\.clearAllMocks\b/g, 'vi.clearAllMocks')
      // Replace jest.resetAllMocks with vi.resetAllMocks
      .replace(/\bjest\.resetAllMocks\b/g, 'vi.resetAllMocks')
      // Replace jest.restoreAllMocks with vi.restoreAllMocks
      .replace(/\bjest\.restoreAllMocks\b/g, 'vi.restoreAllMocks')
      // Replace jest.useFakeTimers with vi.useFakeTimers
      .replace(/\bjest\.useFakeTimers\b/g, 'vi.useFakeTimers')
      // Replace jest.useRealTimers with vi.useRealTimers
      .replace(/\bjest\.useRealTimers\b/g, 'vi.useRealTimers')
      // Replace jest.advanceTimersByTime with vi.advanceTimersByTime
      .replace(/\bjest\.advanceTimersByTime\b/g, 'vi.advanceTimersByTime')
      // Replace jest.runAllTimers with vi.runAllTimers
      .replace(/\bjest\.runAllTimers\b/g, 'vi.runAllTimers')
      // Replace jest.runOnlyPendingTimers with vi.runOnlyPendingTimers
      .replace(/\bjest\.runOnlyPendingTimers\b/g, 'vi.runOnlyPendingTimers')
      // Replace jest.requireActual with vi.importActual (async)
      .replace(/\bjest\.requireActual\b/g, 'vi.importActual')
      // Replace jest.requireMock with vi.importMock
      .replace(/\bjest\.requireMock\b/g, 'vi.importMock');

    // Only return if we made changes
    if (transformedCode !== code) {
      return {
        code: transformedCode,
        map: null,
      };
    }
    return null;
  },
};

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [jestToVitestPlugin],
    test: {
      globals: true,
      environment: 'jsdom',
      mode: 'test',
      setupFiles: ['./src/test/vitest.setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', 'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      exclude: ['node_modules', 'dist', 'e2e', '**/*.e2e.{js,jsx,ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html', 'json-summary'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          '**/*index.js',
          'src/serviceWorker.js',
          'src/polyfill.js',
          'src/__mocks__/**',
          'src/test/**',
          'src/assets/**',
          'src/**/*.test.{js,jsx,ts,tsx}',
          'src/**/__tests__/**',
          'src/**/*.config.js',
          'src/**/*.setup.js',
        ],
        // Coverage thresholds disabled for CI (matching original Jest config)
        // Can be increased as test coverage improves
        thresholds: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
      },
      // Timeout for long-running tests
      testTimeout: 10000,
      hookTimeout: 10000,
      // Reporter configuration
      reporters: ['default'],
    },
  })
);
