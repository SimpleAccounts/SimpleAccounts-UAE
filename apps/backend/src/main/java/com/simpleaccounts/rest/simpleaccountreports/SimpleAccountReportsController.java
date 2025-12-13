package com.simpleaccounts.rest.simpleaccountreports;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountRequestModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/simpleaccountReports")
@RequiredArgsConstructor
public class SimpleAccountReportsController {

    private final Logger logger = LoggerFactory.getLogger(SimpleAccountReportsController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final simpleAccountReportRestHelper simpleAccountReportRestHelper;

    private final UserService userService;

    private final SimpleAccountReportDaoImpl simpleAccountReportDao;

    @LogRequest
    @ApiOperation(value = "Get salesbycustomer Report")
    @GetMapping(value = "/salesbycustomer")
    public ResponseEntity<SalesByCustomerResponseModel> getSalesbycustomer(ReportRequestModel requestModel,
                                                                HttpServletRequest request) {

        SalesByCustomerResponseModel salesByCustomerResponseModel = simpleAccountReportRestHelper.getSalesByCustomer(requestModel);
        try {
            if (salesByCustomerResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(salesByCustomerResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get purchasebyvendor Report")
    @GetMapping(value = "/purchasebyVendor")
    public ResponseEntity<PurchseByVendorResponseModel> getSalesbyVendor(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        PurchseByVendorResponseModel purchseByVendorResponseModel = simpleAccountReportRestHelper.getPurchaseByVendor(requestModel);
        try {
            if (purchseByVendorResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(purchseByVendorResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get salesbyproduct Report")
    @GetMapping(value = "/salesbyproduct")
    public ResponseEntity<SalesByProductResponseModel> getSalesByProduct(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        SalesByProductResponseModel salesByProductResponseModel = simpleAccountReportRestHelper.getSalesByProduct(requestModel);
        try {
            if (salesByProductResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(salesByProductResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get purchasebyproduct Report")
    @GetMapping(value = "/purchasebyproduct")
    public ResponseEntity<PurchaseByProductResponseModel> getPurchaseByProduct(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        PurchaseByProductResponseModel purchaseByProductResponseModel = simpleAccountReportRestHelper.getPurchaseByProduct(requestModel);
        try {
            if (purchaseByProductResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(purchaseByProductResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Receivable Invoice Summary Report")
    @GetMapping(value = "/ReceivableInvoiceSummary")
    public ResponseEntity<ReceivableInvoiceSummaryResponseModel> getReceivableInvoiceSummary(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        ReceivableInvoiceSummaryResponseModel receivableInvoiceSummaryResponseModel = simpleAccountReportRestHelper.getreceivableInvoiceSummary(requestModel);
        try {
            if (receivableInvoiceSummaryResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(receivableInvoiceSummaryResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get PayableInvoiceSummary Report")
    @GetMapping(value = "/PayableInvoiceSummary")
    public ResponseEntity<PayableInvoiceSummaryResponseModel> getPayableInvoiceSummary(ReportRequestModel requestModel,
                                                                                             HttpServletRequest request) {
        PayableInvoiceSummaryResponseModel payableInvoiceSummaryResponseModel = simpleAccountReportRestHelper.getPayableInvoiceSummary(requestModel);
        try {
            if (payableInvoiceSummaryResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(payableInvoiceSummaryResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get ReceivableInvoiceDetail Report")
    @GetMapping(value = "/ReceivableInvoiceDetail")
    public ResponseEntity<ReceivableInvoiceDetailResponseModel> getReceivableInvoiceDetail(ReportRequestModel requestModel,
                                                                                             HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        ReceivableInvoiceDetailResponseModel receivableInvoiceDetailResponseModel = simpleAccountReportRestHelper.getreceivableInvoiceDetail(requestModel);
        try {
            if (receivableInvoiceDetailResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(receivableInvoiceDetailResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get PayableInvoiceDetail Report")
    @GetMapping(value = "/PayableInvoiceDetail")
    public ResponseEntity<PayableInvoiceDetailResponseModel> getPayableInvoiceDetail(ReportRequestModel requestModel,
                                                                                           HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        PayableInvoiceDetailResponseModel payableInvoiceDetailResponseModel = simpleAccountReportRestHelper.getPayableInvoiceDetail(requestModel);
        try {
            if (payableInvoiceDetailResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(payableInvoiceDetailResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "credit Note details report")
    @GetMapping(value = "/creditNoteDetails")
    public ResponseEntity<CreditNoteDetailsResponseModel> getcreditNoteDetails(ReportRequestModel requestModel,
                                                                                  HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        CreditNoteDetailsResponseModel creditNoteDetailsResponseModel = simpleAccountReportRestHelper.getcreditNoteDetails(requestModel);
        try {
            if (creditNoteDetailsResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(creditNoteDetailsResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Expense details report")
    @GetMapping(value = "/ExpenseDetails")
    public ResponseEntity<ExpenseDetailsResponseModel> getExpenseDetails(ReportRequestModel requestModel,
                                                                               HttpServletRequest request) {
        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
        User user = userService.findByPK(userId);
        ExpenseDetailsResponseModel expenseDetailsResponseModel = simpleAccountReportRestHelper.getExpenseDetails(requestModel);
        try {
            if (expenseDetailsResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(expenseDetailsResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Reports : Expense By Category")
    @GetMapping(value = "/ExpenseByCategory")
    public ResponseEntity<ExpenseByCategoryResponseModel> getExpenseByCategory(ReportRequestModel requestModel,
                                                 HttpServletRequest request) {
        ExpenseByCategoryResponseModel expenseByCategoryResponseModel = simpleAccountReportRestHelper.getExpenseByCategoryDetails(requestModel);
        try {
            if (expenseByCategoryResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(expenseByCategoryResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get invoice Details")
    @GetMapping(value = "/invoiceDetails")
    public ResponseEntity<InvoiceDetailsResponseModel> getInvoiceDetails(ReportRequestModel requestModel,
                                                                                             HttpServletRequest request) {
        InvoiceDetailsResponseModel invoiceDetailsResponseModel = simpleAccountReportRestHelper.getInvoiceDetails(requestModel);
        try {
            if (invoiceDetailsResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(invoiceDetailsResponseModel, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Supplier Invoice Details")
    @GetMapping(value = "/supplierInvoiceDetails")
    public ResponseEntity<SupplierInvoiceDetailsResponseModel> getSupplierInvoiceDetails(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        SupplierInvoiceDetailsResponseModel supplierInvoiceDetailsResponseModel = simpleAccountReportRestHelper.getSupplierInvoiceDetails(requestModel);
        try {
            if (supplierInvoiceDetailsResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(supplierInvoiceDetailsResponseModel, HttpStatus.OK);
    }
    @LogRequest
    @ApiOperation(value = "Get Payroll Summary Report")
    @GetMapping(value = "/getPayrollSummary")
    public ResponseEntity<PayrollSummaryResponseModel> getPayrollSummary(ReportRequestModel requestModel,
                                                                         HttpServletRequest request) {
        PayrollSummaryResponseModel payrollSummaryResponseModel = simpleAccountReportRestHelper.getPayrollSummary(requestModel);
        try {
            if (payrollSummaryResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(payrollSummaryResponseModel, HttpStatus.OK);
    }

    /**Created By Suraj Rahade For SOA Report
     *
     * The Statement of Account (SOA) is both a property tax bill
     * and account summary.
     * It displays all current and future property taxes due.
     *  @param requestModel
     * @param request
     * @return
     */
    @LogRequest
    @ApiOperation(value = "Get statement Of Account Details")
    @GetMapping(value = "/StatementOfAccountReport")
    public ResponseEntity<StatementOfAccountResponseModel> getSOA(StatementOfAccountRequestModel requestModel,
                                                                  HttpServletRequest request) {
        StatementOfAccountResponseModel statementOfAccountResponseModel = simpleAccountReportRestHelper.getSOADetails(requestModel);
        try {
            if (statementOfAccountResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(statementOfAccountResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get FTA Audit Report")
    @GetMapping(value = "/getFtaAuditReport")
    public ResponseEntity<FtaAuditResponseModel> getFtaAuditReport(FtaAuditRequestModel requestModel,
                                                                   HttpServletRequest request) {
        FtaAuditResponseModel ftaAuditResponseModel = simpleAccountReportRestHelper.getFtaAuditReport(requestModel);
        try {
            if (ftaAuditResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(ftaAuditResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get FTA Excise Audit Report")
    @GetMapping(value = "/getFtaExciseAuditReport")
    public ResponseEntity<FtaAuditResponseModel> getFtaExciseAuditReport(FtaAuditRequestModel requestModel,
                                                                   HttpServletRequest request) {
        FtaAuditResponseModel ftaAuditResponseModel = simpleAccountReportRestHelper.getFtaExciseAuditReport(requestModel);
        try {
            if (ftaAuditResponseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(ftaAuditResponseModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Aging Report")
    @GetMapping(value = "/getAgingReport")
    public ResponseEntity<AgingListModel> getAgingReport(AgingRequestModel requestModel,
                                                         HttpServletRequest request) {
        AgingListModel agingListModel = simpleAccountReportRestHelper.getAgingReport(requestModel);
        try {
            if (agingListModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(agingListModel, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Statement of Accounts Report")
    @GetMapping(value = "/statementOfAccounts")
    public ResponseEntity<Object> getStatementOfAccounts(ReportRequestModel requestModel,@RequestParam(value = "contactId",required = false) Integer contactId,
                                                                           HttpServletRequest request) {
        ResponseModelStatementOfAccounts responseModelStatementOfAccounts = simpleAccountReportDao.getStatementOfAccounts(requestModel,contactId);
        try {
            if (responseModelStatementOfAccounts == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(responseModelStatementOfAccounts, HttpStatus.OK);
    }
    @LogRequest
    @ApiOperation(value = "Get Statement of Accounts Report For Supplier ")
    @GetMapping(value = "/supplierStatementOfAccounts")
    public ResponseEntity<Object> getsupplierStatementOfAccounts(ReportRequestModel requestModel,@RequestParam(value = "contactId",required = false) Integer contactId,
                                                    HttpServletRequest request) {
        ResponseModelStatementOfAccounts responseModelStatementOfAccounts = simpleAccountReportDao.getsupplierStatementOfAccounts(requestModel,contactId);
        try {
            if (responseModelStatementOfAccounts == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(responseModelStatementOfAccounts, HttpStatus.OK);
    }
}
