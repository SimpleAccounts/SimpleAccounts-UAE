import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';
import {
  TransformStream,
  WritableStream,
  ReadableStream,
} from 'web-streams-polyfill/dist/ponyfill.js';

// Import MSW server after polyfills
import { server } from './msw/server';

// Make jest globals available for backward compatibility
// eslint-disable-next-line no-undef
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

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window._env_ for config.js
window._env_ = {
  SIMPLEACCOUNTS_HOST: 'http://localhost:8080',
};

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
      formatString(str, ...values) {
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
vi.mock('react-router-navigation-prompt', () => {
  return {
    default: ({ children, when }) => {
      return children({
        isActive: false,
        onCancel: vi.fn(),
        onConfirm: vi.fn(),
      });
    },
  };
});

// Mock react-loader-spinner to avoid DOM API issues
vi.mock('react-loader-spinner', () => ({
  Circles: () => null,
  ThreeDots: () => null,
  Oval: () => null,
  TailSpin: () => null,
  Rings: () => null,
  Puff: () => null,
  Bars: () => null,
  Audio: () => null,
  BallTriangle: () => null,
  Grid: () => null,
  Hearts: () => null,
  InfinitySpin: () => null,
  LineWave: () => null,
  MagnifyingGlass: () => null,
  MutatingDots: () => null,
  ProgressBar: () => null,
  Radio: () => null,
  RevolvingDot: () => null,
  RotatingLines: () => null,
  RotatingSquare: () => null,
  RotatingTriangles: () => null,
  Triangle: () => null,
  Watch: () => null,
  Dna: () => null,
  FidgetSpinner: () => null,
  ColorRing: () => null,
  Discuss: () => null,
  Vortex: () => null,
  Comment: () => null,
  FallingLines: () => null,
}));

// Mock CSS imports
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));

// Mock image imports
vi.mock('*.png', () => 'test-file-stub');
vi.mock('*.jpg', () => 'test-file-stub');
vi.mock('*.jpeg', () => 'test-file-stub');
vi.mock('*.gif', () => 'test-file-stub');
vi.mock('*.svg', () => 'test-file-stub');
