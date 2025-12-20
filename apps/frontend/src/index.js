import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'polyfill';

// Register Chart.js components before any chart renders
import 'utils/chartRegistry';

import React from 'react';
import { createRoot } from 'react-dom/client';

import 'assets/css/tailwind.css';
import 'assets/css/global.scss';
import { ThemeProvider } from 'next-themes';

import App from 'app';
import { Toaster } from '@/components/ui/sonner';
import * as serviceWorker from 'serviceWorker';

// Suppress findDOMNode deprecation warning from react-select v3
// This is a known issue in react-select v3.x that will be fixed in v5+
// See: https://github.com/JedWatson/react-select/issues/3590
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
      // Suppress this specific warning from react-select
      return;
    }
    originalError.apply(console, args);
  };
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
    <Toaster />
  </ThemeProvider>
);

serviceWorker.unregister();
