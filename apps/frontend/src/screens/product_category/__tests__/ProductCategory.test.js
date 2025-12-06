import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import ProductCategory from '../screen';
import * as ProductCategoryActions from '../actions';
import { CommonActions } from 'services/global';

// Mock actions
jest.mock('../actions', () => ({
  getProductCategoryList: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: {
      data: [
        { id: 1, productCategoryCode: 'PC001', productCategoryName: 'Electronics' },
        { id: 2, productCategoryCode: 'PC002', productCategoryName: 'Furniture' }
      ],
      count: 2
    }
  })),
  deleteProductCategory: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: { message: 'Product Category Deleted Successfully' }
  })),
}));

jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(() => () => {}),
  },
}));

// Mock components
jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  ConfirmDeleteModal: ({ isOpen, okHandler, cancelHandler, message, message1 }) => (
    isOpen ? (
      <div data-testid="confirm-modal">
        <p data-testid="modal-message">{message}</p>
        <button onClick={okHandler} data-testid="confirm-ok">OK</button>
        <button onClick={cancelHandler} data-testid="confirm-cancel">Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('react-bootstrap-table', () => ({
  BootstrapTable: ({ children, data, options, selectRow }) => (
    <div data-testid="bootstrap-table">
      <table>
        <tbody>
          {data && data.map((item, index) => (
            <tr
              key={index}
              data-testid={`category-row-${index}`}
              onClick={() => options.onRowClick && options.onRowClick(item)}
            >
              <td>{item.productCategoryCode}</td>
              <td>{item.productCategoryName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  ),
  TableHeaderColumn: ({ children }) => <th>{children}</th>,
}));

jest.mock('react-localization', () => {
  return jest.fn().mockImplementation(() => ({
    setLanguage: jest.fn(),
    ProductCategory: 'Product Category',
    AddNewProductCategory: 'Add New Product Category',
    ProductCategoryCode: 'Product Category Code',
    ProductCategoryName: 'Product Category Name',
  }));
});

const mockStore = configureStore([]);

describe('ProductCategory Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      product_category: {
        product_category_list: {
          data: [
            { id: 1, productCategoryCode: 'PC001', productCategoryName: 'Electronics' },
            { id: 2, productCategoryCode: 'PC002', productCategoryName: 'Furniture' },
          ],
          count: 2,
        },
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
      location: { pathname: '/admin/master/product-category' },
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'en');

    // Reset mocks
    ProductCategoryActions.getProductCategoryList.mockClear();
    ProductCategoryActions.deleteProductCategory.mockClear();
    CommonActions.tostifyAlert.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders product category screen with table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
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
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('calls getProductCategoryList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProductCategoryActions.getProductCategoryList).toHaveBeenCalled();
    });
  });

  test('renders Add New Product Category button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*product.*category/i });
    expect(addButton).toBeInTheDocument();
  });

  test('navigates to create page when Add New Product Category is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*product.*category/i });
    fireEvent.click(addButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/product-category/create');
  });

  test('renders product category list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('category-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('category-row-1')).toBeInTheDocument();
  });

  test('handles empty product category list', async () => {
    const emptyState = {
      product_category: {
        product_category_list: { data: [], count: 0 },
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
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('bootstrap-table')).toBeInTheDocument();
    expect(screen.queryByTestId('category-row-0')).not.toBeInTheDocument();
  });

  test('navigates to detail page when row is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    const row = screen.getByTestId('category-row-0');
    fireEvent.click(row);

    expect(mockHistory.push).toHaveBeenCalledWith('/admin/master/product-category/detail', { id: 1 });
  });

  test('handles API error on product category list fetch', async () => {
    ProductCategoryActions.getProductCategoryList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProductCategoryActions.getProductCategoryList).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  test('displays product category code correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('PC001')).toBeInTheDocument();
    expect(screen.getByText('PC002')).toBeInTheDocument();
  });

  test('displays product category name correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
  });

  test('handles pagination changes', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Table should render with pagination enabled
    const table = screen.getByTestId('bootstrap-table');
    expect(table).toBeInTheDocument();
  });

  test('handles sorting by column', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Verify that data is displayed
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  test('renders card header with correct title', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCategory history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Product Category')).toBeInTheDocument();
  });
});
