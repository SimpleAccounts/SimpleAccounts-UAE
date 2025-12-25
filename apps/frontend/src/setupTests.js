import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';
import {
  TransformStream,
  WritableStream,
  ReadableStream,
} from 'web-streams-polyfill/dist/ponyfill.js';

// Make jest globals available for backward compatibility
globalThis.jest = vi;

// Polyfills for Node environment
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
if (!global.TransformStream) {
  global.TransformStream = TransformStream;
}
if (!global.WritableStream) {
  global.WritableStream = WritableStream;
}
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream;
}
if (typeof global.BroadcastChannel === 'undefined') {
  class MockBroadcastChannel {
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.BroadcastChannel = MockBroadcastChannel;
}

// Defer importing server until after polyfills are in place
import { server } from './test/msw/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window._env_ for config.js
window._env_ = {
  SIMPLEACCOUNTS_HOST: 'http://localhost:8080',
};

// Mock Vite's import.meta.env for tests
// Vite uses import.meta.env instead of process.env
// Set up globalThis.import.meta.env for env.js compatibility
// env.js checks globalThis.import.meta.env first for Vitest compatibility
if (!globalThis.import) {
  globalThis.import = {
    meta: {
      env: {
        MODE: process.env.NODE_ENV || 'test',
        DEV: process.env.NODE_ENV !== 'production',
        PROD: process.env.NODE_ENV === 'production',
        SSR: false,
        BASE_URL: '/',
        // Add any VITE_ prefixed variables from process.env
        ...Object.keys(process.env)
          .filter(key => key.startsWith('VITE_'))
          .reduce((acc, key) => {
            acc[key] = process.env[key];
            return acc;
          }, {}),
      },
    },
  };
}

// Mock localStorage with default language for react-localization
const localStorageMock = {
  store: { language: 'en' },
  getItem: vi.fn(function (key) {
    return this.store[key] || null;
  }),
  setItem: vi.fn(function (key, value) {
    this.store[key] = value;
  }),
  removeItem: vi.fn(function (key) {
    delete this.store[key];
  }),
  clear: vi.fn(function () {
    this.store = { language: 'en' };
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock react-localization to avoid language-related errors in tests
vi.mock('react-localization', () => {
  return {
    default: class LocalizedStrings {
      constructor(data) {
        this.data = data || {};
        // Copy all properties from the 'en' language as defaults
        if (data && data.en) {
          Object.keys(data.en).forEach(key => {
            this[key] = data.en[key];
          });
        }
      }
      setLanguage(lang) {
        const langData = this.data[lang || 'en'] || this.data.en || {};
        Object.keys(langData).forEach(key => {
          this[key] = langData[key];
        });
      }
      getLanguage() {
        return 'en';
      }
      getInterfaceLanguage() {
        return 'en';
      }
      formatString(str, ..._values) {
        return str;
      }
    },
  };
});

// Mock createRange for some UI libraries if needed
if (global.document) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
  });
}

// Mock react-router-navigation-prompt (incompatible with React Router v6)
// This library uses withRouter which doesn't exist in v6
vi.mock('react-router-navigation-prompt', () => {
  return {
    default: ({ children }) => {
      // Return a component that renders children with mock functions
      // This allows tests to run without the actual navigation prompt functionality
      return children({
        isActive: false,
        onCancel: vi.fn(),
        onConfirm: vi.fn(),
      });
    },
  };
});
