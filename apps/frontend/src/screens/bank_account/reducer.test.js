import reducer from './reducer';
import { BANK_ACCOUNT } from 'constants/types';

describe('BankAccountReducer', () => {
  it('should return the initial state by default', () => {
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.reconcile_list).toEqual([]);
    expect(state.bank_account_list).toEqual([]);
  });

  it('should hydrate reconcile_list immutably', () => {
    const payload = {
      data: [{ reconcileId: 1, closingBalance: '100.00' }],
      count: 1,
    };

    const state = reducer(undefined, {
      type: BANK_ACCOUNT.RECONCILE_LIST,
      payload,
    });

    expect(state.reconcile_list.count).toBe(1);
    expect(state.reconcile_list.data).toEqual(payload.data);
    expect(state.reconcile_list).not.toBe(payload);
  });

  it('should copy bank accounts when BANK_ACCOUNT_LIST fires', () => {
    const payload = { data: [{ bankAccountId: 9 }] };

    const state = reducer(undefined, {
      type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
      payload,
    });

    expect(state.bank_account_list).toEqual(payload.data);
    expect(state.bank_account_list).not.toBe(payload.data);
  });
});

