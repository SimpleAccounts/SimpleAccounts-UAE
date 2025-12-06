import VatReducer from '../reducer';
import { VAT } from 'constants/types';

describe('VatReducer', () => {
	const initialState = {
		vat_list: [],
		vat_row: {},
	};

	it('should return the initial state', () => {
		expect(VatReducer(undefined, {})).toEqual(initialState);
	});

	describe('VAT_LIST', () => {
		it('should handle VAT_LIST action', () => {
			const mockVatList = [
				{ id: 1, name: 'Standard Rate', vatPercentage: 5, isActive: true },
				{ id: 2, name: 'Zero Rate', vatPercentage: 0, isActive: true },
				{ id: 3, name: 'Exempt', vatPercentage: 0, isActive: false },
			];

			const action = {
				type: VAT.VAT_LIST,
				payload: mockVatList,
			};

			const expectedState = {
				...initialState,
				vat_list: mockVatList,
			};

			expect(VatReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing VAT list', () => {
			const existingState = {
				...initialState,
				vat_list: [{ id: 99, name: 'Old VAT', vatPercentage: 10 }],
			};

			const newVatList = [
				{ id: 1, name: 'Standard Rate', vatPercentage: 5 },
				{ id: 2, name: 'Zero Rate', vatPercentage: 0 },
			];

			const action = {
				type: VAT.VAT_LIST,
				payload: newVatList,
			};

			const newState = VatReducer(existingState, action);
			expect(newState.vat_list).toEqual(newVatList);
			expect(newState.vat_list).toHaveLength(2);
		});

		it('should handle empty VAT list', () => {
			const action = {
				type: VAT.VAT_LIST,
				payload: [],
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_list).toEqual([]);
		});

		it('should handle VAT list with pagination data', () => {
			const mockData = {
				data: [
					{ id: 1, name: 'Standard Rate', vatPercentage: 5 },
					{ id: 2, name: 'Zero Rate', vatPercentage: 0 },
				],
				totalRecords: 2,
				pageNo: 1,
				pageSize: 10,
			};

			const action = {
				type: VAT.VAT_LIST,
				payload: mockData,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_list).toEqual(mockData);
		});

		it('should handle VAT codes with different percentages', () => {
			const vatCodes = [
				{ id: 1, name: 'Standard 5%', vatPercentage: 5 },
				{ id: 2, name: 'Reduced 2.5%', vatPercentage: 2.5 },
				{ id: 3, name: 'Zero 0%', vatPercentage: 0 },
				{ id: 4, name: 'Exempt', vatPercentage: 0 },
			];

			const action = {
				type: VAT.VAT_LIST,
				payload: vatCodes,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_list).toHaveLength(4);
			expect(newState.vat_list[0].vatPercentage).toBe(5);
			expect(newState.vat_list[1].vatPercentage).toBe(2.5);
		});
	});

	describe('VAT_ROW', () => {
		it('should handle VAT_ROW action', () => {
			const mockVatRow = {
				id: 1,
				name: 'Standard Rate',
				vatPercentage: 5,
				description: 'Standard VAT rate for UAE',
				isActive: true,
				createdDate: '2023-01-01',
			};

			const action = {
				type: VAT.VAT_ROW,
				payload: mockVatRow,
			};

			const expectedState = {
				...initialState,
				vat_row: mockVatRow,
			};

			expect(VatReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing VAT row', () => {
			const existingState = {
				...initialState,
				vat_row: { id: 99, name: 'Old VAT Row' },
			};

			const newVatRow = {
				id: 1,
				name: 'New VAT Row',
				vatPercentage: 5,
			};

			const action = {
				type: VAT.VAT_ROW,
				payload: newVatRow,
			};

			const newState = VatReducer(existingState, action);
			expect(newState.vat_row).toEqual(newVatRow);
			expect(newState.vat_row.id).toBe(1);
		});

		it('should handle empty VAT row object', () => {
			const action = {
				type: VAT.VAT_ROW,
				payload: {},
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_row).toEqual({});
		});

		it('should handle VAT row with complete details', () => {
			const completeVatRow = {
				id: 1,
				name: 'Standard Rate',
				vatPercentage: 5,
				code: 'VAT-STD-5',
				description: 'Standard VAT rate',
				isActive: true,
				isDefault: true,
				createdBy: 'admin',
				createdDate: '2023-01-01',
				modifiedBy: 'admin',
				modifiedDate: '2023-06-01',
			};

			const action = {
				type: VAT.VAT_ROW,
				payload: completeVatRow,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_row).toHaveProperty('name', 'Standard Rate');
			expect(newState.vat_row).toHaveProperty('vatPercentage', 5);
			expect(newState.vat_row).toHaveProperty('isActive', true);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action', () => {
			const action = {
				type: 'UNKNOWN_ACTION',
				payload: { data: 'test' },
			};

			const newState = VatReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				vat_list: [{ id: 1, name: 'Standard Rate' }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = VatReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state when updating vat_list', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, name: 'Test VAT' }];

			const action = {
				type: VAT.VAT_LIST,
				payload,
			};

			VatReducer(originalState, action);
			expect(originalState.vat_list).toEqual([]);
		});

		it('should not mutate the original state when updating vat_row', () => {
			const originalState = { ...initialState };
			const payload = { id: 1, name: 'Test VAT' };

			const action = {
				type: VAT.VAT_ROW,
				payload,
			};

			VatReducer(originalState, action);
			expect(originalState.vat_row).toEqual({});
		});

		it('should preserve vat_row when updating vat_list', () => {
			const stateWithData = {
				vat_list: [{ id: 1 }],
				vat_row: { id: 99, name: 'Existing VAT' },
			};

			const payload = [{ id: 2 }, { id: 3 }];
			const action = {
				type: VAT.VAT_LIST,
				payload,
			};

			const newState = VatReducer(stateWithData, action);
			expect(newState.vat_list).toEqual([{ id: 2 }, { id: 3 }]);
			expect(newState.vat_row).toEqual({ id: 99, name: 'Existing VAT' });
		});

		it('should preserve vat_list when updating vat_row', () => {
			const stateWithData = {
				vat_list: [{ id: 1 }, { id: 2 }],
				vat_row: { id: 99 },
			};

			const payload = { id: 100, name: 'New VAT Row' };
			const action = {
				type: VAT.VAT_ROW,
				payload,
			};

			const newState = VatReducer(stateWithData, action);
			expect(newState.vat_row).toEqual({ id: 100, name: 'New VAT Row' });
			expect(newState.vat_list).toEqual([{ id: 1 }, { id: 2 }]);
		});
	});

	describe('complex VAT scenarios', () => {
		it('should handle multiple active and inactive VAT codes', () => {
			const vatCodes = [
				{ id: 1, name: 'Standard 5%', vatPercentage: 5, isActive: true },
				{ id: 2, name: 'Zero Rated', vatPercentage: 0, isActive: true },
				{ id: 3, name: 'Exempt', vatPercentage: 0, isActive: true },
				{ id: 4, name: 'Old Rate 10%', vatPercentage: 10, isActive: false },
			];

			const action = {
				type: VAT.VAT_LIST,
				payload: vatCodes,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_list).toHaveLength(4);
			const activeCodes = newState.vat_list.filter(v => v.isActive);
			expect(activeCodes).toHaveLength(3);
		});

		it('should handle VAT row with audit information', () => {
			const vatRowWithAudit = {
				id: 1,
				name: 'Standard Rate',
				vatPercentage: 5,
				isActive: true,
				createdBy: 'admin@example.com',
				createdDate: '2023-01-01T10:00:00Z',
				modifiedBy: 'admin@example.com',
				modifiedDate: '2023-06-15T14:30:00Z',
				usageCount: 1250,
			};

			const action = {
				type: VAT.VAT_ROW,
				payload: vatRowWithAudit,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_row.createdBy).toBe('admin@example.com');
			expect(newState.vat_row.usageCount).toBe(1250);
		});

		it('should handle VAT codes for different countries', () => {
			const internationalVatCodes = [
				{ id: 1, name: 'UAE Standard', vatPercentage: 5, country: 'AE' },
				{ id: 2, name: 'UK Standard', vatPercentage: 20, country: 'GB' },
				{ id: 3, name: 'Saudi Standard', vatPercentage: 15, country: 'SA' },
			];

			const action = {
				type: VAT.VAT_LIST,
				payload: internationalVatCodes,
			};

			const newState = VatReducer(initialState, action);
			expect(newState.vat_list).toHaveLength(3);
			expect(newState.vat_list.map(v => v.vatPercentage)).toEqual([5, 20, 15]);
		});
	});
});
