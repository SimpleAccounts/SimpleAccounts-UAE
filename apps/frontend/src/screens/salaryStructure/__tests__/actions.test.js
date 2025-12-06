import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { SALARY_STRUCTURE } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Salary Structure Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSalaryStructureList', () => {
    it('should dispatch SALARY_STRUCTURE_LIST action on successful API call', async () => {
      const mockResponse = {
        data: [
          {
            salaryStructureId: 1,
            structureName: 'Basic Structure',
            basicSalary: 5000,
          },
          {
            salaryStructureId: 2,
            structureName: 'Senior Structure',
            basicSalary: 10000,
          },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const obj = { pageNo: 1, pageSize: 10 };
      await store.dispatch(actions.getSalaryStructureList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0]).toEqual({
        type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
        payload: mockResponse.data,
      });
    });

    it('should call authApi with correct parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 1,
        pageSize: 20,
        order: 'asc',
        sortingCol: 'structureName',
      };

      await store.dispatch(actions.getSalaryStructureList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/rest/payroll/salaryStructureList'),
      });
      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=1&pageSize=20&order=asc&sortingCol=structureName'),
      });
    });

    it('should not dispatch action when paginationDisable is true', async () => {
      const mockResponse = { data: [] };
      authApi.mockResolvedValue(mockResponse);

      const obj = { paginationDisable: true };
      await store.dispatch(actions.getSalaryStructureList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      authApi.mockRejectedValue(error);

      const obj = { pageNo: 1, pageSize: 10 };

      await expect(store.dispatch(actions.getSalaryStructureList(obj))).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle empty parameters object', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {};
      await store.dispatch(actions.getSalaryStructureList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=&pageSize=&order=&sortingCol='),
      });
    });

    it('should return the API response', async () => {
      const mockResponse = {
        data: [{ salaryStructureId: 1 }],
        status: 200,
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getSalaryStructureList({}));

      expect(result).toEqual(mockResponse);
    });

    it('should handle descending order sorting', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 2,
        pageSize: 50,
        order: 'desc',
        sortingCol: 'basicSalary',
      };

      await store.dispatch(actions.getSalaryStructureList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('order=desc&sortingCol=basicSalary'),
      });
    });

    it('should handle large page sizes', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 1,
        pageSize: 100,
      };

      await store.dispatch(actions.getSalaryStructureList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageSize=100'),
      });
    });
  });

  describe('getSalaryList', () => {
    it('should fetch salary list successfully', async () => {
      const mockResponse = {
        data: [
          { salaryId: 1, employeeName: 'John Doe', totalSalary: 5000 },
          { salaryId: 2, employeeName: 'Jane Smith', totalSalary: 6000 },
        ],
        status: 200,
      };

      authApi.mockResolvedValue(mockResponse);

      const obj = { pageNo: 1, pageSize: 10 };
      const result = await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/rest/payroll/getSalaryList'),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call authApi with correct pagination parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 2,
        pageSize: 25,
        order: 'asc',
        sortingCol: 'employeeName',
      };

      await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=2&pageSize=25&order=asc&sortingCol=employeeName'),
      });
    });

    it('should not dispatch any actions', async () => {
      authApi.mockResolvedValue({ data: [] });

      await store.dispatch(actions.getSalaryList({}));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('Salary list fetch failed');
      authApi.mockRejectedValue(error);

      const obj = { pageNo: 1, pageSize: 10 };

      await expect(store.dispatch(actions.getSalaryList(obj))).rejects.toThrow(
        'Salary list fetch failed'
      );
    });

    it('should handle empty parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {};
      await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=&pageSize=&order=&sortingCol='),
      });
    });

    it('should handle paginationDisable parameter', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = { paginationDisable: true };
      await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('paginationDisable=true'),
      });
    });

    it('should handle different sorting columns', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        sortingCol: 'totalSalary',
        order: 'desc',
      };

      await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('sortingCol=totalSalary&order=desc'),
      });
    });

    it('should return the complete response', async () => {
      const mockResponse = {
        data: [{ salaryId: 1, totalSalary: 5000 }],
        status: 200,
        message: 'Success',
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getSalaryList({}));

      expect(result).toEqual(mockResponse);
      expect(result.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors for getSalaryStructureList', async () => {
      const networkError = new Error('Network error');
      authApi.mockRejectedValue(networkError);

      await expect(store.dispatch(actions.getSalaryStructureList({}))).rejects.toThrow(
        'Network error'
      );
    });

    it('should propagate network errors for getSalaryList', async () => {
      const networkError = new Error('Network error');
      authApi.mockRejectedValue(networkError);

      await expect(store.dispatch(actions.getSalaryList({}))).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      authApi.mockRejectedValue(timeoutError);

      await expect(store.dispatch(actions.getSalaryStructureList({}))).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle unauthorized errors', async () => {
      const authError = new Error('Unauthorized');
      authApi.mockRejectedValue(authError);

      await expect(store.dispatch(actions.getSalaryList({}))).rejects.toThrow('Unauthorized');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      authApi.mockRejectedValue(serverError);

      await expect(store.dispatch(actions.getSalaryStructureList({}))).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('Action Dispatching', () => {
    it('should dispatch exactly one action for getSalaryStructureList', async () => {
      authApi.mockResolvedValue({ data: [] });

      await store.dispatch(actions.getSalaryStructureList({ pageNo: 1 }));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
    });

    it('should not dispatch any actions for getSalaryList', async () => {
      authApi.mockResolvedValue({ data: [] });

      await store.dispatch(actions.getSalaryList({ pageNo: 1 }));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });
  });

  describe('URL Construction', () => {
    it('should construct proper URL with all parameters for getSalaryStructureList', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 3,
        pageSize: 15,
        order: 'desc',
        sortingCol: 'createdDate',
        paginationDisable: false,
      };

      await store.dispatch(actions.getSalaryStructureList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/payroll/salaryStructureList?&pageNo=3&pageSize=15&order=desc&sortingCol=createdDate&paginationDisable=false',
      });
    });

    it('should construct proper URL with all parameters for getSalaryList', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 2,
        pageSize: 30,
        order: 'asc',
        sortingCol: 'employeeName',
        paginationDisable: true,
      };

      await store.dispatch(actions.getSalaryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/payroll/getSalaryList?pageNo=2&pageSize=30&order=asc&sortingCol=employeeName&paginationDisable=true',
      });
    });
  });
});
