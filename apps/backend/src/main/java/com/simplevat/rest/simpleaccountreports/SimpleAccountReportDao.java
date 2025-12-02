package com.simplevat.rest.simpleaccountreports;

import com.simplevat.rest.simpleaccountreports.Aging.AgingListModel;
import com.simplevat.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simplevat.rest.simpleaccountreports.FTA.FtaAuditRequestModel;
import com.simplevat.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simplevat.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simplevat.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import org.springframework.stereotype.Component;

import java.util.List;


public interface SimpleAccountReportDao {


   public SalesByCustomerResponseModel getSalesByCustomer(ReportRequestModel requestModel,SalesByCustomerResponseModel salesByCustomerResponseModel);

   public PurchseByVendorResponseModel getPurchaseByVendor(ReportRequestModel requestModel,PurchseByVendorResponseModel purchseByVendorResponseModel);

   public List<SalesByProductModel> getSalesByProduct(ReportRequestModel requestModel);

   public List<PurchaseByProductModel> getPurchaseByProduct(ReportRequestModel requestModel);

   public ReceivableInvoiceSummaryResponseModel getReceivableInvoices(ReportRequestModel requestModel,ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel);

   public ReceivableInvoiceDetailResponseModel getReceivableInvoiceDetail(ReportRequestModel requestModel, ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel);

   public PayableInvoiceSummaryResponseModel getPayableInvoices(ReportRequestModel requestModel, PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel);

   public PayableInvoiceDetailResponseModel getPayableInvoiceDetail(ReportRequestModel requestModel, PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel);

   public CreditNoteDetailsResponseModel getcreditNoteDetails(ReportRequestModel requestModel, CreditNoteDetailsResponseModel creditNoteDetailsResponseModel);

   public ExpenseDetailsResponseModel getExpenseDetails(ReportRequestModel requestModel, ExpenseDetailsResponseModel creditNoteDetailsResponseModel);

   public ExpenseByCategoryResponseModel getExpenseByCategoryDetails(ReportRequestModel requestModel, ExpenseByCategoryResponseModel expenseByCategoryResponseModel);

   public InvoiceDetailsResponseModel getInvoiceDetails(ReportRequestModel requestModel, InvoiceDetailsResponseModel invoiceDetailsResponseModel);


   public SupplierInvoiceDetailsResponseModel getSupplierInvoiceDetails(ReportRequestModel requestModel, SupplierInvoiceDetailsResponseModel supplierInvoiceDetailsResponseModel);

   public PayrollSummaryResponseModel getPayrollSummary(ReportRequestModel requestModel, PayrollSummaryResponseModel payrollSummaryResponseModel);

   public StatementOfAccountResponseModel getSOA(StatementOfAccountRequestModel requestModel);

    FtaAuditResponseModel getFtaAuditReport(FtaAuditRequestModel requestModel);

    FtaAuditResponseModel getFtaExciseAuditReport (FtaAuditRequestModel requestModel);

   AgingListModel getAgingReport(AgingRequestModel responseModel);

}
