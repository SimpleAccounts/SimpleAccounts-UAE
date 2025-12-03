package com.simpleaccounts.constant;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum PostingReferenceTypeEnum {
    MANUAL("Manual"),
    INVOICE("Invoice"),
    REVERSE_INVOICE("Reverse Invoice"),
    EXPENSE("Expense"),
    REVERSE_EXPENSE("Reverse Expense"),
    TRANSACTION_RECONSILE_INVOICE("Reconcile  Transaction for Invoice"),
    TRANSACTION_RECONSILE("Transaction Reconcile "),
    BANK_ACCOUNT("Bank Account"),

    REVERSE_BANK_ACCOUNT("Reverse Bank Account"),

    DELETE_BANK_ACCOUNT("Delete Bank Account"),

    PURCHASE("Purchase"),
    RECEIPT("Customer Payment"),

    BANK_RECEIPT("Customer Payment Through Bank"),
    REVERSE_BANK_RECEIPT("Reverse Customer Payment Through Bank"),
    BALANCE_ADJUSTMENT("Opening Balance Adjustments"),
    PAYMENT("Supplier Payment"),
    BANK_PAYMENT("Supplier Payment Through Bank"),
    REVERSE_BANK_PAYMENT("Reverse Supplier Payment Through Bank"),
    PETTY_CASH("Petty Cash"),
    CREDIT_NOTE("Credit Note"),
    DEBIT_NOTE("Debit Note"),
    PAYROLL("Payroll"),
    PAYROLL_APPROVED("Payroll Approved"),

    PAYROLL_VOIDED("Payroll Voided"),
    PAYROLL_EXPLAINED("Payroll Explained"),
    PUBLISH("Publish"),
    REFUND("Refund"),

    CANCEL_REFUND("Cancel Refund"),
    VAT_PAYMENT("VAT Payment"),
    VAT_PENALTY_AMOUNT("Vat Penalty Amount"),
    VAT_CLAIM("VAT Claim"),

    VAT_REPORT_FILED("VAT Report FILED"),

    VAT_REPORT_UNFILED("VAT Report UNFILED"),
    REVERSE_PAYMENT("Reverse Supplier Payment"),
    REVERSE_RECEIPT("Reverse Customer Payment"),
    REVERSE_VAT_PAYMENT("Reverse VAT Payment"),
    REVERSE_VAT_CLAIM("Reverse VAT Claim"),

    REVERSE_PAYROLL_EXPLAINED("Reverse Payroll Explained"),

    REVERSE_CREDIT_NOTE("Reverse Credit Note"),
    REVERSE_DEBIT_NOTE("Reverse Debit Note"),
    REVERSE_TRANSACTION_RECONSILE("Reverse Transaction Reconcile "),

    CORPORATE_TAX_REPORT_FILED("Corporate Tax Report Filed"),

    CORPORATE_TAX_REPORT_UNFILED("Corporate Tax Report UnFiled"),

    CORPORATE_TAX_PAYMENT("Corporate Tax Payment"),

    REVERSE_CORPORATE_TAX_PAYMENT("Reverse Corporate Tax Payment"),

    REVERSE_PUBLISH("Reverse Published Vat");
	
	@Getter
	private String displayName;

	private PostingReferenceTypeEnum(String displayName) {
		this.displayName = displayName;
	}
}
