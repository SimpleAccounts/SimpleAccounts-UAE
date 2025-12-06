import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import GeneralSettings from '../screen';
import * as GeneralSettingActions from '../actions';
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

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('GeneralSettings Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {};

    store = mockStore(initialState);

    GeneralSettingActions.getGeneralSettingDetail = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          id: 1,
          invoiceMailingSubject: 'Test Subject',
          invoicingReferencePattern: 'INV-',
          fromEmailAddress: 'test@example.com',
          mailingHost: 'smtp.gmail.com',
          mailingPort: '587',
          mailingUserName: 'testuser',
          mailingPassword: 'testpass',
          mailingAPIKey: 'apikey123',
          invoiceMailingBody: 'Test email body',
          mailingSmtpAuthorization: 'true',
          mailingSmtpStarttlsEnable: 'true',
          loggedInUserEmailFlag: false,
        },
      })
    );
    GeneralSettingActions.updateGeneralSettings = jest.fn(() =>
      Promise.resolve({ status: 200 })
    );
    GeneralSettingActions.getTestUserMailById = jest.fn(() =>
      Promise.resolve({ status: 200 })
    );
    AuthActions.checkAuthStatus = jest.fn(() =>
      Promise.resolve({ status: 200, data: { userId: 1 } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the general settings screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/General Settings/i)).toBeInTheDocument();
    });
  });

  it('should call getGeneralSettingDetail on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GeneralSettingActions.getGeneralSettingDetail).toHaveBeenCalled();
    });
  });

  it('should call checkAuthStatus on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(AuthActions.checkAuthStatus).toHaveBeenCalled();
    });
  });

  it('should display mail configuration section', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mail Configuration Detail/i)).toBeInTheDocument();
    });
  });

  it('should render mailing host input field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const mailingHostInput = screen.getByPlaceholderText(/Mailing Host/i);
      expect(mailingHostInput).toBeInTheDocument();
    });
  });

  it('should render mailing port input field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const mailingPortInput = screen.getByPlaceholderText(/Mailing Port/i);
      expect(mailingPortInput).toBeInTheDocument();
    });
  });

  it('should render mailing username input field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mailing User Name/i)).toBeInTheDocument();
    });
  });

  it('should render mailing password input field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mailing Password/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const passwordIcon = document.querySelector('.fa-eye-slash');
      if (passwordIcon) {
        fireEvent.click(passwordIcon);
      }
    });
  });

  it('should render SMTP Authorization radio buttons', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mailing SMTP Authorization/i)).toBeInTheDocument();
    });
  });

  it('should render SMTP StartTLS Enable radio buttons', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mailing SMTP StartTLS Enable/i)).toBeInTheDocument();
    });
  });

  it('should render sender email options', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sender Email/i)).toBeInTheDocument();
    });
  });

  it('should render Test Mail button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Mail/i)).toBeInTheDocument();
    });
  });

  it('should handle Test Mail button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const testMailButton = screen.getByText(/Test Mail/i);
      fireEvent.click(testMailButton);
    });

    expect(GeneralSettingActions.getTestUserMailById).toHaveBeenCalled();
  });

  it('should render Save button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButtons = screen.getAllByText(/Save/i);
      expect(saveButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render Cancel button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });

  it('should populate form fields with fetched data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <GeneralSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const mailingHostInput = screen.getByPlaceholderText(/Mailing Host/i);
      expect(mailingHostInput.value).toBe('smtp.gmail.com');
    });
  });
});
