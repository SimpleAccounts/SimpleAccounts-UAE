/**
 * Tests that DetailReceipt never renders an object as a React child in the contact Select.
 * Regression for: "Objects are not valid as a React child (found: object with keys
 * {contactId, contactName, currency, taxTreatment})" when the API returns contact
 * options with label as an object instead of a string.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeContactOption,
  normalizeContactOptions,
} from '../screen';

const thunk = thunkModule.default || thunkModule.thunk || thunkModule;
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Contact option as returned by getContactsForDropdown when label is an object (bug case)
const contactOptionWithObjectLabel = {
  value: 42,
  label: {
    contactId: 42,
    contactName: 'Acme Corp',
    currency: 'AED',
    taxTreatment: 'Standard',
  },
};

describe('normalizeContactOption / normalizeContactOptions', () => {
  it('converts option with object label to string label using contactName', () => {
    const result = normalizeContactOption(contactOptionWithObjectLabel);
    expect(result).toEqual({ value: 42, label: 'Acme Corp' });
  });

  it('leaves option with string label unchanged', () => {
    const option = { value: 1, label: 'Customer One' };
    expect(normalizeContactOption(option)).toEqual(option);
  });

  it('returns null for null/undefined option', () => {
    expect(normalizeContactOption(null)).toBeNull();
    expect(normalizeContactOption(undefined)).toBeNull();
  });

  it('normalizeContactOptions maps entire list to string labels', () => {
    const list = [
      contactOptionWithObjectLabel,
      { value: 2, label: 'Second Customer' },
    ];
    const result = normalizeContactOptions(list);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ value: 42, label: 'Acme Corp' });
    expect(result[1]).toEqual({ value: 2, label: 'Second Customer' });
  });

  it('normalizeContactOptions returns empty array for empty/null list', () => {
    expect(normalizeContactOptions([])).toEqual([]);
    expect(normalizeContactOptions(null)).toEqual([]);
    expect(normalizeContactOptions(undefined)).toEqual([]);
  });
});

// Mock react-router so we can pass location.state with receipt id
const mockUseLocation = vi.hoisted(() =>
  vi.fn(() => ({
    pathname: '/admin/income/receipt/detail',
    search: '',
    hash: '',
    state: { id: 100 },
    key: 'default',
  }))
);
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseNavigate = vi.hoisted(() => vi.fn(() => mockNavigate));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: mockUseLocation,
    useNavigate: mockUseNavigate,
  };
});

vi.mock('../../actions', () => ({
  getContactList: () => () => Promise.resolve(),
  getInvoiceList: () => () => Promise.resolve(),
}));

vi.mock('../actions', () => ({
  getReceiptById: () => () =>
    Promise.resolve({
      status: 200,
      data: {
        receiptId: 100,
        receiptNo: 'REC-001',
        referenceCode: 'REF-001',
        contactId: 42,
        receiptDate: '2024-01-15',
        amount: '5000',
        unusedAmount: '0',
        invoiceId: null,
      },
    }),
  updateReceipt: () => () => Promise.resolve({ status: 200 }),
  deleteReceipt: () => () => Promise.resolve({ status: 200 }),
}));

vi.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: vi.fn(),
  },
}));

vi.mock('components', () => ({
  LeavePage: () => <div data-testid="leave-page" />,
  Loader: () => <div data-testid="loader">Loading</div>,
  ConfirmDeleteModal: () => <div data-testid="confirm-modal" />,
}));

vi.mock('components/migration', () => {
  const MockInput = ({ id, ...p }) => <input id={id} {...p} />;
  const MockLabel = ({ children, ...p }) => <label {...p}>{children}</label>;
  const MockSelect = ({ children, ...p }) => <select {...p}>{children}</select>;
  return {
    Card: ({ children }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }) => <div>{children}</div>,
    CardBody: ({ children }) => <div>{children}</div>,
    Button: ({ children, ...p }) => <button {...p}>{children}</button>,
    Row: ({ children }) => <div className="row">{children}</div>,
    Col: ({ children }) => <div className="col">{children}</div>,
    Form: ({ children }) => <form>{children}</form>,
    FormGroup: ({ children }) => <div className="form-group">{children}</div>,
    Input: MockInput,
    Label: MockLabel,
  };
});

vi.mock('react-datepicker', () => ({
  default: props => (
    <input
      data-testid="date-picker"
      value={props.selected ? String(props.selected) : ''}
      onChange={() => props.onChange && props.onChange(new Date())}
    />
  ),
}));

// Import connected DetailReceipt after mocks (default export is connect()(DetailReceipt))
import ConnectedDetailReceipt from '../screen';

describe('DetailReceipt contact Select (no object-as-child)', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: '/admin/income/receipt/detail',
      search: '',
      hash: '',
      state: { id: 100 },
      key: 'default',
    });
    store = mockStore({
      receipt: {
        contact_list: [
          // API-style: label is an object (would cause "Objects are not valid as a React child" if not normalized)
          contactOptionWithObjectLabel,
        ],
        invoice_list: [],
      },
    });
  });

  it('renders without throwing when contact_list has object labels and a receipt is selected', async () => {
    expect(() => {
      render(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              { pathname: '/admin/income/receipt/detail', state: { id: 100 } },
            ]}
          >
            <ConnectedDetailReceipt />
          </MemoryRouter>
        </Provider>
      );
    }).not.toThrow();

    await waitFor(
      () => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // If normalization were removed, react-select would try to render the label object and throw.
    // With normalization, the displayed contact name is the string "Acme Corp".
    await waitFor(
      () => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
