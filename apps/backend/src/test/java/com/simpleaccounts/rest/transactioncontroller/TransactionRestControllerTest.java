package com.simpleaccounts.rest.transactioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.helper.TransactionHelper;
import com.simpleaccounts.repository.TransactionRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.reconsilationcontroller.ReconsilationRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.InvoiceNumberUtil;
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
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;
    @MockBean
    private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @MockBean
    private TransactionStatusService transactionStatusService;
    @MockBean
    private UserService userService;
    @MockBean
    private DateFormatUtil dateFormatUtil;
    @MockBean
    private FileHelper fileHelper;
    @MockBean
    private InvoiceNumberUtil invoiceNumberUtil;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    // Adding MockBeans for all repositories and services referenced
    @MockBean(name = "customizeInvoiceTemplateService")
    private Object customizeInvoiceTemplateService;
    @MockBean(name = "vatPaymentRepository")
    private Object vatPaymentRepository;
    @MockBean(name = "vatRecordPaymentHistoryRepository")
    private Object vatRecordPaymentHistoryRepository;
    @MockBean(name = "vatReportFilingRepository")
    private Object vatReportFilingRepository;
    @MockBean(name = "receiptRestHelper")
    private Object receiptRestHelper;
    @MockBean(name = "creditNoteRepository")
    private Object creditNoteRepository;
    @MockBean(name = "corporateTaxPaymentHistoryRepository")
    private Object corporateTaxPaymentHistoryRepository;
    @MockBean(name = "corporateTaxPaymentRepository")
    private Object corporateTaxPaymentRepository;
    @MockBean(name = "invoiceRepository")
    private Object invoiceRepository;
    @MockBean(name = "expenseRepository")
    private Object expenseRepository;
    @MockBean(name = "invoiceService")
    private Object invoiceService;
    @MockBean(name = "expenseService")
    private Object expenseService;
    @MockBean(name = "currencyExchangeService")
    private Object currencyExchangeService;
    @MockBean(name = "debitNoteRepository")
    private Object debitNoteRepository;
    @MockBean(name = "debitNoteService")
    private Object debitNoteService;
    @MockBean(name = "creditNoteService")
    private Object creditNoteService;
    @MockBean(name = "journalLineItemRepository")
    private Object journalLineItemRepository;
    @MockBean(name = "receiptService")
    private Object receiptService;
    @MockBean(name = "receiptRepository")
    private Object receiptRepository;
    @MockBean(name = "coacTransactionCategoryService")
    private Object coacTransactionCategoryService;

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
    private User testUser;

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

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
    }

    @Nested
    @DisplayName("GET /rest/transaction/list Tests")
    class GetTransactionListTests {

        @Test
        @DisplayName("Should return paginated transaction list")
        void shouldReturnPaginatedTransactionList() throws Exception {
            PaginationResponseModel responseModel = new PaginationResponseModel(1, new HashMap<>());
            when(transactionService.getAllTransactionList(any(), any())).thenReturn(responseModel);
            when(transactionHelper.getListModel(any())).thenReturn(Collections.emptyList());

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
    @DisplayName("GET /rest/transaction/getbyid Tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return transaction by id")
        void shouldReturnTransactionById() throws Exception {
            TransactionRestModel model = new TransactionRestModel();
            model.setTransactionId(1);

            when(transactionService.findByPK(1)).thenReturn(testTransaction);
            when(transactionHelper.getModel(testTransaction)).thenReturn(model);

            mockMvc.perform(get("/rest/transaction/getbyid")
                            .param("id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value(1));
        }

        @Test
        @DisplayName("Should return error when transaction not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(transactionService.findByPK(999)).thenReturn(null);

            mockMvc.perform(get("/rest/transaction/getbyid")
                            .param("id", "999"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/getcashflowdata Tests")
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

            mockMvc.perform(get("/rest/transaction/getcashflowdata")
                            .param("monthNo", "6")
                            .param("bankId", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/getchildtransactions Tests")
    class GetChildTransactionsTests {

        @Test
        @DisplayName("Should return child transactions")
        void shouldReturnChildTransactions() throws Exception {
            List<Transaction> childTransactions = Collections.singletonList(testTransaction);
            when(transactionService.getChildTransactionListByParentId(1)).thenReturn(childTransactions);
            when(transactionHelper.getListModel(childTransactions)).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/transaction/getchildtransactions")
                            .param("parentId", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /rest/transaction/gettransactioncountbybank Tests")
    class GetTransactionCountByBankTests {

        @Test
        @DisplayName("Should return transaction counts")
        void shouldReturnTransactionCounts() throws Exception {
            when(transactionService.getTotalExplainedTransactionCountByBankAccountId(1)).thenReturn(5);
            when(transactionService.getTotalUnexplainedTransactionCountByBankAccountId(1)).thenReturn(3);
            when(transactionService.getTotalPartiallyExplainedTransactionCountByBankAccountId(1)).thenReturn(2);
            when(transactionService.getTotalAllTransactionCountByBankAccountId(1)).thenReturn(10);

            mockMvc.perform(get("/rest/transaction/gettransactioncountbybank")
                            .param("bankId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.explainedCount").value(5))
                    .andExpect(jsonPath("$.unexplainedCount").value(3))
                    .andExpect(jsonPath("$.partialCount").value(2))
                    .andExpect(jsonPath("$.total").value(10));
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

    @Nested
    @DisplayName("GET /rest/transaction/getcurrentbalance Tests")
    class GetCurrentBalanceTests {

        @Test
        @DisplayName("Should return current balance for bank")
        void shouldReturnCurrentBalanceForBank() throws Exception {
            when(transactionService.getCurrentBalanceByBankId(1)).thenReturn(new BigDecimal("1500.00"));

            mockMvc.perform(get("/rest/transaction/getcurrentbalance")
                            .param("bankId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(1500.00));
        }
    }
}
