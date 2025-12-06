import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { JOURNAL } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Journal Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getJournalList', () => {
		it('should fetch journal list successfully', async () => {
			const mockJournals = [
				{ journalId: 1, journalReferenceNo: 'JNL-001', description: 'Opening balance' },
				{ journalId: 2, journalReferenceNo: 'JNL-002', description: 'Adjustment entry' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockJournals,
			});

			const params = {
				journalReferenceNo: 'JNL-001',
				description: 'Opening',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'journalDate',
				paginationDisable: false,
			};

			await store.dispatch(actions.getJournalList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.JOURNAL_LIST,
				payload: { status: 200, data: mockJournals },
			});
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				journalReferenceNo: 'JNL-001',
				description: 'Test entry',
				journalDate: '2023-12-01',
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'referenceNo',
				paginationDisable: false,
			};

			await store.dispatch(actions.getJournalList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('journalReferenceNo=JNL-001'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('description=Test entry'),
				})
			);
		});

		it('should format date correctly when provided', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const dateToTest = '2023-12-15';
			const params = {
				journalDate: dateToTest,
				paginationDisable: false,
			};

			await store.dispatch(actions.getJournalList(params));

			const expectedDateFormat = moment(dateToTest).format('YYYY-MM-DD');
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining(`journalDate=${expectedDateFormat}`),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getJournalList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getJournalList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('getCurrencyList', () => {
		it('should fetch currency list successfully', async () => {
			const mockCurrencies = [
				{ code: 'AED', name: 'UAE Dirham' },
				{ code: 'USD', name: 'US Dollar' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCurrencies,
			});

			const result = await store.dispatch(actions.getCurrencyList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/currency/getCompanyCurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.CURRENCY_LIST,
				payload: { status: 200, data: mockCurrencies },
			});

			expect(result.status).toBe(200);
		});

		it('should handle currency list error', async () => {
			authApi.mockRejectedValue(new Error('Currency service unavailable'));

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Currency service unavailable'
			);
		});
	});

	describe('getTransactionCategoryList', () => {
		it('should fetch transaction category list successfully', async () => {
			const mockCategories = [
				{ transactionCategoryId: 1, transactionCategoryDescription: 'Sales' },
				{ transactionCategoryId: 2, transactionCategoryDescription: 'Purchases' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const result = await store.dispatch(actions.getTransactionCategoryList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/transactioncategory/getTransactionCategoryListForManualJornal',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.TRANSACTION_CATEGORY_LIST,
				payload: { status: 200, data: mockCategories },
			});
		});

		it('should handle transaction category list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch categories'));

			await expect(
				store.dispatch(actions.getTransactionCategoryList())
			).rejects.toThrow('Failed to fetch categories');
		});
	});

	describe('getContactList', () => {
		it('should fetch contact list successfully', async () => {
			const mockContacts = [
				{ contactId: 1, firstName: 'Ahmed', lastName: 'Ali' },
				{ contactId: 2, firstName: 'Fatima', lastName: 'Hassan' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockContacts,
			});

			const result = await store.dispatch(actions.getContactList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/contact/getContactsForDropdown',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.CONTACT_LIST,
				payload: { status: 200, data: mockContacts },
			});
		});

		it('should handle contact list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch contacts'));

			await expect(store.dispatch(actions.getContactList())).rejects.toThrow(
				'Failed to fetch contacts'
			);
		});
	});

	describe('getVatList', () => {
		it('should fetch VAT list successfully', async () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', rate: 5 },
				{ id: 2, name: 'Zero Rate', rate: 0 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatList,
			});

			const result = await store.dispatch(actions.getVatList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/vatCategory',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.VAT_LIST,
				payload: { status: 200, data: mockVatList },
			});
		});

		it('should handle VAT list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch VAT list'));

			await expect(store.dispatch(actions.getVatList())).rejects.toThrow(
				'Failed to fetch VAT list'
			);
		});
	});

	describe('removeBulkJournal', () => {
		it('should remove bulk journals successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulkJournal(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/journal/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulkJournal({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});
	});

	describe('getSavedPageNum', () => {
		it('should dispatch page number successfully', () => {
			const pageNumber = 3;

			store.dispatch(actions.getSavedPageNum(pageNumber));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.PAGE_NUM,
				payload: pageNumber,
			});
		});

		it('should handle different page numbers', () => {
			for (let i = 1; i <= 5; i++) {
				store = mockStore({});
				store.dispatch(actions.getSavedPageNum(i));

				const dispatchedActions = store.getActions();
				expect(dispatchedActions).toContainEqual({
					type: JOURNAL.PAGE_NUM,
					payload: i,
				});
			}
		});
	});

	describe('setCancelFlag', () => {
		it('should dispatch cancel flag true', () => {
			store.dispatch(actions.setCancelFlag(true));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.CANCEL_FLAG,
				payload: true,
			});
		});

		it('should dispatch cancel flag false', () => {
			store.dispatch(actions.setCancelFlag(false));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.CANCEL_FLAG,
				payload: false,
			});
		});
	});

	describe('getInvoicePrefix', () => {
		it('should fetch invoice prefix successfully', async () => {
			const mockPrefix = { prefix: 'JNL', suffix: '2023', nextNumber: 100 };

			authApi.mockResolvedValue({
				status: 200,
				data: mockPrefix,
			});

			const result = await store.dispatch(actions.getInvoicePrefix());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=11',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockPrefix);
		});

		it('should handle invoice prefix fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch prefix'));

			await expect(store.dispatch(actions.getInvoicePrefix())).rejects.toThrow(
				'Failed to fetch prefix'
			);
		});
	});

	describe('checkValidation', () => {
		it('should check validation successfully', async () => {
			const mockValidation = { isValid: true };

			authApi.mockResolvedValue({
				status: 200,
				data: mockValidation,
			});

			const params = {
				name: 'JNL-001',
				moduleType: 'journal',
			};

			const result = await store.dispatch(actions.checkValidation(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/validation/validate?name=${params.name}&moduleType=${params.moduleType}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockValidation);
		});

		it('should handle validation check error', async () => {
			authApi.mockRejectedValue(new Error('Validation failed'));

			await expect(
				store.dispatch(actions.checkValidation({ name: 'Test', moduleType: 'journal' }))
			).rejects.toThrow('Validation failed');
		});
	});

	describe('getInvoiceNo', () => {
		it('should fetch invoice number successfully', async () => {
			const mockInvoiceNo = { invoiceNo: 'JNL-2023-100' };

			authApi.mockResolvedValue({
				status: 200,
				data: mockInvoiceNo,
			});

			const result = await store.dispatch(actions.getInvoiceNo());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=11',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockInvoiceNo);
		});

		it('should handle invoice number fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch invoice number'));

			await expect(store.dispatch(actions.getInvoiceNo())).rejects.toThrow(
				'Failed to fetch invoice number'
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle network timeout', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.code = 'ECONNABORTED';
			authApi.mockRejectedValue(timeoutError);

			await expect(
				store.dispatch(actions.getJournalList({}))
			).rejects.toThrow('Request timeout');
		});

		it('should handle 401 unauthorized error', async () => {
			const unauthorizedError = new Error('Unauthorized');
			unauthorizedError.response = { status: 401 };
			authApi.mockRejectedValue(unauthorizedError);

			await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow(
				'Unauthorized'
			);
		});

		it('should handle 404 not found error', async () => {
			const notFoundError = new Error('Not found');
			notFoundError.response = { status: 404 };
			authApi.mockRejectedValue(notFoundError);

			await expect(store.dispatch(actions.getInvoiceNo())).rejects.toThrow(
				'Not found'
			);
		});

		it('should handle 500 server error', async () => {
			const serverError = new Error('Internal server error');
			serverError.response = { status: 500 };
			authApi.mockRejectedValue(serverError);

			await expect(store.dispatch(actions.getVatList())).rejects.toThrow(
				'Internal server error'
			);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty journal list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getJournalList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.JOURNAL_LIST,
				payload: { status: 200, data: [] },
			});
		});

		it('should handle null parameters gracefully', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				journalReferenceNo: null,
				description: null,
				journalDate: null,
				paginationDisable: false,
			};

			await store.dispatch(actions.getJournalList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle large bulk delete operation', async () => {
			const largeIdArray = Array.from({ length: 100 }, (_, i) => i + 1);
			authApi.mockResolvedValue({ status: 200, data: { message: 'Success' } });

			await store.dispatch(actions.removeBulkJournal({ ids: largeIdArray }));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { ids: largeIdArray },
				})
			);
		});

		it('should handle special characters in journal reference', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				journalReferenceNo: 'JNL-2023/12/001',
				paginationDisable: false,
			};

			await store.dispatch(actions.getJournalList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle page number zero', () => {
			store.dispatch(actions.getSavedPageNum(0));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.PAGE_NUM,
				payload: 0,
			});
		});

		it('should handle negative page number', () => {
			store.dispatch(actions.getSavedPageNum(-1));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: JOURNAL.PAGE_NUM,
				payload: -1,
			});
		});
	});
});
