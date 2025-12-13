package com.simpleaccounts.dao;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import java.util.List;

public interface CustomerInvoiceReceiptDao extends Dao<Integer, CustomerInvoiceReceipt> {

	public List<CustomerInvoiceReceipt> findAllForInvoice(Integer invoiceId);

	public List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
	
}
