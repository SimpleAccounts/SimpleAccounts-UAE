package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.CustomerInvoiceReceipt;

public abstract class CustomerInvoiceReceiptService extends SimpleVatService<Integer, CustomerInvoiceReceipt> {

	public abstract Integer findNextReceiptNoForInvoice(Integer invoiceId);

	public abstract List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId);
}
