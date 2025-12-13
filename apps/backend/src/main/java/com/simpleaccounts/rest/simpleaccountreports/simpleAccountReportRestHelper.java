package com.simpleaccounts.rest.simpleaccountreports;

import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class simpleAccountReportRestHelper {

private final SimpleAccountReportService simpleAccountReportService;

    public  PurchaseByProductResponseModel getPurchaseByProduct(ReportRequestModel requestModel) {

       PurchaseByProductResponseModel purchaseByProductResponseModel = new PurchaseByProductResponseModel();
       List<PurchaseByProductModel> purchaseByProductModelList = simpleAccountReportService.getListOfPurchaseByProduct(requestModel);

       purchaseByProductResponseModel.setPurchaseByProductModelList(purchaseByProductModelList);

       return purchaseByProductResponseModel;
    }

    public SalesByProductResponseModel getSalesByProduct(ReportRequestModel requestModel) {

        SalesByProductResponseModel salesByProductResponseModel = new SalesByProductResponseModel();

    List<SalesByProductModel> sbProductList = simpleAccountReportService.getListOfSalesByProduct(requestModel);

    salesByProductResponseModel.setSalesByProductModelList(sbProductList);

        return salesByProductResponseModel;

    }

    public  PurchseByVendorResponseModel getPurchaseByVendor(ReportRequestModel requestModel) {

        PurchseByVendorResponseModel purchseByVendorResponseModel = new PurchseByVendorResponseModel();

        return simpleAccountReportService.getListOfPurchaseByVendor(requestModel,purchseByVendorResponseModel);

    }

    public SalesByCustomerResponseModel getSalesByCustomer(ReportRequestModel requestModel) {

        SalesByCustomerResponseModel salesByCustomerResponseModel = new SalesByCustomerResponseModel();

        return simpleAccountReportService.getListOfSalesByCustomer(requestModel,salesByCustomerResponseModel);

    }

    public ReceivableInvoiceSummaryResponseModel getreceivableInvoiceSummary(ReportRequestModel requestModel) {

        ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel = new ReceivableInvoiceSummaryResponseModel();

        return simpleAccountReportService.getListOfReceivableInvoices(requestModel,receivableInvoiceSummaryResponseModel);
    }

    public ReceivableInvoiceDetailResponseModel getreceivableInvoiceDetail(ReportRequestModel requestModel) {

        ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel = new ReceivableInvoiceDetailResponseModel();
        return simpleAccountReportService.getListOfReceivableInvoiceDetail(requestModel,receivableInvoiceDetailResponseModel);
    }

    public PayableInvoiceSummaryResponseModel getPayableInvoiceSummary(ReportRequestModel requestModel) {

        PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel = new PayableInvoiceSummaryResponseModel();

        return simpleAccountReportService.getListOfPayableInvoiceSummary(requestModel,payableInvoiceSummaryResponseModel);
    }

    public PayableInvoiceDetailResponseModel getPayableInvoiceDetail(ReportRequestModel requestModel) {

        PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel = new PayableInvoiceDetailResponseModel();
        return simpleAccountReportService.getListOfPayableInvoiceDetail(requestModel,payableInvoiceDetailResponseModel);
    }
    public CreditNoteDetailsResponseModel getcreditNoteDetails(ReportRequestModel requestModel) {

        CreditNoteDetailsResponseModel creditNoteDetailsResponseModel = new CreditNoteDetailsResponseModel();
        return simpleAccountReportService.getListOfcreditNoteDetails(requestModel,creditNoteDetailsResponseModel);
    }
/**
 *
 */
public ExpenseDetailsResponseModel getExpenseDetails(ReportRequestModel requestModel) {

    ExpenseDetailsResponseModel expenseDetailsResponseModel = new ExpenseDetailsResponseModel();
    return simpleAccountReportService.getListOfExpenseDetails(requestModel,expenseDetailsResponseModel);
}

    public  ExpenseByCategoryResponseModel getExpenseByCategoryDetails(ReportRequestModel requestModel) {

        ExpenseByCategoryResponseModel expenseByCategoryResponseModel = new ExpenseByCategoryResponseModel();

        return simpleAccountReportService.getListOfExpenseByCategory(requestModel,expenseByCategoryResponseModel);

    }

    public InvoiceDetailsResponseModel getInvoiceDetails(ReportRequestModel requestModel) {

        InvoiceDetailsResponseModel invoiceDetailsResponseModel = new InvoiceDetailsResponseModel();

        return simpleAccountReportService.getListOfInvoiceDetails(requestModel,invoiceDetailsResponseModel);
    }

    public SupplierInvoiceDetailsResponseModel getSupplierInvoiceDetails(ReportRequestModel requestModel) {

        SupplierInvoiceDetailsResponseModel supplierInvoiceDetailsResponseModel = new SupplierInvoiceDetailsResponseModel();

        return simpleAccountReportService.getListOfSupplierInvoiceDetails(requestModel,supplierInvoiceDetailsResponseModel);
    }

    public PayrollSummaryResponseModel getPayrollSummary(ReportRequestModel requestModel) {
        PayrollSummaryResponseModel payrollSummaryResponseModel = new PayrollSummaryResponseModel();

        return simpleAccountReportService.getListOfPayrollSummary(requestModel,payrollSummaryResponseModel);
    }

    public StatementOfAccountResponseModel getSOADetails(StatementOfAccountRequestModel requestModel) {
        return simpleAccountReportService.getSOA(requestModel);
    }

    public FtaAuditResponseModel getFtaAuditReport(FtaAuditRequestModel requestModel) {
    return simpleAccountReportService.getFtaAuditReport(requestModel);
    }

    public FtaAuditResponseModel getFtaExciseAuditReport(FtaAuditRequestModel requestModel) {
        return simpleAccountReportService.getFtaExciseAuditReport(requestModel);
    }

    public AgingListModel getAgingReport(AgingRequestModel requestModel) {
        return simpleAccountReportService.getAgingReport(requestModel);
    }
}