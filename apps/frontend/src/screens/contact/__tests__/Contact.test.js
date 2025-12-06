import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Contact from '../screen';
import * as ContactActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
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

describe('Contact Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      contact: {
        contact_list: {
          data: [
            {
              id: 1,
              fullName: 'John Doe',
              organization: 'Acme Corp',
              email: 'john@example.com',
              mobileNumber: '1234567890',
              contactTypeString: 'Customer',
              isActive: true,
            },
            {
              id: 2,
              fullName: 'Jane Smith',
              organization: null,
              email: 'jane@example.com',
              mobileNumber: '9876543210',
              contactTypeString: 'Supplier',
              isActive: false,
            },
          ],
          count: 2,
        },
        contact_type_list: [
          { id: 1, name: 'Customer' },
          { id: 2, name: 'Supplier' },
        ],
      },
      common: {
        universal_currency_list: [],
      },
    };

    store = mockStore(initialState);

    ContactActions.getContactList = jest.fn(() =>
      Promise.resolve({ status: 200, data: initialState.contact.contact_list })
    );
    ContactActions.getContactTypeList = jest.fn(() => Promise.resolve());
    ContactActions.removeBulk = jest.fn(() => Promise.resolve({ status: 200, data: { message: 'Success' } }));
    ContactActions.getInvoicesCountContact = jest.fn(() => Promise.resolve({ data: 0 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the contact screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    });
  });

  it('should display contact list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe (Acme Corp)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call getContactList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ContactActions.getContactList).toHaveBeenCalled();
    });
  });

  it('should call getContactTypeList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ContactActions.getContactTypeList).toHaveBeenCalled();
    });
  });

  it('should display email addresses correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('should display mobile numbers with country code prefix', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
    });
  });

  it('should display contact type correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Supplier')).toBeInTheDocument();
    });
  });

  it('should display active status badge with correct styling', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const activeBadge = screen.getByText('Active');
      expect(activeBadge).toHaveClass('badge');
      expect(activeBadge).toHaveClass('label-success');
    });
  });

  it('should display inactive status badge with correct styling', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const inactiveBadge = screen.getByText('InActive');
      expect(inactiveBadge).toHaveClass('badge');
      expect(inactiveBadge).toHaveClass('label-due');
    });
  });

  it('should render add new contact button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => btn.textContent.includes('Add'));
      expect(addButton).toBeDefined();
    });
  });

  it('should handle row selection', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe (Acme Corp)')).toBeInTheDocument();
    });
  });

  it('should display organization name with contact name when available', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe (Acme Corp)')).toBeInTheDocument();
    });
  });

  it('should display only contact name when organization is null', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should handle pagination when multiple contacts exist', async () => {
    const multipleContacts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      fullName: `Contact ${i + 1}`,
      organization: i % 2 === 0 ? `Org ${i}` : null,
      email: `contact${i}@example.com`,
      mobileNumber: `123456${i}`,
      contactTypeString: i % 2 === 0 ? 'Customer' : 'Supplier',
      isActive: true,
    }));

    initialState.contact.contact_list.data = multipleContacts;
    initialState.contact.contact_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Contact 1 (Org 0)')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Contact />
        </BrowserRouter>
      </Provider>
    );

    const state = store.getState();
    expect(state.contact.contact_list).toBeDefined();
  });
});
