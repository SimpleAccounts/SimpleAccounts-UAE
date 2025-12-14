package com.simpleaccounts.service;

import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.List;

public abstract class SupplierInvoicePaymentService extends SimpleAccountsService<Integer, SupplierInvoicePayment> {

	public abstract Integer findNextPaymentNoForInvoice(Integer invoiceId);

	public abstract List<SupplierInvoicePayment> findForPayment(Integer paymentId);
}
