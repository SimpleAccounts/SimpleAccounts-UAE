package com.simpleaccounts.rest.transactioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.helper.TransactionHelper;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxFilingRepository;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentHistoryRepository;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.financialreport.VatRecordPaymentHistoryRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.receiptcontroller.ReceiptRestHelper;
import com.simpleaccounts.rest.reconsilationcontroller.ReconsilationRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.service.impl.TransactionCategoryClosingBalanceServiceImpl;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TransactionRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private TransactionRepository transactionRepository;
    @MockBean private TransactionService transactionService;
    @MockBean private DateFormatHelper dateFormatHelper;
    @MockBean private TransactionCategoryClosingBalanceServiceImpl transactionCategoryClosingBalanceService;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private ChartOfAccountService chartOfAccountService;
    @MockBean private TransactionHelper transactionHelper;
    @MockBean private ChartUtil chartUtil;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private ReconsilationRestHelper reconsilationRestHelper;
    @MockBean private JournalService journalService;
    @MockBean private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private ContactService contactService;
    @MockBean private TransactionStatusService transactionStatusService;
    @MockBean private FileHelper fileHelper;
    @MockBean private InvoiceService invoiceService;
    @MockBean private ReceiptService receiptService;
    @MockBean private CustomerInvoiceReceiptService customerInvoiceReceiptService;
    @MockBean private ReceiptRestHelper receiptRestHelper;
    @MockBean private ExpenseService expenseService;
    @MockBean private TransactionExpensesService transactionExpensesService;
    @MockBean private TransactionExpensesPayrollService transactionExpensesPayrollService;
    @MockBean private PaymentService paymentService;
    @MockBean private SupplierInvoicePaymentService supplierInvoicePaymentService;
    @MockBean private UserService userService;
    @MockBean private CurrencyService currencyService;
    @MockBean private FileAttachmentService fileAttachmentService;
    @MockBean private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @MockBean private PayrollRepository payrollRepository;
    @MockBean private InvoiceNumberUtil invoiceNumberUtil;
    @MockBean private VatPaymentRepository vatPaymentRepository;
    @MockBean private VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;
    @MockBean private VatReportFilingRepository vatReportFilingRepository;
    @MockBean private JournalLineItemRepository journalLineItemRepository;
    @MockBean private DateFormatUtil dateFormtUtil;
    @MockBean private TransactionExplanationRepository transactionExplanationRepository;
    @MockBean private TransactionExplanationLineItemRepository transactionExplanationLineItemRepository;
    @MockBean private ContactTransactionCategoryService contactTransactionCategoryService;
    @MockBean private CorporateTaxFilingRepository corporateTaxFilingRepository;
    @MockBean private CorporateTaxPaymentRepository corporateTaxPaymentRepository;
    @MockBean private CorporateTaxPaymentHistoryRepository corporateTaxPaymentHistoryRepository;
    @MockBean private CreditNoteRepository creditNoteRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private Transaction testTransaction;
    private BankAccount testBankAccount;
    private TransactionCategory testCategory;

    @BeforeEach
    void setUp() {
        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Bank Account");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");

        testTransaction = new Transaction();
        testTransaction.setTransactionId(1);
        testTransaction.setTransactionAmount(new BigDecimal("1000.00"));
        testTransaction.setTransactionDate(LocalDateTime.now());
        testTransaction.setBankAccount(testBankAccount);
        testTransaction.setExplainedTransactionCategory(testCategory);
        testTransaction.setTransactionExplinationStatus(TransactionExplinationStatusEnum.NOT_EXPLAIN);
        testTransaction.setDeleteFlag(false);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    }

    @Test
    void getAllTransactionShouldReturnPaginatedList() throws Exception {
        List<Transaction> transactionList = Arrays.asList(testTransaction);
        PaginationResponseModel response = new PaginationResponseModel(1, transactionList);

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        verify(transactionService).getAllTransactionList(any(), any());
    }

    @Test
    void getAllTransactionShouldReturnNotFoundWhenNull() throws Exception {
        when(transactionService.getAllTransactionList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllTransactionShouldHandleBankIdFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(bankAccountService.findByPK(1)).thenReturn(testBankAccount);
        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("bankId", "1"))
                .andExpect(status().isOk());

        verify(bankAccountService).findByPK(1);
    }

    @Test
    void getAllTransactionShouldHandleTransactionDateFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("transactionDate", "01-01-2024"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandlePotentialDuplicateFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("transactionType", "POTENTIAL_DUPLICATE"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandleNotExplainFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("transactionType", "NOT_EXPLAIN"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandleTransactionStatusFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionStatusService.findByPK(any())).thenReturn(null);
        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("transactionStatusCode", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandleChartOfAccountFilter() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(chartOfAccountService.findByPK(any())).thenReturn(null);
        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("chartOfAccountId", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldDefaultSortingColumn() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandleEmptyList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void getAllTransactionShouldHandleMultipleTransactions() throws Exception {
        List<Transaction> transactionList = Arrays.asList(testTransaction, testTransaction, testTransaction);
        PaginationResponseModel response = new PaginationResponseModel(3, transactionList);

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));
    }

    @Test
    void deleteTransactionShouldReturnSuccess() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(testTransaction);

        mockMvc.perform(delete("/rest/transaction/delete")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        verify(transactionService).findByPK(1);
        verify(transactionService).update(testTransaction);
    }

    @Test
    void deleteTransactionShouldHandleNullTransaction() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(null);

        mockMvc.perform(delete("/rest/transaction/delete")
                        .param("id", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void deletesTransactionShouldDeleteMultiple() throws Exception {
        mockMvc.perform(delete("/rest/transaction/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        verify(transactionService).deleteByIds(any());
    }

    @Test
    void changeStatusShouldUpdateTransactionStatus() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(testTransaction);
        when(transactionStatusService.findByPK(2)).thenReturn(null);

        mockMvc.perform(post("/rest/transaction/changestatus")
                        .param("transactionId", "1")
                        .param("statusCode", "2"))
                .andExpect(status().isOk());

        verify(transactionService).findByPK(1);
        verify(transactionService).update(testTransaction);
    }

    @Test
    void getByIdShouldReturnTransaction() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(testTransaction);
        when(transactionHelper.getModel(testTransaction)).thenReturn(new TransactionListModel());

        mockMvc.perform(get("/rest/transaction/getById")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(transactionService).findByPK(1);
    }

    @Test
    void getByIdShouldReturnNotFoundWhenNull() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/transaction/getById")
                        .param("id", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCashFlowShouldReturnData() throws Exception {
        when(transactionService.getTotalCashFlow(any())).thenReturn(new BigDecimal("5000.00"));

        mockMvc.perform(get("/rest/transaction/getCashFlow")
                        .param("startDate", "01-01-2024")
                        .param("endDate", "31-12-2024"))
                .andExpect(status().isOk());

        verify(transactionService).getTotalCashFlow(any());
    }

    @Test
    void getCashFlowShouldHandleNullResult() throws Exception {
        when(transactionService.getTotalCashFlow(any())).thenReturn(null);

        mockMvc.perform(get("/rest/transaction/getCashFlow")
                        .param("startDate", "01-01-2024")
                        .param("endDate", "31-12-2024"))
                .andExpect(status().isOk());
    }

    @Test
    void getExplainedTransactionCountShouldReturnCount() throws Exception {
        when(transactionService.getExplainedTransactionCount()).thenReturn(10L);

        mockMvc.perform(get("/rest/transaction/getExplainedTransactionCount"))
                .andExpect(status().isOk())
                .andExpect(content().string("10"));

        verify(transactionService).getExplainedTransactionCount();
    }

    @Test
    void getExplainedTransactionCountShouldHandleZero() throws Exception {
        when(transactionService.getExplainedTransactionCount()).thenReturn(0L);

        mockMvc.perform(get("/rest/transaction/getExplainedTransactionCount"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));
    }

    @Test
    void getAllTransactionShouldHandlePaginationParameters() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(100, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("page", "1")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(100));
    }

    @Test
    void getAllTransactionShouldHandleMultipleFilters() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(5, new ArrayList<>());

        when(bankAccountService.findByPK(1)).thenReturn(testBankAccount);
        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("bankId", "1")
                        .param("transactionDate", "01-01-2024")
                        .param("transactionType", "NOT_EXPLAIN"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteTransactionShouldSetDeleteFlag() throws Exception {
        when(transactionService.findByPK(1)).thenReturn(testTransaction);

        mockMvc.perform(delete("/rest/transaction/delete")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(transactionService).update(testTransaction);
    }

    @Test
    void changeStatusShouldHandleNullTransaction() throws Exception {
        when(transactionService.findByPK(999)).thenReturn(null);

        mockMvc.perform(post("/rest/transaction/changestatus")
                        .param("transactionId", "999")
                        .param("statusCode", "2"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldTransformDataWithHelper() throws Exception {
        List<Transaction> transactions = Arrays.asList(testTransaction);
        PaginationResponseModel response = new PaginationResponseModel(1, transactions);
        List<TransactionListModel> models = new ArrayList<>();

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(transactions)).thenReturn(models);

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk());

        verify(transactionHelper).getModelList(transactions);
    }

    @Test
    void deletesShouldHandleEmptyList() throws Exception {
        mockMvc.perform(delete("/rest/transaction/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[]}"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllTransactionShouldHandleInvalidDateFormat() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list")
                        .param("transactionDate", "invalid-date"))
                .andExpect(status().isOk());
    }

    @Test
    void getByIdShouldHandleDifferentIds() throws Exception {
        when(transactionService.findByPK(999)).thenReturn(testTransaction);
        when(transactionHelper.getModel(testTransaction)).thenReturn(new TransactionListModel());

        mockMvc.perform(get("/rest/transaction/getById")
                        .param("id", "999"))
                .andExpect(status().isOk());

        verify(transactionService).findByPK(999);
    }

    @Test
    void getCashFlowShouldHandleDifferentDateRanges() throws Exception {
        when(transactionService.getTotalCashFlow(any())).thenReturn(new BigDecimal("10000.00"));

        mockMvc.perform(get("/rest/transaction/getCashFlow")
                        .param("startDate", "01-06-2024")
                        .param("endDate", "30-06-2024"))
                .andExpect(status().isOk());
    }

    @Test
    void getExplainedTransactionCountShouldHandleLargeNumbers() throws Exception {
        when(transactionService.getExplainedTransactionCount()).thenReturn(999999L);

        mockMvc.perform(get("/rest/transaction/getExplainedTransactionCount"))
                .andExpect(status().isOk())
                .andExpect(content().string("999999"));
    }

    @Test
    void getAllTransactionShouldSetDeleteFlagToFalse() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk());

        verify(transactionService).getAllTransactionList(any(), any());
    }

    @Test
    void getAllTransactionShouldOrderByDescending() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionService.getAllTransactionList(any(), any())).thenReturn(response);
        when(transactionHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transaction/list"))
                .andExpect(status().isOk());
    }
}
