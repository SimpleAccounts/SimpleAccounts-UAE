package com.simplevat.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.dao.Dao;
import com.simplevat.dao.SupplierInvoicePaymentDao;
import com.simplevat.entity.SupplierInvoicePayment;
import com.simplevat.service.SupplierInvoicePaymentService;

@Service
public class SupplierInvoicePaymentServiceImpl extends SupplierInvoicePaymentService {

	@Autowired
	private SupplierInvoicePaymentDao supplierInvoicePaymentDao;

	@Override
	protected Dao<Integer, SupplierInvoicePayment> getDao() {
		return supplierInvoicePaymentDao;
	}

	@Override
	public Integer findNextPaymentNoForInvoice(Integer invoiceId) {
		List<SupplierInvoicePayment> list = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);
		return list != null && !list.isEmpty() ? (list.size() + 1) : 1;

	}

	@Override
	public List<SupplierInvoicePayment> findForPayment(Integer paymentId) {
		List<SupplierInvoicePayment> receiptList = supplierInvoicePaymentDao.findForPayment(paymentId);
		return receiptList != null && !receiptList.isEmpty() ? receiptList: null;
	}
}
