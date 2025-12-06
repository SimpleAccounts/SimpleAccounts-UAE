import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi, authFileUploadApi } from 'utils';
import { IMPORT } from 'constants/types';

jest.mock('utils', () => ({
	authApi: jest.fn(),
	authFileUploadApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Import Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('uploadFolder', () => {
		it('should call authFileUploadApi with multipart/form-data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Folder uploaded successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const formData = new FormData();
			formData.append('folder', 'test-folder');

			const result = await store.dispatch(actions.uploadFolder(formData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/migration/uploadFolder',
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle upload errors', async () => {
			const mockError = new Error('Upload failed');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.uploadFolder({}))).rejects.toThrow('Upload failed');
		});

		it('should not dispatch any actions', async () => {
			const mockResponse = {
				status: 200,
				data: {},
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.uploadFolder({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});
	});

	describe('migrationProduct', () => {
		it('should call authApi to get migration list', async () => {
			const mockProducts = [
				{ id: 1, name: 'Product 1' },
				{ id: 2, name: 'Product 2' },
			];

			const mockResponse = {
				status: 200,
				data: mockProducts,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.migrationProduct());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/migration/list',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should not return anything on non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.migrationProduct());

			expect(result).toBeUndefined();
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch migration products');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.migrationProduct())).rejects.toThrow('Failed to fetch migration products');
		});
	});

	describe('rollBackMigration', () => {
		it('should call authApi with DELETE method', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Migration rolled back successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.rollBackMigration());

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/migration/rollbackMigratedData',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle rollback errors', async () => {
			const mockError = new Error('Rollback failed');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.rollBackMigration())).rejects.toThrow('Rollback failed');
		});

		it('should not return anything on non-200 status', async () => {
			const mockResponse = {
				status: 500,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.rollBackMigration());

			expect(result).toBeUndefined();
		});
	});

	describe('migrate', () => {
		it('should call authFileUploadApi with migration data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Migration completed successfully' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const migrationData = {
				productName: 'QuickBooks',
				version: '2024',
				files: [],
			};

			const result = await store.dispatch(actions.migrate(migrationData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/migration/migrate',
				data: migrationData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle migration errors', async () => {
			const mockError = new Error('Migration failed');
			authFileUploadApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.migrate({}))).rejects.toThrow('Migration failed');
		});
	});

	describe('getVersionListByPrioductName', () => {
		it('should call authApi with product name parameter', async () => {
			const mockVersions = [
				{ id: 1, version: '2023' },
				{ id: 2, version: '2024' },
			];

			const mockResponse = {
				status: 200,
				data: mockVersions,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getVersionListByPrioductName('QuickBooks'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/getVersionListByPrioductName?productName=QuickBooks',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle different product names', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getVersionListByPrioductName('Xero'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/getVersionListByPrioductName?productName=Xero',
			});
		});

		it('should handle API errors', async () => {
			const mockError = new Error('Failed to fetch versions');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getVersionListByPrioductName('Test'))).rejects.toThrow('Failed to fetch versions');
		});
	});

	describe('getFileData', () => {
		it('should dispatch FILE_DATA_LIST action on successful API call', async () => {
			const mockFileData = [
				{ id: 1, row: ['data1', 'data2'] },
				{ id: 2, row: ['data3', 'data4'] },
			];

			const mockResponse = {
				status: 200,
				data: mockFileData,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getFileData({ fileName: 'test.csv' }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(1);
			expect(dispatchedActions[0]).toEqual({
				type: IMPORT.FILE_DATA_LIST,
				payload: {
					data: mockFileData,
				},
			});

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/getFileData?fileName=test.csv',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch action on non-200 status', async () => {
			const mockResponse = {
				status: 404,
				data: null,
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.getFileData({ fileName: 'missing.csv' }));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toHaveLength(0);
		});

		it('should handle API errors', async () => {
			const mockError = new Error('File not found');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.getFileData({ fileName: 'test.csv' }))).rejects.toThrow('File not found');
		});
	});

	describe('listOfTransactionCategory', () => {
		it('should call authApi to get transaction categories', async () => {
			const mockCategories = [
				{ id: 1, name: 'Category 1' },
				{ id: 2, name: 'Category 2' },
			];

			const mockResponse = {
				status: 200,
				data: mockCategories,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.listOfTransactionCategory());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/listOfTransactionCategory',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle empty category list', async () => {
			const mockResponse = {
				status: 200,
				data: [],
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.listOfTransactionCategory());

			expect(result.data).toEqual([]);
		});
	});

	describe('deleteFiles', () => {
		it('should call authApi with DELETE method and file data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Files deleted successfully' },
			};

			authApi.mockResolvedValue(mockResponse);

			const fileData = {
				fileNames: ['file1.csv', 'file2.csv'],
			};

			const result = await store.dispatch(actions.deleteFiles(fileData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'DELETE',
				url: '/rest/migration/deleteFiles',
				data: fileData,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle deletion errors', async () => {
			const mockError = new Error('Delete failed');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.deleteFiles({}))).rejects.toThrow('Delete failed');
		});
	});

	describe('addOpeningBalance', () => {
		it('should call authApi to save opening balance', async () => {
			const mockResponse = {
				status: 200,
				data: { id: 1, message: 'Opening balance saved' },
			};

			authApi.mockResolvedValue(mockResponse);

			const balanceData = {
				categoryId: 1,
				balance: 10000,
			};

			const result = await store.dispatch(actions.addOpeningBalance(balanceData));

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/transactionCategoryBalance/save',
				data: balanceData,
				contentType: false,
			});

			expect(result).toEqual(mockResponse);
		});

		it('should handle save errors', async () => {
			const mockError = new Error('Save failed');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.addOpeningBalance({}))).rejects.toThrow('Save failed');
		});
	});

	describe('getListOfAllFiles', () => {
		it('should call authApi to get all files', async () => {
			const mockFiles = [
				{ id: 1, fileName: 'file1.csv', uploadedAt: '2024-01-01' },
				{ id: 2, fileName: 'file2.csv', uploadedAt: '2024-01-02' },
			];

			const mockResponse = {
				status: 200,
				data: mockFiles,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getListOfAllFiles());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/getListOfAllFiles',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('saveAccountStartDate', () => {
		it('should call authFileUploadApi with date data', async () => {
			const mockResponse = {
				status: 200,
				data: { message: 'Start date saved' },
			};

			authFileUploadApi.mockResolvedValue(mockResponse);

			const dateData = {
				startDate: '2024-01-01',
			};

			const result = await store.dispatch(actions.saveAccountStartDate(dateData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/migration/saveAccountStartDate',
				data: dateData,
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('getMigrationSummary', () => {
		it('should call authApi to get migration summary', async () => {
			const mockSummary = {
				totalRecords: 1000,
				processed: 800,
				failed: 50,
				pending: 150,
			};

			const mockResponse = {
				status: 200,
				data: mockSummary,
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getMigrationSummary());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/migration/getMigrationSummary',
			});

			expect(result).toEqual(mockResponse);
		});
	});

	describe('downloadcsv', () => {
		it('should call authApi with filename', async () => {
			const mockResponse = {
				status: 200,
				data: 'csv data',
			};

			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.downloadcsv('test.csv'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/migration/downloadcsv/test.csv',
				data: 'test.csv',
			});

			expect(result).toEqual(mockResponse);
		});

		it('should replace spaces with underscores in filename', async () => {
			const mockResponse = {
				status: 200,
				data: 'csv data',
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.downloadcsv('test file name.csv'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/migration/downloadcsv/test_file_name.csv',
				data: 'test_file_name.csv',
			});
		});

		it('should handle multiple spaces in filename', async () => {
			const mockResponse = {
				status: 200,
				data: 'csv data',
			};

			authApi.mockResolvedValue(mockResponse);

			await store.dispatch(actions.downloadcsv('my test  file   name.csv'));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/migration/downloadcsv/my_test__file___name.csv',
				data: 'my_test__file___name.csv',
			});
		});

		it('should handle download errors', async () => {
			const mockError = new Error('Download failed');
			authApi.mockRejectedValue(mockError);

			await expect(store.dispatch(actions.downloadcsv('test.csv'))).rejects.toThrow('Download failed');
		});
	});
});
