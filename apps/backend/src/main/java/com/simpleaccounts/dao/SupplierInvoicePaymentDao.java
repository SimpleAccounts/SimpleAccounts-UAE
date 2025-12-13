package com.simpleaccounts.dao;

import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.List;

public interface SupplierInvoicePaymentDao extends Dao<Integer, SupplierInvoicePayment> {
	public List<SupplierInvoicePayment> findAllForInvoice(Integer invoiceId);

	public List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
