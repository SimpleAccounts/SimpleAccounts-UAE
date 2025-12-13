package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.SupplierInvoicePaymentDao;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import com.simpleaccounts.service.SupplierInvoicePaymentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupplierInvoicePaymentServiceImpl extends SupplierInvoicePaymentService {

	private final SupplierInvoicePaymentDao supplierInvoicePaymentDao;

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
