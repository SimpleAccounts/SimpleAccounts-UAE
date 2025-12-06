import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { authApi, authFileUploadApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
	authFileUploadApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Import Bank Statement Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('getTemplateList', () => {
		it('should fetch template list successfully', async () => {
			const mockTemplates = [
				{ id: 1, templateName: 'Standard CSV', format: 'CSV' },
				{ id: 2, templateName: 'Excel Format', format: 'XLSX' },
				{ id: 3, templateName: 'Bank Statement', format: 'PDF' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockTemplates,
			});

			const result = await store.dispatch(actions.getTemplateList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactionParsing/selectModelList',
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockTemplates);
		});

		it('should use correct API endpoint', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getTemplateList());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/transactionParsing/selectModelList',
				})
			);
		});

		it('should use GET method', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getTemplateList());

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
				})
			);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch templates'));

			await expect(store.dispatch(actions.getTemplateList())).rejects.toThrow(
				'Failed to fetch templates'
			);
		});

		it('should return response object', async () => {
			const mockResponse = {
				status: 200,
				data: [{ id: 1, templateName: 'Test' }],
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.getTemplateList());
			expect(result).toEqual(mockResponse);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(actions.getTemplateList());

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle empty template list', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const result = await store.dispatch(actions.getTemplateList());
			expect(result.data).toEqual([]);
		});

		it('should handle server errors', async () => {
			authApi.mockRejectedValue(new Error('Internal Server Error'));

			await expect(store.dispatch(actions.getTemplateList())).rejects.toThrow(
				'Internal Server Error'
			);
		});

		it('should handle network timeout', async () => {
			authApi.mockRejectedValue(new Error('Request timeout'));

			await expect(store.dispatch(actions.getTemplateList())).rejects.toThrow(
				'Request timeout'
			);
		});
	});

	describe('parseFile', () => {
		it('should parse file successfully', async () => {
			const mockFileData = {
				file: new File(['content'], 'statement.csv', { type: 'text/csv' }),
				templateId: 1,
			};

			const mockParsedData = {
				transactions: [
					{ date: '2024-01-15', description: 'Payment', amount: 1000 },
					{ date: '2024-01-16', description: 'Receipt', amount: 2000 },
				],
				totalRecords: 2,
			};

			authFileUploadApi.mockResolvedValue({
				status: 200,
				data: mockParsedData,
			});

			const result = await store.dispatch(actions.parseFile(mockFileData));

			expect(authFileUploadApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/transactionimport/parse',
				data: mockFileData,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockParsedData);
		});

		it('should use authFileUploadApi for file upload', async () => {
			authFileUploadApi.mockResolvedValue({ status: 200, data: {} });

			const fileData = { file: 'test.csv', templateId: 1 };
			await store.dispatch(actions.parseFile(fileData));

			expect(authFileUploadApi).toHaveBeenCalled();
			expect(authApi).not.toHaveBeenCalled();
		});

		it('should handle parse error', async () => {
			authFileUploadApi.mockRejectedValue(new Error('File parsing failed'));

			await expect(store.dispatch(actions.parseFile({}))).rejects.toThrow(
				'File parsing failed'
			);
		});

		it('should use correct API endpoint', async () => {
			authFileUploadApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.parseFile({}));

			expect(authFileUploadApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/transactionimport/parse',
				})
			);
		});

		it('should use POST method', async () => {
			authFileUploadApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.parseFile({}));

			expect(authFileUploadApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'post',
				})
			);
		});

		it('should pass file data to API', async () => {
			authFileUploadApi.mockResolvedValue({ status: 200, data: {} });

			const fileData = {
				file: 'statement.csv',
				templateId: 5,
				bankAccountId: 10,
			};

			await store.dispatch(actions.parseFile(fileData));

			expect(authFileUploadApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: fileData,
				})
			);
		});

		it('should not dispatch any actions', async () => {
			authFileUploadApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.parseFile({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle invalid file format error', async () => {
			authFileUploadApi.mockRejectedValue(new Error('Invalid file format'));

			await expect(store.dispatch(actions.parseFile({}))).rejects.toThrow(
				'Invalid file format'
			);
		});

		it('should return parsed response', async () => {
			const mockResponse = {
				status: 200,
				data: { parsed: true, records: 10 },
			};
			authFileUploadApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.parseFile({}));
			expect(result).toEqual(mockResponse);
		});
	});

	describe('importTransaction', () => {
		it('should import transactions successfully', async () => {
			const mockImportData = {
				transactions: [
					{ date: '2024-01-15', amount: 1000, description: 'Payment' },
					{ date: '2024-01-16', amount: 2000, description: 'Receipt' },
				],
				bankAccountId: 5,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Transactions imported successfully', imported: 2 },
			});

			const result = await store.dispatch(
				actions.importTransaction(mockImportData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'post',
				url: '/rest/transactionimport/save',
				data: mockImportData,
			});

			expect(result.status).toBe(200);
			expect(result.data.imported).toBe(2);
		});

		it('should handle import error', async () => {
			authApi.mockRejectedValue(new Error('Import failed'));

			await expect(
				store.dispatch(actions.importTransaction({}))
			).rejects.toThrow('Import failed');
		});

		it('should use correct API endpoint', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.importTransaction({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/transactionimport/save',
				})
			);
		});

		it('should use POST method', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.importTransaction({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'post',
				})
			);
		});

		it('should pass transaction data to API', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			const transactionData = {
				transactions: [{ id: 1 }, { id: 2 }],
				accountId: 10,
			};

			await store.dispatch(actions.importTransaction(transactionData));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: transactionData,
				})
			);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: {} });

			await store.dispatch(actions.importTransaction({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle validation errors', async () => {
			authApi.mockRejectedValue(new Error('Validation failed'));

			await expect(
				store.dispatch(actions.importTransaction({}))
			).rejects.toThrow('Validation failed');
		});

		it('should return import response', async () => {
			const mockResponse = {
				status: 200,
				data: { success: true, count: 5 },
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.importTransaction({}));
			expect(result).toEqual(mockResponse);
		});

		it('should handle duplicate transaction errors', async () => {
			authApi.mockRejectedValue(new Error('Duplicate transactions found'));

			await expect(
				store.dispatch(actions.importTransaction({}))
			).rejects.toThrow('Duplicate transactions found');
		});
	});

	describe('downloadcsv', () => {
		it('should download CSV successfully', async () => {
			const mockCsvData = 'Date,Description,Amount\n2024-01-15,Payment,1000';

			authApi.mockResolvedValue({
				status: 200,
				data: mockCsvData,
			});

			const downloadParams = { templateId: 1 };
			const result = await store.dispatch(actions.downloadcsv(downloadParams));

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/transactionimport/downloadcsv',
				data: downloadParams,
			});

			expect(result.status).toBe(200);
			expect(result.data).toEqual(mockCsvData);
		});

		it('should handle download error', async () => {
			authApi.mockRejectedValue(new Error('Download failed'));

			await expect(store.dispatch(actions.downloadcsv({}))).rejects.toThrow(
				'Download failed'
			);
		});

		it('should use correct API endpoint', async () => {
			authApi.mockResolvedValue({ status: 200, data: '' });

			await store.dispatch(actions.downloadcsv({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/rest/transactionimport/downloadcsv',
				})
			);
		});

		it('should use GET method', async () => {
			authApi.mockResolvedValue({ status: 200, data: '' });

			await store.dispatch(actions.downloadcsv({}));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
				})
			);
		});

		it('should pass download parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: '' });

			const params = { templateId: 5, format: 'csv' };
			await store.dispatch(actions.downloadcsv(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					data: params,
				})
			);
		});

		it('should not dispatch any actions', async () => {
			authApi.mockResolvedValue({ status: 200, data: '' });

			await store.dispatch(actions.downloadcsv({}));

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should return CSV response', async () => {
			const mockResponse = {
				status: 200,
				data: 'csv,content,here',
			};
			authApi.mockResolvedValue(mockResponse);

			const result = await store.dispatch(actions.downloadcsv({}));
			expect(result).toEqual(mockResponse);
		});

		it('should handle file not found error', async () => {
			authApi.mockRejectedValue(new Error('File not found'));

			await expect(store.dispatch(actions.downloadcsv({}))).rejects.toThrow(
				'File not found'
			);
		});
	});
});
