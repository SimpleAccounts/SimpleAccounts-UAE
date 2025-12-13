package com.simpleaccounts.rest.bankaccountcontroller;

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
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.model.BankModel;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.BankAccountStatusService;
import com.simpleaccounts.service.BankAccountTypeService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
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
@WebMvcTest(BankAccountController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("BankAccountController Tests")
class BankAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BankAccountService bankAccountService;
    @MockBean
    private JournalService journalService;
    @MockBean
    private CoacTransactionCategoryService coacTransactionCategoryService;
    @MockBean
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;
    @MockBean
    private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @MockBean
    private BankAccountStatusService bankAccountStatusService;
    @MockBean
    private UserService userServiceNew;
    @MockBean
    private CurrencyService currencyService;
    @MockBean
    private BankAccountTypeService bankAccountTypeService;
    @MockBean
    private CountryService countryService;
    @MockBean
    private BankAccountRestHelper bankAccountRestHelper;
    @MockBean
    private TransactionCategoryService transactionCategoryService;
    @MockBean
    private ExpenseService expenseService;
    @MockBean
    private JwtTokenUtil jwtTokenUtil;
    @MockBean
    private TransactionService transactionService;
    @MockBean
    private CurrencyExchangeService currencyExchangeService;
    @MockBean
    private UserService userService;
    @MockBean
    private JournalLineItemRepository journalLineItemRepository;
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
    private TransactionCategory testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");

        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Account");
        testBankAccount.setBankName("Test Bank");
        testBankAccount.setCurrentBalance(new BigDecimal("1000.00"));
        testBankAccount.setTransactionCategory(testCategory);

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
    }

    @Nested
    @DisplayName("GET /rest/bank/list Tests")
    class GetBankAccountListTests {

        @Test
        @DisplayName("Should return bank account list")
        void shouldReturnBankAccountList() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(testUser);

            PaginationResponseModel responseModel = new PaginationResponseModel(1, new HashMap<>());
            when(bankAccountService.getBankAccounts(any(), any())).thenReturn(responseModel);
            when(bankAccountRestHelper.getListModel(responseModel)).thenReturn(responseModel);

            mockMvc.perform(get("/rest/bank/list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(1));
        }

        @Test
        @DisplayName("Should return internal server error when service returns null")
        void shouldReturnErrorWhenServiceReturnsNull() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(testUser);
            when(bankAccountService.getBankAccounts(any(), any())).thenReturn(null);

            mockMvc.perform(get("/rest/bank/list"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getbyid Tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return bank account by id")
        void shouldReturnBankAccountById() throws Exception {
            BankModel bankModel = new BankModel();
            bankModel.setBankAccountId(1);
            bankModel.setBankAccountName("Test Account");

            when(bankAccountService.findByPK(1)).thenReturn(testBankAccount);
            when(transactionCategoryClosingBalanceService.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(null);
            when(bankAccountRestHelper.getModel(testBankAccount)).thenReturn(bankModel);

            mockMvc.perform(get("/rest/bank/getbyid").param("id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bankAccountId").value(1));
        }

        @Test
        @DisplayName("Should include closing balance when exists")
        void shouldIncludeClosingBalanceWhenExists() throws Exception {
            BankModel bankModel = new BankModel();
            bankModel.setBankAccountId(1);

            TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
            closingBalance.setClosingBalance(new BigDecimal("500.00"));
            closingBalance.setBankAccountClosingBalance(new BigDecimal("500.00"));

            when(bankAccountService.findByPK(1)).thenReturn(testBankAccount);
            when(transactionCategoryClosingBalanceService.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(closingBalance);
            when(bankAccountRestHelper.getModel(testBankAccount)).thenReturn(bankModel);

            mockMvc.perform(get("/rest/bank/getbyid").param("id", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getaccounttype Tests")
    class GetAccountTypeTests {

        @Test
        @DisplayName("Should return bank account types")
        void shouldReturnBankAccountTypes() throws Exception {
            BankAccountType accountType = new BankAccountType();
            accountType.setBankAccountTypeName("Checking");
            List<BankAccountType> types = Collections.singletonList(accountType);

            when(bankAccountTypeService.getBankAccountTypeList()).thenReturn(types);

            mockMvc.perform(get("/rest/bank/getaccounttype"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bankAccountTypeName").value("Checking"));
        }

        @Test
        @DisplayName("Should return not found when no account types exist")
        void shouldReturnNotFoundWhenNoTypes() throws Exception {
            when(bankAccountTypeService.getBankAccountTypeList()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/bank/getaccounttype"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getbankaccountstatus Tests")
    class GetBankAccountStatusTests {

        @Test
        @DisplayName("Should return bank account statuses")
        void shouldReturnBankAccountStatuses() throws Exception {
            BankAccountStatus status = new BankAccountStatus();
            status.setBankAccountStatusName("Active");
            List<BankAccountStatus> statuses = Collections.singletonList(status);

            when(bankAccountStatusService.getBankAccountStatuses()).thenReturn(statuses);

            mockMvc.perform(get("/rest/bank/getbankaccountstatus"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bankAccountStatusName").value("Active"));
        }

        @Test
        @DisplayName("Should return not found when no statuses exist")
        void shouldReturnNotFoundWhenNoStatuses() throws Exception {
            when(bankAccountStatusService.getBankAccountStatuses()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/bank/getbankaccountstatus"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getcountry Tests")
    class GetCountryTests {

        @Test
        @DisplayName("Should return countries")
        void shouldReturnCountries() throws Exception {
            Country country = new Country();
            country.setCountryName("UAE");
            List<Country> countries = Collections.singletonList(country);

            when(countryService.getCountries()).thenReturn(countries);

            mockMvc.perform(get("/rest/bank/getcountry"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].countryName").value("UAE"));
        }

        @Test
        @DisplayName("Should return not found when no countries exist")
        void shouldReturnNotFoundWhenNoCountries() throws Exception {
            when(countryService.getCountries()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/bank/getcountry"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getBankChart Tests")
    class GetBankChartTests {

        @Test
        @DisplayName("Should return empty data when no bank id provided")
        void shouldReturnEmptyDataWhenNoBankId() throws Exception {
            mockMvc.perform(get("/rest/bank/getBankChart"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return chart data when bank id provided")
        void shouldReturnChartDataWhenBankIdProvided() throws Exception {
            DashBoardBankDataModel chartData = new DashBoardBankDataModel();
            chartData.setAccount_name("Test Account");
            chartData.setBalance(new BigDecimal("1000.00"));

            when(bankAccountRestHelper.getBankBalanceList(1, 6)).thenReturn(chartData);

            mockMvc.perform(get("/rest/bank/getBankChart")
                            .param("bankId", "1")
                            .param("monthCount", "6"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getTotalBalance Tests")
    class GetTotalBalanceTests {

        @Test
        @DisplayName("Should return total balance")
        void shouldReturnTotalBalance() throws Exception {
            BigDecimal totalBalance = new BigDecimal("5000.00");
            when(bankAccountService.getAllBankAccountsTotalBalance()).thenReturn(totalBalance);

            mockMvc.perform(get("/rest/bank/getTotalBalance"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(5000.00));
        }

        @Test
        @DisplayName("Should return zero when no balance")
        void shouldReturnZeroWhenNoBalance() throws Exception {
            when(bankAccountService.getAllBankAccountsTotalBalance()).thenReturn(null);

            mockMvc.perform(get("/rest/bank/getTotalBalance"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(0));
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getBankNameList Tests")
    class GetBankNameListTests {

        @Test
        @DisplayName("Should return bank name list")
        void shouldReturnBankNameList() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(testUser);

            BankDetails bankDetails = new BankDetails();
            bankDetails.setBankName("Test Bank");
            List<BankDetails> bankDetailsList = Collections.singletonList(bankDetails);

            when(bankAccountService.getBankNameList()).thenReturn(bankDetailsList);

            mockMvc.perform(get("/rest/bank/getBankNameList"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].bankName").value("Test Bank"));
        }
    }

    @Nested
    @DisplayName("GET /rest/bank/getcurrenncy Tests")
    class GetCurrencyTests {

        @Test
        @DisplayName("Should return currencies")
        void shouldReturnCurrencies() throws Exception {
            Currency currency = new Currency();
            currency.setCurrencyCode("AED");
            List<Currency> currencies = Collections.singletonList(currency);

            when(currencyService.getCurrencies()).thenReturn(currencies);

            mockMvc.perform(get("/rest/bank/getcurrenncy"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].currencyCode").value("AED"));
        }

        @Test
        @DisplayName("Should return not found when no currencies exist")
        void shouldReturnNotFoundWhenNoCurrencies() throws Exception {
            when(currencyService.getCurrencies()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/bank/getcurrenncy"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /rest/bank/multiple Tests")
    class DeleteMultipleTests {

        @Test
        @DisplayName("Should delete multiple bank accounts")
        void shouldDeleteMultipleBankAccounts() throws Exception {
            String requestBody = "{\"ids\":[1,2,3]}";

            mockMvc.perform(delete("/rest/bank/multiple")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("0074"));

            verify(bankAccountService).deleteByIds(any());
        }
    }
}
