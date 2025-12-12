package com.simpleaccounts.service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

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

public abstract class JournalLineItemService extends SimpleAccountsService<Integer, JournalLineItem> {

	public abstract void deleteByJournalId(Integer journalId);

	public abstract List<JournalLineItem> getList(ReportRequestModel reportRequestModel);

	public abstract BigDecimal updateCurrentBalance(TransactionCategory transactionCategory, BigDecimal balance);

	public abstract Map<Integer, CreditDebitAggregator> getAggregateTransactionCategoryMap(
			FinancialReportRequestModel reportRequestModel, String reportType);

	public abstract PaginationResponseModel getVatTransactionList(Map<TaxesFilterEnum, Object> filterMap, TaxesFilterModel paginationModel, List<TransactionCategory> transactionCategoryList);

	public abstract  Map<Integer, CreditDebitAggregator> getTaxReport(Date startDate, Date endDate);

    public abstract List<Object[]> totalInputVatAmountAndOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);
	public abstract BigDecimal totalInputVatAmount(VatReportFiling vatReportFiling, VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);
	public abstract BigDecimal totalOutputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel,Integer transactionCategoryId);

	public abstract List<Object> getIdsAndTypeInTotalInputVat(VatReportFiling vatReportFiling, VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);
	public abstract List<Object> getIdsAndTypeInTotalOutputVat(VatReportFiling vatReportFiling, VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);

}
