/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao;

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

/**
 *
 * @author daynil
 */
public interface JournalLineItemDao extends Dao<Integer, JournalLineItem> {

	public void deleteByJournalId(Integer journalId);

	public List<JournalLineItem> getList(ReportRequestModel reportRequestModel);
	public Map<Integer, CreditDebitAggregator> getAggregateTransactionCategoryMap(FinancialReportRequestModel financialReportRequestModel, String reportType);


	public List<JournalLineItem> getListByTransactionCategory(TransactionCategory transactionCategory);

    public PaginationResponseModel getVatTransactionList(Map<TaxesFilterEnum, Object> map, TaxesFilterModel paginationResponseModel, List<TransactionCategory> transactionCategoryList);

	public 	Map<Integer, CreditDebitAggregator> getTaxReport(Date startDate, Date endDate);

	List<Object[]> totalInputVatAmountAndOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);
	BigDecimal totalInputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);
	BigDecimal totalOutputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel,Integer transactionCategoryId);
	List<Object> getIdsAndTypeInTotalInputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);
	List<Object> getIdsAndTypeInTotalOutputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId);
}
