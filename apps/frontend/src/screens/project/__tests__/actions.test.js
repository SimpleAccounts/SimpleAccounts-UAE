import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { PROJECT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Project Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getProjectList', () => {
    it('should dispatch PROJECT_LIST action on successful API call', async () => {
      const mockResponse = {
        data: [
          { projectId: 1, projectName: 'Project A' },
          { projectId: 2, projectName: 'Project B' },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const obj = { pageNo: 1, pageSize: 10 };
      await store.dispatch(actions.getProjectList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0]).toEqual({
        type: PROJECT.PROJECT_LIST,
        payload: mockResponse.data,
      });
    });

    it('should call authApi with correct parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        projectName: 'Test Project',
        expenseBudget: '5000',
        revenueBudget: '10000',
        vatRegistrationNumber: 'VAT123',
        pageNo: 1,
        pageSize: 20,
        order: 'asc',
        sortingCol: 'projectName',
      };

      await store.dispatch(actions.getProjectList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/rest/project/getList'),
      });
      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('projectName=Test Project'),
      });
    });

    it('should not dispatch action when paginationDisable is true', async () => {
      const mockResponse = { data: [] };
      authApi.mockResolvedValue(mockResponse);

      const obj = { paginationDisable: true };
      await store.dispatch(actions.getProjectList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      authApi.mockRejectedValue(error);

      const obj = { pageNo: 1, pageSize: 10 };

      await expect(store.dispatch(actions.getProjectList(obj))).rejects.toThrow('API Error');
    });

    it('should handle empty filter parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {};
      await store.dispatch(actions.getProjectList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('projectName=&expenseBudget=&revenueBudget='),
      });
    });
  });

  describe('createProjectContact', () => {
    it('should call authApi to create project contact', async () => {
      const mockResponse = { data: { contactId: 1 }, status: 200 };
      authApi.mockResolvedValue(mockResponse);

      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const result = await store.dispatch(actions.createProjectContact(contactData));

      expect(authApi).toHaveBeenCalledWith({
        method: 'POST',
        url: '/rest/contact/save',
        data: contactData,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle contact creation error', async () => {
      const error = new Error('Contact creation failed');
      authApi.mockRejectedValue(error);

      await expect(
        store.dispatch(actions.createProjectContact({}))
      ).rejects.toThrow('Contact creation failed');
    });
  });

  describe('getCurrencyList', () => {
    it('should dispatch CURRENCY_LIST action on success', async () => {
      const mockCurrencies = [
        { currencyId: 1, currencyName: 'USD' },
        { currencyId: 2, currencyName: 'EUR' },
      ];

      authApi.mockResolvedValue({ data: mockCurrencies });

      await store.dispatch(actions.getCurrencyList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0]).toEqual({
        type: PROJECT.CURRENCY_LIST,
        payload: mockCurrencies,
      });
    });

    it('should call correct API endpoint', async () => {
      authApi.mockResolvedValue({ data: [] });

      await store.dispatch(actions.getCurrencyList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/currency/getactivecurrencies',
      });
    });
  });

  describe('getCountryList', () => {
    it('should dispatch COUNTRY_LIST action on success', async () => {
      const mockCountries = [
        { countryId: 1, countryName: 'USA' },
        { countryId: 2, countryName: 'UK' },
      ];

      authApi.mockResolvedValue({ data: mockCountries });

      await store.dispatch(actions.getCountryList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0].type).toBe(PROJECT.COUNTRY_LIST);
      expect(dispatchedActions[0].payload).toEqual(mockCountries);
    });
  });

  describe('getTitleList', () => {
    it('should dispatch TITLE_LIST action on success', async () => {
      const mockTitles = [
        { titleId: 1, titleName: 'Mr.' },
        { titleId: 2, titleName: 'Mrs.' },
      ];

      authApi.mockResolvedValue({ data: mockTitles });

      await store.dispatch(actions.getTitleList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(PROJECT.TITLE_LIST);
      expect(dispatchedActions[0].payload).toEqual(mockTitles);
    });
  });

  describe('removeBulk', () => {
    it('should delete projects in bulk', async () => {
      const mockResponse = { status: 200, data: { message: 'Deleted' } };
      authApi.mockResolvedValue(mockResponse);

      const projectIds = [1, 2, 3];
      const result = await store.dispatch(actions.removeBulk(projectIds));

      expect(authApi).toHaveBeenCalledWith({
        method: 'delete',
        url: '/rest/project/deletes',
        data: projectIds,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle bulk delete errors', async () => {
      authApi.mockRejectedValue(new Error('Delete failed'));

      await expect(store.dispatch(actions.removeBulk([1, 2]))).rejects.toThrow('Delete failed');
    });
  });

  describe('getContactList', () => {
    it('should dispatch CONTACT_LIST action on success', async () => {
      const mockContacts = [
        { contactId: 1, firstName: 'John' },
        { contactId: 2, firstName: 'Jane' },
      ];

      authApi.mockResolvedValue({ data: mockContacts });

      await store.dispatch(actions.getContactList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe(PROJECT.CONTACT_LIST);
      expect(dispatchedActions[0].payload).toEqual(mockContacts);
    });

    it('should call correct endpoint for contacts dropdown', async () => {
      authApi.mockResolvedValue({ data: [] });

      await store.dispatch(actions.getContactList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/contact/getContactsForDropdown',
      });
    });
  });

  describe('getStateList', () => {
    it('should fetch states by country code', async () => {
      const mockStates = [{ stateId: 1, stateName: 'California' }];
      authApi.mockResolvedValue({ status: 200, data: mockStates });

      const countryCode = 'US';
      const result = await store.dispatch(actions.getStateList(countryCode));

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/datalist/getstate?countryCode=US',
      });
      expect(result.status).toBe(200);
    });

    it('should not dispatch action for state list', async () => {
      authApi.mockResolvedValue({ status: 200, data: [] });

      await store.dispatch(actions.getStateList('US'));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network error');
      authApi.mockRejectedValue(networkError);

      await expect(store.dispatch(actions.getProjectList({}))).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      authApi.mockRejectedValue(timeoutError);

      await expect(store.dispatch(actions.getCurrencyList())).rejects.toThrow('Request timeout');
    });

    it('should handle unauthorized errors', async () => {
      const authError = new Error('Unauthorized');
      authApi.mockRejectedValue(authError);

      await expect(store.dispatch(actions.getCountryList())).rejects.toThrow('Unauthorized');
    });
  });

  describe('Action Return Values', () => {
    it('should return response from getProjectList', async () => {
      const mockResponse = { data: [], status: 200 };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getProjectList({}));
      expect(result).toEqual(mockResponse);
    });

    it('should return response from getCurrencyList', async () => {
      const mockResponse = { data: [], status: 200 };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getCurrencyList());
      expect(result).toEqual(mockResponse);
    });
  });
});
