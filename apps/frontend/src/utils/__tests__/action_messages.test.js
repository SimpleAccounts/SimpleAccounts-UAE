/**
 * Tests for action messages utility (data exports)
 */

import {
  InvoiceMessagesList,
  CreditNoteMessagesList,
  QuotationMessagesList,
  ExpenseMessagesList,
  SupplierInvoiceMessagesList,
} from '../action_messages';

describe('Action Messages List', () => {
  describe('InvoiceMessagesList', () => {
    it('should export InvoiceMessagesList array', () => {
      expect(Array.isArray(InvoiceMessagesList)).toBe(true);
    });

    it('should have Sent, Delete, and UnPost actions', () => {
      const actions = InvoiceMessagesList.map((item) => item.action);
      expect(actions).toContain('Sent');
      expect(actions).toContain('Delete');
      expect(actions).toContain('UnPost');
    });

    it('should have list arrays for each action', () => {
      InvoiceMessagesList.forEach((item) => {
        expect(Array.isArray(item.list)).toBe(true);
        expect(item.list.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CreditNoteMessagesList', () => {
    it('should export CreditNoteMessagesList array', () => {
      expect(Array.isArray(CreditNoteMessagesList)).toBe(true);
    });

    it('should have expected actions', () => {
      const actions = CreditNoteMessagesList.map((item) => item.action);
      expect(actions).toContain('Sent');
      expect(actions).toContain('Delete');
      expect(actions).toContain('UnPost');
    });
  });

  describe('QuotationMessagesList', () => {
    it('should export QuotationMessagesList array', () => {
      expect(Array.isArray(QuotationMessagesList)).toBe(true);
    });

    it('should have multiple actions including Status Change', () => {
      const actions = QuotationMessagesList.map((item) => item.action);
      expect(actions).toContain('Sent');
      expect(actions).toContain('Delete');
      expect(actions).toContain('Status Change');
      expect(actions).toContain('Draft');
      expect(actions).toContain('Approved');
      expect(actions).toContain('Rejected');
    });
  });

  describe('ExpenseMessagesList', () => {
    it('should export ExpenseMessagesList array', () => {
      expect(Array.isArray(ExpenseMessagesList)).toBe(true);
    });

    it('should have expected actions', () => {
      const actions = ExpenseMessagesList.map((item) => item.action);
      expect(actions).toContain('Sent');
      expect(actions).toContain('Delete');
      expect(actions).toContain('UnPost');
    });
  });

  describe('SupplierInvoiceMessagesList', () => {
    it('should export SupplierInvoiceMessagesList array', () => {
      expect(Array.isArray(SupplierInvoiceMessagesList)).toBe(true);
    });

    it('should have expected actions', () => {
      const actions = SupplierInvoiceMessagesList.map((item) => item.action);
      expect(actions).toContain('Sent');
      expect(actions).toContain('Delete');
      expect(actions).toContain('UnPost');
    });
  });
});

