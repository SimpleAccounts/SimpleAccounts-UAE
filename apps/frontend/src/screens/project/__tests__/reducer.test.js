import ProjectReducer from '../reducer';
import { PROJECT } from 'constants/types';

describe('Project Reducer', () => {
  const initialState = {
    project_list: [],
    currency_list: [],
    country_list: [],
    title_list: [],
    contact_list: [],
  };

  it('should return the initial state', () => {
    expect(ProjectReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle PROJECT.PROJECT_LIST', () => {
    const projectData = [
      { projectId: 1, projectName: 'Project A' },
      { projectId: 2, projectName: 'Project B' },
    ];

    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: projectData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.project_list).toEqual(projectData);
    expect(newState.project_list.length).toBe(2);
    expect(newState.currency_list).toEqual([]);
  });

  it('should handle PROJECT.CURRENCY_LIST', () => {
    const currencyData = [
      { currencyId: 1, currencyName: 'USD', symbol: '$' },
      { currencyId: 2, currencyName: 'EUR', symbol: '€' },
    ];

    const action = {
      type: PROJECT.CURRENCY_LIST,
      payload: currencyData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.currency_list).toEqual(currencyData);
    expect(newState.currency_list.length).toBe(2);
    expect(newState.project_list).toEqual([]);
  });

  it('should handle PROJECT.COUNTRY_LIST', () => {
    const countryData = [
      { countryId: 1, countryName: 'USA', code: 'US' },
      { countryId: 2, countryName: 'UK', code: 'GB' },
    ];

    const action = {
      type: PROJECT.COUNTRY_LIST,
      payload: countryData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.country_list).toEqual(countryData);
    expect(newState.country_list.length).toBe(2);
  });

  it('should handle PROJECT.TITLE_LIST', () => {
    const titleData = [
      { titleId: 1, titleName: 'Mr.' },
      { titleId: 2, titleName: 'Mrs.' },
      { titleId: 3, titleName: 'Dr.' },
    ];

    const action = {
      type: PROJECT.TITLE_LIST,
      payload: titleData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.title_list).toEqual(titleData);
    expect(newState.title_list.length).toBe(3);
  });

  it('should handle PROJECT.CONTACT_LIST', () => {
    const contactData = [
      { contactId: 1, firstName: 'John', lastName: 'Doe' },
      { contactId: 2, firstName: 'Jane', lastName: 'Smith' },
    ];

    const action = {
      type: PROJECT.CONTACT_LIST,
      payload: contactData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.contact_list).toEqual(contactData);
    expect(newState.contact_list.length).toBe(2);
  });

  it('should not mutate the original state', () => {
    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: [{ projectId: 1, projectName: 'Test' }],
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState).not.toBe(initialState);
    expect(initialState.project_list).toEqual([]);
  });

  it('should preserve other state properties when updating one list', () => {
    const stateWithData = {
      project_list: [{ projectId: 1 }],
      currency_list: [{ currencyId: 1 }],
      country_list: [],
      title_list: [],
      contact_list: [],
    };

    const action = {
      type: PROJECT.TITLE_LIST,
      payload: [{ titleId: 1, titleName: 'Mr.' }],
    };

    const newState = ProjectReducer(stateWithData, action);

    expect(newState.project_list).toEqual(stateWithData.project_list);
    expect(newState.currency_list).toEqual(stateWithData.currency_list);
    expect(newState.title_list).toEqual([{ titleId: 1, titleName: 'Mr.' }]);
  });

  it('should handle empty payload arrays', () => {
    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: [],
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.project_list).toEqual([]);
    expect(Array.isArray(newState.project_list)).toBe(true);
  });

  it('should handle unknown action types', () => {
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: { data: 'test' },
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should handle multiple sequential actions', () => {
    let state = initialState;

    state = ProjectReducer(state, {
      type: PROJECT.PROJECT_LIST,
      payload: [{ projectId: 1 }],
    });

    state = ProjectReducer(state, {
      type: PROJECT.CURRENCY_LIST,
      payload: [{ currencyId: 1 }],
    });

    state = ProjectReducer(state, {
      type: PROJECT.CONTACT_LIST,
      payload: [{ contactId: 1 }],
    });

    expect(state.project_list.length).toBe(1);
    expect(state.currency_list.length).toBe(1);
    expect(state.contact_list.length).toBe(1);
  });

  it('should replace existing list data when action is dispatched', () => {
    const stateWithData = {
      ...initialState,
      project_list: [{ projectId: 1, projectName: 'Old Project' }],
    };

    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: [
        { projectId: 2, projectName: 'New Project 1' },
        { projectId: 3, projectName: 'New Project 2' },
      ],
    };

    const newState = ProjectReducer(stateWithData, action);

    expect(newState.project_list.length).toBe(2);
    expect(newState.project_list[0].projectName).toBe('New Project 1');
    expect(newState.project_list).not.toContain({ projectId: 1, projectName: 'Old Project' });
  });

  it('should handle complex nested objects in payload', () => {
    const complexProjectData = [
      {
        projectId: 1,
        projectName: 'Complex Project',
        contact: { firstName: 'John', lastName: 'Doe' },
        currency: { currencyName: 'USD', symbol: '$' },
        metadata: { createdAt: '2024-01-01', tags: ['important', 'urgent'] },
      },
    ];

    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: complexProjectData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.project_list[0].contact.firstName).toBe('John');
    expect(newState.project_list[0].currency.symbol).toBe('$');
    expect(newState.project_list[0].metadata.tags).toContain('important');
  });

  it('should handle large datasets efficiently', () => {
    const largeProjectList = Array.from({ length: 1000 }, (_, i) => ({
      projectId: i + 1,
      projectName: `Project ${i + 1}`,
    }));

    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: largeProjectList,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.project_list.length).toBe(1000);
    expect(newState.project_list[999].projectId).toBe(1000);
  });

  it('should use Object.assign to create new array reference', () => {
    const projectData = [{ projectId: 1 }];

    const action = {
      type: PROJECT.PROJECT_LIST,
      payload: projectData,
    };

    const newState = ProjectReducer(initialState, action);

    expect(newState.project_list).not.toBe(projectData);
    expect(newState.project_list).toEqual(projectData);
  });
});
