package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.SupplierInvoicePayment;

public abstract class SupplierInvoicePaymentService extends SimpleVatService<Integer, SupplierInvoicePayment> {

	public abstract Integer findNextPaymentNoForInvoice(Integer invoiceId);

	public abstract List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
