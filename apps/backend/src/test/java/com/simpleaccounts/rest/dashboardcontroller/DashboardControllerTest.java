package com.simpleaccounts.rest.dashboardcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DashboardRestHelper;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardController Unit Tests")
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ChartUtil chartUtil;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private FinancialReportRestHelper financialReportRestHelper;

    @Mock
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private DashboardRestHelper dashboardRestHelper;

    @InjectMocks
    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController).build();
    }

    @Nested
    @DisplayName("getVatReport Tests")
    class GetVatReportTests {

        @Test
        @DisplayName("Should return VAT report with OK status")
        void getVatReportReturnsOkStatus() throws Exception {
            // Arrange
            Calendar endCal = Calendar.getInstance();
            Calendar startCal = Calendar.getInstance();
            startCal.add(Calendar.MONTH, -6);

            when(chartUtil.getEndDate()).thenReturn(endCal);
            when(chartUtil.getStartDate(Calendar.MONTH, -6)).thenReturn(startCal);
            when(dateFormatUtil.getDateAsString(any(Date.class), any())).thenReturn("01/01/2024");
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any()))
                .thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/dashboardReport/getVatReport")
                    .param("monthNo", "6"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return VAT report with closing balances")
        void getVatReportReturnsClosingBalances() throws Exception {
            // Arrange
            Calendar endCal = Calendar.getInstance();
            Calendar startCal = Calendar.getInstance();
            startCal.add(Calendar.MONTH, -6);

            List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(2);
            Map<Integer, TransactionCategoryClosingBalance> balanceMap = new HashMap<>();
            balanceMap.put(1, balances.get(0));
            balanceMap.put(2, balances.get(1));

            when(chartUtil.getEndDate()).thenReturn(endCal);
            when(chartUtil.getStartDate(Calendar.MONTH, -6)).thenReturn(startCal);
            when(dateFormatUtil.getDateAsString(any(Date.class), any())).thenReturn("01/01/2024");
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any())).thenReturn(balances);
            when(financialReportRestHelper.processTransactionCategoryClosingBalance(balances)).thenReturn(balanceMap);

            // Act & Assert
            mockMvc.perform(get("/rest/dashboardReport/getVatReport")
                    .param("monthNo", "6"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should use default year when monthNo is null")
        void getVatReportUsesDefaultYear() throws Exception {
            // Arrange
            Calendar endCal = Calendar.getInstance();
            Calendar startCal = Calendar.getInstance();
            startCal.add(Calendar.YEAR, -1);

            when(chartUtil.getEndDate()).thenReturn(endCal);
            when(chartUtil.getStartDate(Calendar.YEAR, -1)).thenReturn(startCal);
            when(dateFormatUtil.getDateAsString(any(Date.class), any())).thenReturn("01/01/2024");
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any()))
                .thenReturn(new ArrayList<>());

            // Act & Assert - monthNo not provided, should default
            mockMvc.perform(get("/rest/dashboardReport/getVatReport"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getDashboardProfitAndLoss Tests")
    class GetDashboardProfitAndLossTests {

        @Test
        @DisplayName("Should return profit and loss report with OK status")
        void getDashboardProfitAndLossReturnsOkStatus() throws Exception {
            // Arrange
            List<DateRequestModel> dateModels = createDateRequestModelList(3);
            when(dashboardRestHelper.getStartDateEndDateForEveryMonth(anyInt())).thenReturn(dateModels);
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any()))
                .thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                    .param("monthNo", "6"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return profit and loss with closing balances")
        void getDashboardProfitAndLossReturnsClosingBalances() throws Exception {
            // Arrange
            List<DateRequestModel> dateModels = createDateRequestModelList(3);
            List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(2);

            when(dashboardRestHelper.getStartDateEndDateForEveryMonth(anyInt())).thenReturn(dateModels);
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any())).thenReturn(balances);

            // Act & Assert
            mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                    .param("monthNo", "6"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle null monthNo parameter")
        void getDashboardProfitAndLossHandlesNullMonthNo() throws Exception {
            // Arrange
            List<DateRequestModel> dateModels = createDateRequestModelList(12);
            when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
            when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("1,2,3");
            when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any()))
                .thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/dashboardReport/profitandloss"))
                .andExpect(status().isOk());
        }
    }

    private List<TransactionCategoryClosingBalance> createClosingBalanceList(int count) {
        List<TransactionCategoryClosingBalance> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createClosingBalance(i + 1));
        }
        return list;
    }

    private TransactionCategoryClosingBalance createClosingBalance(Integer id) {
        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setId(id);
        balance.setClosingBalance(BigDecimal.valueOf(1000 * id));
        balance.setClosingBalanceDate(LocalDate.now());
        balance.setTransactionCategory(createTransactionCategory(id));
        return balance;
    }

    private TransactionCategory createTransactionCategory(Integer id) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName("Category " + id);
        category.setTransactionCategoryCode("CAT" + id);
        return category;
    }

    private List<DateRequestModel> createDateRequestModelList(int count) {
        List<DateRequestModel> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            DateRequestModel model = new DateRequestModel();
            model.setStartDate("01/" + String.format("%02d", i + 1) + "/2024");
            model.setEndDate("28/" + String.format("%02d", i + 1) + "/2024");
            list.add(model);
        }
        return list;
    }
}
