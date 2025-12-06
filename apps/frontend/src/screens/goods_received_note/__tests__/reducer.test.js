import RequestForQuotationReducer from '../reducer';
import { GOODS_RECEVED_NOTE } from 'constants/types';

describe('Goods Received Note (GRN) Reducer', () => {
  const initialState = {
    project_list: [],
    contact_list: [],
    status_list: [],
    currency_list: [],
    vat_list: [],
    product_list: [],
    supplier_list: [],
    country_list: [],
    deposit_list: [],
    pay_mode: [],
    goods_received_note_list: [],
    po_list: [],
  };

  it('should return the initial state', () => {
    expect(RequestForQuotationReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GOODS_RECEVED_NOTE.PROJECT_LIST', () => {
    const projectData = [
      { projectId: 1, projectName: 'Project Alpha' },
      { projectId: 2, projectName: 'Project Beta' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.PROJECT_LIST,
      payload: { data: projectData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.project_list).toEqual(projectData);
    expect(newState.project_list.length).toBe(2);
  });

  it('should handle GOODS_RECEVED_NOTE.CONTACT_LIST', () => {
    const contactData = [
      { contactId: 1, firstName: 'John', lastName: 'Doe' },
      { contactId: 2, firstName: 'Jane', lastName: 'Smith' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.CONTACT_LIST,
      payload: { data: contactData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.contact_list).toEqual(contactData);
    expect(newState.contact_list.length).toBe(2);
  });

  it('should handle GOODS_RECEVED_NOTE.STATUS_LIST', () => {
    const statusData = [
      { statusId: 1, statusName: 'Draft' },
      { statusId: 2, statusName: 'Approved' },
      { statusId: 3, statusName: 'Received' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.STATUS_LIST,
      payload: { data: statusData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.status_list).toEqual(statusData);
    expect(newState.status_list.length).toBe(3);
  });

  it('should handle GOODS_RECEVED_NOTE.CURRENCY_LIST', () => {
    const currencyData = [
      { currencyId: 1, currencyName: 'AED', symbol: 'د.إ' },
      { currencyId: 2, currencyName: 'USD', symbol: '$' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.CURRENCY_LIST,
      payload: { data: currencyData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.currency_list).toEqual(currencyData);
  });

  it('should handle GOODS_RECEVED_NOTE.SUPPLIER_LIST', () => {
    const supplierData = [
      { supplierId: 1, supplierName: 'Supplier A', contactType: 'Vendor' },
      { supplierId: 2, supplierName: 'Supplier B', contactType: 'Vendor' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.SUPPLIER_LIST,
      payload: { data: supplierData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.supplier_list).toEqual(supplierData);
  });

  it('should handle GOODS_RECEVED_NOTE.VAT_LIST', () => {
    const vatData = [
      { vatId: 1, vatCategory: 'Standard', rate: 5 },
      { vatId: 2, vatCategory: 'Zero Rated', rate: 0 },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.VAT_LIST,
      payload: { data: vatData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.vat_list).toEqual(vatData);
  });

  it('should handle GOODS_RECEVED_NOTE.PAY_MODE', () => {
    const payModeData = [
      { payModeId: 1, payModeName: 'Cash' },
      { payModeId: 2, payModeName: 'Bank Transfer' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.PAY_MODE,
      payload: { data: payModeData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.pay_mode).toEqual(payModeData);
  });

  it('should handle GOODS_RECEVED_NOTE.PRODUCT_LIST', () => {
    const productData = [
      { productId: 1, productName: 'Product X', unitPrice: 100 },
      { productId: 2, productName: 'Product Y', unitPrice: 200 },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.PRODUCT_LIST,
      payload: { data: productData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.product_list).toEqual(productData);
  });

  it('should handle GOODS_RECEVED_NOTE.DEPOSIT_LIST', () => {
    const depositData = [
      { depositId: 1, depositName: 'Advance Payment' },
      { depositId: 2, depositName: 'Security Deposit' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.DEPOSIT_LIST,
      payload: { data: depositData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.deposit_list).toEqual(depositData);
  });

  it('should handle GOODS_RECEVED_NOTE.COUNTRY_LIST', () => {
    const countryData = [
      { countryId: 1, countryName: 'UAE', code: 'AE' },
      { countryId: 2, countryName: 'Saudi Arabia', code: 'SA' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.COUNTRY_LIST,
      payload: countryData,
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.country_list).toEqual(countryData);
  });

  it('should handle GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST', () => {
    const grnData = [
      { grnId: 1, grnNumber: 'GRN-001', status: 'Received' },
      { grnId: 2, grnNumber: 'GRN-002', status: 'Pending' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST,
      payload: grnData,
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.goods_received_note_list).toEqual(grnData);
  });

  it('should handle GOODS_RECEVED_NOTE.PO_LIST', () => {
    const poData = [
      { poId: 1, poNumber: 'PO-001' },
      { poId: 2, poNumber: 'PO-002' },
    ];

    const action = {
      type: GOODS_RECEVED_NOTE.PO_LIST,
      payload: { data: poData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.po_list).toEqual(poData);
  });

  it('should not mutate the original state', () => {
    const action = {
      type: GOODS_RECEVED_NOTE.PROJECT_LIST,
      payload: { data: [{ projectId: 1 }] },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState).not.toBe(initialState);
    expect(initialState.project_list).toEqual([]);
  });

  it('should preserve other state properties when updating one list', () => {
    const stateWithData = {
      ...initialState,
      project_list: [{ projectId: 1 }],
      supplier_list: [{ supplierId: 1 }],
    };

    const action = {
      type: GOODS_RECEVED_NOTE.VAT_LIST,
      payload: { data: [{ vatId: 1 }] },
    };

    const newState = RequestForQuotationReducer(stateWithData, action);

    expect(newState.project_list).toEqual(stateWithData.project_list);
    expect(newState.supplier_list).toEqual(stateWithData.supplier_list);
    expect(newState.vat_list).toEqual([{ vatId: 1 }]);
  });

  it('should handle unknown action types', () => {
    const action = {
      type: 'UNKNOWN_GRN_ACTION',
      payload: { data: 'test' },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should use Object.assign to create new array references', () => {
    const projectData = [{ projectId: 1 }];

    const action = {
      type: GOODS_RECEVED_NOTE.PROJECT_LIST,
      payload: { data: projectData },
    };

    const newState = RequestForQuotationReducer(initialState, action);

    expect(newState.project_list).not.toBe(projectData);
    expect(newState.project_list).toEqual(projectData);
  });
});
