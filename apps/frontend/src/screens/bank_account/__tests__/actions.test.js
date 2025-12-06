import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { BANK_ACCOUNT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Bank Account Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getAccountTypeList', () => {
		it('should fetch account type list successfully', async () => {
			const mockAccountTypes = [
				{ id: 1, accountType: 'Savings' },
				{ id: 2, accountType: 'Current' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockAccountTypes,
			});

			await store.dispatch(actions.getAccountTypeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/bank/getaccounttype',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: BANK_ACCOUNT.ACCOUNT_TYPE_LIST,
				payload: {
					data: mockAccountTypes,
				},
			});
		});

		it('should handle account type list fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch account types'));

			await expect(
				store.dispatch(actions.getAccountTypeList())
			).rejects.toThrow('Failed to fetch account types');
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
				url: '/rest/currency/getactivecurrencies',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: BANK_ACCOUNT.CURRENCY_LIST,
				payload: {
					data: mockCurrencies,
				},
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

	describe('getBankAccountList', () => {
		it('should fetch bank account list successfully', async () => {
			const mockBankAccounts = [
				{ id: 1, bankName: 'Emirates NBD', accountNumber: '123456' },
				{ id: 2, bankName: 'Dubai Islamic Bank', accountNumber: '789012' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockBankAccounts,
			});

			const params = {
				bankName: 'Emirates',
				pageNo: 1,
				pageSize: 10,
				order: 'desc',
				sortingCol: 'bankName',
				paginationDisable: false,
			};

			const result = await store.dispatch(actions.getBankAccountList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
				payload: {
					data: mockBankAccounts,
				},
			});

			expect(result.status).toBe(200);
		});

		it('should build correct URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				bankName: 'Emirates NBD',
				bankAccountTypeId: { value: 'savings' },
				bankAccountName: 'Business Account',
				accountNumber: '123456',
				currencyCode: { value: 'AED' },
				pageNo: 2,
				pageSize: 20,
				order: 'asc',
				sortingCol: 'accountNumber',
				paginationDisable: false,
			};

			await store.dispatch(actions.getBankAccountList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: expect.stringContaining('bankName=Emirates NBD'),
				})
			);
			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: expect.stringContaining('bankAccountTypeId=savings'),
				})
			);
		});

		it('should not dispatch action when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = { paginationDisable: true };

			await store.dispatch(actions.getBankAccountList(params));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			const mockError = new Error('Network error');
			authApi.mockRejectedValue(mockError);

			await expect(
				store.dispatch(actions.getBankAccountList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('deleteBankAccount', () => {
		it('should delete bank account successfully', async () => {
			const bankAccountId = 123;

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(
				actions.deleteBankAccount(bankAccountId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: `/rest/bank/deletebank?id=${bankAccountId}`,
			});

			expect(result.status).toBe(200);
		});

		it('should handle delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.deleteBankAccount(123))
			).rejects.toThrow('Delete failed');
		});
	});

	describe('removeBankAccountByID', () => {
		it('should remove bank account by ID successfully', async () => {
			const bankAccountId = 456;

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Removed successfully' },
			});

			const result = await store.dispatch(
				actions.removeBankAccountByID(bankAccountId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: `/rest/bank/${bankAccountId}`,
			});

			expect(result.status).toBe(200);
		});

		it('should handle remove error', async () => {
			authApi.mockRejectedValue(new Error('Remove failed'));

			await expect(
				store.dispatch(actions.removeBankAccountByID(456))
			).rejects.toThrow('Remove failed');
		});
	});

	describe('removeBulkBankAccount', () => {
		it('should remove bulk bank accounts successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(
				actions.removeBulkBankAccount(mockIds)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/bank/multiple',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Bulk delete failed'));

			await expect(
				store.dispatch(actions.removeBulkBankAccount({ ids: [1, 2] }))
			).rejects.toThrow('Bulk delete failed');
		});
	});

	describe('getExplainCount', () => {
		it('should fetch explain count successfully', async () => {
			const bankAccountId = 789;
			const mockCount = { count: 15 };

			authApi.mockResolvedValue({
				status: 200,
				data: mockCount,
			});

			const result = await store.dispatch(
				actions.getExplainCount(bankAccountId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/transaction/getExplainedTransactionCount/?bankAccountId=${bankAccountId}`,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCount);
		});

		it('should handle explain count fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch count'));

			await expect(
				store.dispatch(actions.getExplainCount(789))
			).rejects.toThrow('Failed to fetch count');
		});
	});

	describe('Error Handling', () => {
		it('should handle network timeout', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.code = 'ECONNABORTED';
			authApi.mockRejectedValue(timeoutError);

			await expect(
				store.dispatch(actions.getBankAccountList({}))
			).rejects.toThrow('Request timeout');
		});

		it('should handle 401 unauthorized error', async () => {
			const unauthorizedError = new Error('Unauthorized');
			unauthorizedError.response = { status: 401 };
			authApi.mockRejectedValue(unauthorizedError);

			await expect(
				store.dispatch(actions.getCurrencyList())
			).rejects.toThrow('Unauthorized');
		});

		it('should handle 500 server error', async () => {
			const serverError = new Error('Internal server error');
			serverError.response = { status: 500 };
			authApi.mockRejectedValue(serverError);

			await expect(
				store.dispatch(actions.getAccountTypeList())
			).rejects.toThrow('Internal server error');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty bank account list', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: [],
			});

			await store.dispatch(actions.getBankAccountList({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
				payload: {
					data: [],
				},
			});
		});

		it('should handle null parameters gracefully', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				bankName: null,
				bankAccountTypeId: null,
				paginationDisable: false,
			};

			await store.dispatch(actions.getBankAccountList(params));

			expect(authApi).toHaveBeenCalled();
		});

		it('should handle undefined currency response', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: undefined,
			});

			await store.dispatch(actions.getCurrencyList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: BANK_ACCOUNT.CURRENCY_LIST,
				payload: {
					data: undefined,
				},
			});
		});
	});
});
