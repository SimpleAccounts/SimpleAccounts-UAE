package com.simpleaccounts.constant;

public final class InvoiceTypeConstant {

	public static final int SUPPLIER = 1;

	public static final int CUSTOMER = 2;

	public static final int REQUEST_FOR_QUATATION = 3;

	public static final int PURCHASE_ORDER = 4;

	public static final int GOODS_RECEIVE_NOTES = 5;

	public static final int QUATATION = 6;

	public static final int CUSTOMER_CREDIT_NOTE = 7;

	public static final int SUPPLIER_CREDIT_NOTE = 8;

	private InvoiceTypeConstant() {
		// CREATED TO REMOVE SONAR ERROR
	}

	public static boolean isCustomerInvoice(Integer type) {
		return type.equals(CUSTOMER);
	}

	public static boolean isCustomerCreditNote(Integer type){
		return type.equals(CUSTOMER_CREDIT_NOTE);
	}
}
