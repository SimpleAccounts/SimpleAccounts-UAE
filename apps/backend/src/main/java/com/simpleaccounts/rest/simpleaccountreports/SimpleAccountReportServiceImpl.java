package com.simpleaccounts.rest.simpleaccountreports;

import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SimpleAccountReportServiceImpl extends SimpleAccountReportService{

    private final SimpleAccountReportDao simpleAccountReportDao;

    public SalesByCustomerResponseModel getListOfSalesByCustomer(ReportRequestModel requestModel,SalesByCustomerResponseModel salesByCustomerResponseModel){

      return simpleAccountReportDao.getSalesByCustomer(requestModel,salesByCustomerResponseModel) ;

    }

    public PurchseByVendorResponseModel getListOfPurchaseByVendor(ReportRequestModel requestModel,PurchseByVendorResponseModel purchseByVendorResponseModel){

        return simpleAccountReportDao.getPurchaseByVendor(requestModel,purchseByVendorResponseModel);
    }

    public List<SalesByProductModel> getListOfSalesByProduct(ReportRequestModel requestModel){

        return simpleAccountReportDao.getSalesByProduct(requestModel);
    }

    public List<PurchaseByProductModel> getListOfPurchaseByProduct(ReportRequestModel requestModel){
        return simpleAccountReportDao.getPurchaseByProduct(requestModel);
    }

    public  ReceivableInvoiceSummaryResponseModel getListOfReceivableInvoices(ReportRequestModel requestModel,ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel){

        return simpleAccountReportDao.getReceivableInvoices(requestModel,receivableInvoiceSummaryResponseModel);

    }
    public PayableInvoiceSummaryResponseModel getListOfPayableInvoiceSummary(ReportRequestModel requestModel, PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel) {

        return simpleAccountReportDao.getPayableInvoices(requestModel,payableInvoiceSummaryResponseModel);
    }

    public  ReceivableInvoiceDetailResponseModel getListOfReceivableInvoiceDetail(ReportRequestModel requestModel, ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel){

        return simpleAccountReportDao.getReceivableInvoiceDetail(requestModel,receivableInvoiceDetailResponseModel);
    }

    public PayableInvoiceDetailResponseModel getListOfPayableInvoiceDetail(ReportRequestModel requestModel, PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel){

        return simpleAccountReportDao.getPayableInvoiceDetail(requestModel,payableInvoiceDetailResponseModel);
    }

    public CreditNoteDetailsResponseModel getListOfcreditNoteDetails(ReportRequestModel requestModel, CreditNoteDetailsResponseModel creditNoteDetailsResponseModel){

        return simpleAccountReportDao.getcreditNoteDetails(requestModel,creditNoteDetailsResponseModel);
    }

    public ExpenseDetailsResponseModel getListOfExpenseDetails(ReportRequestModel requestModel, ExpenseDetailsResponseModel expenseDetailsResponseModel){

        return simpleAccountReportDao.getExpenseDetails(requestModel,expenseDetailsResponseModel);
    }

    public ExpenseByCategoryResponseModel getListOfExpenseByCategory(ReportRequestModel requestModel, ExpenseByCategoryResponseModel expenseByCategoryResponseModel){

        return simpleAccountReportDao.getExpenseByCategoryDetails(requestModel,expenseByCategoryResponseModel);
    }

    public InvoiceDetailsResponseModel getListOfInvoiceDetails(ReportRequestModel requestModel, InvoiceDetailsResponseModel invoiceDetailsResponseModel){

        return simpleAccountReportDao.getInvoiceDetails(requestModel,invoiceDetailsResponseModel);
    }

    public SupplierInvoiceDetailsResponseModel getListOfSupplierInvoiceDetails(ReportRequestModel requestModel, SupplierInvoiceDetailsResponseModel supplierInvoiceDetailsResponseModel){

        return simpleAccountReportDao.getSupplierInvoiceDetails(requestModel,supplierInvoiceDetailsResponseModel);
    }
    public  PayrollSummaryResponseModel getListOfPayrollSummary(ReportRequestModel requestModel, PayrollSummaryResponseModel payrollSummaryResponseModel){
        return simpleAccountReportDao.getPayrollSummary(requestModel,payrollSummaryResponseModel);
    }

    @Override
    public StatementOfAccountResponseModel getSOA(StatementOfAccountRequestModel requestModel) {
        return simpleAccountReportDao.getSOA(requestModel);
    }

    @Override
    public FtaAuditResponseModel getFtaAuditReport(FtaAuditRequestModel requestModel) {
        return simpleAccountReportDao.getFtaAuditReport(requestModel);
    }

    @Override
    public FtaAuditResponseModel getFtaExciseAuditReport(FtaAuditRequestModel requestModel) {
        return simpleAccountReportDao.getFtaExciseAuditReport(requestModel);
    }
    @Override
    public AgingListModel getAgingReport(AgingRequestModel requestModel) {
        return simpleAccountReportDao.getAgingReport(requestModel);
    }
}
