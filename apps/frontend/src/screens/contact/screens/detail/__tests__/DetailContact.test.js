import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock React Hook Form components
jest.mock('react-hook-form', () => {
  const mockFormContext = {
    control: {},
    formState: { errors: {}, touchedFields: {} },
    watch: jest.fn(() => ({})),
    setValue: jest.fn(),
    reset: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    trigger: jest.fn(() => Promise.resolve(true)),
  };

  return {
    useForm: jest.fn(() => ({
      register: jest.fn(),
      handleSubmit: jest.fn(fn => fn),
      formState: { errors: {}, touchedFields: {} },
      watch: jest.fn(() => ({})),
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

// Mock reactstrap
jest.mock('reactstrap', () => ({
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
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(schema => ({
    validate: jest.fn(),
  })),
}));

// Mock actions
const mockActions = {
  getContactById: jest.fn(() => Promise.resolve({ status: 200 })),
  getCountryList: jest.fn(),
  getStateList: jest.fn(),
  getCityList: jest.fn(),
  getContactTypeList: jest.fn(),
  updateContact: jest.fn(() => Promise.resolve({ status: 200 })),
  deleteContact: jest.fn(() => Promise.resolve({ status: 200 })),
};

const mockCommonActions = {
  getUniversalCurrencyList: jest.fn(),
};

const defaultProps = {
  contactActions: mockActions,
  detailContactActions: mockActions,
  commonActions: mockCommonActions,
  history: {
    push: jest.fn(),
    goBack: jest.fn(),
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
    renderComponent({
      match: {
        params: {
          id: '1',
        },
      },
    });

    await waitFor(() => {
      expect(mockActions.getContactById).toHaveBeenCalledWith('1');
    });
  });

  it('should display delete button', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
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
    window.confirm = jest.fn(() => true);

    renderComponent();

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockActions.deleteContact).toHaveBeenCalled();
    });
  });

  it('should call updateContact on form submission', async () => {
    renderComponent();

    const updateButton = await screen.findByRole('button', { name: /update|save/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockActions.updateContact).toHaveBeenCalled();
    });
  });

  it('should populate form with contact data', async () => {
    const contactData = {
      contactId: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    renderComponent(
      {},
      {
        contact: {
          contact_detail: contactData,
        },
      }
    );

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('John');
      expect(nameInput).toBeInTheDocument();
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
});
