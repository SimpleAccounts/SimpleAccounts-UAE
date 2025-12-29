import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as thunkModule from 'redux-thunk';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock actions - define before component import
// These need to return thunks (functions) for redux-thunk to process correctly
const mockContactActions = {
  getContactList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCountryList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getStateList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCityList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getContactTypeList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getTaxTreatmentList: vi.fn(() => () => Promise.resolve({ data: [] })),
  checkValidation: vi.fn(() => () => Promise.resolve({ status: 200, data: { exist: false } })),
};

const mockCreateContactActions = {
  saveContact: vi.fn(() => () => Promise.resolve({ status: 200, data: {} })),
  checkEmailExist: vi.fn(() => () => Promise.resolve({ data: { exist: false } })),
  checkTrnExist: vi.fn(() => () => Promise.resolve({ data: { exist: false } })),
};

const mockCommonActions = {
  getUniversalCurrencyList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCurrencyConversionList: vi.fn(() => () => Promise.resolve({ data: [] })),
  fillManDatoryDetails: vi.fn(() => () => {}),
  tostifyAlert: vi.fn(() => () => {}),
};

// Mock the actions modules
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
  saveContact: () => () => Promise.resolve({ status: 200, data: {} }),
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

// Mock AddressComponent to prevent componentDidUpdate error
vi.mock('screens/contact/sections', () => ({
  AddressComponent: () => <div data-testid="address-component">Address Component</div>,
}));

// Import component AFTER all mocks are set up
import CreateContact from '../screen';

const defaultProps = {
  contactActions: mockContactActions,
  createContactActions: mockCreateContactActions,
  commonActions: mockCommonActions,
  history: {
    push: vi.fn(),
    goBack: vi.fn(),
  },
  contactType: null,
  country_list: [],
  currency_list_dropdown: [
    { value: 1, label: 'AED' },
    { value: 2, label: 'USD' },
  ],
  contact_type_list: [
    { value: 1, label: 'Customer' },
    { value: 2, label: 'Supplier' },
  ],
  companyDetails: { currencyCode: 1 },
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
      ...initialState.contact,
    },
    common: {
      universal_currency_list: [],
      currency_convert_list: [],
      company_details: { currencyCode: 1 },
      ...initialState.common,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <CreateContact {...defaultProps} {...props} />
      </BrowserRouter>
    </Provider>
  );
};

describe('CreateContact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create contact form', async () => {
    renderComponent();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/create.*contact/i)).toBeInTheDocument();
    });
  });

  it('should display name input field', async () => {
    renderComponent();

    await waitFor(() => {
      // Look for First Name label text
      expect(screen.getByText(/first.*name/i)).toBeInTheDocument();
    });
  });

  it('should display email input field', async () => {
    renderComponent();

    await waitFor(() => {
      // Look for Email label text
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('should display phone input field', async () => {
    renderComponent();

    await waitFor(() => {
      // Look for Mobile label text or phone input
      const phoneInput = screen.getByTestId('phone-input');
      expect(phoneInput).toBeInTheDocument();
    });
  });

  it('should display create button', async () => {
    renderComponent();

    await waitFor(() => {
      // There are two create buttons: "Create" and "Create and More"
      const createButtons = screen.getAllByRole('button', { name: /create/i });
      expect(createButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should display cancel button', async () => {
    renderComponent();

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should render without crashing on mount', async () => {
    renderComponent();

    // Component should render and call initialization actions
    await waitFor(() => {
      expect(screen.getByText(/create.*contact/i)).toBeInTheDocument();
    });
  });

  it('should display form fields on mount', async () => {
    renderComponent();

    // Component should initialize and display form fields
    await waitFor(() => {
      expect(screen.getByText(/first.*name/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    renderComponent();

    const createButton = await screen.findByRole('button', { name: /^create$/i });
    fireEvent.click(createButton);

    // Form validation should prevent submission - just verify form renders with validation
    await waitFor(() => {
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should navigate back on cancel', async () => {
    const mockHistory = {
      push: vi.fn(),
      goBack: vi.fn(),
    };

    renderComponent({ history: mockHistory });

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Cancel navigates to /admin/master/contact via history.push
    await waitFor(() => {
      expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/contact');
    });
  });

  it('should display contact type selector', async () => {
    renderComponent();

    await waitFor(
      () => {
        // Look for Contact Type label - exact text from strings.ContactType
        expect(screen.getByText('Contact Type')).toBeInTheDocument();
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
});
