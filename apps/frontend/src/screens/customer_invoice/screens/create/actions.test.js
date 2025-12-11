import {
  createInvoice,
  getInvoiceNo,
  checkValidation,
  getProductById,
} from './actions';

import { authApi, authFileUploadApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
  authFileUploadApi: jest.fn(),
}));

describe('customer invoice create actions', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createInvoice posts multipart payload through authFileUploadApi', async () => {
    authFileUploadApi.mockResolvedValue({ status: 200 });
    const payload = { referenceNumber: 'INV-001' };

    await expect(createInvoice(payload)(dispatch)).resolves.toEqual({ status: 200 });

    expect(authFileUploadApi).toHaveBeenCalledWith({
      method: 'post',
      url: '/rest/invoice/save',
      data: payload,
    });
  });

  it('getInvoiceNo fetches next number via authApi', async () => {
    authApi.mockResolvedValue({ data: { next: 'INV-1002' } });

    await expect(getInvoiceNo()(dispatch)).resolves.toEqual({ data: { next: 'INV-1002' } });

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=2',
    });
  });

  it('checkValidation resolves only when backend returns 200', async () => {
    authApi.mockResolvedValue({ status: 200 });
    const params = { name: 'INV-001', moduleType: 'INVOICE' };

    await expect(checkValidation(params)(dispatch)).resolves.toEqual({ status: 200 });

    expect(authApi).toHaveBeenCalledWith({
      method: 'get',
      url: `/rest/validation/validate?name=${params.name}&moduleType=${params.moduleType}`,
    });
  });

  it('checkValidation propagates underlying errors', async () => {
    const boom = new Error('boom');
    authApi.mockRejectedValue(boom);

    await expect(checkValidation({ name: 'INV', moduleType: 'INVOICE' })(dispatch)).rejects.toThrow('boom');
  });

  it('getProductById calls product endpoint with supplied id', async () => {
    authApi.mockResolvedValue({ data: { id: 7 } });

    await expect(getProductById(7)(dispatch)).resolves.toEqual({ data: { id: 7 } });

    expect(authApi).toHaveBeenCalledWith({
      method: 'GET',
      url: '/rest/product/getProductById?id=7',
    });
  });
});








