import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import NewPassword from '../screen';
import { api } from 'utils';

jest.mock('utils', () => ({
  api: jest.fn(),
}));

jest.mock('components', () => ({
  Message: ({ type, content, link }) => (
    <div data-testid={`message-${type}`}>
      {content}
      {link && <a href={link}>Link</a>}
    </div>
  ),
}));

jest.mock('react-password-checklist', () => {
  return function PasswordChecklist({ rules, value, valueAgain }) {
    return (
      <div data-testid="password-checklist">
        Password Checklist: {rules.join(', ')}
      </div>
    );
  };
});

Object.defineProperty(window, 'location', {
  value: {
    search: '?token=test-token-123',
  },
  writable: true,
});

describe('NewPassword Screen Component', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    window.location.search = '?token=test-token-123';
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the new password screen without errors', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    expect(screen.getByText('Create Password')).toBeInTheDocument();
  });

  it('should display password input field', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should display confirm password input field', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should display create password button', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const createButton = screen.getByText('Create Password');
    expect(createButton).toBeInTheDocument();
  });

  it('should toggle password visibility when eye icon is clicked', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const eyeIcon = document.querySelector('.password-icon');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(eyeIcon);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(eyeIcon);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show validation error when password field is empty', async () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error when confirm password field is empty', async () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test@5678' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });

  it('should show validation error for weak password', async () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Must contain minimum 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should display password checklist when password is entered', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });

    expect(screen.getByTestId('password-checklist')).toBeInTheDocument();
  });

  it('should prevent paste in password field', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const pasteEvent = new Event('paste', { bubbles: true });
    pasteEvent.preventDefault = jest.fn();

    passwordInput.dispatchEvent(pasteEvent);

    expect(pasteEvent.preventDefault).toBeDefined();
  });

  it('should prevent copy in password field', () => {
    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const copyEvent = new Event('copy', { bubbles: true });
    copyEvent.preventDefault = jest.fn();

    passwordInput.dispatchEvent(copyEvent);

    expect(copyEvent.preventDefault).toBeDefined();
  });

  it('should call API with correct data when valid password is submitted', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test@1234' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/public/resetPassword',
          data: expect.objectContaining({
            password: 'Test@1234',
            token: 'test-token-123',
          }),
        })
      );
    });
  });

  it('should display success message when password is created successfully', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test@1234' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('message-success')).toBeInTheDocument();
      expect(screen.getByText('Password Created Successfully.')).toBeInTheDocument();
    });
  });

  it('should redirect to login page after successful password creation', async () => {
    api.mockResolvedValue({ status: 200, data: {} });

    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test@1234' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(
      () => {
        expect(history.location.pathname).toBe('/login');
      },
      { timeout: 2000 }
    );
  });

  it('should display error message when token is expired', async () => {
    api.mockRejectedValue({ response: { data: { message: 'Token expired' } } });

    render(
      <Router history={history}>
        <NewPassword history={history} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText(' Enter Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Test@1234' } });

    const createButton = screen.getByText('Create Password');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('message-danger')).toBeInTheDocument();
      expect(
        screen.getByText(/Email Verification Link Is Expired/i)
      ).toBeInTheDocument();
    });
  });
});
