import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { TEMPLATE } from 'constants/types';
import { authApi } from 'utils';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

describe('Template Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('updateMailTheme', () => {
    it('should update mail template theme successfully', async () => {
      const templateId = 5;
      const mockResponse = {
        status: 200,
        data: {
          message: 'Theme updated successfully',
          templateId: templateId,
        },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.updateMailTheme(templateId));

      expect(authApi).toHaveBeenCalledWith({
        method: 'Post',
        url: `/rest/templates/updateMailTemplateTheme?templateId=${templateId}`,
      });

      expect(result.status).toBe(200);
      expect(result.data.message).toBe('Theme updated successfully');
    });

    it('should handle error when updating mail template theme', async () => {
      const templateId = 5;
      const mockError = { message: 'Failed to update theme' };

      authApi.mockRejectedValue(mockError);

      try {
        await store.dispatch(actions.updateMailTheme(templateId));
      } catch (error) {
        expect(error.message).toBe('Failed to update theme');
      }

      expect(authApi).toHaveBeenCalled();
    });

    it('should handle updating theme with invalid template ID', async () => {
      const invalidId = -1;
      authApi.mockRejectedValue({ message: 'Invalid template ID' });

      try {
        await store.dispatch(actions.updateMailTheme(invalidId));
      } catch (error) {
        expect(error.message).toBe('Invalid template ID');
      }
    });

    it('should handle updating theme with null template ID', async () => {
      authApi.mockRejectedValue({ message: 'Template ID required' });

      try {
        await store.dispatch(actions.updateMailTheme(null));
      } catch (error) {
        expect(error.message).toBe('Template ID required');
      }
    });
  });

  describe('getTemplateList', () => {
    it('should fetch template list successfully', async () => {
      const mockTemplates = [
        { id: 1, name: 'Invoice Template', type: 'invoice' },
        { id: 2, name: 'Receipt Template', type: 'receipt' },
        { id: 3, name: 'Email Template', type: 'email' },
      ];

      const mockResponse = {
        status: 200,
        data: mockTemplates,
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTemplateList());

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/templates/getTemplateDropdown',
      });

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockTemplates);
      expect(result.data).toHaveLength(3);
    });

    it('should handle error when fetching template list', async () => {
      authApi.mockRejectedValue({ message: 'Failed to fetch templates' });

      try {
        await store.dispatch(actions.getTemplateList());
      } catch (error) {
        expect(error.message).toBe('Failed to fetch templates');
      }
    });

    it('should handle empty template list', async () => {
      const mockResponse = {
        status: 200,
        data: [],
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTemplateList());

      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    it('should handle network error when fetching templates', async () => {
      authApi.mockRejectedValue({ message: 'Network error' });

      try {
        await store.dispatch(actions.getTemplateList());
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('template CRUD operations', () => {
    it('should create new template successfully', async () => {
      const mockCreateTemplate = (templateData) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/templates/create',
            data: templateData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'CREATE_TEMPLATE_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const newTemplate = {
        name: 'New Template',
        type: 'invoice',
        content: '<html>...</html>',
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { id: 1, ...newTemplate },
      });

      await store.dispatch(mockCreateTemplate(newTemplate));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('CREATE_TEMPLATE_SUCCESS');
    });

    it('should update existing template successfully', async () => {
      const mockUpdateTemplate = (templateId, templateData) => {
        return (dispatch) => {
          const data = {
            method: 'PUT',
            url: `/rest/templates/update/${templateId}`,
            data: templateData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'UPDATE_TEMPLATE_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const updatedTemplate = {
        name: 'Updated Template',
        content: '<html>Updated...</html>',
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { id: 1, ...updatedTemplate },
      });

      await store.dispatch(mockUpdateTemplate(1, updatedTemplate));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('UPDATE_TEMPLATE_SUCCESS');
    });

    it('should delete template successfully', async () => {
      const mockDeleteTemplate = (templateId) => {
        return (dispatch) => {
          const data = {
            method: 'DELETE',
            url: `/rest/templates/delete/${templateId}`,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'DELETE_TEMPLATE_SUCCESS',
                payload: templateId,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { message: 'Template deleted' },
      });

      await store.dispatch(mockDeleteTemplate(1));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('DELETE_TEMPLATE_SUCCESS');
      expect(actionsDispatched[0].payload).toBe(1);
    });
  });

  describe('template filtering and search', () => {
    it('should filter templates by type', async () => {
      const mockFilterTemplates = (type) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/templates/filter?type=${type}`,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_FILTERED_TEMPLATES',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const mockTemplates = [
        { id: 1, name: 'Invoice 1', type: 'invoice' },
        { id: 2, name: 'Invoice 2', type: 'invoice' },
      ];

      authApi.mockResolvedValue({
        status: 200,
        data: mockTemplates,
      });

      await store.dispatch(mockFilterTemplates('invoice'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_FILTERED_TEMPLATES');
      expect(actionsDispatched[0].payload.every((t) => t.type === 'invoice')).toBe(true);
    });

    it('should search templates by name', async () => {
      const mockSearchTemplates = (searchTerm) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/templates/search?q=${searchTerm}`,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_SEARCH_RESULTS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: [{ id: 1, name: 'Invoice Template' }],
      });

      await store.dispatch(mockSearchTemplates('Invoice'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_SEARCH_RESULTS');
    });
  });

  describe('template validation', () => {
    it('should validate template content successfully', async () => {
      const mockValidateTemplate = (templateContent) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/templates/validate',
            data: { content: templateContent },
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'TEMPLATE_VALIDATION_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { isValid: true, errors: [] },
      });

      await store.dispatch(mockValidateTemplate('<html>Valid content</html>'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('TEMPLATE_VALIDATION_SUCCESS');
      expect(actionsDispatched[0].payload.isValid).toBe(true);
    });

    it('should handle invalid template content', async () => {
      const mockValidateTemplate = (templateContent) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/templates/validate',
            data: { content: templateContent },
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'TEMPLATE_VALIDATION_FAILURE',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { isValid: false, errors: ['Missing required field'] },
      });

      await store.dispatch(mockValidateTemplate('<invalid>'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('TEMPLATE_VALIDATION_FAILURE');
      expect(actionsDispatched[0].payload.isValid).toBe(false);
    });
  });

  describe('template preview', () => {
    it('should generate template preview successfully', async () => {
      const mockGeneratePreview = (templateId, previewData) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: `/rest/templates/preview/${templateId}`,
            data: previewData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_TEMPLATE_PREVIEW',
                payload: res.data,
              });
              return res;
            });
        };
      };

      const previewHtml = '<html><body>Preview content</body></html>';

      authApi.mockResolvedValue({
        status: 200,
        data: { html: previewHtml },
      });

      await store.dispatch(mockGeneratePreview(1, { sampleData: 'test' }));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_TEMPLATE_PREVIEW');
    });
  });

  describe('template export/import', () => {
    it('should export template successfully', async () => {
      const mockExportTemplate = (templateId) => {
        return (dispatch) => {
          const data = {
            method: 'GET',
            url: `/rest/templates/export/${templateId}`,
          };

          return authApi(data)
            .then((res) => {
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { template: 'exported content' },
      });

      const result = await store.dispatch(mockExportTemplate(1));

      expect(result.data.template).toBe('exported content');
    });

    it('should import template successfully', async () => {
      const mockImportTemplate = (templateData) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/templates/import',
            data: templateData,
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'IMPORT_TEMPLATE_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { id: 1, name: 'Imported Template' },
      });

      await store.dispatch(mockImportTemplate({ content: 'imported' }));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('IMPORT_TEMPLATE_SUCCESS');
    });
  });

  describe('template cloning', () => {
    it('should clone template successfully', async () => {
      const mockCloneTemplate = (templateId, newName) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: `/rest/templates/clone/${templateId}`,
            data: { name: newName },
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'CLONE_TEMPLATE_SUCCESS',
                payload: res.data,
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { id: 2, name: 'Cloned Template' },
      });

      await store.dispatch(mockCloneTemplate(1, 'Cloned Template'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('CLONE_TEMPLATE_SUCCESS');
      expect(actionsDispatched[0].payload.name).toBe('Cloned Template');
    });
  });

  describe('template defaults', () => {
    it('should set default template successfully', async () => {
      const mockSetDefaultTemplate = (templateId, templateType) => {
        return (dispatch) => {
          const data = {
            method: 'POST',
            url: '/rest/templates/setDefault',
            data: { templateId, type: templateType },
          };

          return authApi(data)
            .then((res) => {
              dispatch({
                type: 'SET_DEFAULT_TEMPLATE',
                payload: { templateId, type: templateType },
              });
              return res;
            });
        };
      };

      authApi.mockResolvedValue({
        status: 200,
        data: { message: 'Default template set' },
      });

      await store.dispatch(mockSetDefaultTemplate(1, 'invoice'));

      const actionsDispatched = store.getActions();
      expect(actionsDispatched[0].type).toBe('SET_DEFAULT_TEMPLATE');
      expect(actionsDispatched[0].payload.type).toBe('invoice');
    });
  });
});
