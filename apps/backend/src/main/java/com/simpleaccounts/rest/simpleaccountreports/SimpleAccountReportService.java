package com.simpleaccounts.rest.simpleaccountreports;

import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import java.util.List;

public abstract class SimpleAccountReportService {

    public abstract SalesByCustomerResponseModel getListOfSalesByCustomer(ReportRequestModel requestModel,SalesByCustomerResponseModel salesByCustomerResponseModel);

    public abstract PurchseByVendorResponseModel getListOfPurchaseByVendor(ReportRequestModel requestModel,PurchseByVendorResponseModel purchseByVendorResponseModel);

    public abstract List<SalesByProductModel> getListOfSalesByProduct(ReportRequestModel requestModel);

    public abstract List<PurchaseByProductModel> getListOfPurchaseByProduct(ReportRequestModel requestModel);

    public abstract ReceivableInvoiceSummaryResponseModel getListOfReceivableInvoices(ReportRequestModel requestModel,ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel);

    public abstract ReceivableInvoiceDetailResponseModel getListOfReceivableInvoiceDetail(ReportRequestModel requestModel, ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel);

    public abstract PayableInvoiceSummaryResponseModel getListOfPayableInvoiceSummary(ReportRequestModel requestModel, PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel);

    public abstract PayableInvoiceDetailResponseModel getListOfPayableInvoiceDetail(ReportRequestModel requestModel, PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel);

    public abstract CreditNoteDetailsResponseModel getListOfcreditNoteDetails(ReportRequestModel requestModel, CreditNoteDetailsResponseModel creditNoteDetailsResponseModel);

    public abstract ExpenseDetailsResponseModel getListOfExpenseDetails(ReportRequestModel requestModel, ExpenseDetailsResponseModel expenseDetailsResponseModel);

    public abstract ExpenseByCategoryResponseModel getListOfExpenseByCategory(ReportRequestModel requestModel, ExpenseByCategoryResponseModel expenseByCategoryResponseModel);

    public abstract InvoiceDetailsResponseModel getListOfInvoiceDetails(ReportRequestModel requestModel, InvoiceDetailsResponseModel invoiceDetailsResponseModel);

    public abstract SupplierInvoiceDetailsResponseModel getListOfSupplierInvoiceDetails(ReportRequestModel requestModel, SupplierInvoiceDetailsResponseModel supplierInvoiceDetailsResponseModel);

    public abstract PayrollSummaryResponseModel getListOfPayrollSummary(ReportRequestModel requestModel, PayrollSummaryResponseModel payrollSummaryResponseModel);

    public abstract StatementOfAccountResponseModel getSOA(StatementOfAccountRequestModel requestModel);

    public abstract FtaAuditResponseModel getFtaAuditReport(FtaAuditRequestModel requestModel);

    public abstract FtaAuditResponseModel getFtaExciseAuditReport(FtaAuditRequestModel requestModel);

    public abstract AgingListModel getAgingReport(AgingRequestModel requestModel);
}
