import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
import { vi } from 'vitest';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;

// Mock useLocation hook - must be defined before vi.mock
const mockLocation = {
  pathname: '/admin/contact/detail/1',
  search: '',
  hash: '',
  state: { id: '1' },
  key: 'default',
};

const mockUseLocation = vi.fn(() => mockLocation);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: mockUseLocation,
  };
});

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock React Hook Form components
vi.mock('react-hook-form', () => {
  const mockFormContext = {
    control: {},
    formState: { errors: {}, touchedFields: {} },
    watch: vi.fn(() => ({})),
    setValue: vi.fn(),
    reset: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    trigger: vi.fn(() => Promise.resolve(true)),
  };

  return {
    useForm: vi.fn(() => ({
      register: vi.fn(),
      handleSubmit: vi.fn(fn => fn),
      formState: { errors: {}, touchedFields: {} },
      watch: vi.fn(() => ({})),
      setValue: vi.fn(),
      reset: vi.fn(),
      control: {},
      setError: vi.fn(),
      clearErrors: vi.fn(),
      trigger: vi.fn(() => Promise.resolve(true)),
    })),
    useFormContext: vi.fn(() => mockFormContext),
    Controller: ({ render, name }) => {
      const mockField = {
        onChange: vi.fn(),
        value: '',
        name: name || '',
        onBlur: vi.fn(),
        ref: vi.fn(),
      };
      const mockFieldState = { error: null, invalid: false, isDirty: false, isTouched: false };
      const mockFormState = { errors: {}, touchedFields: {} };
      return render({
        field: mockField,
        fieldState: mockFieldState,
        formState: mockFormState,
      });
    },
    FormProvider: ({ children }) => <>{children}</>,
  };
});

// Mock reactstrap
vi.mock('reactstrap', () => ({
  Row: ({ children }) => <div className="row">{children}</div>,
  Col: ({ children }) => <div className="col">{children}</div>,
  FormGroup: ({ children }) => <div className="form-group">{children}</div>,
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
  UncontrolledTooltip: () => null,
  Input: ({ ...props }) => <input {...props} />,
}));

// Import component AFTER mocks are set up
import DetailContact from '../screen';

// Mock Zod resolver
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(schema => ({
    validate: vi.fn(),
  })),
}));

// Mock actions
const mockActions = {
  getContactById: vi.fn(() =>
    Promise.resolve({
      status: 200,
      data: {
        contactId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: true,
        vatRegistrationNumber: '',
        isRegisteredForVat: false,
      },
    })
  ),
  getTaxTreatment: vi.fn(() => Promise.resolve({ status: 200, data: [] })),
  getCountryList: vi.fn(),
  getStateList: vi.fn(),
  getCityList: vi.fn(),
  getContactTypeList: vi.fn(),
  updateContact: vi.fn(() => Promise.resolve({ status: 200 })),
  deleteContact: vi.fn(() => Promise.resolve({ status: 200 })),
};

const mockCommonActions = {
  getUniversalCurrencyList: vi.fn(),
  tostifyAlert: vi.fn(),
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
    jest.clearAllMocks();
  });

  it('should render detail contact form', async () => {
    renderComponent();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/update.*contact|contact.*detail/i)).toBeInTheDocument();
    });
  });

  it('should load contact data on mount', async () => {
    renderComponent();

    await waitFor(
      () => {
        expect(mockActions.getContactById).toHaveBeenCalledWith('1');
      },
      { timeout: 3000 }
    );
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
      const updateButton = screen.getByRole('button', { name: /update|save/i });
      expect(updateButton).toBeInTheDocument();
    });
  });

  it('should call deleteContact on delete button click', async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    renderComponent();

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    // Click the first delete button (header button)
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockActions.deleteContact).toHaveBeenCalled();
    });
  });

  it('should call updateContact on form submission', async () => {
    renderComponent();

    // Wait for getContactById to complete and form to be populated
    await waitFor(() => {
      expect(mockActions.getContactById).toHaveBeenCalled();
    });

    // Wait for form to be populated (reset is called after getContactById)
    await waitFor(
      () => {
        const firstNameInput = screen.queryByDisplayValue('John');
        expect(firstNameInput || screen.queryByPlaceholderText(/first name/i)).toBeTruthy();
      },
      { timeout: 3000 }
    );

    const updateButton = await screen.findByRole('button', { name: /update|save/i });

    // Fill required fields if not already filled
    const firstNameInput =
      screen.queryByDisplayValue('John') || screen.queryByPlaceholderText(/first name/i);
    const lastNameInput =
      screen.queryByDisplayValue('Doe') || screen.queryByPlaceholderText(/last name/i);

    if (firstNameInput && !firstNameInput.value) {
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
    }
    if (lastNameInput && !lastNameInput.value) {
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    }

    fireEvent.click(updateButton);

    await waitFor(
      () => {
        expect(mockActions.updateContact).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });

  it('should populate form with contact data', async () => {
    renderComponent();

    // Wait for getContactById to be called and complete
    await waitFor(() => {
      expect(mockActions.getContactById).toHaveBeenCalledWith('1');
    });

    // Wait for form to be populated with data from getContactById response
    // The reset() call happens after getContactById completes
    await waitFor(
      () => {
        const nameInput = screen.getByDisplayValue('John');
        expect(nameInput).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should navigate back on cancel', async () => {
    const mockHistory = {
      push: vi.fn(),
      goBack: vi.fn(),
    };

    renderComponent({ history: mockHistory });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/update.*contact/i)).toBeInTheDocument();
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
});
