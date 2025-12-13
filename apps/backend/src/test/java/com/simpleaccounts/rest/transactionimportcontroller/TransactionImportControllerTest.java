package com.simpleaccounts.rest.transactionimportcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
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
@WebMvcTest(TransactionImportController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("TransactionImportController Tests")
class TransactionImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CsvParser csvParser;
    @MockBean
    private ExcelParser excelParser;
    @MockBean
    private FileHelper fileHelper;
    @MockBean
    private BankAccountService bankAccountService;
    @MockBean
    private TransactionService transactionService;
    @MockBean
    private UserService userServiceNew;
    @MockBean
    private TransactionParsingSettingService transactionParsingSettingService;
    @MockBean
    private TransactionParsingSettingRestHelper transactionParsingSettingRestHelper;
    @MockBean
    private TransactionImportRestHelper transactionImportRestHelper;
    @MockBean
    private JwtTokenUtil jwtTokenUtil;
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
    private User testUser;

    @BeforeEach
    void setUp() {
        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Account");
        testBankAccount.setCurrentBalance(new BigDecimal("1000.00"));

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
    }

    @Nested
    @DisplayName("GET /rest/transactionimport/getbankaccountlist Tests")
    class GetBankAccountListTests {

        @Test
        @DisplayName("Should return bank account list")
        void shouldReturnBankAccountList() throws Exception {
            List<BankAccount> bankAccounts = Collections.singletonList(testBankAccount);
            when(bankAccountService.getBankAccounts()).thenReturn(bankAccounts);

            mockMvc.perform(get("/rest/transactionimport/getbankaccountlist"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bankAccountId").value(1));
        }

        @Test
        @DisplayName("Should return not found when no bank accounts")
        void shouldReturnNotFoundWhenNoBankAccounts() throws Exception {
            when(bankAccountService.getBankAccounts()).thenReturn(null);

            mockMvc.perform(get("/rest/transactionimport/getbankaccountlist"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactionimport/getformatdate Tests")
    class GetDateFormatListTests {

        @Test
        @DisplayName("Should return date format list")
        void shouldReturnDateFormatList() throws Exception {
            mockMvc.perform(get("/rest/transactionimport/getformatdate"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /rest/transactionimport/save Tests")
    class SaveTransactionsTests {

        @Test
        @DisplayName("Should import transactions successfully")
        void shouldImportTransactionsSuccessfully() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

            Transaction transaction = new Transaction();
            transaction.setBankAccount(testBankAccount);
            List<Transaction> transactions = Collections.singletonList(transaction);

            when(transactionImportRestHelper.getEntity(any())).thenReturn(transactions);
            when(transactionService.saveTransactions(transactions))
                    .thenReturn("Total Transactions To Import 1 Transactions Imported 1");

            TransactionImportModel importModel = new TransactionImportModel();
            importModel.setBankId(1);

            mockMvc.perform(post("/rest/transactionimport/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(importModel)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return error when transaction list is null")
        void shouldReturnErrorWhenTransactionListIsNull() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionImportRestHelper.getEntity(any())).thenReturn(null);

            TransactionImportModel importModel = new TransactionImportModel();
            importModel.setBankId(1);

            mockMvc.perform(post("/rest/transactionimport/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(importModel)))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Should return error when save fails")
        void shouldReturnErrorWhenSaveFails() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

            Transaction transaction = new Transaction();
            List<Transaction> transactions = Collections.singletonList(transaction);

            when(transactionImportRestHelper.getEntity(any())).thenReturn(transactions);
            when(transactionService.saveTransactions(transactions)).thenReturn(null);

            TransactionImportModel importModel = new TransactionImportModel();
            importModel.setBankId(1);

            mockMvc.perform(post("/rest/transactionimport/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(importModel)))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("POST /rest/transactionimport/savewithtemplate Tests")
    class SaveWithTemplateTests {

        @Test
        @DisplayName("Should import transactions with template successfully")
        void shouldImportTransactionsWithTemplateSuccessfully() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

            Transaction transaction = new Transaction();
            transaction.setBankAccount(testBankAccount);
            List<Transaction> transactions = Collections.singletonList(transaction);

            when(transactionImportRestHelper.getEntityWithoutTemplate(any())).thenReturn(transactions);
            when(transactionService.saveTransactions(transactions))
                    .thenReturn("Total Transactions To Import 1 Transactions Imported 1");

            TransactionImportModel importModel = new TransactionImportModel();
            importModel.setBankId(1);

            mockMvc.perform(post("/rest/transactionimport/savewithtemplate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(importModel)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return error when save with template fails")
        void shouldReturnErrorWhenSaveWithTemplateFails() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(transactionImportRestHelper.getEntityWithoutTemplate(any())).thenReturn(null);

            TransactionImportModel importModel = new TransactionImportModel();
            importModel.setBankId(1);

            mockMvc.perform(post("/rest/transactionimport/savewithtemplate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(importModel)))
                    .andExpect(status().isInternalServerError());
        }
    }
}
