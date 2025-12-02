package com.simplevat.service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.rest.financialreport.CreditDebitAggregator;
import com.simplevat.rest.financialreport.FinancialReportRequestModel;
import com.simplevat.rest.financialreport.VatReportFilingRequestModel;
import com.simplevat.rest.taxescontroller.TaxesFilterEnum;
import com.simplevat.rest.taxescontroller.TaxesFilterModel;

public abstract class JournalLineItemService extends SimpleVatService<Integer, JournalLineItem> {

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
