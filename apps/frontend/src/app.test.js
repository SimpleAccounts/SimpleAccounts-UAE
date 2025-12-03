import React from 'react';
import { createRoot } from 'react-dom/client';
import App from 'app';

/**
 * Basic smoke test for App component.
 * Uses React 18's createRoot API.
 */
it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<App />);
  root.unmount();
});
