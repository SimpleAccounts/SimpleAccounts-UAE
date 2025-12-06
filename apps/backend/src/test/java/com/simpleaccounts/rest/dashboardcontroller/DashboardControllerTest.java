package com.simpleaccounts.rest.dashboardcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DashboardRestHelper;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private ChartUtil chartUtil;
    @MockBean private DateFormatUtil dateFormatUtil;
    @MockBean private FinancialReportRestHelper financialReportRestHelper;
    @MockBean private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private DashboardRestHelper dashboardRestHelper;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getVatReportShouldReturnVatData() throws Exception {
        // Setup
        when(chartUtil.getEndDate()).thenReturn(java.util.Calendar.getInstance());
        when(chartUtil.getStartDate(any(), any())).thenReturn(java.util.Calendar.getInstance());
        when(dateFormatUtil.getDateAsString(any(), any())).thenReturn("01/01/2024");
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("CODES");

        TransactionCategory inputVatCategory = createTransactionCategory(
            TransactionCategoryCodeEnum.INPUT_VAT.getCode(),
            ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET
        );

        TransactionCategory outputVatCategory = createTransactionCategory(
            TransactionCategoryCodeEnum.OUTPUT_VAT.getCode(),
            ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES
        );

        TransactionCategoryClosingBalance inputVat = createClosingBalance(inputVatCategory, new BigDecimal("1000"));
        TransactionCategoryClosingBalance outputVat = createClosingBalance(outputVatCategory, new BigDecimal("1500"));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(inputVat, outputVat);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, inputVat);
        processedMap.put(2, outputVat);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(closingBalances))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/getVatReport")
                        .param("monthNo", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.InputVat").value(1000))
                .andExpect(jsonPath("$.OutputVat").value(1500));

        verify(transactionCategoryClosingBalanceService).getListByChartOfAccountIds(any(ReportRequestModel.class));
    }

    @Test
    void getVatReportShouldReturnEmptyMapWhenNoData() throws Exception {
        when(chartUtil.getEndDate()).thenReturn(java.util.Calendar.getInstance());
        when(chartUtil.getStartDate(any(), any())).thenReturn(java.util.Calendar.getInstance());
        when(dateFormatUtil.getDateAsString(any(), any())).thenReturn("01/01/2024");
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("CODES");
        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/dashboardReport/getVatReport")
                        .param("monthNo", "6"))
                .andExpect(status().isOk());
    }

    @Test
    void getVatReportShouldHandleNullMonthNo() throws Exception {
        when(chartUtil.getEndDate()).thenReturn(java.util.Calendar.getInstance());
        when(chartUtil.getStartDate(any(), any())).thenReturn(java.util.Calendar.getInstance());
        when(dateFormatUtil.getDateAsString(any(), any())).thenReturn("01/01/2024");
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport")).thenReturn("CODES");
        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/dashboardReport/getVatReport"))
                .andExpect(status().isOk());
    }

    @Test
    void getVatReportShouldHandleException() throws Exception {
        when(chartUtil.getEndDate()).thenThrow(new RuntimeException("Test exception"));

        mockMvc.perform(get("/rest/dashboardReport/getVatReport")
                        .param("monthNo", "6"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getDashboardProfitAndLossShouldReturnProfitLossData() throws Exception {
        // Setup date ranges
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/01/2024");
        dateModel.setEndDate("31/01/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(6)).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory incomeCategory = createTransactionCategory(
            "SALES",
            ChartOfAccountCategoryCodeEnum.INCOME
        );
        incomeCategory.setTransactionCategoryName("Sales");

        TransactionCategory expenseCategory = createTransactionCategory(
            "EXPENSE",
            ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE
        );

        TransactionCategoryClosingBalance income = createClosingBalance(incomeCategory, new BigDecimal("5000"));
        TransactionCategoryClosingBalance expense = createClosingBalance(expenseCategory, new BigDecimal("3000"));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(income, expense);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, income);
        processedMap.put(2, expense);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Income").exists())
                .andExpect(jsonPath("$.Expense").exists())
                .andExpect(jsonPath("$.NetProfit").exists());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleNullMonthNo() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/01/2024");
        dateModel.setEndDate("31/01/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(null)).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");
        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(new ArrayList<>());
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(new HashMap<>());

        mockMvc.perform(get("/rest/dashboardReport/profitandloss"))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardProfitAndLossShouldCalculateNetProfit() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/12/2024");
        dateModel.setEndDate("31/12/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory incomeCategory = createTransactionCategory(
            "SALES",
            ChartOfAccountCategoryCodeEnum.INCOME
        );
        incomeCategory.setTransactionCategoryName("Sales");

        TransactionCategoryClosingBalance income = createClosingBalance(incomeCategory, new BigDecimal("10000"));
        income.setClosingBalanceDate(LocalDateTime.of(2024, 12, 31, 0, 0));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(income);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, income);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income").exists())
                .andExpect(jsonPath("$.expense").exists());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleException() throws Exception {
        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any()))
            .thenThrow(new RuntimeException("Test exception"));

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "6"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleEmptyClosingBalances() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/01/2024");
        dateModel.setEndDate("31/01/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");
        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(new ArrayList<>());
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(new HashMap<>());

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "6"))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleCostOfGoodsSold() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/12/2024");
        dateModel.setEndDate("31/12/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory cogsCategory = createTransactionCategory(
            "COGS",
            ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD
        );

        TransactionCategoryClosingBalance cogs = createClosingBalance(cogsCategory, new BigDecimal("2000"));
        cogs.setClosingBalanceDate(LocalDateTime.of(2024, 12, 31, 0, 0));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(cogs);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, cogs);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleNonOperatingIncome() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/12/2024");
        dateModel.setEndDate("31/12/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory incomeCategory = createTransactionCategory(
            "OTHER_INCOME",
            ChartOfAccountCategoryCodeEnum.INCOME
        );
        incomeCategory.setTransactionCategoryName("Interest Income");

        TransactionCategoryClosingBalance income = createClosingBalance(incomeCategory, new BigDecimal("500"));
        income.setClosingBalanceDate(LocalDateTime.of(2024, 12, 31, 0, 0));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(income);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, income);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleOtherExpenses() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();
        DateRequestModel dateModel = new DateRequestModel();
        dateModel.setStartDate("01/12/2024");
        dateModel.setEndDate("31/12/2024");
        dateModels.add(dateModel);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory expenseCategory = createTransactionCategory(
            "OTHER_EXP",
            ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE
        );

        TransactionCategoryClosingBalance expense = createClosingBalance(expenseCategory, new BigDecimal("800"));
        expense.setClosingBalanceDate(LocalDateTime.of(2024, 12, 31, 0, 0));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(expense);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, expense);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "1"))
                .andExpect(status().isOk());
    }

    @Test
    void getDashboardProfitAndLossShouldHandleMultipleMonths() throws Exception {
        List<DateRequestModel> dateModels = new ArrayList<>();

        DateRequestModel month1 = new DateRequestModel();
        month1.setStartDate("01/11/2024");
        month1.setEndDate("30/11/2024");
        dateModels.add(month1);

        DateRequestModel month2 = new DateRequestModel();
        month2.setStartDate("01/12/2024");
        month2.setEndDate("31/12/2024");
        dateModels.add(month2);

        when(dashboardRestHelper.getStartDateEndDateForEveryMonth(any())).thenReturn(dateModels);
        when(financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss")).thenReturn("CODES");

        TransactionCategory incomeCategory = createTransactionCategory(
            "SALES",
            ChartOfAccountCategoryCodeEnum.INCOME
        );
        incomeCategory.setTransactionCategoryName("Sales");

        TransactionCategoryClosingBalance income = createClosingBalance(incomeCategory, new BigDecimal("5000"));
        income.setClosingBalanceDate(LocalDateTime.of(2024, 11, 30, 0, 0));

        List<TransactionCategoryClosingBalance> closingBalances = Arrays.asList(income);

        Map<Integer, TransactionCategoryClosingBalance> processedMap = new HashMap<>();
        processedMap.put(1, income);

        when(transactionCategoryClosingBalanceService.getListByChartOfAccountIds(any(ReportRequestModel.class)))
            .thenReturn(closingBalances);
        when(financialReportRestHelper.processTransactionCategoryClosingBalance(any()))
            .thenReturn(processedMap);

        mockMvc.perform(get("/rest/dashboardReport/profitandloss")
                        .param("monthNo", "2"))
                .andExpect(status().isOk());
    }

    // Helper methods
    private TransactionCategory createTransactionCategory(String code, ChartOfAccountCategoryCodeEnum chartCode) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryCode(code);

        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountCode(chartCode.getCode());
        category.setChartOfAccount(chartOfAccount);

        return category;
    }

    private TransactionCategoryClosingBalance createClosingBalance(TransactionCategory category, BigDecimal balance) {
        TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
        closingBalance.setTransactionCategory(category);
        closingBalance.setClosingBalance(balance);
        closingBalance.setClosingBalanceDate(LocalDateTime.now());
        return closingBalance;
    }
}
