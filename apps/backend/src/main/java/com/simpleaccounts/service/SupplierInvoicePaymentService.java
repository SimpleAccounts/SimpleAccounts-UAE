package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.SupplierInvoicePayment;

public abstract class SupplierInvoicePaymentService extends SimpleAccountsService<Integer, SupplierInvoicePayment> {

	public abstract Integer findNextPaymentNoForInvoice(Integer invoiceId);

	public abstract List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
