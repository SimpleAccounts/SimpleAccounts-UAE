import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import TermDateInput from './term_date_input';

window.localStorage.setItem('language', 'en');

jest.mock('react-select', () => ({
  __esModule: true,
  default: ({ options, value, onChange, ...rest }) => (
    <select
      data-testid="term-select"
      value={value?.value ?? ''}
      onChange={(event) => onChange({ value: event.target.value })}
      {...rest}
    >
      <option value="">--</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: ({ id, selected, onChange }) => (
    <input
      data-testid={id}
      type="date"
      value={selected ? selected.toISOString().substring(0, 10) : ''}
      onChange={(event) => onChange(new Date(event.target.value))}
    />
  ),
}));

const baseFields = {
  term: {
    label: 'Term',
    required: true,
    disabled: false,
    values: { value: 'NET_7' },
    errors: null,
    touched: false,
  },
  invoiceDate: {
    name: 'invoiceDate',
    label: 'Invoice Date',
    placeholder: 'Select date',
    values: new Date('2024-01-01T00:00:00Z'),
    value: new Date('2024-01-01T00:00:00Z'),
    errors: null,
    touched: false,
  },
  invoiceDueDate: {
    name: 'invoiceDueDate',
    label: 'Due Date',
    placeholder: 'Select due date',
    disabled: false,
    values: new Date('2024-01-08T00:00:00Z'),
    value: new Date('2024-01-08T00:00:00Z'),
  },
};

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: jest.fn(),
});

const renderComponent = (override = {}) => {
  const store = createStore({
    common: { company_details: { currencyCode: 'AED' } },
  });
  return render(
    <Provider store={store}>
      <TermDateInput
        onChange={override.onChange || jest.fn()}
        fields={{ ...baseFields, ...override.fields }}
      />
    </Provider>,
  );
};

describe('TermDateInput', () => {
  it('updates term and due date when selecting a different term option', () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.change(screen.getByTestId('term-select'), {
      target: { value: 'NET_10' },
    });

    expect(onChange).toHaveBeenCalledWith('term', 'NET_10');
    const dueDateCall = onChange.mock.calls.find(
      ([field]) => field === 'invoiceDueDate',
    );
    expect(dueDateCall).toBeDefined();
    const updatedDate = dueDateCall[1];
    expect(updatedDate).toBeInstanceOf(Date);
    expect(updatedDate.toISOString().substring(0, 10)).toBe('2024-01-11');
  });

  it('recomputes due date when invoice date changes directly', () => {
    const onChange = jest.fn();
    renderComponent({ onChange });

    fireEvent.change(screen.getByTestId('invoiceDate'), {
      target: { value: '2024-01-05' },
    });

    expect(onChange).toHaveBeenCalledWith('invoiceDate', expect.any(Date));
    const dueDateCall = onChange.mock.calls.filter(
      ([field]) => field === 'invoiceDueDate',
    ).pop();
    expect(dueDateCall[1].toISOString().substring(0, 10)).toBe('2024-01-12');
  });
});

