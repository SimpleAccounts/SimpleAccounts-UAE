import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ResetPassword from '../screen';
import { api } from 'utils';

jest.mock('utils', () => ({
  api: jest.fn(),
}));

jest.mock('components', () => ({
  Message: ({ type, content }) => (
    <div data-testid={`message-${type}`}>{content}</div>
  ),
}));

jest.mock('../sections/reset_new_password', () => {
  return function ResetNewPassword(props) {
    return <div data-testid="reset-new-password">Reset New Password Component</div>;
  };
});

describe('ResetPassword Screen Component', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the reset password screen without errors', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });

  it('should display email input field', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    expect(emailInput).toBeInTheDocument();
  });

  it('should display send verification email button', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const sendButton = screen.getByText('Send Verification Email');
    expect(sendButton).toBeInTheDocument();
  });

  it('should display back to login button', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const backButton = screen.getByText('Back To Login');
    expect(backButton).toBeInTheDocument();
  });

  it('should show validation error when email field is empty', async () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Email id is required')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email Id')).toBeInTheDocument();
    });
  });

  it('should call API with correct data when valid email is submitted', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/public/forgotPassword',
          data: expect.objectContaining({
            username: 'test@example.com',
          }),
        })
      );
    });
  });

  it('should display success message when email is sent successfully', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('message-success')).toBeInTheDocument();
      expect(
        screen.getByText('We Have Sent You a Verification Email. Please Check Your Mail Box.')
      ).toBeInTheDocument();
    });
  });

  it('should redirect to login page after successful email submission', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(
      () => {
        expect(history.location.pathname).toBe('/login');
      },
      { timeout: 2000 }
    );
  });

  it('should display error message when API call fails', async () => {
    api.mockRejectedValue({ response: { data: { message: 'Invalid Email' } } });

    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('message-danger')).toBeInTheDocument();
      expect(screen.getByText('Invalid Email Address')).toBeInTheDocument();
    });
  });

  it('should navigate to login page when back to login button is clicked', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const backButton = screen.getByText('Back To Login');
    fireEvent.click(backButton);

    expect(history.location.pathname).toBe('/login');
  });

  it('should extract token from URL query parameters', () => {
    const location = { search: '?token=test-token-123' };

    render(
      <Router history={history}>
        <ResetPassword location={location} history={history} />
      </Router>
    );

    expect(screen.getByTestId('reset-new-password')).toBeInTheDocument();
  });

  it('should render ResetNewPassword component when token is present', () => {
    const location = { search: '?token=test-token-123' };

    render(
      <Router history={history}>
        <ResetPassword location={location} history={history} />
      </Router>
    );

    expect(screen.getByTestId('reset-new-password')).toBeInTheDocument();
    expect(screen.queryByText('Forgot Password')).not.toBeInTheDocument();
  });

  it('should render logo image', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const logoImage = screen.getByAltText('logo');
    expect(logoImage).toBeInTheDocument();
  });

  it('should allow user to type in email field', () => {
    render(
      <Router history={history}>
        <ResetPassword location={{ search: '' }} history={history} />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('Please Enter Your Email Address');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });

    expect(emailInput.value).toBe('user@test.com');
  });
});
