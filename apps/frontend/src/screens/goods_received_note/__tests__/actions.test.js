import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { GOODS_RECEVED_NOTE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return (date) => {
    if (date) {
      return actualMoment(date);
    }
    return actualMoment('2024-12-01');
  };
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Goods Received Note (GRN) Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getGRNList', () => {
    it('should dispatch GOODS_RECEVED_NOTE_LIST action on successful API call', async () => {
      const mockResponse = {
        status: 200,
        data: [
          { grnId: 1, grnNumber: 'GRN-001' },
          { grnId: 2, grnNumber: 'GRN-002' },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const postObj = { pageNo: 1, pageSize: 10 };
      await store.dispatch(actions.getGRNList(postObj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.GOODS_RECEVED_NOTE_LIST);
    });

    it('should call authApi with correct parameters', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      const postObj = {
        supplierId: { value: 1 },
        rfqNumber: 'RFQ-001',
        status: { value: 'approved' },
        pageNo: 1,
        pageSize: 20,
      };

      await store.dispatch(actions.getGRNList(postObj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: expect.stringContaining('/rest/poquatation/getListForGRN'),
      });
      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: expect.stringContaining('supplierId=1'),
      });
    });

    it('should not dispatch action when paginationDisable is true', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      const postObj = { paginationDisable: true };
      await store.dispatch(actions.getGRNList(postObj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });

    it('should handle date formatting in URL', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      const postObj = {
        invoiceDate: new Date('2024-01-15'),
        rfqExpiryDate: new Date('2024-02-15'),
      };

      await store.dispatch(actions.getGRNList(postObj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: expect.stringContaining('rfqReceiveDate='),
      });
    });
  });

  describe('getProjectList', () => {
    it('should dispatch PROJECT_LIST action on success', async () => {
      const mockProjects = [{ projectId: 1, projectName: 'Project A' }];

      authApi.mockResolvedValue({ status: 200, data: mockProjects });

      await store.dispatch(actions.getProjectList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.PROJECT_LIST);
      expect(dispatchedActions[0].payload.data).toEqual(mockProjects);
    });

    it('should call correct API endpoint', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      await store.dispatch(actions.getProjectList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/project/getProjectsForDropdown',
      });
    });
  });

  describe('saveInvoice', () => {
    it('should save invoice successfully', async () => {
      const mockResponse = { status: 200, data: { invoiceId: 1 } };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.saveInvoice(1));

      expect(authApi).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/invoice/save?id=1',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changeStatus', () => {
    it('should change GRN status successfully', async () => {
      const mockResponse = { status: 200, data: { message: 'Status updated' } };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.changeStatus(1, 'approved'));

      expect(authApi).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/poquatation/changeStatus?id=1&status=approved',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('getContactList', () => {
    it('should dispatch CONTACT_LIST action on success', async () => {
      const mockContacts = [{ contactId: 1, firstName: 'John' }];

      authApi.mockResolvedValue({ status: 200, data: mockContacts });

      await store.dispatch(actions.getContactList('supplier'));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.CONTACT_LIST);
    });

    it('should handle optional nameCode parameter', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      await store.dispatch(actions.getContactList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/contact/getContactsForDropdown?contactType=',
      });
    });
  });

  describe('getStatusList', () => {
    it('should dispatch STATUS_LIST action on success', async () => {
      const mockStatuses = [{ statusId: 1, statusName: 'Draft' }];

      authApi.mockResolvedValue({ status: 200, data: mockStatuses });

      await store.dispatch(actions.getStatusList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.STATUS_LIST);
    });
  });

  describe('getVatList', () => {
    it('should dispatch VAT_LIST action on success', async () => {
      const mockVat = [{ vatId: 1, vatCategory: 'Standard' }];

      authApi.mockResolvedValue({ status: 200, data: mockVat });

      await store.dispatch(actions.getVatList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.VAT_LIST);
    });
  });

  describe('getDepositList', () => {
    it('should dispatch DEPOSIT_LIST action on success', async () => {
      const mockDeposits = [{ depositId: 1, depositName: 'Advance' }];

      authApi.mockResolvedValue({ status: 200, data: mockDeposits });

      await store.dispatch(actions.getDepositList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.DEPOSIT_LIST);
    });
  });

  describe('getPaymentMode', () => {
    it('should dispatch PAY_MODE action on success', async () => {
      const mockPayModes = [{ payModeId: 1, payModeName: 'Cash' }];

      authApi.mockResolvedValue({ status: 200, data: mockPayModes });

      await store.dispatch(actions.getPaymentMode());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.PAY_MODE);
    });
  });

  describe('getProductList', () => {
    it('should dispatch PRODUCT_LIST action on success', async () => {
      const mockProducts = [{ productId: 1, productName: 'Product A' }];

      authApi.mockResolvedValue({ status: 200, data: mockProducts });

      await store.dispatch(actions.getProductList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.PRODUCT_LIST);
    });

    it('should call API with PURCHASE price type', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      await store.dispatch(actions.getProductList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/datalist/product?priceType=PURCHASE',
      });
    });
  });

  describe('getSupplierList', () => {
    it('should dispatch SUPPLIER_LIST action on success', async () => {
      const mockSuppliers = [{ supplierId: 1, supplierName: 'Supplier A' }];

      authApi.mockResolvedValue({ status: 200, data: mockSuppliers });

      await store.dispatch(actions.getSupplierList('vendor'));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.SUPPLIER_LIST);
    });
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const supplierData = { supplierName: 'New Supplier' };
      const mockResponse = { status: 200, data: { supplierId: 1 } };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.createSupplier(supplierData));

      expect(authApi).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/contact/save',
        data: supplierData,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeBulk', () => {
    it('should delete GRNs in bulk', async () => {
      const mockResponse = { status: 200, data: { message: 'Deleted' } };
      authApi.mockResolvedValue(mockResponse);

      const grnIds = [1, 2, 3];
      const result = await store.dispatch(actions.removeBulk(grnIds));

      expect(authApi).toHaveBeenCalledWith({
        method: 'delete',
        url: '/rest/invoice/deletes',
        data: grnIds,
      });
      expect(result.status).toBe(200);
    });
  });

  describe('getCountryList', () => {
    it('should dispatch COUNTRY_LIST action on success', async () => {
      const mockCountries = [{ countryId: 1, countryName: 'UAE' }];

      authApi.mockResolvedValue({ status: 200, data: mockCountries });

      await store.dispatch(actions.getCountryList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.COUNTRY_LIST);
      expect(dispatchedActions[0].payload).toEqual(mockCountries);
    });
  });

  describe('postGRN', () => {
    it('should post GRN successfully', async () => {
      const mockResponse = { status: 200, data: { message: 'Posted' } };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.postGRN(1));

      expect(authApi).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/poquatation/postGRN?id=1',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('sendMail', () => {
    it('should send GRN email successfully', async () => {
      const mockResponse = { status: 200, data: { message: 'Email sent' } };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.sendMail(1));

      expect(authApi).toHaveBeenCalledWith({
        method: 'post',
        url: '/rest/poquatation/sendGRN?id=1',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('getPurchaseOrderListForDropdown', () => {
    it('should dispatch PO_LIST action on success', async () => {
      const mockPOs = [{ poId: 1, poNumber: 'PO-001' }];

      authApi.mockResolvedValue({ status: 200, data: mockPOs });

      await store.dispatch(actions.getPurchaseOrderListForDropdown());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(GOODS_RECEVED_NOTE.PO_LIST);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors in getGRNList', async () => {
      authApi.mockRejectedValue(new Error('API Error'));

      await expect(store.dispatch(actions.getGRNList({}))).rejects.toThrow('API Error');
    });

    it('should handle errors in createSupplier', async () => {
      authApi.mockRejectedValue(new Error('Creation failed'));

      await expect(store.dispatch(actions.createSupplier({}))).rejects.toThrow('Creation failed');
    });
  });
});
