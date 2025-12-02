package com.simplevat.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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
import com.simplevat.rest.financialreport.AmountDetailRequestModel;
import com.simplevat.rest.financialreport.VatReportFilingRequestModel;
import com.simplevat.rest.invoice.dto.VatAmountDto;

public abstract class InvoiceService extends SimpleVatService<Integer, Invoice> {

	public abstract PaginationResponseModel getInvoiceList(Map<InvoiceFilterEnum, Object> map,
			PaginationModel paginationModel);

	public abstract List<DropdownModel> getInvoicesForDropdown(Integer type);

	public abstract void deleteByIds(List<Integer> ids);

	public abstract Integer getLastInvoiceNo(Integer invoiceType);

	public abstract List<Invoice> getInvoiceList(int mounthCount);

	public abstract OverDueAmountDetailsModel getOverDueAmountDetails(Integer type);

	public abstract EarningDetailsModel getTotalEarnings();

	public abstract Invoice deleteJournaForInvoice(Invoice invoice);

	public abstract List<Invoice> getUnpaidInvoice(Integer contactId, ContactTypeEnum type);

	public abstract List<Invoice> getSuggestionInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type,Integer currency,Integer userId);

	public abstract List<Invoice> getSuggestionExplainedInvoices(BigDecimal amount, Integer contactId,ContactTypeEnum type,Integer currency,Integer userId);

    public abstract Integer getTotalInvoiceCountByContactId(Integer contactId);

	public abstract Integer getReceiptCountByCustInvoiceId(Integer invoiceId);

	public abstract Integer getReceiptCountBySupInvoiceId(Integer invoiceId);

	public abstract void getSumOfTotalAmountWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	public abstract void sumOfTotalAmountWithoutVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	public abstract void sumOfTotalAmountWithoutVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

	public abstract void getSumOfTotalAmountWithVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

    public abstract BigDecimal getTotalInputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);

	public abstract BigDecimal getTotalOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel);

	public abstract List<VatAmountDto> getAmountDetails(AmountDetailRequestModel amountDetailRequestModel);

}