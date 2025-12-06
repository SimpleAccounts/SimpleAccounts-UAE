import ImportReducer from '../reducer';
import { IMPORT } from 'constants/types';

describe('Import Reducer', () => {
	const initialState = {
		file_data_list: [],
	};

	it('should return the initial state', () => {
		expect(ImportReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle IMPORT.FILE_DATA_LIST action', () => {
		const mockFileData = [
			{ id: 1, fileName: 'customers.csv', status: 'uploaded' },
			{ id: 2, fileName: 'products.csv', status: 'uploaded' },
			{ id: 3, fileName: 'invoices.csv', status: 'processing' },
		];

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: mockFileData,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toEqual(mockFileData);
		expect(newState.file_data_list).toHaveLength(3);
	});

	it('should handle empty file data list payload', () => {
		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [],
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toEqual([]);
		expect(newState.file_data_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 1, fileName: 'test.csv' }],
		};

		const stateBefore = { ...initialState };
		ImportReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = ImportReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			file_data_list: [{ id: 1, fileName: 'old.csv' }],
		};

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 2, fileName: 'new.csv' }],
		};

		const newState = ImportReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.file_data_list).not.toBe(currentState.file_data_list);
	});

	it('should handle file data with nested properties', () => {
		const mockFileData = [
			{
				id: 1,
				fileName: 'data.csv',
				status: 'uploaded',
				metadata: {
					size: 1024,
					uploadedAt: '2024-01-01',
					uploadedBy: 'admin',
				},
				records: {
					total: 100,
					processed: 0,
					failed: 0,
				},
			},
		];

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: mockFileData,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list[0].metadata.uploadedBy).toBe('admin');
		expect(newState.file_data_list[0].records.total).toBe(100);
	});

	it('should handle large file data list', () => {
		const largeList = Array.from({ length: 100 }, (_, i) => ({
			id: i + 1,
			fileName: `file-${i + 1}.csv`,
			status: 'uploaded',
		}));

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: largeList,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toHaveLength(100);
		expect(newState.file_data_list[0].fileName).toBe('file-1.csv');
		expect(newState.file_data_list[99].fileName).toBe('file-100.csv');
	});

	it('should preserve state shape after actions', () => {
		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 1 }],
		};

		const newState = ImportReducer(initialState, action);

		expect(newState).toHaveProperty('file_data_list');
		expect(Object.keys(newState)).toHaveLength(1);
	});

	it('should handle multiple consecutive updates', () => {
		let state = initialState;

		const action1 = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 1, fileName: 'file1.csv' }],
		};

		state = ImportReducer(state, action1);
		expect(state.file_data_list).toHaveLength(1);

		const action2 = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [
				{ id: 1, fileName: 'file1.csv' },
				{ id: 2, fileName: 'file2.csv' },
				{ id: 3, fileName: 'file3.csv' },
			],
		};

		state = ImportReducer(state, action2);
		expect(state.file_data_list).toHaveLength(3);
	});

	it('should replace entire file data list on update', () => {
		const initialFileData = {
			file_data_list: [
				{ id: 1, fileName: 'old1.csv' },
				{ id: 2, fileName: 'old2.csv' },
			],
		};

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 3, fileName: 'new.csv' }],
		};

		const newState = ImportReducer(initialFileData, action);

		expect(newState.file_data_list).toHaveLength(1);
		expect(newState.file_data_list[0].id).toBe(3);
	});

	it('should handle file data with various status values', () => {
		const mockFileData = [
			{ id: 1, fileName: 'file1.csv', status: 'uploaded' },
			{ id: 2, fileName: 'file2.csv', status: 'processing' },
			{ id: 3, fileName: 'file3.csv', status: 'completed' },
			{ id: 4, fileName: 'file4.csv', status: 'failed' },
		];

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: mockFileData,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toHaveLength(4);
		expect(newState.file_data_list.map(f => f.status)).toEqual([
			'uploaded',
			'processing',
			'completed',
			'failed',
		]);
	});

	it('should be a pure function', () => {
		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: [{ id: 1 }],
		};

		const state1 = ImportReducer(initialState, action);
		const state2 = ImportReducer(initialState, action);

		expect(state1).toEqual(state2);
	});

	it('should handle file data with different file types', () => {
		const mockFileData = [
			{ id: 1, fileName: 'data.csv', type: 'csv' },
			{ id: 2, fileName: 'data.xlsx', type: 'excel' },
			{ id: 3, fileName: 'data.json', type: 'json' },
		];

		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: mockFileData,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toHaveLength(3);
		expect(newState.file_data_list[0].type).toBe('csv');
		expect(newState.file_data_list[1].type).toBe('excel');
		expect(newState.file_data_list[2].type).toBe('json');
	});

	it('should handle null payload gracefully', () => {
		const action = {
			type: IMPORT.FILE_DATA_LIST,
			payload: null,
		};

		const newState = ImportReducer(initialState, action);

		expect(newState.file_data_list).toBeNull();
	});
});
