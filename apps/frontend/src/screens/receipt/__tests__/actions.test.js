import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { RECEIPT } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Receipt Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getReceiptList', () => {
		it('should fetch receipt list successfully', async () => {
			const mockReceipts = [
				{ receiptId: 1, receiptNumber: 'REC-001', amount: 5000 },
				{ receiptId: 2, receiptNumber: 'REC-002', amount: 7500 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockReceipts,
			});

			const params = {
				receiptReferenceCode: 'REC-001',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'receiptDate',
				paginationDisable: false,
			};

			await store.dispatch(actions.getReceiptList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: RECEIPT.RECEIPT_LIST,
				payload: mockReceipts,
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				receiptReferenceCode: 'REC-001',
				contactId: { value: 'contact123' },
				invoiceId: { value: 'invoice456' },
				receiptDate: '2023-12-01',
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'amount',
				paginationDisable: false,
			};

			await store.dispatch(actions.getReceiptList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('referenceCode=REC-001'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('contactId=contact123'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('invoiceId=invoice456'),
				})
			);
		});

		it('should format date correctly when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const dateToTest = '2023-12-15';
			const params = {
				receiptDate: dateToTest,
				paginationDisable: false,
			};

			await store.dispatch(actions.getReceiptList(params));

			const expectedDateFormat = moment(dateToTest).format('DD-MM-YYYY');
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining(`receiptDate=${expectedDateFormat}`),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getReceiptList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getReceiptList({}))
			).rejects.toThrow('Network error');
		});

		it('should handle empty parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getReceiptList({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('referenceCode='),
				})
			);
		});
	});

	describe('removeBulk', () => {
		it('should remove bulk receipts successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/receipt/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulk({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});

		it('should handle empty array of ids', async () => {
			authApi.mockResolvedValue({ status: 200, data: { message: 'Success' } });

			const result = await store.dispatch(actions.removeBulk({ ids: [] }));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/receipt/deletes',
				data: { ids: [] },
			});
		});
	});

	describe('getContactList', () => {
		it('should fetch contact list successfully', async () => {
			const mockContacts = [
				{ contactId: 1, firstName: 'John', lastName: 'Doe' },
				{ contactId: 2, firstName: 'Jane', lastName: 'Smith' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockContacts,
			});

			const contactType = 2;
			await store.dispatch(actions.getContactList(contactType));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: RECEIPT.CONTACT_LIST,
				payload: mockContacts,
			});
		});

		it('should handle different contact types', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getContactList(1));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/contact/getContactsForDropdown?contactType=1',
				})
			);

			await store.dispatch(actions.getContactList(2));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/contact/getContactsForDropdown?contactType=2',
				})
			);
		});

		it('should handle contact list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch contacts'));

			await expect(store.dispatch(actions.getContactList(2))).rejects.toThrow(
				'Failed to fetch contacts'
			);
		});
	});

	describe('getInvoiceList', () => {
		it('should fetch invoice list successfully', async () => {
			const mockInvoices = [
				{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000 },
				{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 15000 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoices,
			});

			await store.dispatch(actions.getInvoiceList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/invoice/getInvoicesForDropdown?type=2',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: RECEIPT.INVOICE_LIST,
				payload: mockInvoices,
			});
		});

		it('should handle invoice list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch invoices'));

			await expect(store.dispatch(actions.getInvoiceList())).rejects.toThrow(
				'Failed to fetch invoices'
			);
		});

		it('should return response data', async () => {
			const mockInvoices = [{ invoiceId: 1 }];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoices,
			});

			const result = await store.dispatch(actions.getInvoiceList());

			expect(result.data).toEqual(mockInvoices);
		});
	});

	describe('Error Handling', () => {
		it('should handle network timeout', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.code = 'ECONNABORTED';
			authApi.mockRejectedValue(timeoutError);

			await expect(
				store.dispatch(actions.getReceiptList({}))
			).rejects.toThrow('Request timeout');
		});

		it('should handle 401 unauthorized error', async () => {
			const unauthorizedError = new Error('Unauthorized');
			unauthorizedError.response = { status: 401 };
			authApi.mockRejectedValue(unauthorizedError);

			await expect(store.dispatch(actions.getContactList(2))).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 404 not found error', async () => {
			const notFoundError = new Error('Not found');
			notFoundError.response = { status: 404 };
			authApi.mockRejectedValue(notFoundError);

			await expect(store.dispatch(actions.getInvoiceList())).rejects.toThrow(
				'Not found'
			);
		});

		it('should handle 500 server error', async () => {
			const serverError = new Error('Internal server error');
			serverError.response = { status: 500 };
			authApi.mockRejectedValue(serverError);

			await expect(
				store.dispatch(actions.removeBulk({ ids: [1] }))
			).rejects.toThrow('Internal server error');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty receipt list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getReceiptList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: RECEIPT.RECEIPT_LIST,
				payload: [],
			});
		});

		it('should handle null date parameter', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				receiptDate: null,
				paginationDisable: false,
			};

			await store.dispatch(actions.getReceiptList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.not.stringContaining('receiptDate='),
				})
			);
		});

		it('should handle large bulk delete operation', async () => {
			const largeIdArray = Array.from({ length: 100 }, (_, i) => i + 1);
			authApi.mockResolvedValue({ status: 200, data: { message: 'Success' } });

			await store.dispatch(actions.removeBulk({ ids: largeIdArray }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { ids: largeIdArray },
				})
			);
		});

		it('should handle special characters in reference code', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				receiptReferenceCode: 'REC-2023/12/001',
				paginationDisable: false,
			};

			await store.dispatch(actions.getReceiptList(params));

			expect(authApi).toHaveBeenCalled();
		});
	});
});
