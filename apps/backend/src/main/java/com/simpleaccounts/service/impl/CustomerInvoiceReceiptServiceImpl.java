package com.simpleaccounts.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.CustomerInvoiceReceiptDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import com.simpleaccounts.service.CustomerInvoiceReceiptService;

@Service
public class CustomerInvoiceReceiptServiceImpl extends CustomerInvoiceReceiptService {

	@Autowired
	private CustomerInvoiceReceiptDao customerInvoiceReceiptDao;

	@Override
	protected Dao<Integer, CustomerInvoiceReceipt> getDao() {
		return customerInvoiceReceiptDao;
	}

	@Override
	public Integer findNextReceiptNoForInvoice(Integer invoiceId) {
		List<CustomerInvoiceReceipt> list = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);
		return list != null && !list.isEmpty() ? (list.size() + 1) : 1;

	}

	@Override
	public List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId) {
		List<CustomerInvoiceReceipt> receiptList = customerInvoiceReceiptDao.findForReceipt(receiptId);
		return receiptList != null && !receiptList.isEmpty() ? receiptList: null;
	}

}
