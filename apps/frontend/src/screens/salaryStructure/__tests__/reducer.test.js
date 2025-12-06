import EmployeeReducer from '../reducer';
import { SALARY_STRUCTURE } from 'constants/types';

describe('Salary Structure Reducer', () => {
  const initialState = {
    salaryStructure_list: [],
    currency_list: [],
    country_list: [],
  };

  it('should return the initial state', () => {
    expect(EmployeeReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SALARY_STRUCTURE.SALARY_STRUCTURE_LIST', () => {
    const salaryStructureData = [
      {
        salaryStructureId: 1,
        structureName: 'Basic Structure',
        basicSalary: 5000,
        allowances: 1000,
      },
      {
        salaryStructureId: 2,
        structureName: 'Senior Structure',
        basicSalary: 10000,
        allowances: 2000,
      },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: salaryStructureData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list).toEqual(salaryStructureData);
    expect(newState.salaryStructure_list.length).toBe(2);
  });

  it('should not mutate the original state', () => {
    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: [{ salaryStructureId: 1, structureName: 'Test Structure' }],
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState).not.toBe(initialState);
    expect(initialState.salaryStructure_list).toEqual([]);
  });

  it('should handle empty payload', () => {
    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: [],
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list).toEqual([]);
    expect(Array.isArray(newState.salaryStructure_list)).toBe(true);
  });

  it('should handle unknown action types', () => {
    const action = {
      type: 'UNKNOWN_SALARY_ACTION',
      payload: { data: 'test' },
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should replace existing salary structure list data', () => {
    const stateWithData = {
      ...initialState,
      salaryStructure_list: [
        { salaryStructureId: 1, structureName: 'Old Structure' },
      ],
    };

    const newStructureData = [
      { salaryStructureId: 2, structureName: 'New Structure 1' },
      { salaryStructureId: 3, structureName: 'New Structure 2' },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: newStructureData,
    };

    const newState = EmployeeReducer(stateWithData, action);

    expect(newState.salaryStructure_list.length).toBe(2);
    expect(newState.salaryStructure_list[0].structureName).toBe('New Structure 1');
  });

  it('should preserve other state properties', () => {
    const stateWithData = {
      salaryStructure_list: [],
      currency_list: [{ currencyId: 1, currencyName: 'AED' }],
      country_list: [{ countryId: 1, countryName: 'UAE' }],
    };

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: [{ salaryStructureId: 1 }],
    };

    const newState = EmployeeReducer(stateWithData, action);

    expect(newState.currency_list).toEqual(stateWithData.currency_list);
    expect(newState.country_list).toEqual(stateWithData.country_list);
    expect(newState.salaryStructure_list.length).toBe(1);
  });

  it('should handle complex salary structure objects', () => {
    const complexStructureData = [
      {
        salaryStructureId: 1,
        structureName: 'Executive Structure',
        basicSalary: 15000,
        allowances: {
          housing: 5000,
          transport: 2000,
          communication: 500,
        },
        deductions: {
          pension: 750,
          insurance: 500,
        },
        components: [
          { componentId: 1, componentName: 'Basic', amount: 15000 },
          { componentId: 2, componentName: 'Housing', amount: 5000 },
        ],
        metadata: {
          createdDate: '2024-01-01',
          lastModified: '2024-06-01',
        },
      },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: complexStructureData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list[0].allowances.housing).toBe(5000);
    expect(newState.salaryStructure_list[0].deductions.pension).toBe(750);
    expect(newState.salaryStructure_list[0].components.length).toBe(2);
  });

  it('should use Object.assign to create new array reference', () => {
    const structureData = [{ salaryStructureId: 1 }];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: structureData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list).not.toBe(structureData);
    expect(newState.salaryStructure_list).toEqual(structureData);
  });

  it('should handle large datasets efficiently', () => {
    const largeStructureList = Array.from({ length: 200 }, (_, i) => ({
      salaryStructureId: i + 1,
      structureName: `Structure ${i + 1}`,
      basicSalary: 5000 + i * 100,
    }));

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: largeStructureList,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list.length).toBe(200);
    expect(newState.salaryStructure_list[199].salaryStructureId).toBe(200);
  });

  it('should handle salary structures with zero values', () => {
    const zeroValueData = [
      {
        salaryStructureId: 1,
        structureName: 'Trainee Structure',
        basicSalary: 0,
        allowances: 0,
      },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: zeroValueData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list[0].basicSalary).toBe(0);
    expect(newState.salaryStructure_list[0].allowances).toBe(0);
  });

  it('should handle salary structures with various salary ranges', () => {
    const variousRangesData = [
      { salaryStructureId: 1, structureName: 'Entry Level', basicSalary: 3000 },
      { salaryStructureId: 2, structureName: 'Mid Level', basicSalary: 8000 },
      { salaryStructureId: 3, structureName: 'Senior Level', basicSalary: 15000 },
      { salaryStructureId: 4, structureName: 'Executive Level', basicSalary: 30000 },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: variousRangesData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list.length).toBe(4);
    expect(newState.salaryStructure_list[0].basicSalary).toBe(3000);
    expect(newState.salaryStructure_list[3].basicSalary).toBe(30000);
  });

  it('should preserve state immutability across multiple dispatches', () => {
    let state = initialState;
    const firstPayload = [{ salaryStructureId: 1, structureName: 'First' }];
    const secondPayload = [{ salaryStructureId: 2, structureName: 'Second' }];

    state = EmployeeReducer(state, {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: firstPayload,
    });

    const intermediateState = state;

    state = EmployeeReducer(state, {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: secondPayload,
    });

    expect(intermediateState.salaryStructure_list[0].structureName).toBe('First');
    expect(state.salaryStructure_list[0].structureName).toBe('Second');
  });

  it('should maintain state shape integrity', () => {
    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: [{ salaryStructureId: 1 }],
    };

    const newState = EmployeeReducer(initialState, action);

    expect(Object.keys(newState).sort()).toEqual([
      'country_list',
      'currency_list',
      'salaryStructure_list',
    ].sort());
    expect(Array.isArray(newState.salaryStructure_list)).toBe(true);
  });

  it('should handle salary structures with decimal values', () => {
    const decimalData = [
      {
        salaryStructureId: 1,
        structureName: 'Decimal Structure',
        basicSalary: 5500.75,
        allowances: 1250.50,
        totalSalary: 6751.25,
      },
    ];

    const action = {
      type: SALARY_STRUCTURE.SALARY_STRUCTURE_LIST,
      payload: decimalData,
    };

    const newState = EmployeeReducer(initialState, action);

    expect(newState.salaryStructure_list[0].basicSalary).toBe(5500.75);
    expect(newState.salaryStructure_list[0].allowances).toBe(1250.50);
  });
});
