import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import moment from 'moment';
import ConnectedComponent from './view_bank_account';

const ViewBankAccount = ConnectedComponent.WrappedComponent;

describe('ViewBankAccount', () => {
  beforeEach(() => {
    window.localStorage.setItem('language', 'en');
  });

  const baseProps = {
    initialVals: {
      chartOfAccountId: 'Sales',
      transactionDate: '2024-02-05T00:00:00Z',
      transactionAmount: 1234.56,
      transactionCategoryId: 'Income',
      projectId: 'PR-10',
      description: 'Invoice payment',
      receiptNumber: 'RCPT-100',
      attachementDescription: 'Receipt attachment',
      fileName: 'receipt.pdf',
      filePath: '/files/receipt.pdf',
    },
    editDetails: jest.fn(),
  };

  it('renders transaction details with formatted values', () => {
    render(<ViewBankAccount {...baseProps} />);

    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('PR-10')).toBeInTheDocument();
    expect(screen.getByText('Invoice payment')).toBeInTheDocument();
    expect(screen.getByText('RCPT-100')).toBeInTheDocument();
    expect(
      screen.getByText('Receipt attachment', { exact: false }),
    ).toBeInTheDocument();

    const formattedDate = moment(
      baseProps.initialVals.transactionDate,
    ).format('DD/MM/YYYY');
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText('1,234.56')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'receipt.pdf' });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/files/receipt.pdf'),
    );
  });

  it('calls editDetails when edit icon is clicked', () => {
    render(<ViewBankAccount {...baseProps} />);

    const editIcon = document.querySelector('.fa-edit');
    fireEvent.click(editIcon);

    expect(baseProps.editDetails).toHaveBeenCalled();
  });
});

