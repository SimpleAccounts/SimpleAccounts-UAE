/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.CommonStatusEnum;
import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.dao.*;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.Payment;
import com.simplevat.entity.SupplierInvoicePayment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Ashish
 */
@Repository(value = "paymentDao")
public class PaymentDaoImpl extends AbstractDao<Integer, Payment> implements PaymentDao {

	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Autowired
	private SupplierInvoicePaymentDao supplierInvoicePaymentDao;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private InvoiceDao invoiceDao;

	@Override
	public PaginationResponseModel getPayments(Map<PaymentFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(
				dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.PAYMENT));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Payment payment = findByPK(id);

				// Delete middle tabe mapping and update invoice stats as post/partially paid
				deleteupdatestatus(id, payment);

				// delete related journal
				Map<String, Object> param = new HashMap<>();
				param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
				param.put("referenceId", id);
				param.put("deleteFlag", false);
				List<JournalLineItem> lineItemList = journalLineItemDao.findByAttributes(param);

				if (lineItemList != null && !lineItemList.isEmpty()) {
					List<Integer> list = new ArrayList<>();
					list.add(lineItemList.get(0).getJournal().getId());
					journalDao.deleteByIds(list);
				}

				// delete payment
				payment.setDeleteFlag(Boolean.TRUE);
				update(payment);
			}
		}
	}

	private void deleteupdatestatus(Integer id, Payment payment) {
		List<SupplierInvoicePayment> receiptEntryList = supplierInvoicePaymentDao.findForPayment(id);
		if (receiptEntryList != null && !receiptEntryList.isEmpty()) {
			for (SupplierInvoicePayment receiptEntry : receiptEntryList) {
				Invoice invoice = receiptEntry.getSupplierInvoice();
				BigDecimal remainingAmt = invoice.getTotalAmount().subtract(payment.getInvoiceAmount());

				invoice.setStatus(
						remainingAmt.compareTo(BigDecimal.ZERO) == 0 ? CommonStatusEnum.POST.getValue()
								: CommonStatusEnum.PARTIALLY_PAID.getValue());
				invoiceDao.update(invoice);
				receiptEntry.setDeleteFlag(Boolean.TRUE);
				supplierInvoicePaymentDao.update(receiptEntry);
			}
		}
	}
}
