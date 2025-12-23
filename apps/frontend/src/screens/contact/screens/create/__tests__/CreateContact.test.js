import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock reactstrap
jest.mock('reactstrap', () => ({
  Row: ({ children }) => <div className="row">{children}</div>,
  Col: ({ children }) => <div className="col">{children}</div>,
  FormGroup: ({ children }) => <div className="form-group">{children}</div>,
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
  UncontrolledTooltip: () => null,
  Input: ({ ...props }) => <input {...props} />,
}));

// Mock React Hook Form components
jest.mock('react-hook-form', () => {
  const mockFormContext = {
    control: {},
    formState: { errors: {}, touchedFields: {} },
    watch: vi.fn(() => ({ taxTreatmentId: null })),
    setValue: vi.fn(),
    reset: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    trigger: vi.fn(() => Promise.resolve(true)),
  };
  
  return {
    useForm: jest.fn(() => ({
      register: jest.fn(),
      handleSubmit: jest.fn(fn => fn),
      formState: { errors: {}, touchedFields: {} },
      watch: jest.fn(() => ({ taxTreatmentId: null })),
      setValue: jest.fn(),
      reset: jest.fn(),
      control: {},
      setError: jest.fn(),
      clearErrors: jest.fn(),
      trigger: jest.fn(() => Promise.resolve(true)),
    })),
    useFormContext: jest.fn(() => mockFormContext),
    Controller: ({ render }) => render({ field: { onChange: jest.fn(), value: '' } }),
    FormProvider: ({ children }) => <>{children}</>,
  };
});

// Mock Zod resolver
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(schema => ({
    validate: jest.fn(),
  })),
}));

// Mock actions
const mockActions = {
  getContactList: jest.fn(),
  getCountryList: jest.fn(),
  getStateList: jest.fn(),
  getCityList: jest.fn(),
  getContactTypeList: jest.fn(),
  saveContact: jest.fn(() => Promise.resolve({ status: 200 })),
};

const mockCommonActions = {
  getUniversalCurrencyList: jest.fn(),
};

const defaultProps = {
  contactActions: mockActions,
  createContactActions: mockActions,
  commonActions: mockCommonActions,
  history: {
    push: jest.fn(),
    goBack: jest.fn(),
  },
  contactType: null,
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
        <CreateContact {...defaultProps} {...props} />
      </BrowserRouter>
    </Provider>
  );
};

describe('CreateContact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      const nameInput = screen.getByLabelText(/first.*name|name/i);
      expect(nameInput).toBeInTheDocument();
    });
  });

  it('should display email input field', async () => {
    renderComponent();

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });
  });

  it('should display phone input field', async () => {
    renderComponent();

    await waitFor(() => {
      const phoneInput = screen.getByLabelText(/phone|mobile/i);
      expect(phoneInput).toBeInTheDocument();
    });
  });

  it('should display save button', async () => {
    renderComponent();

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  it('should display cancel button', async () => {
    renderComponent();

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should call getCountryList on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockActions.getCountryList).toHaveBeenCalled();
    });
  });

  it('should call getContactTypeList on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockActions.getContactTypeList).toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    renderComponent();

    const saveButton = await screen.findByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Form validation should prevent submission
    await waitFor(() => {
      expect(mockActions.saveContact).not.toHaveBeenCalled();
    });
  });

  it('should navigate back on cancel', async () => {
    const mockHistory = {
      push: jest.fn(),
      goBack: jest.fn(),
    };

    renderComponent({ history: mockHistory });

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockHistory.goBack).toHaveBeenCalled();
  });

  it('should display contact type selector', async () => {
    renderComponent({
      contact_type_list: [
        { value: '1', label: 'Customer' },
        { value: '2', label: 'Supplier' },
      ],
    });

    await waitFor(() => {
      const typeSelector = screen.getByLabelText(/contact.*type|type/i);
      expect(typeSelector).toBeInTheDocument();
    });
  });

  it('should load country list on mount', async () => {
    renderComponent({
      country_list: [
        { countryId: 1, countryName: 'United Arab Emirates' },
        { countryId: 2, countryName: 'United States' },
      ],
    });

    await waitFor(() => {
      expect(mockActions.getCountryList).toHaveBeenCalled();
    });
  });
});
