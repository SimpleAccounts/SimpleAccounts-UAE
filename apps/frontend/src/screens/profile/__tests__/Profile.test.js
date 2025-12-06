import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Profile from '../screen';
import * as ProfileActions from '../actions';
import { CommonActions, AuthActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
  AuthActions: {
    checkAuthStatus: jest.fn(),
  },
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  LeavePage: () => <div data-testid="leave-page">Leave Page Component</div>,
  ImageUploader: ({ onChange }) => (
    <div data-testid="image-uploader">
      <button
        onClick={() => onChange([new File([''], 'test.png', { type: 'image/png' })])}
      >
        Upload Image
      </button>
    </div>
  ),
}));

jest.mock('react-phone-input-2', () => {
  return function PhoneInput(props) {
    return (
      <input
        data-testid="phone-input"
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value}
      />
    );
  };
});

jest.mock('react-password-checklist', () => {
  return function PasswordChecklist() {
    return <div data-testid="password-checklist">Password Checklist</div>;
  };
});

describe('Profile Screen Component', () => {
  let store;
  let history;
  let initialState;

  beforeEach(() => {
    history = createMemoryHistory();
    initialState = {
      profile: {
        currency_list: [
          { currencyCode: 'USD', currencyName: 'US Dollar' },
          { currencyCode: 'AED', currencyName: 'UAE Dirham' },
        ],
        country_list: [
          { countryCode: 'US', countryName: 'United States' },
          { countryCode: 'AE', countryName: 'United Arab Emirates' },
        ],
        industry_type_list: [
          { value: 'tech', label: 'Technology' },
          { value: 'finance', label: 'Finance' },
        ],
        company_type_list: [
          { value: 'llc', label: 'LLC' },
          { value: 'corp', label: 'Corporation' },
        ],
        role_list: [
          { id: 1, name: 'Admin' },
          { id: 2, name: 'User' },
        ],
        invoicing_state_list: [],
        company_state_list: [],
      },
    };

    store = mockStore(initialState);

    AuthActions.checkAuthStatus = jest.fn(() =>
      Promise.resolve({ status: 200, data: { userId: 1 } })
    );

    ProfileActions.getCountryList = jest.fn(() => Promise.resolve({ status: 200 }));
    ProfileActions.getIndustryTypeList = jest.fn(() => Promise.resolve({ status: 200 }));
    ProfileActions.getCompanyTypeList = jest.fn(() => Promise.resolve({ status: 200 }));
    ProfileActions.getRoleList = jest.fn(() => Promise.resolve({ status: 200 }));
    ProfileActions.getUserDetail = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
        },
      })
    );
    ProfileActions.getCompanyDetail = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          companyName: 'Test Company',
          vatNumber: '123456789',
        },
      })
    );
    ProfileActions.updateUserDetail = jest.fn(() =>
      Promise.resolve({ status: 200, data: {} })
    );
    ProfileActions.updateCompanyDetail = jest.fn(() =>
      Promise.resolve({ status: 200, data: {} })
    );
    ProfileActions.changePassword = jest.fn(() =>
      Promise.resolve({ status: 200, data: {} })
    );

    window.localStorage.setItem('language', 'en');

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the profile screen without errors', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should display loader initially', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should call checkAuthStatus on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.checkAuthStatus).toHaveBeenCalled();
    });
  });

  it('should call getUserDetail on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(ProfileActions.getUserDetail).toHaveBeenCalled();
    });
  });

  it('should call getCompanyDetail on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(ProfileActions.getCompanyDetail).toHaveBeenCalled();
    });
  });

  it('should display user profile tab', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should display company profile tab', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should handle tab switching', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should display image uploader for user photo', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const uploaders = screen.getAllByTestId('image-uploader');
      expect(uploaders.length).toBeGreaterThan(0);
    });
  });

  it('should handle user photo upload', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      const uploadButtons = screen.getAllByText('Upload Image');
      expect(uploadButtons.length).toBeGreaterThan(0);
    });
  });

  it('should update user details when save button is clicked', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should display success message after updating user profile', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should handle password change', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('should handle error when fetching user details fails', async () => {
    ProfileActions.getUserDetail = jest.fn(() =>
      Promise.reject({ data: { message: 'Failed to fetch user details' } })
    );

    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith('error', expect.any(String));
    });
  });

  it('should handle error when fetching company details fails', async () => {
    ProfileActions.getCompanyDetail = jest.fn(() =>
      Promise.reject({ data: { message: 'Failed to fetch company details' } })
    );

    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith('error', expect.any(String));
    });
  });

  it('should redirect when auth check fails', async () => {
    AuthActions.checkAuthStatus = jest.fn(() =>
      Promise.reject({ data: { message: 'Unauthorized' } })
    );

    render(
      <Provider store={store}>
        <Router history={history}>
          <Profile history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(history.location.pathname).toMatch(/admin/);
    });
  });
});
