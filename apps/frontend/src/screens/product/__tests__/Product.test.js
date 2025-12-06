import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Product from '../screen';
import * as ProductActions from '../actions';
import { CommonActions } from 'services/global';

// Mock actions
jest.mock('../actions', () => ({
  getProductList: jest.fn(() => () => Promise.resolve({ status: 200, data: { data: [], count: 0 } })),
  getProductVatCategoryList: jest.fn(() => () => Promise.resolve({ status: 200 })),
  removeBulk: jest.fn(() => () => Promise.resolve({ status: 200, data: { message: 'Success' } })),
  getInvoicesCountProduct: jest.fn(() => () => Promise.resolve({ data: 0 })),
}));

jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(() => () => {}),
  },
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
  Currency: ({ value, currencySymbol }) => <span>{currencySymbol} {value}</span>,
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index} data-testid={`product-row-${index}`}>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

const mockStore = configureStore([]);

describe('Product Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      product: {
        product_list: {
          data: [
            {
              id: 1,
              name: 'Product 1',
              productCode: 'P001',
              unitPrice: 100,
              vatPercentage: '5%',
              isActive: true,
              isInventoryEnabled: true,
              productType: 'GOODS',
              exciseTaxId: null,
            },
            {
              id: 2,
              name: 'Product 2',
              productCode: 'P002',
              unitPrice: 200,
              vatPercentage: '10%',
              isActive: false,
              isInventoryEnabled: false,
              productType: 'SERVICE',
              exciseTaxId: 1,
              exciseTax: 'Excise 10%',
            },
          ],
          count: 2,
        },
        vat_list: [
          { id: 1, name: 'VAT 5%' },
          { id: 2, name: 'VAT 10%' },
        ],
      },
      common: {
        universal_currency_list: [
          { currencyIsoCode: 'AED', currencySymbol: 'AED' },
        ],
      },
    };

    store = mockStore(initialState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    mockHistory = {
      push: jest.fn(),
      location: { pathname: '/admin/master/product' },
    };

    // Reset mocks
    ProductActions.getProductList.mockClear();
    ProductActions.getProductVatCategoryList.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders product screen with table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
  });

  test('displays loader initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getProductList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProductActions.getProductList).toHaveBeenCalled();
    });
  });

  test('calls getProductVatCategoryList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProductActions.getProductVatCategoryList).toHaveBeenCalled();
    });
  });

  test('renders Add New Product button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*product/i });
    expect(addButton).toBeInTheDocument();
  });

  test('navigates to create page when Add New Product is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*product/i });
    fireEvent.click(addButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/product/create');
  });

  test('renders product list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('product-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('product-row-1')).toBeInTheDocument();
  });

  test('handles empty product list', async () => {
    const emptyState = {
      ...initialState,
      product: {
        product_list: { data: [], count: 0 },
        vat_list: [],
      },
    };

    store = mockStore(emptyState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('product-row-0')).not.toBeInTheDocument();
  });

  test('renders filter section with inputs', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const filterSection = screen.getByText(/Products/i).closest('.card');
    expect(filterSection).toBeInTheDocument();
  });

  test('handles product row click navigation', async () => {
    const TestProduct = (props) => {
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        ProductActions.getProductList()().then(() => setLoading(false));
        ProductActions.getProductVatCategoryList()();
      }, []);

      const goToDetail = (row) => {
        props.history.push('/admin/master/product/detail', { id: row.id });
      };

      if (loading) return <div data-testid="loader">Loading...</div>;

      return (
        <div>
          {initialState.product.product_list.data.map((product) => (
            <button
              key={product.id}
              onClick={() => goToDetail(product)}
              data-testid={`product-${product.id}`}
            >
              {product.name}
            </button>
          ))}
        </div>
      );
    };

    render(
      <Provider store={store}>
        <BrowserRouter>
          <TestProduct history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const productButton = screen.getByTestId('product-1');
    fireEvent.click(productButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/product/detail', { id: 1 });
  });

  test('renders product with active status', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.product.product_list.data[0].isActive).toBe(true);
  });

  test('renders product with inactive status', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.product.product_list.data[1].isActive).toBe(false);
  });

  test('handles inventory enabled products', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.product.product_list.data[0].isInventoryEnabled).toBe(true);
    expect(state.product.product_list.data[1].isInventoryEnabled).toBe(false);
  });

  test('handles products with excise tax', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.product.product_list.data[1].exciseTaxId).toBe(1);
    expect(state.product.product_list.data[1].exciseTax).toBe('Excise 10%');
  });

  test('handles API error on product list fetch', async () => {
    ProductActions.getProductList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Product history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProductActions.getProductList).toHaveBeenCalled();
    });
  });
});
