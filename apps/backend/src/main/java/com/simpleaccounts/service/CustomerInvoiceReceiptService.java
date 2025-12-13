package com.simpleaccounts.service;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import java.util.List;

public abstract class CustomerInvoiceReceiptService extends SimpleAccountsService<Integer, CustomerInvoiceReceipt> {

	public abstract Integer findNextReceiptNoForInvoice(Integer invoiceId);

	public abstract List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
}
