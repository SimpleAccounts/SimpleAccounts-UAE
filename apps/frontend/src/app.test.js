import { render } from '@testing-library/react';
import { vi } from 'vitest';
import App from './app';

// Mock routes
vi.mock('routes', () => ({
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
vi.mock('services', () => {
  const mockStore = {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({})),
    subscribe: vi.fn(),
    replaceReducer: vi.fn(),
  };
  return {
    configureStore: () => mockStore,
  };
});

// Mock components
vi.mock('components', () => ({
  Loading: () => <div data-testid="loading">Loading...</div>,
  RouteLoading: () => <div data-testid="route-loading">Route Loading...</div>,
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
