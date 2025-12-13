import {
  getTransactionDetail,
  getReconcileList,
  reconcilenow,
  removeBulkReconciled,
} from './actions';
import { BANK_ACCOUNT } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
  authFileUploadApi: jest.fn(),
}));

describe('transaction reconcile actions', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getTransactionDetail requests transaction by id', async () => {
    const response = { data: { transactionId: 55 } };
    authApi.mockResolvedValue(response);

    const result = await getTransactionDetail(55)(dispatch);

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/transaction/getById?id=55',
    });
    expect(result).toBe(response);
  });

  it('getReconcileList dispatches payload when pagination is enabled', async () => {
    const response = { data: { data: [{ reconcileId: 2 }], count: 1 } };
    authApi.mockResolvedValue(response);

    const params = {
      bankId: 9,
      pageNo: 1,
      pageSize: 25,
      order: 'ASC',
      sortingCol: 'reconciledDate',
    };

    await getReconcileList(params)(dispatch);

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/reconsile/list?bankId=9&pageNo=1&pageSize=25&order=ASC&sortingCol=reconciledDate&paginationDisable=false',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: BANK_ACCOUNT.RECONCILE_LIST,
      payload: response.data,
    });
  });

  it('getReconcileList skips dispatch when paginationDisable is true', async () => {
    authApi.mockResolvedValue({ data: {} });

    await getReconcileList({ bankId: 1, paginationDisable: true })(dispatch);

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/reconsile/list?bankId=1&pageNo=&pageSize=&order=&sortingCol=&paginationDisable=true',
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('reconcilenow posts multipart payload via authFileUploadApi', async () => {
    const response = { data: { status: 1 } };
    authFileUploadApi.mockResolvedValue(response);
    const payload = new FormData();
    payload.append('bankId', '10');

    const result = await reconcilenow(payload)(dispatch);

    expect(authFileUploadApi).toHaveBeenCalledWith({
      method: 'post',
      url: '/rest/reconsile/reconcilenow',
      data: payload,
    });
    expect(result).toBe(response);
  });

  it('removeBulkReconciled issues delete request with body', async () => {
    const response = { data: 'ok' };
    authApi.mockResolvedValue(response);
    const payload = { ids: [1, 2, 3] };

    const result = await removeBulkReconciled(payload)(dispatch);

    expect(authApi).toHaveBeenCalledWith({
      method: 'delete',
      url: '/rest/reconsile/deletes',
      data: payload,
    });
    expect(result).toBe(response);
  });
});

