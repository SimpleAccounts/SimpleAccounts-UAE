package com.simpleaccounts.rest.reconsilationcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.impl.TransactionCategoryClosingBalanceServiceImpl;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.OSValidator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ReconsilationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReconsilationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private ReconcileStatusService reconcileStatusService;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private ReconsilationRestHelper reconsilationRestHelper;
    @MockBean private InvoiceService invoiceService;
    @MockBean private TranscationCategoryHelper transcationCategoryHelper;
    @MockBean private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private ContactService contactService;
    @MockBean private UserService userServiceNew;
    @MockBean private TransactionService transactionService;
    @MockBean private TransactionCategoryClosingBalanceServiceImpl transactionCategoryClosingBalanceService;
    @MockBean private TransactionExpensesRepository transactionExpensesRepository;
    @MockBean private OSValidator osValidator;
    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private JwtTokenUtil jwtTokenUtil;

    @TestConfiguration
    static class StaticResourceConfigMocks {
        @Bean
        String basePath() {
            return "/tmp";
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
}

