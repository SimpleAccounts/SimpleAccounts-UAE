import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
const {
  TransformStream,
  WritableStream,
  ReadableStream,
} = require('web-streams-polyfill/dist/ponyfill.js');

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
    constructor() {}
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.BroadcastChannel = MockBroadcastChannel;
}

// Defer importing server until after polyfills are in place
const { server } = require('./test/msw/server');

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window._env_ for config.js
window._env_ = {
  SIMPLEACCOUNTS_HOST: 'http://localhost:8080',
};

// Mock localStorage with default language for react-localization
const localStorageMock = {
  store: { language: 'en' },
  getItem: jest.fn(function(key) {
    return this.store[key] || null;
  }),
  setItem: jest.fn(function(key, value) {
    this.store[key] = value;
  }),
  removeItem: jest.fn(function(key) {
    delete this.store[key];
  }),
  clear: jest.fn(function() {
    this.store = { language: 'en' };
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock react-localization to avoid language-related errors in tests
jest.mock('react-localization', () => {
  return class LocalizedStrings {
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
