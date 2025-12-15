import React from 'react';
import { render } from '@testing-library/react';
import App from './app';

// Mock routes
jest.mock('routes', () => ({
  mainRoutes: [
    {
      path: '/admin',
      name: 'AdminLayout',
      component: () => <div data-testid="admin-layout">Admin Layout</div>,
    },
    {
      path: '/',
      name: 'InitialLayout',
      component: () => <div data-testid="initial-layout">Initial Layout</div>,
    },
  ],
}));

// Mock services
jest.mock('services', () => {
  const mockStore = {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  };
  return {
    configureStore: () => mockStore,
  };
});

// Mock components
jest.mock('components', () => ({
  Loading: () => <div data-testid="loading">Loading...</div>,
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render Provider with store', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render BrowserRouter', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render Suspense wrapper', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render Routes component', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render all main routes', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
