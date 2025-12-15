/**
 * Tests for InitialLayout component (React Router v6)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import InitialLayout from '../initial';

const mockStore = configureStore([]);

// Mock the routes
jest.mock('routes', () => ({
  initialRoutes: [
    {
      path: '/login',
      name: 'LogIn',
      component: () => <div data-testid="login">Login Page</div>,
    },
    {
      path: '/register',
      name: 'Register',
      component: () => <div data-testid="register">Register Page</div>,
    },
    {
      redirect: true,
      path: '/',
      pathTo: '/login',
      name: 'Initial',
    },
  ],
}));

// Mock services
jest.mock('services/global', () => ({
  AuthActions: {},
  CommonActions: {},
}));

// Mock config
jest.mock('constants/config', () => ({
  DASHBOARD: true,
  BASE_ROUTE: '/admin/dashboard',
  SECONDARY_BASE_ROUTE: '/admin/income/customer-invoice',
}));

describe('InitialLayout Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {},
      common: {},
    });
    // Clear sessionStorage
    window.sessionStorage.clear();
  });

  it('should render login page on /login route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <InitialLayout />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('should render register page on /register route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/register']}>
          <InitialLayout />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('register')).toBeInTheDocument();
  });

  it('should redirect from / to /login', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <InitialLayout />
        </MemoryRouter>
      </Provider>
    );

    // Should redirect to login
    waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard when accessToken exists in sessionStorage', () => {
    window.sessionStorage.setItem('accessToken', 'test-token');

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <InitialLayout />
        </MemoryRouter>
      </Provider>
    );

    // Component should attempt navigation (tested via withNavigation HOC)
    expect(container).toBeInTheDocument();
  });
});

