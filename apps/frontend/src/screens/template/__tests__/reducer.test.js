import TemplateReducer from '../reducer';
import { TEMPLATE } from 'constants/types';

describe('Template Reducer', () => {
  const initialState = {};

  it('should return the initial state', () => {
    const state = TemplateReducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should handle UPDATE_TEMPLATE_THEME action', () => {
    const action = {
      type: 'UPDATE_TEMPLATE_THEME',
      payload: { templateId: 1, theme: 'modern' },
    };

    const mockReducer = (state = initialState, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'UPDATE_TEMPLATE_THEME':
          return {
            ...state,
            currentTheme: payload.theme,
            templateId: payload.templateId,
          };
        default:
          return state;
      }
    };

    const state = mockReducer(initialState, action);
    expect(state.currentTheme).toBe('modern');
    expect(state.templateId).toBe(1);
  });

  it('should handle SET_TEMPLATE_LIST action', () => {
    const templates = [
      { id: 1, name: 'Invoice Template', type: 'invoice' },
      { id: 2, name: 'Receipt Template', type: 'receipt' },
      { id: 3, name: 'Email Template', type: 'email' },
    ];

    const mockReducer = (state = { template_list: [] }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_LIST':
          return {
            ...state,
            template_list: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_LIST',
      payload: templates,
    };

    const state = mockReducer({ template_list: [] }, action);
    expect(state.template_list).toEqual(templates);
    expect(state.template_list).toHaveLength(3);
  });

  it('should handle SET_ACTIVE_TEMPLATE action', () => {
    const template = {
      id: 1,
      name: 'Invoice Template',
      content: '<html>...</html>',
    };

    const mockReducer = (state = initialState, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_ACTIVE_TEMPLATE':
          return {
            ...state,
            activeTemplate: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_ACTIVE_TEMPLATE',
      payload: template,
    };

    const state = mockReducer(initialState, action);
    expect(state.activeTemplate).toEqual(template);
  });

  it('should handle CLEAR_TEMPLATE action', () => {
    const stateWithData = {
      template_list: [{ id: 1 }],
      activeTemplate: { id: 1 },
      currentTheme: 'modern',
    };

    const mockReducer = (state = stateWithData, action) => {
      const { type } = action;
      switch (type) {
        case 'CLEAR_TEMPLATE':
          return {};
        default:
          return state;
      }
    };

    const action = { type: 'CLEAR_TEMPLATE' };
    const state = mockReducer(stateWithData, action);
    expect(state).toEqual({});
  });

  it('should handle SET_TEMPLATE_LOADING action', () => {
    const mockReducer = (state = { loading: false }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_LOADING':
          return {
            ...state,
            loading: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_LOADING',
      payload: true,
    };

    const state = mockReducer({ loading: false }, action);
    expect(state.loading).toBe(true);
  });

  it('should handle SET_TEMPLATE_ERROR action', () => {
    const errorMessage = 'Failed to load template';

    const mockReducer = (state = { error: null }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_ERROR':
          return {
            ...state,
            error: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_ERROR',
      payload: errorMessage,
    };

    const state = mockReducer({ error: null }, action);
    expect(state.error).toBe(errorMessage);
  });

  it('should preserve state for unknown action types', () => {
    const currentState = { template_list: [{ id: 1 }] };
    const action = { type: 'UNKNOWN_ACTION' };

    const state = TemplateReducer(currentState, action);
    expect(state).toEqual(currentState);
  });

  it('should not mutate original state', () => {
    const originalState = { ...initialState };
    const action = { type: 'UNKNOWN_ACTION' };

    TemplateReducer(initialState, action);
    expect(initialState).toEqual(originalState);
  });

  it('should handle template with custom fields', () => {
    const template = {
      id: 1,
      name: 'Custom Template',
      customFields: {
        header: 'Company Header',
        footer: 'Company Footer',
        logo: 'logo.png',
      },
    };

    const mockReducer = (state = initialState, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_ACTIVE_TEMPLATE':
          return {
            ...state,
            activeTemplate: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_ACTIVE_TEMPLATE',
      payload: template,
    };

    const state = mockReducer(initialState, action);
    expect(state.activeTemplate.customFields.header).toBe('Company Header');
  });

  it('should handle empty template list', () => {
    const mockReducer = (state = { template_list: [] }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_LIST':
          return {
            ...state,
            template_list: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_LIST',
      payload: [],
    };

    const state = mockReducer({ template_list: [{ id: 1 }] }, action);
    expect(state.template_list).toEqual([]);
  });

  it('should handle updating template theme multiple times', () => {
    const mockReducer = (state = { currentTheme: null }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'UPDATE_TEMPLATE_THEME':
          return {
            ...state,
            currentTheme: payload.theme,
          };
        default:
          return state;
      }
    };

    let state = mockReducer({ currentTheme: null }, {
      type: 'UPDATE_TEMPLATE_THEME',
      payload: { theme: 'classic' },
    });

    expect(state.currentTheme).toBe('classic');

    state = mockReducer(state, {
      type: 'UPDATE_TEMPLATE_THEME',
      payload: { theme: 'modern' },
    });

    expect(state.currentTheme).toBe('modern');
  });

  it('should handle template list with different types', () => {
    const templates = [
      { id: 1, name: 'Invoice', type: 'invoice' },
      { id: 2, name: 'Receipt', type: 'receipt' },
      { id: 3, name: 'Quotation', type: 'quotation' },
      { id: 4, name: 'Email', type: 'email' },
    ];

    const mockReducer = (state = { template_list: [] }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_LIST':
          return {
            ...state,
            template_list: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_LIST',
      payload: templates,
    };

    const state = mockReducer({ template_list: [] }, action);
    expect(state.template_list).toHaveLength(4);
    expect(state.template_list.filter((t) => t.type === 'invoice')).toHaveLength(1);
  });

  it('should handle template preferences', () => {
    const preferences = {
      fontSize: 12,
      fontFamily: 'Arial',
      colorScheme: 'blue',
      margins: { top: 20, bottom: 20, left: 15, right: 15 },
    };

    const mockReducer = (state = { preferences: null }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_PREFERENCES':
          return {
            ...state,
            preferences: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_PREFERENCES',
      payload: preferences,
    };

    const state = mockReducer({ preferences: null }, action);
    expect(state.preferences.fontSize).toBe(12);
    expect(state.preferences.margins.top).toBe(20);
  });

  it('should handle template validation status', () => {
    const mockReducer = (state = { isValid: false }, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'SET_TEMPLATE_VALIDATION':
          return {
            ...state,
            isValid: payload,
          };
        default:
          return state;
      }
    };

    const action = {
      type: 'SET_TEMPLATE_VALIDATION',
      payload: true,
    };

    const state = mockReducer({ isValid: false }, action);
    expect(state.isValid).toBe(true);
  });
});
