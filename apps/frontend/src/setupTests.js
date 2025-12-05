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
