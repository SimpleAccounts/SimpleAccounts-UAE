package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.CreditDebitAggregator;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.rest.taxescontroller.TaxesFilterEnum;
import com.simpleaccounts.rest.taxescontroller.TaxesFilterModel;
import com.simpleaccounts.service.JournalLineItemService;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service("JournalLineItemService")
@RequiredArgsConstructor
public class JournalLineItemServiceImpl extends JournalLineItemService {

	private final Logger logger = LoggerFactory.getLogger(JournalLineItemServiceImpl.class);

	private final JournalLineItemDao journalLineItemDao;

	@Override
	protected Dao<Integer, JournalLineItem> getDao() {
		return journalLineItemDao;
	}

	@Override
	public void deleteByJournalId(Integer journalId) {
		journalLineItemDao.deleteByJournalId(journalId);
	}

	@Override
	public List<JournalLineItem> getList(ReportRequestModel reportRequestModel) {
		return journalLineItemDao.getList(reportRequestModel);
	}

	@Override
	public BigDecimal updateCurrentBalance(TransactionCategory transactionCategory, BigDecimal balance) {
		List<JournalLineItem> itemList = journalLineItemDao.getListByTransactionCategory(transactionCategory);

		BigDecimal currentBalance = balance;
		for (JournalLineItem journalLineItem : itemList) {

			if (journalLineItem.getCreditAmount() != null) {
				currentBalance = currentBalance.add(journalLineItem.getCreditAmount());
			} else {
				currentBalance = currentBalance.subtract(journalLineItem.getDebitAmount());
			}
			journalLineItem.setCurrentBalance(currentBalance);
		}

		return currentBalance;
	}

	@Override
	public Map<Integer, CreditDebitAggregator> getAggregateTransactionCategoryMap(
			FinancialReportRequestModel financialReportRequestModel, String reportType) {
		return journalLineItemDao.getAggregateTransactionCategoryMap(financialReportRequestModel,reportType);
	}

	@Override
	public PaginationResponseModel getVatTransactionList(Map<TaxesFilterEnum, Object> filterMap, TaxesFilterModel paginationModel, List<TransactionCategory> transactionCategoryList) {
		return journalLineItemDao.getVatTransactionList(filterMap, paginationModel,transactionCategoryList);
	}

	@Override
	public 	Map<Integer, CreditDebitAggregator> getTaxReport(Date startdate, Date endDate) {
		return journalLineItemDao.getTaxReport(startdate, endDate);
	}

	public List<Object[]> totalInputVatAmountAndOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){
		return journalLineItemDao.totalInputVatAmountAndOutputVatAmount(vatReportFilingRequestModel);
	}

	public BigDecimal totalInputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		return journalLineItemDao.totalInputVatAmount( vatReportFiling,vatReportFilingRequestModel,transactionCategoryId);
	}
	public BigDecimal totalOutputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel,Integer transactionCategoryId){
		return journalLineItemDao.totalOutputVatAmount(vatReportFiling,vatReportFilingRequestModel,transactionCategoryId);
	}
	public List<Object> getIdsAndTypeInTotalInputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		return journalLineItemDao.getIdsAndTypeInTotalInputVat( vatReportFiling,vatReportFilingRequestModel,transactionCategoryId);
	}
	public List<Object> getIdsAndTypeInTotalOutputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		return journalLineItemDao.getIdsAndTypeInTotalOutputVat( vatReportFiling,vatReportFilingRequestModel,transactionCategoryId);
	}

}
