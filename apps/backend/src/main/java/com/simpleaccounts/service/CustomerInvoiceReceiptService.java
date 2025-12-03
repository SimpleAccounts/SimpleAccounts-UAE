package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;

public abstract class CustomerInvoiceReceiptService extends SimpleAccountsService<Integer, CustomerInvoiceReceipt> {

	public abstract Integer findNextReceiptNoForInvoice(Integer invoiceId);

	public abstract List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
}
