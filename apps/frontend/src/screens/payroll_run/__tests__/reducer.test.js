import PayrollRunReducer from '../reducer';
import { EMPLOYEEPAYROLL } from 'constants/types';

describe('Payroll Run Reducer', () => {
	const initialState = {
		payroll_employee_list: [],
		employee_list_dropdown: [],
		incompleteEmployeeList: [],
		payroll_list: [],
		approver_dropdown_list: [],
		user_approver_generater_dropdown_list: [],
	};

	it('should return the initial state', () => {
		expect(PayrollRunReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST action', () => {
		const mockEmployeeList = [
			{ id: 1, name: 'John Doe', salary: 5000, department: 'IT' },
			{ id: 2, name: 'Jane Smith', salary: 6000, department: 'HR' },
			{ id: 3, name: 'Bob Johnson', salary: 5500, department: 'Finance' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: mockEmployeeList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.payroll_employee_list).toEqual(mockEmployeeList);
		expect(newState.payroll_employee_list).toHaveLength(3);
	});

	it('should handle EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN action', () => {
		const mockDropdownList = [
			{ value: 1, label: 'John Doe' },
			{ value: 2, label: 'Jane Smith' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN,
			payload: mockDropdownList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.employee_list_dropdown).toEqual(mockDropdownList);
		expect(newState.employee_list_dropdown).toHaveLength(2);
	});

	it('should handle EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST action', () => {
		const mockIncompleteList = [
			{ id: 1, name: 'Employee A', missingInfo: 'Bank details' },
			{ id: 2, name: 'Employee B', missingInfo: 'Tax information' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST,
			payload: mockIncompleteList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.incompleteEmployeeList).toEqual(mockIncompleteList);
		expect(newState.incompleteEmployeeList).toHaveLength(2);
	});

	it('should handle EMPLOYEEPAYROLL.PAYROLL_LIST action', () => {
		const mockPayrollList = [
			{ id: 1, period: 'January 2024', totalAmount: 50000, status: 'Approved' },
			{ id: 2, period: 'February 2024', totalAmount: 52000, status: 'Pending' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_LIST,
			payload: mockPayrollList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.payroll_list).toEqual(mockPayrollList);
		expect(newState.payroll_list).toHaveLength(2);
	});

	it('should handle EMPLOYEEPAYROLL.APPROVER_DROPDOWN action', () => {
		const mockApproverList = [
			{ value: 1, label: 'Manager A' },
			{ value: 2, label: 'Manager B' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.APPROVER_DROPDOWN,
			payload: mockApproverList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.approver_dropdown_list).toEqual(mockApproverList);
		expect(newState.approver_dropdown_list).toHaveLength(2);
	});

	it('should handle EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN action', () => {
		const mockUserApproverList = [
			{ userId: 1, userName: 'Admin User', role: 'Approver' },
			{ userId: 2, userName: 'Finance Manager', role: 'Generator' },
		];

		const action = {
			type: EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN,
			payload: mockUserApproverList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.user_approver_generater_dropdown_list).toEqual(
			mockUserApproverList
		);
		expect(newState.user_approver_generater_dropdown_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [{ id: 1, name: 'Test Employee' }],
		};

		const stateBefore = { ...initialState };
		PayrollRunReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_PAYROLL_ACTION',
			payload: [],
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should update payroll employee list without affecting other state', () => {
		const stateWithData = {
			...initialState,
			payroll_list: [{ id: 1, period: 'January' }],
		};

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [{ id: 1, name: 'New Employee' }],
		};

		const newState = PayrollRunReducer(stateWithData, action);

		expect(newState.payroll_employee_list).toHaveLength(1);
		expect(newState.payroll_list).toHaveLength(1);
		expect(newState.payroll_list[0].period).toBe('January');
	});

	it('should handle empty payload arrays', () => {
		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [],
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.payroll_employee_list).toEqual([]);
		expect(newState.payroll_employee_list).toHaveLength(0);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			...initialState,
			payroll_employee_list: [{ id: 1, name: 'Old Employee' }],
		};

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [{ id: 2, name: 'New Employee' }],
		};

		const newState = PayrollRunReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.payroll_employee_list).not.toBe(
			currentState.payroll_employee_list
		);
	});

	it('should handle large employee list', () => {
		const largeEmployeeList = Array.from({ length: 500 }, (_, i) => ({
			id: i + 1,
			name: `Employee ${i + 1}`,
			salary: 5000 + i * 100,
		}));

		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: largeEmployeeList,
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState.payroll_employee_list).toHaveLength(500);
		expect(newState.payroll_employee_list[0].name).toBe('Employee 1');
		expect(newState.payroll_employee_list[499].name).toBe('Employee 500');
	});

	it('should handle sequential updates to different state properties', () => {
		let state = initialState;

		const action1 = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [{ id: 1, name: 'Employee 1' }],
		};

		state = PayrollRunReducer(state, action1);
		expect(state.payroll_employee_list).toHaveLength(1);

		const action2 = {
			type: EMPLOYEEPAYROLL.PAYROLL_LIST,
			payload: [{ id: 1, period: 'January' }],
		};

		state = PayrollRunReducer(state, action2);
		expect(state.payroll_employee_list).toHaveLength(1);
		expect(state.payroll_list).toHaveLength(1);

		const action3 = {
			type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST,
			payload: [{ id: 1, name: 'Incomplete' }],
		};

		state = PayrollRunReducer(state, action3);
		expect(state.payroll_employee_list).toHaveLength(1);
		expect(state.payroll_list).toHaveLength(1);
		expect(state.incompleteEmployeeList).toHaveLength(1);
	});

	it('should preserve state shape after all actions', () => {
		const action = {
			type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST,
			payload: [{ id: 1 }],
		};

		const newState = PayrollRunReducer(initialState, action);

		expect(newState).toHaveProperty('payroll_employee_list');
		expect(newState).toHaveProperty('employee_list_dropdown');
		expect(newState).toHaveProperty('incompleteEmployeeList');
		expect(newState).toHaveProperty('payroll_list');
		expect(newState).toHaveProperty('approver_dropdown_list');
		expect(newState).toHaveProperty('user_approver_generater_dropdown_list');
		expect(Object.keys(newState)).toHaveLength(6);
	});
});
