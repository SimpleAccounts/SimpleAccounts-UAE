import reducer from './reducer';
import { EXPENSE } from 'constants/types';

describe('ExpenseReducer', () => {
  const baseState = reducer(undefined, { type: '@@INIT' });

  it('should hydrate the expense list when EXPENSE_LIST fires', () => {
    const payload = [{ expenseId: 1 }];
    const nextState = reducer(baseState, {
      type: EXPENSE.EXPENSE_LIST,
      payload,
    });

    expect(nextState.expense_list).toEqual(payload);
    expect(nextState.expense_list).not.toBe(payload);
  });

  it('should copy detail payloads when EXPENSE_DETAIL fires', () => {
    const payload = { expenseId: 42, amount: 100 };
    const nextState = reducer(baseState, {
      type: EXPENSE.EXPENSE_DETAIL,
      payload,
    });

    expect(nextState.expense_detail).toEqual(payload);
    expect(nextState.expense_detail).not.toBe(payload);
  });

  it('should normalize pay mode labels when PAY_MODE fires', () => {
    const payload = [
      { label: 'Original', value: 'cash' },
      { label: 'Bank', value: 'bank' },
    ];
    const nextState = reducer(baseState, {
      type: EXPENSE.PAY_MODE,
      payload,
    });

    expect(nextState.pay_mode_list[0].label).toBe('Petty Cash');
    expect(nextState.pay_mode_list[1].label).toBe('Bank');
  });

  it('should prepend Company Expense when PAY_TO_LIST fires', () => {
    const payload = [{ value: 'John', label: 'John' }];
    const nextState = reducer(baseState, {
      type: EXPENSE.PAY_TO_LIST,
      payload: [...payload],
    });

    expect(nextState.pay_to_list[0]).toEqual({
      value: 'Company Expense',
      label: 'Company Expense',
    });
    expect(nextState.pay_to_list[1]).toEqual(payload[0]);
  });
});




