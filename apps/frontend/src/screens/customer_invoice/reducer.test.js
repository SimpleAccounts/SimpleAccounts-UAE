import reducer from './reducer';
import { CUSTOMER_INVOICE } from 'constants/types';

describe('CustomerInvoiceReducer', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('should return the initial state by default', () => {
    expect(initialState.customer_invoice_list).toEqual([]);
    expect(initialState.currency_list).toEqual([]);
  });

  it('should populate the invoice list when CUSTOMER_INVOICE_LIST fires', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const nextState = reducer(initialState, {
      type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
      payload: { data },
    });

    expect(nextState.customer_invoice_list).toEqual(data);
    expect(nextState.customer_invoice_list).not.toBe(data);
  });

  it('should store country metadata when COUNTRY_LIST fires', () => {
    const payload = [{ code: 'AE' }];
    const nextState = reducer(initialState, {
      type: CUSTOMER_INVOICE.COUNTRY_LIST,
      payload,
    });

    expect(nextState.country_list).toEqual(payload);
    expect(nextState.country_list).not.toBe(payload);
  });

  it('should store place of supply lookup when PLACE_OF_SUPPLY fires', () => {
    const payload = [{ id: 1, name: 'UAE' }];
    const nextState = reducer(initialState, {
      type: CUSTOMER_INVOICE.PLACE_OF_SUPPLY,
      payload,
    });

    expect(nextState.place_of_supply).toEqual(payload);
    expect(nextState.place_of_supply).not.toBe(payload);
  });
});









