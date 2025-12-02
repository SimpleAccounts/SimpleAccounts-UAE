package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.SupplierInvoicePayment;

public interface SupplierInvoicePaymentDao extends Dao<Integer, SupplierInvoicePayment> {
	public List<SupplierInvoicePayment> findAllForInvoice(Integer invoiceId);

	public List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
