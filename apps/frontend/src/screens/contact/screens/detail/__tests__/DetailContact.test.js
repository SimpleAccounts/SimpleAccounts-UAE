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

const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseNavigate = vi.hoisted(() => vi.fn(() => mockNavigate));
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

// Module mock: thunk must return Promise so dispatch(thunk) resolves when connect() is used (inline data; vi.mock is hoisted)
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
        taxTreatmentId: '',
        billingEmail: '',
        city: '',
        countryId: '',
        addressLine1: '',
        postZipCode: '',
        stateId: '',
        billingTelephone: '',
        fax: '',
        shippingCity: '',
        shippingCountryId: '',
        addressLine2: '',
        shippingPostZipCode: '',
        shippingStateId: '',
        shippingTelephone: '',
        shippingFax: '',
        contactType: '',
        currencyCode: '',
        middleName: '',
        website: '',
        mobileNumber: '',
        organization: '',
        telephone: '',
        vatRegistrationNumber: '',
        isRegisteredForVat: false,
        isBillingAndShippingAddressSame: false,
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

// Contact data returned by getContactById - component expects this shape to leave loading state
const mockContactData = {
  contactId: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isActive: true,
  taxTreatmentId: '',
  billingEmail: '',
  city: '',
  countryId: '',
  addressLine1: '',
  postZipCode: '',
  stateId: '',
  billingTelephone: '',
  fax: '',
  shippingCity: '',
  shippingCountryId: '',
  addressLine2: '',
  shippingPostZipCode: '',
  shippingStateId: '',
  shippingTelephone: '',
  shippingFax: '',
  contactType: '',
  currencyCode: '',
  middleName: '',
  website: '',
  mobileNumber: '',
  organization: '',
  telephone: '',
  vatRegistrationNumber: '',
  isRegisteredForVat: false,
  isBillingAndShippingAddressSame: false,
};

// Mock prop action objects. getContactById must return a Promise (not a thunk) so component's .then() runs and setLoading(false).
const mockActions = {
  getContactById: vi.fn(() =>
    Promise.resolve({
      status: 200,
      data: mockContactData,
    })
  ),
  getTaxTreatment: vi.fn(() => () => Promise.resolve({ status: 200, data: [] })),
  getCountryList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getStateList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getCityList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getContactTypeList: vi.fn(() => () => Promise.resolve({ data: [] })),
  getInvoicesCountContact: vi.fn(() => Promise.resolve({ data: 0 })),
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

    // Wait for form to load (button appears after getContactById resolves); avoid relying on localized heading
    const updateButton = await screen.findByRole('button', { name: /update/i }, { timeout: 15000 });
    expect(updateButton).toBeInTheDocument();
  }, 20000);

  it('should display form inputs', async () => {
    renderComponent();

    // Wait for form to load (First Name label appears after getContactById resolves)
    const firstNameLabel = await screen.findByText(/first.*name/i, {}, { timeout: 15000 });
    expect(firstNameLabel).toBeInTheDocument();
  }, 20000);

  it('should display delete button', async () => {
    renderComponent();

    // Wait for form to load (delete button(s) appear after getContactById resolves; screen may have more than one)
    const deleteButtons = await screen.findAllByRole(
      'button',
      { name: /delete/i },
      { timeout: 15000 }
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  }, 20000);

  it('should display update button', async () => {
    renderComponent();

    const updateButton = await screen.findByRole('button', { name: /update/i }, { timeout: 15000 });
    expect(updateButton).toBeInTheDocument();
  });

  it('should display cancel button', async () => {
    renderComponent();

    const cancelButton = await screen.findByRole('button', { name: /cancel/i }, { timeout: 15000 });
    expect(cancelButton).toBeInTheDocument();
  });

  it('should navigate back on cancel', async () => {
    mockNavigate.mockClear();
    renderComponent();

    const cancelButton = await screen.findByRole('button', { name: /cancel/i }, { timeout: 15000 });
    fireEvent.click(cancelButton);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/master/contact');
      },
      { timeout: 3000 }
    );
  }, 20000);

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
