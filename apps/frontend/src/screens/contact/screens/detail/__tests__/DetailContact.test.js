// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
import { vi, describe, it, expect, beforeEach } from 'vitest';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;

// Mock useLocation hook - use vi.hoisted to avoid hoisting issues
const mockUseLocation = vi.hoisted(() =>
  vi.fn(() => ({
    pathname: '/admin/contact/detail/1',
    search: '',
    hash: '',
    state: { id: '1' },
    key: 'default',
  }))
);

const mockUseNavigate = vi.hoisted(() => vi.fn(() => vi.fn()));
const mockUseParams = vi.hoisted(() => vi.fn(() => ({ id: '1' })));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: mockUseLocation,
    useNavigate: mockUseNavigate,
    useParams: mockUseParams,
  };
});

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock action modules with thunks
vi.mock('../../actions', () => ({
  getContactList: () => () => Promise.resolve({ data: [] }),
  getCountryList: () => () => Promise.resolve({ data: [] }),
  getStateList: () => () => Promise.resolve({ data: [] }),
  getCityList: () => () => Promise.resolve({ data: [] }),
  getContactTypeList: () => () => Promise.resolve({ data: [] }),
  getTaxTreatmentList: () => () => Promise.resolve({ data: [] }),
  checkValidation: () => () => Promise.resolve({ status: 200, data: { exist: false } }),
}));

vi.mock('./actions', () => ({
  getContactById: () => () =>
    Promise.resolve({
      status: 200,
      data: {
        contactId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: true,
      },
    }),
  updateContact: () => () => Promise.resolve({ status: 200 }),
  deleteContact: () => () => Promise.resolve({ status: 200 }),
  checkEmailExist: () => () => Promise.resolve({ data: { exist: false } }),
  checkTrnExist: () => () => Promise.resolve({ data: { exist: false } }),
}));

vi.mock('services/global', () => ({
  CommonActions: {
    getUniversalCurrencyList: () => () => Promise.resolve({ data: [] }),
    getCurrencyConversionList: () => () => Promise.resolve({ data: [] }),
    fillManDatoryDetails: () => () => {},
    tostifyAlert: () => () => {},
  },
}));

// Mock react-phone-input-2
vi.mock('react-phone-input-2', () => ({
  default: ({ value, onChange, ...props }) => (
    <input
      data-testid="phone-input"
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      {...props}
    />
  ),
}));

// Mock react-select
vi.mock('react-select', () => ({
  default: ({ options, value, onChange, placeholder, ...props }) => (
    <select
      data-testid={props['data-testid'] || 'react-select'}
      value={value?.value || ''}
      onChange={e => {
        const selected = options?.find(o => String(o.value) === e.target.value);
        onChange && onChange(selected);
      }}
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options?.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

// Mock AddressComponent
vi.mock('screens/contact/sections', () => ({
  AddressComponent: () => <div data-testid="address-component">Address Component</div>,
}));

// Import component AFTER mocks are set up
import DetailContact from '../screen';

// Mock prop action objects
const mockActions = {
  getContactById: vi.fn(
    () => () =>
      Promise.resolve({
        status: 200,
        data: {
          contactId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          isActive: true,
        },
      })
  ),
  getTaxTreatment: vi.fn(() => () => Promise.resolve({ status: 200, data: [] })),
  getCountryList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getStateList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCityList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getContactTypeList: vi.fn(() => () => Promise.resolve({ data: [] })),
  updateContact: vi.fn(() => () => Promise.resolve({ status: 200 })),
  deleteContact: vi.fn(() => () => Promise.resolve({ status: 200 })),
  checkValidation: vi.fn(() => () => Promise.resolve({ status: 200, data: { exist: false } })),
};

const mockCommonActions = {
  getUniversalCurrencyList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCurrencyConversionList: vi.fn(() => () => Promise.resolve({ data: [] })),
  fillManDatoryDetails: vi.fn(() => () => {}),
  tostifyAlert: vi.fn(() => () => {}),
};

const defaultProps = {
  contactActions: mockActions,
  detailContactActions: mockActions,
  commonActions: mockCommonActions,
  history: {
    push: vi.fn(),
    goBack: vi.fn(),
  },
  location: {
    pathname: '/admin/contact/detail/1',
    search: '',
    hash: '',
    state: { id: '1' },
    key: 'default',
  },
  match: {
    params: {
      id: '1',
    },
  },
  country_list: [],
  currency_list_dropdown: [],
  contact_type_list: [],
  companyDetails: {},
  isParentComponentPresent: false,
  getCurrentContactData: null,
  closeModal: null,
  confirmCancel: null,
};

const renderComponent = (props = {}, initialState = {}) => {
  const store = mockStore({
    contact: {
      country_list: [],
      state_list: [],
      city_list: [],
      contact_type_list: [],
      currency_list: [],
      contact_detail: null,
      ...initialState.contact,
    },
    common: {
      universal_currency_list: [],
      ...initialState.common,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <DetailContact {...defaultProps} {...props} />
      </BrowserRouter>
    </Provider>
  );
};

describe('DetailContact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset useLocation mock to return default location
    mockUseLocation.mockReturnValue({
      pathname: '/admin/contact/detail/1',
      search: '',
      hash: '',
      state: { id: '1' },
      key: 'default',
    });
  });

  it('should render detail contact form', async () => {
    renderComponent();

    // Wait for form to load - use exact text to avoid multiple matches
    await waitFor(() => {
      expect(screen.getByText('Update Contact')).toBeInTheDocument();
    });
  });

  it('should display form inputs', async () => {
    renderComponent();

    await waitFor(() => {
      // Check for First Name label
      expect(screen.getByText(/first.*name/i)).toBeInTheDocument();
    });
  });

  it('should display delete button', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display update button', async () => {
    renderComponent();

    await waitFor(() => {
      const updateButton = screen.getByRole('button', { name: /update/i });
      expect(updateButton).toBeInTheDocument();
    });
  });

  it('should display cancel button', async () => {
    renderComponent();

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should navigate back on cancel', async () => {
    const mockHistory = {
      push: vi.fn(),
      goBack: vi.fn(),
    };

    renderComponent({ history: mockHistory });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Update Contact')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Cancel button uses history.push('/admin/master/contact')
    await waitFor(
      () => {
        expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/contact');
      },
      { timeout: 2000 }
    );
  });

  it('should display address components', async () => {
    renderComponent();

    await waitFor(
      () => {
        // Look for mocked address components (billing and shipping)
        const addressComponents = screen.getAllByTestId('address-component');
        expect(addressComponents.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 2000 }
    );
  });

  it('should display phone input', async () => {
    renderComponent();

    await waitFor(() => {
      const phoneInput = screen.getByTestId('phone-input');
      expect(phoneInput).toBeInTheDocument();
    });
  });
});
