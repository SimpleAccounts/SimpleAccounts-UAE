/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

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
