import {
  createExpense,
  checkAuthStatus,
  getPaytoList,
  getExpenseNumber,
  checkExpenseCodeValidation,
} from './actions';
import { EXPENSE } from 'constants/types';
import { authApi, authFileUploadApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
  authFileUploadApi: jest.fn(),
}));

describe('expense create actions', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createExpense uploads payload through authFileUploadApi', async () => {
    const payload = { memo: 'Taxi fare' };
    authFileUploadApi.mockResolvedValue({ status: 201 });

    await expect(createExpense(payload)(dispatch)).resolves.toEqual({ status: 201 });

    expect(authFileUploadApi).toHaveBeenCalledWith({
      method: 'post',
      url: '/rest/expense/save',
      data: payload,
    });
  });

  it('checkAuthStatus throws when backend response is not 200', async () => {
    authApi.mockResolvedValue({ status: 401 });

    await expect(checkAuthStatus()(dispatch)).rejects.toThrow('Auth Failed');
  });

  it('getPaytoList dispatches EXPENSE.PAY_TO_LIST on success', async () => {
    const payload = [{ id: 1, name: 'Cash' }];
    authApi.mockResolvedValue({ status: 200, data: payload });

    await expect(getPaytoList()(dispatch)).resolves.toBeUndefined();

    expect(authApi).toHaveBeenCalledWith({
      method: 'get',
      url: '/rest/reconsile/getChildrenTransactionCategoryList?id=91',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: EXPENSE.PAY_TO_LIST,
      payload,
    });
  });

  it('getExpenseNumber queries invoice prefix endpoint with invoiceType 10', async () => {
    authApi.mockResolvedValue({ data: { next: 'EXP-10' } });

    await expect(getExpenseNumber()(dispatch)).resolves.toEqual({ data: { next: 'EXP-10' } });

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=10',
    });
  });

  it('checkExpenseCodeValidation passes through result when status 200', async () => {
    const params = { moduleType: 'EXPENSE', name: 'Travel' };
    authApi.mockResolvedValue({ status: 200, data: {} });

    await expect(checkExpenseCodeValidation(params)(dispatch)).resolves.toEqual({ status: 200, data: {} });

    expect(authApi).toHaveBeenCalledWith({
      method: 'get',
      url: `/rest/validation/validate?moduleType=${params.moduleType}&name=${params.name}`,
    });
  });
});




