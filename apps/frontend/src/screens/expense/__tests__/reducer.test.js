import ExpenseReducer from '../reducer';
import { EXPENSE } from 'constants/types';

describe('ExpenseReducer', () => {
	const initialState = {
		expense_list: [],
		expense_detail: {},
		currency_list: [],
		supplier_list: [],
		project_list: [],
		employee_list: [],
		expense_categories_list: [],
		vat_list: [],
		bank_list: [],
		pay_mode_list: [],
		pay_to_list: [],
	};

	it('should return the initial state', () => {
		expect(ExpenseReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle EXPENSE.EXPENSE_LIST', () => {
		const mockExpenses = [
			{ id: 1, amount: 1000, description: 'Office supplies' },
			{ id: 2, amount: 2000, description: 'Travel' },
		];

		const action = {
			type: EXPENSE.EXPENSE_LIST,
			payload: mockExpenses,
		};

		const expectedState = {
			...initialState,
			expense_list: mockExpenses,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.EXPENSE_DETAIL', () => {
		const mockExpenseDetail = {
			id: 1,
			amount: 1500,
			description: 'Client meeting',
			date: '2023-12-01',
		};

		const action = {
			type: EXPENSE.EXPENSE_DETAIL,
			payload: mockExpenseDetail,
		};

		const expectedState = {
			...initialState,
			expense_detail: mockExpenseDetail,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.BANK_LIST', () => {
		const mockBankList = [
			{ id: 1, name: 'Bank A', accountNumber: '123456' },
			{ id: 2, name: 'Bank B', accountNumber: '789012' },
		];

		const action = {
			type: EXPENSE.BANK_LIST,
			payload: { data: mockBankList },
		};

		const expectedState = {
			...initialState,
			bank_list: mockBankList,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'USD', name: 'US Dollar' },
			{ code: 'EUR', name: 'Euro' },
			{ code: 'AED', name: 'UAE Dirham' },
		];

		const action = {
			type: EXPENSE.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.PROJECT_LIST', () => {
		const mockProjects = [
			{ id: 1, projectName: 'Project Alpha' },
			{ id: 2, projectName: 'Project Beta' },
		];

		const action = {
			type: EXPENSE.PROJECT_LIST,
			payload: mockProjects,
		};

		const expectedState = {
			...initialState,
			project_list: mockProjects,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.SUPPLIER_LIST', () => {
		const mockSuppliers = [
			{ contactId: 1, firstName: 'Supplier A' },
			{ contactId: 2, firstName: 'Supplier B' },
		];

		const action = {
			type: EXPENSE.SUPPLIER_LIST,
			payload: mockSuppliers,
		};

		const expectedState = {
			...initialState,
			supplier_list: mockSuppliers,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.EMPLOYEE_LIST', () => {
		const mockEmployees = [
			{ id: 1, name: 'John Doe', email: 'john@example.com' },
			{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
		];

		const action = {
			type: EXPENSE.EMPLOYEE_LIST,
			payload: mockEmployees,
		};

		const expectedState = {
			...initialState,
			employee_list: mockEmployees,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.VAT_LIST', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard Rate', rate: 5 },
			{ id: 2, name: 'Zero Rate', rate: 0 },
		];

		const action = {
			type: EXPENSE.VAT_LIST,
			payload: { data: mockVatList },
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.EXPENSE_CATEGORIES_LIST', () => {
		const mockCategories = [
			{ transactionCategoryId: 1, transactionCategoryDescription: 'Travel' },
			{ transactionCategoryId: 2, transactionCategoryDescription: 'Office' },
		];

		const action = {
			type: EXPENSE.EXPENSE_CATEGORIES_LIST,
			payload: mockCategories,
		};

		const expectedState = {
			...initialState,
			expense_categories_list: mockCategories,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle EXPENSE.PAY_MODE with Petty Cash label transformation', () => {
		const mockPayModes = [
			{ id: 1, label: 'Cash' },
			{ id: 2, label: 'Card' },
		];

		const action = {
			type: EXPENSE.PAY_MODE,
			payload: mockPayModes,
		};

		const state = ExpenseReducer(initialState, action);

		expect(state.pay_mode_list[0].label).toBe('Petty Cash');
		expect(state.pay_mode_list[1].label).toBe('Card');
	});

	it('should handle EXPENSE.USER_LIST with Company Expense prepended', () => {
		const mockUsers = [
			{ label: 'User 1', value: 'user1' },
			{ label: 'User 2', value: 'user2' },
		];

		const action = {
			type: EXPENSE.USER_LIST,
			payload: mockUsers,
		};

		const state = ExpenseReducer(initialState, action);

		expect(state.user_list[0]).toEqual({
			label: 'Company Expense',
			value: 'Company Expense',
		});
		expect(state.user_list.length).toBe(3);
	});

	it('should handle EXPENSE.PAY_TO_LIST with Company Expense prepended', () => {
		const mockPayToList = [
			{ label: 'Payee 1', value: 'payee1' },
			{ label: 'Payee 2', value: 'payee2' },
		];

		const action = {
			type: EXPENSE.PAY_TO_LIST,
			payload: mockPayToList,
		};

		const state = ExpenseReducer(initialState, action);

		expect(state.pay_to_list[0]).toEqual({
			label: 'Company Expense',
			value: 'Company Expense',
		});
		expect(state.pay_to_list.length).toBe(3);
	});

	it('should handle EXPENSE.PAYMENT_LIST', () => {
		const mockPayments = [
			{ paymentID: 1, amount: 500 },
			{ paymentID: 2, amount: 1000 },
		];

		const action = {
			type: EXPENSE.PAYMENT_LIST,
			payload: mockPayments,
		};

		const expectedState = {
			...initialState,
			payment_list: mockPayments,
		};

		expect(ExpenseReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(ExpenseReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockExpenses = [{ id: 1, amount: 100 }];
		const action = {
			type: EXPENSE.EXPENSE_LIST,
			payload: mockExpenses,
		};

		const stateBefore = { ...initialState };
		ExpenseReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle EXPENSE.PAY_MODE with empty array', () => {
		const action = {
			type: EXPENSE.PAY_MODE,
			payload: [],
		};

		const state = ExpenseReducer(initialState, action);

		expect(state.pay_mode_list).toEqual([]);
	});
});
