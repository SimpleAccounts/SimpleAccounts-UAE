package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.CustomerInvoiceReceipt;

public interface CustomerInvoiceReceiptDao extends Dao<Integer, CustomerInvoiceReceipt> {

	public List<CustomerInvoiceReceipt> findAllForInvoice(Integer invoiceId);

	public List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
	
}
