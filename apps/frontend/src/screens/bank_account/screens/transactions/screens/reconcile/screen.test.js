import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ConnectedComponent from './screen';

const ReconcileTransaction = ConnectedComponent.WrappedComponent;
const appendMock = jest.fn();

global.FormData = class {
  constructor() {
    this.append = appendMock;
  }
};

jest.mock('react-datepicker', () => (props) => (
  <input data-testid={props.id} onChange={() => props.onChange(new Date())} />
));

jest.mock('react-bootstrap-table', () => {
  const Table = ({ children }) => (
    <div data-testid="bootstrap-table">{children}</div>
  );
  const Column = ({ children }) => <div>{children}</div>;
  return { BootstrapTable: Table, TableHeaderColumn: Column };
});

jest.mock('components', () => ({
  LeavePage: () => <div data-testid="leave-page" />,
  Loader: () => <div data-testid="loader">Loading</div>,
  ConfirmDeleteModal: () => <div data-testid="confirm-modal" />,
}));

jest.mock('./sections', () => ({
  ViewBankAccount: () => <div data-testid="view-bank-account" />,
}));

jest.mock('formik', () => ({
  Formik: ({ initialValues, children }) =>
    children({
      values: initialValues,
      handleSubmit: jest.fn(),
      handleChange: () => jest.fn(),
      errors: {},
      touched: {},
    }),
}));

const buildProps = (overrides = {}) => {
  const getReconcileList = jest.fn().mockResolvedValue({ status: 200 });
  const props = {
    transactionReconcileActions: {
      getReconcileList,
      reconcilenow: jest.fn().mockResolvedValue({ status: 200, data: {} }),
      removeBulkReconciled: jest.fn().mockResolvedValue({}),
    },
    transactionActions: {},
    commonActions: {
      tostifyAlert: jest.fn(),
    },
    transaction_category_list: [],
    transaction_type_list: [],
    project_list: [],
    currency_list: [],
    reconcile_list: {
      data: [
        {
          reconcileId: 1,
          closingBalance: 100,
          reconciledDate: '2024-01-01',
          reconciledDuration: '1 Month',
        },
      ],
      count: 1,
    },
    location: {
      state: {
        bankAccountId: 9,
      },
    },
    history: {
      push: jest.fn(),
    },
    ...overrides,
  };
  return { props, getReconcileList };
};

describe('ReconcileTransaction screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem('language', 'en');
    appendMock.mockClear();
  });

  it('loads reconcile list on mount when bank account id is present', async () => {
    const { props, getReconcileList } = buildProps();

    render(<ReconcileTransaction {...props} />);

    await waitFor(() => expect(getReconcileList).toHaveBeenCalledWith({
      pageNo: 0,
      pageSize: 10,
      bankId: 9,
    }));
  });

  it('redirects to banking list when bank account id is missing', async () => {
    const history = { push: jest.fn() };
    const { props } = buildProps({
      location: { state: null },
      history,
    });

    render(<ReconcileTransaction {...props} />);

    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith('/admin/banking/bank-account'),
    );
  });

  it('removes reconciled rows and refreshes list', async () => {
    const { props, getReconcileList } = buildProps();
    const ref = React.createRef();

    render(<ReconcileTransaction ref={ref} {...props} />);

    await waitFor(() => expect(ref.current).toBeTruthy());
    await ref.current.removeReconciled(42);

    expect(props.transactionReconcileActions.removeBulkReconciled).toHaveBeenCalledWith(
      { ids: [42] },
    );
    expect(props.commonActions.tostifyAlert).toHaveBeenCalledWith(
      'success',
      'Deleted Successfully',
    );
    await waitFor(() => expect(getReconcileList).toHaveBeenCalledTimes(2));
  });

  it('submits reconcile form and shows success toast', async () => {
    const reconcilenow = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { status: 1, message: 'ok' } });
    const tostifyAlert = jest.fn();
    const { props } = buildProps({
      transactionReconcileActions: {
        getReconcileList: jest.fn().mockResolvedValue({ status: 200 }),
        reconcilenow,
        removeBulkReconciled: jest.fn(),
      },
      commonActions: { tostifyAlert },
    });
    const ref = React.createRef();

    render(<ReconcileTransaction ref={ref} {...props} />);
    await waitFor(() => expect(ref.current).toBeTruthy());

    const resetForm = jest.fn();
    await ref.current.handleSubmit(
      {
        closingBalance: '123.45',
        date: new Date(Date.UTC(2024, 0, 5)),
      },
      resetForm,
    );

    expect(reconcilenow).toHaveBeenCalledTimes(1);
    expect(appendMock).toHaveBeenCalledWith('closingBalance', '123.45');
    expect(appendMock).toHaveBeenCalledWith('date', expect.any(String));
    expect(tostifyAlert).toHaveBeenCalledWith('success', 'ok');
    expect(resetForm).toHaveBeenCalled();
  });

  it('surfaces backend error message when reconcile fails', async () => {
    const reconcilenow = jest.fn().mockResolvedValue({
      status: 200,
      data: { status: 2, message: 'balance mismatch' },
    });
    const tostifyAlert = jest.fn();
    const { props } = buildProps({
      transactionReconcileActions: {
        getReconcileList: jest.fn().mockResolvedValue({ status: 200 }),
        reconcilenow,
        removeBulkReconciled: jest.fn(),
      },
      commonActions: { tostifyAlert },
    });
    const ref = React.createRef();

    render(<ReconcileTransaction ref={ref} {...props} />);
    await waitFor(() => expect(ref.current).toBeTruthy());

    await ref.current.handleSubmit(
      {
        closingBalance: '50.00',
        date: new Date(),
      },
      jest.fn(),
    );

    expect(tostifyAlert).toHaveBeenCalledWith('error', 'balance mismatch');
  });
});

