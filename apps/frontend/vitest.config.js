import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
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
        thresholds: {
          statements: 10,
          branches: 10,
          functions: 10,
          lines: 10,
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
