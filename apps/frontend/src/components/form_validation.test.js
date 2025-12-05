import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Tests for form validation components and utilities.
 */
describe('Form Validation Tests', () => {
  describe('Required Field Validation', () => {
    const RequiredFieldForm = ({ onSubmit }) => {
      const [name, setName] = React.useState('');
      const [error, setError] = React.useState('');

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        setError('');
        onSubmit({ name });
      };

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!error}
            />
            {error && <span role="alert">{error}</span>}
          </div>
          <button type="submit">Submit</button>
        </form>
      );
    };

    test('should show error when required field is empty', () => {
      render(<RequiredFieldForm onSubmit={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
    });

    test('should not show error when required field has value', () => {
      const mockSubmit = jest.fn();
      render(<RequiredFieldForm onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(mockSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
    });

    test('should clear error when user starts typing', async () => {
      render(<RequiredFieldForm onSubmit={jest.fn()} />);

      // Submit empty form to trigger error
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Start typing
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'J' },
      });

      // Submit again to clear error
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Numeric Field Validation', () => {
    const NumericForm = ({ onSubmit }) => {
      const [amount, setAmount] = React.useState('');
      const [errors, setErrors] = React.useState({});

      const validate = (value) => {
        if (!value) return 'Amount is required';
        if (isNaN(parseFloat(value))) return 'Amount must be a number';
        if (parseFloat(value) < 0) return 'Amount cannot be negative';
        if (parseFloat(value) > 1000000) return 'Amount exceeds maximum';
        return null;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const error = validate(amount);
        if (error) {
          setErrors({ amount: error });
          return;
        }
        setErrors({});
        onSubmit({ amount: parseFloat(amount) });
      };

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {errors.amount && <span role="alert">{errors.amount}</span>}
          </div>
          <button type="submit">Submit</button>
        </form>
      );
    };

    test('should reject non-numeric input', () => {
      render(<NumericForm onSubmit={jest.fn()} />);

      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: 'abc' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('must be a number');
    });

    test('should reject negative amounts', () => {
      render(<NumericForm onSubmit={jest.fn()} />);

      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: '-100' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('cannot be negative');
    });

    test('should reject amounts exceeding maximum', () => {
      render(<NumericForm onSubmit={jest.fn()} />);

      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: '2000000' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('exceeds maximum');
    });

    test('should accept valid numeric input', () => {
      const mockSubmit = jest.fn();
      render(<NumericForm onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: '1000.50' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockSubmit).toHaveBeenCalledWith({ amount: 1000.5 });
    });
  });

  describe('Date Field Validation', () => {
    const DateForm = ({ onSubmit, minDate, maxDate }) => {
      const [date, setDate] = React.useState('');
      const [error, setError] = React.useState('');

      const validate = (value) => {
        if (!value) return 'Date is required';
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) return 'Invalid date format';
        if (minDate && dateObj < new Date(minDate)) return 'Date is before minimum allowed';
        if (maxDate && dateObj > new Date(maxDate)) return 'Date is after maximum allowed';
        return null;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validate(date);
        if (validationError) {
          setError(validationError);
          return;
        }
        setError('');
        onSubmit({ date });
      };

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {error && <span role="alert">{error}</span>}
          </div>
          <button type="submit">Submit</button>
        </form>
      );
    };

    test('should reject empty date', () => {
      render(<DateForm onSubmit={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Date is required');
    });

    test('should reject date before minimum', () => {
      render(<DateForm onSubmit={jest.fn()} minDate="2024-01-01" />);

      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2023-12-31' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('before minimum');
    });

    test('should accept valid date within range', () => {
      const mockSubmit = jest.fn();
      render(
        <DateForm
          onSubmit={mockSubmit}
          minDate="2024-01-01"
          maxDate="2024-12-31"
        />
      );

      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2024-06-15' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockSubmit).toHaveBeenCalledWith({ date: '2024-06-15' });
    });
  });

  describe('Email Field Validation', () => {
    const EmailForm = ({ onSubmit }) => {
      const [email, setEmail] = React.useState('');
      const [error, setError] = React.useState('');

      const validate = (value) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        return null;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validate(email);
        if (validationError) {
          setError(validationError);
          return;
        }
        setError('');
        onSubmit({ email });
      };

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <span role="alert">{error}</span>}
          </div>
          <button type="submit">Submit</button>
        </form>
      );
    };

    test('should reject invalid email format', () => {
      render(<EmailForm onSubmit={jest.fn()} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'notanemail' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    });

    test('should accept valid email', () => {
      const mockSubmit = jest.fn();
      render(<EmailForm onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('Multi-Field Form Validation', () => {
    const InvoiceForm = ({ onSubmit }) => {
      const [formData, setFormData] = React.useState({
        customerName: '',
        amount: '',
        dueDate: '',
      });
      const [errors, setErrors] = React.useState({});

      const validateAll = () => {
        const newErrors = {};
        if (!formData.customerName.trim()) {
          newErrors.customerName = 'Customer name is required';
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          newErrors.amount = 'Valid amount is required';
        }
        if (!formData.dueDate) {
          newErrors.dueDate = 'Due date is required';
        }
        return newErrors;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateAll();
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        setErrors({});
        onSubmit(formData);
      };

      const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
      };

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="customerName">Customer</label>
            <input
              id="customerName"
              value={formData.customerName}
              onChange={handleChange('customerName')}
            />
            {errors.customerName && (
              <span data-testid="error-customer">{errors.customerName}</span>
            )}
          </div>
          <div>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              value={formData.amount}
              onChange={handleChange('amount')}
            />
            {errors.amount && (
              <span data-testid="error-amount">{errors.amount}</span>
            )}
          </div>
          <div>
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange('dueDate')}
            />
            {errors.dueDate && (
              <span data-testid="error-dueDate">{errors.dueDate}</span>
            )}
          </div>
          <button type="submit">Create Invoice</button>
        </form>
      );
    };

    test('should show all validation errors at once', () => {
      render(<InvoiceForm onSubmit={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /create invoice/i }));

      expect(screen.getByTestId('error-customer')).toBeInTheDocument();
      expect(screen.getByTestId('error-amount')).toBeInTheDocument();
      expect(screen.getByTestId('error-dueDate')).toBeInTheDocument();
    });

    test('should submit when all fields are valid', () => {
      const mockSubmit = jest.fn();
      render(<InvoiceForm onSubmit={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/customer/i), {
        target: { value: 'Acme Corp' },
      });
      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: '1500' },
      });
      fireEvent.change(screen.getByLabelText(/due date/i), {
        target: { value: '2024-12-31' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create invoice/i }));

      expect(mockSubmit).toHaveBeenCalledWith({
        customerName: 'Acme Corp',
        amount: '1500',
        dueDate: '2024-12-31',
      });
    });
  });
});
