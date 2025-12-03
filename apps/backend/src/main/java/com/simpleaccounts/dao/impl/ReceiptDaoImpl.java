package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.dao.*;
import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.Receipt;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@Transactional
public class ReceiptDaoImpl extends AbstractDao<Integer, Receipt> implements ReceiptDao {

	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Autowired
	private CustomerInvoiceReceiptDao customerInvoiceReceiptDao;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private InvoiceDao invoiceDao;

	@Override
	public PaginationResponseModel getProductList(Map<ReceiptFilterEnum, Object> filterMap,
			PaginationModel paginamtionModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginamtionModel.setSortingCol(
				dataTableUtil.getColName(paginamtionModel.getSortingCol(), DatatableSortingFilterConstant.RECEIPT));
		PaginationResponseModel responseModel = new PaginationResponseModel();
		responseModel.setCount(this.getResultCount(dbFilters));
		responseModel.setData(this.executeQuery(dbFilters, paginamtionModel));
		return responseModel;
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Receipt receipt = findByPK(id);

				// Delete middle tabe mapping and update invoice stats as post/partially paid
				deleteupdatestatus(id, receipt);

				// delete related journal
				Map<String, Object> param = new HashMap<>();
				param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
				param.put("referenceId", id);
				param.put("deleteFlag", false);
				List<JournalLineItem> lineItemList = journalLineItemDao.findByAttributes(param);

				if (lineItemList != null && !lineItemList.isEmpty()) {
					List<Integer> list = new ArrayList<>();
					list.add(lineItemList.get(0).getJournal().getId());
					journalDao.deleteByIds(list);
				}

				// delete receipt
				receipt.setDeleteFlag(Boolean.TRUE);
				update(receipt);
			}
		}
	}

	private void deleteupdatestatus(Integer id, Receipt receipt) {
		List<CustomerInvoiceReceipt> receiptEntryList = customerInvoiceReceiptDao.findForReceipt(id);
		if (receiptEntryList != null && !receiptEntryList.isEmpty()) {
			for (CustomerInvoiceReceipt receiptEntry : receiptEntryList) {

				Invoice invoice = receiptEntry.getCustomerInvoice();
				BigDecimal remainingAmt = invoice.getTotalAmount().subtract(receipt.getAmount());
				invoice.setStatus(
						remainingAmt.compareTo(BigDecimal.ZERO) == 0 ? CommonStatusEnum.POST.getValue()
								: CommonStatusEnum.PARTIALLY_PAID.getValue());
				invoiceDao.update(invoice);
				receiptEntry.setDeleteFlag(Boolean.TRUE);
				customerInvoiceReceiptDao.update(receiptEntry);
			}
		}
	}

}
