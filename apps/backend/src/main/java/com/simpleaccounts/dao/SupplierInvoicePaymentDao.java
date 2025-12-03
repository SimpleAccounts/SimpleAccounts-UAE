package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.SupplierInvoicePayment;

public interface SupplierInvoicePaymentDao extends Dao<Integer, SupplierInvoicePayment> {
	public List<SupplierInvoicePayment> findAllForInvoice(Integer invoiceId);

	public List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
