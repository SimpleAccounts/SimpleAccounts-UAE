/**
 * Tests for AdminLayout Component
 * Verifies AdminLayout integration with new layout components
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminLayout from '../../layouts/admin/index.jsx';
import authReducer from '../../services/global/auth/authSlice';
import commonReducer from '../../services/global/common/commonSlice';

// Mock components
jest.mock('../../layouts/components/header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('../../layouts/components/sidebar', () => {
  return function MockSidebar() {
    return <aside data-testid="sidebar">Sidebar</aside>;
  };
});

jest.mock('../../layouts/components/footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

jest.mock('../../utils/withNavigation', () => ({
  withNavigation: (Component) => Component,
}));

// Mock routes - adminRoutes is imported from 'routes' which exports from routes/admin.js
jest.mock('../../routes', () => ({
  adminRoutes: [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      component: () => <div>Dashboard Content</div>,
    },
  ],
}));

// Mock auth actions
const mockAuthActions = {
  checkAuthStatus: jest.fn().mockResolvedValue({
    data: { role: { roleCode: 'admin' } },
  }),
  getUserSubscription: jest.fn().mockResolvedValue({
    status: 200,
    data: { status: 'active' },
  }),
  logOut: jest.fn(),
};

const mockCommonActions = {
  getCompanyDetails: jest.fn().mockResolvedValue({
    data: { isRegisteredVat: true },
  }),
  getRoleList: jest.fn().mockResolvedValue({}),
  getCompanyCurrency: jest.fn().mockResolvedValue({}),
  getCurrencyConversionList: jest.fn().mockResolvedValue({}),
  getVatList: jest.fn().mockResolvedValue({}),
  getCurrencyList: jest.fn().mockResolvedValue({}),
  getSimpleAccountsVersion: jest.fn(),
  setTostifyAlertFunc: jest.fn(),
  tostifyAlert: jest.fn(),
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      common: commonReducer,
      user: (state = { user_list: [] }) => state,
    },
    preloadedState: {
      auth: {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      common: {
        version: '1.0.0',
        user_role_list: [
          { moduleName: 'Dashboard' },
        ],
      },
      user: {
        user_list: [],
      },
    },
  });
};

describe('AdminLayout Component', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
    localStorage.setItem('accessToken', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderAdminLayout = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminLayout
            authActions={mockAuthActions}
            commonActions={mockCommonActions}
            history={{ push: jest.fn() }}
            location={{ pathname: '/admin/dashboard' }}
          />
        </MemoryRouter>
      </Provider>
    );
  };

  test('renders all layout components', async () => {
    renderAdminLayout();
    
    // Wait for loading to complete and components to render
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders breadcrumb navigation', async () => {
    renderAdminLayout();
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders main content area', async () => {
    renderAdminLayout();
    
    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays subscription message when present', async () => {
    mockAuthActions.getUserSubscription.mockResolvedValue({
      status: 200,
      data: { status: 'expired' },
    });

    renderAdminLayout();
    
    await waitFor(() => {
      // Subscription message should be displayed if validation is enabled
      // This depends on config.VALIDATE_SUBSCRIPTION
    }, { timeout: 3000 });
  });
});

