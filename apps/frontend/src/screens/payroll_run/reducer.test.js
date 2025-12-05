import PayrollRunReducer from './reducer';
import { EMPLOYEEPAYROLL } from 'constants/types';

describe('PayrollRunReducer', () => {
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

    describe('PAYROLL_EMPLOYEE_LIST', () => {
        it('should handle PAYROLL_EMPLOYEE_LIST action', () => {
            const payload = [
                { id: 1, employeeName: 'John Doe', grossSalary: 10000, netSalary: 8500 },
                { id: 2, employeeName: 'Jane Smith', grossSalary: 12000, netSalary: 10200 },
            ];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.payroll_employee_list).toEqual(payload);
            expect(newState.payroll_employee_list).toHaveLength(2);
        });

        it('should replace existing payroll employee list', () => {
            const existingState = {
                ...initialState,
                payroll_employee_list: [{ id: 99 }],
            };
            const payload = [{ id: 1 }];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(existingState, action);
            expect(newState.payroll_employee_list).toEqual(payload);
        });

        it('should handle empty employee list', () => {
            const payload = [];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.payroll_employee_list).toEqual([]);
        });
    });

    describe('EMPLOYEE_LIST_DDROPDOWN', () => {
        it('should handle EMPLOYEE_LIST_DDROPDOWN action', () => {
            const payload = [
                { id: 1, label: 'John Doe', value: 1 },
                { id: 2, label: 'Jane Smith', value: 2 },
                { id: 3, label: 'Bob Johnson', value: 3 },
            ];
            const action = { type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.employee_list_dropdown).toEqual(payload);
        });
    });

    describe('INCOMPLETED_EMPLOYEE_LIST', () => {
        it('should handle INCOMPLETED_EMPLOYEE_LIST action', () => {
            const payload = [
                { id: 1, name: 'Employee A', missingInfo: 'Bank Details' },
                { id: 2, name: 'Employee B', missingInfo: 'Salary Structure' },
            ];
            const action = { type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.incompleteEmployeeList).toEqual(payload);
        });

        it('should handle no incomplete employees', () => {
            const payload = [];
            const action = { type: EMPLOYEEPAYROLL.INCOMPLETED_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.incompleteEmployeeList).toEqual([]);
        });
    });

    describe('PAYROLL_LIST', () => {
        it('should handle PAYROLL_LIST action', () => {
            const payload = [
                { id: 1, payPeriod: 'January 2024', status: 'Draft', employeeCount: 10 },
                { id: 2, payPeriod: 'February 2024', status: 'Approved', employeeCount: 12 },
            ];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.payroll_list).toEqual(payload);
        });

        it('should handle payroll with different statuses', () => {
            const payload = [
                { id: 1, status: 'Draft' },
                { id: 2, status: 'Pending Approval' },
                { id: 3, status: 'Approved' },
                { id: 4, status: 'Paid' },
                { id: 5, status: 'Voided' },
            ];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.payroll_list).toHaveLength(5);
        });
    });

    describe('APPROVER_DROPDOWN', () => {
        it('should handle APPROVER_DROPDOWN action', () => {
            const payload = [
                { id: 1, label: 'Manager A', value: 1 },
                { id: 2, label: 'Manager B', value: 2 },
            ];
            const action = { type: EMPLOYEEPAYROLL.APPROVER_DROPDOWN, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.approver_dropdown_list).toEqual(payload);
        });
    });

    describe('USER_APPROVER_GENERATER_DROPDOWN', () => {
        it('should handle USER_APPROVER_GENERATER_DROPDOWN action', () => {
            const payload = [
                { id: 1, label: 'HR Admin', value: 1, role: 'Admin' },
                { id: 2, label: 'Finance Manager', value: 2, role: 'Manager' },
            ];
            const action = { type: EMPLOYEEPAYROLL.USER_APPROVER_GENERATER_DROPDOWN, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.user_approver_generater_dropdown_list).toEqual(payload);
        });
    });

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: [] };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState).toEqual(initialState);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            const payload = [{ id: 1 }];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, payload };
            PayrollRunReducer(originalState, action);
            expect(originalState.payroll_employee_list).toEqual([]);
        });

        it('should preserve other state properties when updating', () => {
            const stateWithData = {
                ...initialState,
                payroll_employee_list: [{ id: 1 }],
                approver_dropdown_list: [{ id: 2 }],
            };
            const payload = [{ id: 3 }];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_LIST, payload };
            const newState = PayrollRunReducer(stateWithData, action);
            expect(newState.payroll_employee_list).toEqual([{ id: 1 }]);
            expect(newState.approver_dropdown_list).toEqual([{ id: 2 }]);
            expect(newState.payroll_list).toEqual([{ id: 3 }]);
        });
    });

    describe('payroll calculation scenarios', () => {
        it('should handle employees with various salary components', () => {
            const payload = [
                {
                    id: 1,
                    employeeName: 'Test Employee',
                    basicSalary: 8000,
                    housingAllowance: 2000,
                    transportAllowance: 500,
                    grossSalary: 10500,
                    deductions: 500,
                    netSalary: 10000,
                },
            ];
            const action = { type: EMPLOYEEPAYROLL.PAYROLL_EMPLOYEE_LIST, payload };
            const newState = PayrollRunReducer(initialState, action);
            expect(newState.payroll_employee_list[0].grossSalary).toBe(10500);
            expect(newState.payroll_employee_list[0].netSalary).toBe(10000);
        });
    });
});
