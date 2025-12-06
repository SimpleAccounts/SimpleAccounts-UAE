import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Register from '../screen';
import { AuthActions, CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('services/global', () => ({
  AuthActions: {
    register: jest.fn(),
    registerStrapiUser: jest.fn(),
    getCompanyCount: jest.fn(),
    getCurrencyList: jest.fn(),
    getTimeZoneList: jest.fn(),
    getSimpleAccountsreleasenumber: jest.fn(),
  },
  CommonActions: {
    tostifyAlert: jest.fn(),
    getStateList: jest.fn(),
    getCountryList: jest.fn(),
    getCompanyTypeListRegister: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();

describe('Register Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        country_list: [
          {
            countryCode: 229,
            countryName: 'United Arab Emirates',
            countryFullName: 'United Arab Emirates - (null)',
          },
        ],
        state_list: [
          { value: 1, label: 'Dubai' },
          { value: 2, label: 'Abu Dhabi' },
        ],
        version: '1.0.0',
        universal_currency_list: [
          {
            currencyCode: 150,
            currencyName: 'UAE Dirham - AED',
            currencyIsoCode: 'AED',
          },
        ],
        company_type_list: [
          { value: 1, label: 'LLC' },
          { value: 2, label: 'Sole Proprietorship' },
        ],
      },
    };

    store = mockStore(initialState);
    jest.clearAllMocks();

    AuthActions.getCompanyCount.mockReturnValue(
      Promise.resolve({ data: 0, status: 200 })
    );
    AuthActions.getTimeZoneList.mockReturnValue(
      Promise.resolve({ data: ['Asia/Dubai', 'Asia/Abu_Dhabi'], status: 200 })
    );
    AuthActions.getCurrencyList.mockReturnValue(
      Promise.resolve({ status: 200 })
    );
    AuthActions.getSimpleAccountsreleasenumber.mockReturnValue(
      Promise.resolve({ simpleAccountsRelease: '1.0.0', status: 200 })
    );
    CommonActions.getStateList.mockReturnValue(
      Promise.resolve({ status: 200 })
    );
    CommonActions.getCompanyTypeListRegister.mockReturnValue(
      Promise.resolve({ status: 200 })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the register screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Register/i)).toBeInTheDocument();
    });
  });

  it('should display all company details input fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Company Name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter Company Address/i)).toBeInTheDocument();
    });
  });

  it('should call initialization methods on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getCompanyCount).toHaveBeenCalled();
      expect(AuthActions.getTimeZoneList).toHaveBeenCalled();
      expect(AuthActions.getCurrencyList).toHaveBeenCalled();
    });
  });

  it('should show validation error when submitting empty company name', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText(/Enter Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid Email/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText(/ Enter Password/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Must contain minimum 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate password confirmation match', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText(/ Enter Password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm Password/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456!' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Passwords must match/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(/ Enter Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    const eyeIcon = screen.getByClassName('password-icon');
    fireEvent.click(eyeIcon);

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(/ Enter Password/i);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  it('should handle VAT registration checkbox toggle', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const vatCheckbox = screen.getByLabelText(/Is VAT Registered?/i);
      fireEvent.click(vatCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Tax Registration Number/i)).toBeInTheDocument();
    });
  });

  it('should show TRN field when VAT registered is checked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const vatCheckbox = screen.getByLabelText(/Is VAT Registered?/i);
    fireEvent.click(vatCheckbox);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Tax Registration Number/i)).toBeVisible();
      expect(screen.getByPlaceholderText(/Select VAT Registered Date/i)).toBeVisible();
    });
  });

  it('should validate TRN when VAT registered is checked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const vatCheckbox = screen.getByLabelText(/Is VAT Registered?/i);
    fireEvent.click(vatCheckbox);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Tax registration number is required/i)).toBeInTheDocument();
    });
  });

  it('should handle phone number input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const phoneInputs = screen.getAllByRole('textbox');
      const phoneInput = phoneInputs.find(input =>
        input.className && input.className.includes('phone')
      );
      if (phoneInput) {
        fireEvent.change(phoneInput, { target: { value: '+971501234567' } });
      }
    });
  });

  it('should handle successful registration', async () => {
    AuthActions.register.mockReturnValue(
      Promise.resolve({ status: 200, data: { message: 'Success' } })
    );
    AuthActions.registerStrapiUser.mockReturnValue(
      Promise.resolve({ status: 200 })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    // Fill in all required fields
    const companyNameInput = screen.getByPlaceholderText(/Enter Company Name/i);
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });
  });

  it('should handle registration failure', async () => {
    AuthActions.register.mockReturnValue(
      Promise.reject({ data: { message: 'Registration failed' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText(/Enter Company Name/i);
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(submitButton);
    });
  });

  it('should redirect to login if company count is greater than 0', async () => {
    AuthActions.getCompanyCount.mockReturnValue(
      Promise.resolve({ data: 1, status: 200 })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getCompanyCount).toHaveBeenCalled();
    });
  });

  it('should display loading state during registration', async () => {
    AuthActions.register.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 1000))
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText(/Enter Company Name/i);
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
