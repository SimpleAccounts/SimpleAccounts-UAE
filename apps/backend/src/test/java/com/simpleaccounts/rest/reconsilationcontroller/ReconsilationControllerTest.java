package com.simpleaccounts.rest.reconsilationcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.TransactionExpensesRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.impl.TransactionCategoryClosingBalanceServiceImpl;
import com.simpleaccounts.utils.OSValidator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.cache.autoconfigure.CacheAutoConfiguration;
import org.springframework.boot.http.converter.autoconfigure.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ReconsilationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration({CacheAutoConfiguration.class, JacksonAutoConfiguration.class, HttpMessageConvertersAutoConfiguration.class})
@TestPropertySource(properties = {"spring.cache.type=simple"})
@Import(ReconsilationControllerTest.StaticResourceConfigMocks.class)
class ReconsilationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private ReconcileStatusService reconcileStatusService;
    @MockitoBean private BankAccountService bankAccountService;
    @MockitoBean private TransactionCategoryService transactionCategoryService;
    @MockitoBean private ReconsilationRestHelper reconsilationRestHelper;
    @MockitoBean private InvoiceService invoiceService;
    @MockitoBean private TranscationCategoryHelper transcationCategoryHelper;
    @MockitoBean private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockitoBean private VatCategoryService vatCategoryService;
    @MockitoBean private ContactService contactService;
    @MockitoBean private UserService userServiceNew;
    @MockitoBean private TransactionService transactionService;
    @MockitoBean private TransactionCategoryClosingBalanceServiceImpl transactionCategoryClosingBalanceService;
    @MockitoBean private TransactionExpensesRepository transactionExpensesRepository;
    @MockitoBean private OSValidator osValidator;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;
    @MockitoBean private JwtTokenUtil jwtTokenUtil;

    @TestConfiguration
    static class StaticResourceConfigMocks {
        @Bean
        String basePath() {
            return "/tmp";
        }

        @Bean
        com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            return mapper;
        }
    }

    @Test
    void listShouldReturnHelperData() throws Exception {
        BankAccount account = new BankAccount();
        when(bankAccountService.findByPK(5)).thenReturn(account);

        PaginationResponseModel responseModel = new PaginationResponseModel(1, new HashMap<>());
        when(reconcileStatusService.getAllReconcileStatusList(any(), any()))
                .thenReturn(responseModel);

        ReconcileStatusListModel model = new ReconcileStatusListModel();
        model.setReconcileId(10);
        model.setReconciledDate("2024-11-01");
        model.setClosingBalance(BigDecimal.TEN);
        List<ReconcileStatusListModel> helperList = Collections.singletonList(model);
        when(reconsilationRestHelper.getModelList(any())).thenReturn(helperList);

        mockMvc.perform(get("/rest/reconsile/list").param("bankId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.data[0].reconcileId").value(10));

        verify(bankAccountService).findByPK(5);
        verify(reconcileStatusService).getAllReconcileStatusList(any(), any());
        verify(reconsilationRestHelper).getModelList(any());
    }

    @Test
    void saveShouldPersistReconcileStatus() throws Exception {
        BankAccount account = new BankAccount();
        when(bankAccountService.getBankAccountById(8)).thenReturn(account);

        mockMvc.perform(post("/rest/reconsile/save")
                        .param("bankAccountId", "8")
                        .param("closingBalance", "250.00"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Saved Successfully")));

        ArgumentCaptor<ReconcileStatus> captor = ArgumentCaptor.forClass(ReconcileStatus.class);
        verify(reconcileStatusService).persist(captor.capture());
        ReconcileStatus saved = captor.getValue();
        assertThat(saved.getBankAccount()).isSameAs(account);
        assertThat(saved.getClosingBalance()).isEqualByComparingTo("250.00");
    }

    @Test
    void reconcileNowShouldReturnClosingBalanceMismatchStatus() throws Exception {
        LocalDateTime reconcileDate = LocalDateTime.of(2024, 12, 1, 0, 0);
        LocalDateTime startDate = reconcileDate.minusDays(5);
        TransactionCategory category = new TransactionCategory();
        BankAccount bankAccount = new BankAccount();
        bankAccount.setTransactionCategory(category);

        when(reconsilationRestHelper.getDateFromRequest(any())).thenReturn(reconcileDate);
        when(reconsilationRestHelper.getReconcileStatus(any())).thenReturn(null);
        when(transactionService.getTransactionStartDateToReconcile(any(), any())).thenReturn(startDate);
        when(transactionService.isTransactionsReadyForReconcile(any(), any(), any())).thenReturn(0);
        when(bankAccountService.getBankAccountById(9)).thenReturn(bankAccount);
        when(transactionCategoryClosingBalanceService.matchClosingBalanceForReconcile(reconcileDate, category))
                .thenReturn(new BigDecimal("999.99"));

        mockMvc.perform(post("/rest/reconsile/reconcilenow")
                        .param("bankId", "9")
                        .param("closingBalance", "150.00")
                        .param("date", "2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(2))
                .andExpect(jsonPath("$.message", Matchers.containsString("Closing Balance")));
    }

    @Test
    void reconcileNowShouldReturnUnexplainedTransactionsMessage() throws Exception {
        LocalDateTime reconcileDate = LocalDateTime.of(2024, 12, 1, 0, 0);
        LocalDateTime startDate = reconcileDate.minusDays(5);

        when(reconsilationRestHelper.getDateFromRequest(any())).thenReturn(reconcileDate);
        when(reconsilationRestHelper.getReconcileStatus(any())).thenReturn(null);
        when(transactionService.getTransactionStartDateToReconcile(any(), any())).thenReturn(startDate);
        when(transactionService.isTransactionsReadyForReconcile(any(), any(), any())).thenReturn(5);

        mockMvc.perform(post("/rest/reconsile/reconcilenow")
                        .param("bankId", "9")
                        .param("closingBalance", "150.00")
                        .param("date", "2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(4))
                .andExpect(jsonPath("$.message", Matchers.containsString("unexplained transactions")));
    }

    @Test
    void reconcileNowShouldReturnAlreadyReconciledMessage() throws Exception {
        LocalDateTime reconcileDate = LocalDateTime.of(2024, 12, 1, 0, 0);
        ReconcileStatus existingStatus = new ReconcileStatus();
        existingStatus.setReconciledDate(reconcileDate);

        when(reconsilationRestHelper.getDateFromRequest(any())).thenReturn(reconcileDate);
        when(reconsilationRestHelper.getReconcileStatus(any())).thenReturn(existingStatus);
        when(transactionService.isTransactionsReadyForReconcile(any(), any(), any())).thenReturn(-1);

        mockMvc.perform(post("/rest/reconsile/reconcilenow")
                        .param("bankId", "9")
                        .param("closingBalance", "150.00")
                        .param("date", "2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(3))
                .andExpect(jsonPath("$.message", Matchers.containsString("already reconciled")));
    }

    @Test
    void reconcileNowShouldReturnSuccessWhenBalancesMatch() throws Exception {
        LocalDateTime reconcileDate = LocalDateTime.of(2024, 12, 1, 0, 0);
        LocalDateTime startDate = reconcileDate.minusDays(5);
        TransactionCategory category = new TransactionCategory();
        BankAccount bankAccount = new BankAccount();
        bankAccount.setTransactionCategory(category);

        when(reconsilationRestHelper.getDateFromRequest(any())).thenReturn(reconcileDate);
        when(reconsilationRestHelper.getReconcileStatus(any())).thenReturn(null);
        when(transactionService.getTransactionStartDateToReconcile(any(), any())).thenReturn(startDate);
        when(transactionService.isTransactionsReadyForReconcile(any(), any(), any())).thenReturn(0);
        when(bankAccountService.getBankAccountById(9)).thenReturn(bankAccount);
        when(bankAccountService.findByPK(9)).thenReturn(bankAccount);
        when(transactionCategoryClosingBalanceService.matchClosingBalanceForReconcile(reconcileDate, category))
                .thenReturn(new BigDecimal("150.00"));

        mockMvc.perform(post("/rest/reconsile/reconcilenow")
                        .param("bankId", "9")
                        .param("closingBalance", "150.00")
                        .param("date", "2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(1))
                .andExpect(jsonPath("$.message", Matchers.containsString("Successfully")));

        verify(reconcileStatusService).persist(any(ReconcileStatus.class));
    }

    @Test
    void reconcileNowShouldReturnNullStartDateMessage() throws Exception {
        LocalDateTime reconcileDate = LocalDateTime.of(2024, 12, 1, 0, 0);

        when(reconsilationRestHelper.getDateFromRequest(any())).thenReturn(reconcileDate);
        when(reconsilationRestHelper.getReconcileStatus(any())).thenReturn(null);
        when(transactionService.getTransactionStartDateToReconcile(any(), any())).thenReturn(null);

        mockMvc.perform(post("/rest/reconsile/reconcilenow")
                        .param("bankId", "9")
                        .param("closingBalance", "150.00")
                        .param("date", "2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(3))
                .andExpect(jsonPath("$.message", Matchers.containsString("transaction date")));
    }

    @Test
    void deletesShouldDeleteReconcileStatusRows() throws Exception {
        mockMvc.perform(delete("/rest/reconsile/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted")));

        verify(reconcileStatusService).deleteByIds(any());
    }

    @Test
    void listShouldReturnNotFoundWhenServiceReturnsNull() throws Exception {
        BankAccount account = new BankAccount();
        when(bankAccountService.findByPK(5)).thenReturn(account);
        when(reconcileStatusService.getAllReconcileStatusList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/reconsile/list").param("bankId", "5"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listShouldHandleNoFilters() throws Exception {
        PaginationResponseModel responseModel = new PaginationResponseModel(0, new HashMap<>());
        when(reconcileStatusService.getAllReconcileStatusList(any(), any())).thenReturn(responseModel);
        when(reconsilationRestHelper.getModelList(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/reconsile/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }
}

