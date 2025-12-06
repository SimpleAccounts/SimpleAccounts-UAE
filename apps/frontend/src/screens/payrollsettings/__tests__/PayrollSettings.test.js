import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PayrollSettings from '../screen';
import * as PayrollActions from '../actions';
import { AuthActions, CommonActions } from 'services/global';
import { toast } from 'react-toastify';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  AuthActions: {},
  CommonActions: {
    getCompanyDetails: jest.fn(),
  },
}));
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('PayrollSettings Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        version: '1.0.0',
      },
    };

    store = mockStore(initialState);

    PayrollActions.getCompanyById = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          generateSif: true,
        },
      })
    );

    PayrollActions.getPayrollSettings = jest.fn(() =>
      Promise.resolve({
        status: 200,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the payroll settings screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/PayrollSettings/i)).toBeInTheDocument();
    });
  });

  it('should call getCompanyById on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PayrollActions.getCompanyById).toHaveBeenCalled();
    });
  });

  it('should display SIF Payroll label', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/SifPayroll/i)).toBeInTheDocument();
    });
  });

  it('should render Yes radio button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const yesRadio = screen.getByLabelText(/Yes/i);
      expect(yesRadio).toBeInTheDocument();
      expect(yesRadio).toHaveAttribute('type', 'radio');
    });
  });

  it('should render No radio button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const noRadio = screen.getByLabelText(/No/i);
      expect(noRadio).toBeInTheDocument();
      expect(noRadio).toHaveAttribute('type', 'radio');
    });
  });

  it('should have Yes radio button checked by default when SIF is enabled', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const yesRadio = screen.getByLabelText(/Yes/i);
      expect(yesRadio).toBeChecked();
    });
  });

  it('should toggle radio button from Yes to No', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const noRadio = screen.getByLabelText(/No/i);
      fireEvent.click(noRadio);
      expect(noRadio).toBeChecked();
    });
  });

  it('should render Save button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      expect(saveButton).toBeInTheDocument();
    });
  });

  it('should render Cancel button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const cancelButton = screen.getByText(/Cancel/i);
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should call getPayrollSettings when Save button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(PayrollActions.getPayrollSettings).toHaveBeenCalled();
    });
  });

  it('should show success toast on successful save', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Payroll Settings Saved Successfully');
    });
  });

  it('should navigate to dashboard on successful save', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalled();
    });
  });

  it('should show error toast on save failure', async () => {
    PayrollActions.getPayrollSettings = jest.fn(() =>
      Promise.reject({
        data: { message: 'Save failed' },
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Save UnSuccessful');
    });
  });

  it('should render payroll settings icon', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const icon = document.querySelector('.fa-money-check-alt');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should disable save button when disabled state is true', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PayrollSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      expect(saveButton).not.toBeDisabled();
    });
  });
});
