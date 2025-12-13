/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.dao.*;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Ashish
 */
@Repository(value = "paymentDao")
@RequiredArgsConstructor
public class PaymentDaoImpl extends AbstractDao<Integer, Payment> implements PaymentDao {

	private final DatatableSortingFilterConstant dataTableUtil;

	private final SupplierInvoicePaymentDao supplierInvoicePaymentDao;

	private final JournalLineItemDao journalLineItemDao;

	private final JournalDao journalDao;

	private final InvoiceDao invoiceDao;

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
