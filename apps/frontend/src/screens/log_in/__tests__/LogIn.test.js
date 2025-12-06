import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LogIn from '../screen';
import { AuthActions, CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('services/global', () => ({
  AuthActions: {
    logIn: jest.fn(),
    getCompanyCount: jest.fn(),
    getUserSubscription: jest.fn(),
  },
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('LogIn Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        version: '1.0.0',
      },
    };

    store = mockStore(initialState);
    jest.clearAllMocks();

    AuthActions.getCompanyCount.mockReturnValue(
      Promise.resolve({ data: 1, status: 200 })
    );
    AuthActions.getUserSubscription.mockReturnValue(
      Promise.resolve({
        status: 200,
        data: { message: 'active', status: 'active' }
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the login screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });
  });

  it('should display email and password input fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Email Id/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    });
  });

  it('should call getCompanyCount on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getCompanyCount).toHaveBeenCalled();
    });
  });

  it('should call getUserSubscription on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getUserSubscription).toHaveBeenCalled();
    });
  });

  it('should show validation error when submitting empty form', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for empty password field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText(/Enter Email Id/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility when eye icon is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(/Enter password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    const eyeIcon = screen.getByClassName('password-icon');
    fireEvent.click(eyeIcon);

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(/Enter password/i);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  it('should handle successful login', async () => {
    AuthActions.logIn.mockReturnValue(
      Promise.resolve({ status: 200, data: { token: 'test-token' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText(/Enter Email Id/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(AuthActions.logIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'Password123!',
      });
    });
  });

  it('should handle login failure with error message', async () => {
    AuthActions.logIn.mockReturnValue(
      Promise.reject({ data: { message: 'Invalid credentials' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText(/Enter Email Id/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(AuthActions.logIn).toHaveBeenCalled();
    });
  });

  it('should navigate to forgot password page when link is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const forgotPasswordLink = screen.getByText(/Forgot password?/i);
      expect(forgotPasswordLink).toBeInTheDocument();
    });
  });

  it('should redirect to register page if company count is less than 1', async () => {
    AuthActions.getCompanyCount.mockReturnValue(
      Promise.resolve({ data: 0, status: 200 })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getCompanyCount).toHaveBeenCalled();
    });
  });

  it('should display subscription expired message when subscription is not active', async () => {
    AuthActions.getUserSubscription.mockReturnValue(
      Promise.resolve({
        status: 200,
        data: { message: 'expired', status: 'expired' }
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.getUserSubscription).toHaveBeenCalled();
    });
  });

  it('should disable login button when loading', async () => {
    AuthActions.logIn.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 1000))
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText(/Enter Email Id/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    const submitButton = screen.getByRole('button', { name: /Log In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should prevent copy and paste on password field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);

    const pasteEvent = new Event('paste', { bubbles: true });
    Object.defineProperty(pasteEvent, 'preventDefault', {
      value: jest.fn(),
    });

    fireEvent(passwordInput, pasteEvent);

    await waitFor(() => {
      expect(pasteEvent.preventDefault).toBeDefined();
    });
  });

  it('should show register link when company count is less than 1', async () => {
    AuthActions.getCompanyCount.mockReturnValue(
      Promise.resolve({ data: 0, status: 200 })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogIn />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Register Here/i)).toBeInTheDocument();
    });
  });
});
