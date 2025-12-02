/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.entity.Invoice;
import com.simplevat.model.EarningDetailsModel;
import com.simplevat.model.OverDueAmountDetailsModel;
import com.simplevat.model.VatReportResponseModel;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.rest.financialreport.VatReportFilingRequestModel;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 *
 * @author daynil
 */
public interface InvoiceDao extends Dao<Integer, Invoice> {

	public PaginationResponseModel getInvoiceList(Map<InvoiceFilterEnum, Object> filterMap,
			PaginationModel paginationModel);

	public List<DropdownModel> getInvoicesForDropdown(Integer type);

	public void deleteByIds(List<Integer> ids);

	public Invoice getLastInvoice(Integer invoiceType);

	public List<Invoice> getInvoiceList(Date startDate, Date endDate);

	public EarningDetailsModel getTotalEarnings();

	public OverDueAmountDetailsModel getOverDueAmountDetails(Integer type);

	public List<Invoice> getUnpaidInvoice(Integer customerId, ContactTypeEnum type);

	public List<Invoice> getSuggestionUnpaidInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type, Integer currency ,Integer userId);

	public List<Invoice> getSuggestionExplainedInvoices(BigDecimal amount, Integer contactId,ContactTypeEnum type,Integer currency,Integer userId);

	public Integer getTotalInvoiceCountByContactId(Integer contactId);

	public Integer getReceiptCountByCustInvoiceId(Integer invoiceId);

	public Integer getReceiptCountBySupInvoiceId(Integer invoiceId);

	void getSumOfTotalAmountWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	void sumOfTotalAmountWithoutVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	void sumOfTotalAmountWithoutVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	void getSumOfTotalAmountWithVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

    BigDecimal getTotalInputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);

	BigDecimal getTotalOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);
}