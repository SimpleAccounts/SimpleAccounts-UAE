package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;

public interface CustomerInvoiceReceiptDao extends Dao<Integer, CustomerInvoiceReceipt> {

	public List<CustomerInvoiceReceipt> findAllForInvoice(Integer invoiceId);

	public List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
	
}
