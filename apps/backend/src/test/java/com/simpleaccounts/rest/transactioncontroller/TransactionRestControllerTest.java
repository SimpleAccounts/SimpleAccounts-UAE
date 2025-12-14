package com.simpleaccounts.rest.transactioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.TransactionExplanation;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.helper.TransactionHelper;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.TransactionExplanationLineItemRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.repository.TransactionRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.financialreport.VatRecordPaymentHistoryRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.receiptcontroller.ReceiptRestHelper;
import com.simpleaccounts.rest.reconsilationcontroller.ReconsilationRestHelper;
import com.simpleaccounts.rest.transactioncontroller.TransactionPresistModel;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxFilingRepository;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentHistoryRepository;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxPaymentRepository;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.CustomerInvoiceReceiptService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.PaymentService;
import com.simpleaccounts.service.ReceiptService;
import com.simpleaccounts.service.SupplierInvoicePaymentService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.TransactionExpensesPayrollService;
import com.simpleaccounts.service.TransactionExpensesService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import com.simpleaccounts.utils.OSValidator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TransactionRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("TransactionRestController Tests")
class TransactionRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;
    @MockBean
    private TransactionRepository transactionRepository;
    @MockBean
    private TransactionService transactionService;
    @MockBean
    private DateFormatHelper dateFormatHelper;
    @MockBean
    private BankAccountService bankAccountService;
    @MockBean
    private ChartOfAccountService chartOfAccountService;
    @MockBean
    private TransactionHelper transactionHelper;
    @MockBean
    private ChartUtil chartUtil;
    @MockBean
    private TransactionCategoryService transactionCategoryService;
    @MockBean
    private ReconsilationRestHelper reconsilationRestHelper;
    @MockBean
    private JournalService journalService;
    @MockBean
    private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockBean
    private VatCategoryService vatCategoryService;
    @MockBean
    private ContactService contactService;
    @MockBean
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;
    @MockBean
    private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @MockBean
    private TransactionStatusService transactionStatusService;
    @MockBean
    private UserService userService;
    @MockBean
    private InvoiceService invoiceService;
    @MockBean
    private ReceiptService receiptService;
    @MockBean
    private CustomerInvoiceReceiptService customerInvoiceReceiptService;
    @MockBean
    private ReceiptRestHelper receiptRestHelper;
    @MockBean
    private ExpenseService expenseService;
    @MockBean
    private TransactionExpensesService transactionExpensesService;
    @MockBean
    private TransactionExpensesPayrollService transactionExpensesPayrollService;
    @MockBean
    private PaymentService paymentService;
    @MockBean
    private SupplierInvoicePaymentService supplierInvoicePaymentService;
    @MockBean
    private CurrencyService currencyService;
    @MockBean
    private FileAttachmentService fileAttachmentService;
    @MockBean
    private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @MockBean
    private PayrollRepository payrollRepository;
    @MockBean
    private DateFormatUtil dateFormatUtil;
    @MockBean
    private FileHelper fileHelper;
    @MockBean
    private InvoiceNumberUtil invoiceNumberUtil;
    @MockBean
    private OSValidator osValidator;
    @MockBean
    private VatPaymentRepository vatPaymentRepository;
    @MockBean
    private VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;
    @MockBean
    private VatReportFilingRepository vatReportFilingRepository;
    @MockBean
    private JournalLineItemRepository journalLineItemRepository;
    @MockBean
    private TransactionExplanationRepository transactionExplanationRepository;
    @MockBean
    private TransactionExplanationLineItemRepository transactionExplanationLineItemRepository;
    @MockBean
    private ContactTransactionCategoryService contactTransactionCategoryService;
    @MockBean
    private CorporateTaxFilingRepository corporateTaxFilingRepository;
    @MockBean
    private CorporateTaxPaymentRepository corporateTaxPaymentRepository;
    @MockBean
    private CorporateTaxPaymentHistoryRepository corporateTaxPaymentHistoryRepository;
    @MockBean
    private CreditNoteRepository creditNoteRepository;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        String basePath() {
            return "/tmp";
        }
    }

    private BankAccount testBankAccount;
    private Transaction testTransaction;
    private TransactionCategory testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");

        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Account");
        testBankAccount.setCurrentBalance(new BigDecimal("1000.00"));
        testBankAccount.setTransactionCategory(testCategory);

        testTransaction = new Transaction();
        testTransaction.setTransactionId(1);
        testTransaction.setBankAccount(testBankAccount);
        testTransaction.setTransactionAmount(new BigDecimal("100.00"));
        testTransaction.setDebitCreditFlag('C');
        testTransaction.setTransactionDate(LocalDateTime.now());
        testTransaction.setDeleteFlag(false);
    }

    @Nested
    @DisplayName("GET /rest/transaction/list Tests")
    class GetTransactionListTests {

        @Test
        @DisplayName("Should return paginated transaction list")
        void shouldReturnPaginatedTransactionList() throws Exception {
            PaginationResponseModel responseModel = new PaginationResponseModel(1, new HashMap<>());
            when(transactionService.getAllTransactionList(any(), any())).thenReturn(responseModel);
            when(transactionHelper.getModelList(any())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/transaction/list")
                            .param("bankId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(1));
        }

        @Test
        @DisplayName("Should return error when service returns null")
        void shouldReturnErrorWhenServiceReturnsNull() throws Exception {
            when(transactionService.getAllTransactionList(any(), any())).thenReturn(null);

            mockMvc.perform(get("/rest/transaction/list")
                            .param("bankId", "1"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/getById Tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return transaction by id")
        void shouldReturnTransactionById() throws Exception {
            TransactionPresistModel model = new TransactionPresistModel();
            model.setTransactionId(1);

            when(transactionService.findByPK(1)).thenReturn(testTransaction);
            when(transactionExplanationRepository.getTransactionExplanationsByTransaction(testTransaction))
                    .thenReturn(Collections.emptyList());
            when(transactionHelper.getModel(any(Transaction.class), anyList()))
                    .thenReturn(Collections.singletonList(model));

            mockMvc.perform(get("/rest/transaction/getById")
                            .param("id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].transactionId").value(1));
        }

        @Test
        @DisplayName("Should return error when transaction not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(transactionService.findByPK(999)).thenReturn(null);
            when(transactionExplanationRepository.getTransactionExplanationsByTransaction(any(Transaction.class)))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/transaction/getById")
                            .param("id", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/getCashFlow Tests")
    class GetCashFlowDataTests {

        @Test
        @DisplayName("Should return cash flow data")
        void shouldReturnCashFlowData() throws Exception {
            Map<Object, Number> cashInData = new LinkedHashMap<>();
            cashInData.put("Jan", 1000);
            cashInData.put("Feb", 1500);

            Map<Object, Number> cashOutData = new LinkedHashMap<>();
            cashOutData.put("Jan", 500);
            cashOutData.put("Feb", 700);

            when(transactionService.getCashInData(any(), any())).thenReturn(cashInData);
            when(transactionService.getCashOutData(any(), any())).thenReturn(cashOutData);

            mockMvc.perform(get("/rest/transaction/getCashFlow")
                            .param("monthNo", "6"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/getExplainedTransactionCount Tests")
    class GetExplainedTransactionCountTests {

        @Test
        @DisplayName("Should return explained transaction count")
        void shouldReturnExplainedTransactionCount() throws Exception {
            when(transactionService.getTotalExplainedTransactionCountByBankAccountId(1)).thenReturn(5);

            mockMvc.perform(get("/rest/transaction/getExplainedTransactionCount")
                            .param("bankAccountId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(5));
        }
    }

    @Nested
    @DisplayName("DELETE /rest/transaction/deletes Tests")
    class DeleteMultipleTests {

        @Test
        @DisplayName("Should delete multiple transactions")
        void shouldDeleteMultipleTransactions() throws Exception {
            String requestBody = "{\"ids\":[1,2,3]}";

            mockMvc.perform(delete("/rest/transaction/deletes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isOk());

            verify(transactionService).deleteByIds(any());
        }
    }
}
