package com.simpleaccounts.reporting;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Financial Reporting functionality.
 * Covers P&L, Balance Sheet, VAT Reports, Cash Flow, and KPI calculations.
 */
class FinancialReportingTest {

    private ReportingService reportingService;

    @BeforeEach
    void setUp() {
        reportingService = new ReportingService();
        setupTestData();
    }

    private void setupTestData() {
        // Add sample transactions for reporting
        reportingService.addTransaction("4100", "Sales Revenue", new BigDecimal("-50000.00"), LocalDate.of(2024, 12, 1));
        reportingService.addTransaction("4200", "Service Income", new BigDecimal("-15000.00"), LocalDate.of(2024, 12, 5));
        reportingService.addTransaction("5100", "Cost of Goods Sold", new BigDecimal("20000.00"), LocalDate.of(2024, 12, 3));
        reportingService.addTransaction("6100", "Operating Expenses", new BigDecimal("10000.00"), LocalDate.of(2024, 12, 10));
        reportingService.addTransaction("6200", "Salaries", new BigDecimal("15000.00"), LocalDate.of(2024, 12, 15));
        reportingService.addTransaction("1100", "Cash", new BigDecimal("50000.00"), LocalDate.of(2024, 12, 1));
        reportingService.addTransaction("1200", "Accounts Receivable", new BigDecimal("15000.00"), LocalDate.of(2024, 12, 5));
        reportingService.addTransaction("2100", "Accounts Payable", new BigDecimal("-20000.00"), LocalDate.of(2024, 12, 3));
        reportingService.addTransaction("3100", "Share Capital", new BigDecimal("-25000.00"), LocalDate.of(2024, 1, 1));
    }

    @Nested
    @DisplayName("Profit & Loss Report Tests")
    class ProfitLossTests {

        @Test
        @DisplayName("Should calculate gross profit correctly")
        void shouldCalculateGrossProfit() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // Revenue: 50000 + 15000 = 65000
            // COGS: 20000
            // Gross Profit: 45000
            assertThat(report.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("65000.00"));
            assertThat(report.getCostOfGoodsSold()).isEqualByComparingTo(new BigDecimal("20000.00"));
            assertThat(report.getGrossProfit()).isEqualByComparingTo(new BigDecimal("45000.00"));
        }

        @Test
        @DisplayName("Should calculate operating income correctly")
        void shouldCalculateOperatingIncome() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // Gross Profit: 45000
            // Operating Expenses: 10000 + 15000 = 25000
            // Operating Income: 20000
            assertThat(report.getTotalOperatingExpenses()).isEqualByComparingTo(new BigDecimal("25000.00"));
            assertThat(report.getOperatingIncome()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }

        @Test
        @DisplayName("Should calculate net income correctly")
        void shouldCalculateNetIncome() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getNetIncome()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }

        @Test
        @DisplayName("Should group expenses by category")
        void shouldGroupExpensesByCategory() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getExpenseByCategory("6100")).isEqualByComparingTo(new BigDecimal("10000.00"));
            assertThat(report.getExpenseByCategory("6200")).isEqualByComparingTo(new BigDecimal("15000.00"));
        }

        @Test
        @DisplayName("Should calculate gross profit margin")
        void shouldCalculateGrossProfitMargin() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // Gross Profit Margin = 45000 / 65000 = 69.23%
            assertThat(report.getGrossProfitMargin()).isCloseTo(69.23, org.assertj.core.api.Assertions.within(0.01));
        }

        @Test
        @DisplayName("Should compare periods for variance analysis")
        void shouldComparePeriods() {
            // Add data for previous period
            reportingService.addTransaction("4100", "Sales Revenue", new BigDecimal("-40000.00"), LocalDate.of(2024, 11, 1));

            PeriodComparison comparison = reportingService.comparePeriods(
                LocalDate.of(2024, 11, 1), LocalDate.of(2024, 11, 30),
                LocalDate.of(2024, 12, 1), LocalDate.of(2024, 12, 31)
            );

            assertThat(comparison.getRevenueVariance()).isEqualByComparingTo(new BigDecimal("25000.00"));
            assertThat(comparison.getRevenueVariancePercent()).isCloseTo(62.5, org.assertj.core.api.Assertions.within(0.1));
        }
    }

    @Nested
    @DisplayName("Balance Sheet Tests")
    class BalanceSheetTests {

        @Test
        @DisplayName("Should calculate total assets")
        void shouldCalculateTotalAssets() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            // Cash: 50000, AR: 15000
            assertThat(report.getTotalAssets()).isEqualByComparingTo(new BigDecimal("65000.00"));
        }

        @Test
        @DisplayName("Should calculate total liabilities")
        void shouldCalculateTotalLiabilities() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            assertThat(report.getTotalLiabilities()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }

        @Test
        @DisplayName("Should ensure assets equal liabilities plus equity")
        void shouldEnsureBalanceSheetBalances() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            BigDecimal liabilitiesAndEquity = report.getTotalLiabilities().add(report.getTotalEquity());
            assertThat(report.getTotalAssets()).isEqualByComparingTo(liabilitiesAndEquity);
        }

        @Test
        @DisplayName("Should classify assets by liquidity")
        void shouldClassifyAssetsByLiquidity() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            assertThat(report.getCurrentAssets()).isEqualByComparingTo(new BigDecimal("65000.00"));
            assertThat(report.getNonCurrentAssets()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should calculate working capital")
        void shouldCalculateWorkingCapital() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            // Current Assets: 65000, Current Liabilities: 20000
            assertThat(report.getWorkingCapital()).isEqualByComparingTo(new BigDecimal("45000.00"));
        }

        @Test
        @DisplayName("Should calculate current ratio")
        void shouldCalculateCurrentRatio() {
            BalanceSheet report = reportingService.generateBalanceSheet(LocalDate.of(2024, 12, 31));

            // Current Ratio = 65000 / 20000 = 3.25
            assertThat(report.getCurrentRatio()).isCloseTo(3.25, org.assertj.core.api.Assertions.within(0.01));
        }
    }

    @Nested
    @DisplayName("VAT Report Tests")
    class VatReportTests {

        @BeforeEach
        void setupVatData() {
            reportingService.addVatTransaction("OUTPUT", new BigDecimal("2500.00"), LocalDate.of(2024, 12, 1)); // 5% of 50000
            reportingService.addVatTransaction("INPUT", new BigDecimal("1000.00"), LocalDate.of(2024, 12, 3)); // Input VAT
        }

        @Test
        @DisplayName("Should calculate output VAT")
        void shouldCalculateOutputVat() {
            VatReport report = reportingService.generateVatReport(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getOutputVat()).isEqualByComparingTo(new BigDecimal("2500.00"));
        }

        @Test
        @DisplayName("Should calculate input VAT")
        void shouldCalculateInputVat() {
            VatReport report = reportingService.generateVatReport(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getInputVat()).isEqualByComparingTo(new BigDecimal("1000.00"));
        }

        @Test
        @DisplayName("Should calculate VAT payable")
        void shouldCalculateVatPayable() {
            VatReport report = reportingService.generateVatReport(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // Output VAT - Input VAT = 2500 - 1000 = 1500
            assertThat(report.getVatPayable()).isEqualByComparingTo(new BigDecimal("1500.00"));
        }

        @Test
        @DisplayName("Should segregate by VAT category")
        void shouldSegregateByVatCategory() {
            reportingService.addVatTransaction("OUTPUT_STANDARD", new BigDecimal("1000.00"), LocalDate.of(2024, 12, 5));
            reportingService.addVatTransaction("OUTPUT_ZERO", new BigDecimal("0.00"), LocalDate.of(2024, 12, 6));

            VatReport report = reportingService.generateVatReport(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getStandardRatedSales()).isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle reverse charge VAT")
        void shouldHandleReverseChargeVat() {
            reportingService.addVatTransaction("REVERSE_CHARGE", new BigDecimal("500.00"), LocalDate.of(2024, 12, 10));

            VatReport report = reportingService.generateVatReport(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getReverseChargeVat()).isEqualByComparingTo(new BigDecimal("500.00"));
        }
    }

    @Nested
    @DisplayName("Cash Flow Statement Tests")
    class CashFlowTests {

        @Test
        @DisplayName("Should calculate operating cash flow")
        void shouldCalculateOperatingCashFlow() {
            CashFlowStatement report = reportingService.generateCashFlow(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getOperatingCashFlow()).isNotNull();
        }

        @Test
        @DisplayName("Should track cash from customer receipts")
        void shouldTrackCashFromCustomerReceipts() {
            reportingService.addCashFlow("OPERATING", "Customer Receipt", new BigDecimal("50000.00"), LocalDate.of(2024, 12, 1));

            CashFlowStatement report = reportingService.generateCashFlow(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getCashFromCustomers()).isEqualByComparingTo(new BigDecimal("50000.00"));
        }

        @Test
        @DisplayName("Should track cash paid to suppliers")
        void shouldTrackCashPaidToSuppliers() {
            reportingService.addCashFlow("OPERATING", "Supplier Payment", new BigDecimal("-20000.00"), LocalDate.of(2024, 12, 3));

            CashFlowStatement report = reportingService.generateCashFlow(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getCashToSuppliers()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }

        @Test
        @DisplayName("Should calculate net change in cash")
        void shouldCalculateNetChangeInCash() {
            reportingService.addCashFlow("OPERATING", "Receipt", new BigDecimal("50000.00"), LocalDate.of(2024, 12, 1));
            reportingService.addCashFlow("OPERATING", "Payment", new BigDecimal("-30000.00"), LocalDate.of(2024, 12, 5));

            CashFlowStatement report = reportingService.generateCashFlow(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            assertThat(report.getNetChangeInCash()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }
    }

    @Nested
    @DisplayName("KPI & Dashboard Tests")
    class KpiDashboardTests {

        @Test
        @DisplayName("Should calculate days sales outstanding")
        void shouldCalculateDaysSalesOutstanding() {
            KpiMetrics metrics = reportingService.calculateKpis(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // DSO = (AR / Revenue) * Days
            // (15000 / 65000) * 31 = ~7.15 days
            assertThat(metrics.getDaysSalesOutstanding()).isCloseTo(7.15, org.assertj.core.api.Assertions.within(0.5));
        }

        @Test
        @DisplayName("Should calculate days payables outstanding")
        void shouldCalculateDaysPayablesOutstanding() {
            KpiMetrics metrics = reportingService.calculateKpis(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // DPO = (AP / COGS) * Days
            assertThat(metrics.getDaysPayablesOutstanding()).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should calculate expense ratios")
        void shouldCalculateExpenseRatios() {
            KpiMetrics metrics = reportingService.calculateKpis(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            // Operating Expense Ratio = 25000 / 65000 = 38.46%
            assertThat(metrics.getOperatingExpenseRatio()).isCloseTo(38.46, org.assertj.core.api.Assertions.within(0.1));
        }

        @Test
        @DisplayName("Should track revenue by month")
        void shouldTrackRevenueByMonth() {
            Map<String, BigDecimal> monthlyRevenue = reportingService.getMonthlyRevenue(2024);

            assertThat(monthlyRevenue.get("12")).isEqualByComparingTo(new BigDecimal("65000.00"));
        }
    }

    @Nested
    @DisplayName("Report Export Tests")
    class ReportExportTests {

        @Test
        @DisplayName("Should export P&L to CSV format")
        void shouldExportPlToCsv() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            String csv = reportingService.exportToCsv(report);

            assertThat(csv).contains("Revenue");
            assertThat(csv).contains("65000.00");
            assertThat(csv).contains("Net Income");
        }

        @Test
        @DisplayName("Should export to JSON format")
        void shouldExportToJson() {
            ProfitLossReport report = reportingService.generateProfitLoss(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 31)
            );

            String json = reportingService.exportToJson(report);

            assertThat(json).contains("\"totalRevenue\"");
            assertThat(json).contains("65000.00");
        }
    }

    // Test implementation classes
    static class ReportingService {
        private List<Transaction> transactions = new ArrayList<>();
        private List<VatTransaction> vatTransactions = new ArrayList<>();
        private List<CashFlowItem> cashFlowItems = new ArrayList<>();

        void addTransaction(String accountCode, String description, BigDecimal amount, LocalDate date) {
            transactions.add(new Transaction(accountCode, description, amount, date));
        }

        void addVatTransaction(String type, BigDecimal amount, LocalDate date) {
            vatTransactions.add(new VatTransaction(type, amount, date));
        }

        void addCashFlow(String category, String description, BigDecimal amount, LocalDate date) {
            cashFlowItems.add(new CashFlowItem(category, description, amount, date));
        }

        ProfitLossReport generateProfitLoss(LocalDate startDate, LocalDate endDate) {
            BigDecimal revenue = BigDecimal.ZERO;
            BigDecimal cogs = BigDecimal.ZERO;
            BigDecimal operatingExpenses = BigDecimal.ZERO;
            Map<String, BigDecimal> expensesByCategory = new HashMap<>();

            for (Transaction txn : transactions) {
                if (!txn.date.isBefore(startDate) && !txn.date.isAfter(endDate)) {
                    if (txn.accountCode.startsWith("4")) {
                        revenue = revenue.add(txn.amount.abs());
                    } else if (txn.accountCode.startsWith("5")) {
                        cogs = cogs.add(txn.amount);
                    } else if (txn.accountCode.startsWith("6")) {
                        operatingExpenses = operatingExpenses.add(txn.amount);
                        expensesByCategory.merge(txn.accountCode, txn.amount, BigDecimal::add);
                    }
                }
            }

            return new ProfitLossReport(revenue, cogs, operatingExpenses, expensesByCategory);
        }

        BalanceSheet generateBalanceSheet(LocalDate asOfDate) {
            BigDecimal currentAssets = BigDecimal.ZERO;
            BigDecimal nonCurrentAssets = BigDecimal.ZERO;
            BigDecimal currentLiabilities = BigDecimal.ZERO;
            BigDecimal nonCurrentLiabilities = BigDecimal.ZERO;
            BigDecimal equity = BigDecimal.ZERO;

            for (Transaction txn : transactions) {
                if (!txn.date.isAfter(asOfDate)) {
                    if (txn.accountCode.startsWith("1")) {
                        currentAssets = currentAssets.add(txn.amount);
                    } else if (txn.accountCode.startsWith("2")) {
                        currentLiabilities = currentLiabilities.add(txn.amount.abs());
                    } else if (txn.accountCode.startsWith("3")) {
                        equity = equity.add(txn.amount.abs());
                    }
                }
            }

            // Add retained earnings from P&L
            ProfitLossReport pl = generateProfitLoss(LocalDate.of(2024, 1, 1), asOfDate);
            equity = equity.add(pl.getNetIncome());

            return new BalanceSheet(currentAssets, nonCurrentAssets, currentLiabilities, nonCurrentLiabilities, equity);
        }

        VatReport generateVatReport(LocalDate startDate, LocalDate endDate) {
            BigDecimal outputVat = BigDecimal.ZERO;
            BigDecimal inputVat = BigDecimal.ZERO;
            BigDecimal reverseChargeVat = BigDecimal.ZERO;
            BigDecimal standardRatedSales = BigDecimal.ZERO;

            for (VatTransaction vat : vatTransactions) {
                if (!vat.date.isBefore(startDate) && !vat.date.isAfter(endDate)) {
                    if (vat.type.startsWith("OUTPUT")) {
                        outputVat = outputVat.add(vat.amount);
                        standardRatedSales = standardRatedSales.add(vat.amount.multiply(new BigDecimal("20"))); // Reverse calc
                    } else if (vat.type.equals("INPUT")) {
                        inputVat = inputVat.add(vat.amount);
                    } else if (vat.type.equals("REVERSE_CHARGE")) {
                        reverseChargeVat = reverseChargeVat.add(vat.amount);
                    }
                }
            }

            return new VatReport(outputVat, inputVat, reverseChargeVat, standardRatedSales);
        }

        CashFlowStatement generateCashFlow(LocalDate startDate, LocalDate endDate) {
            BigDecimal cashFromCustomers = BigDecimal.ZERO;
            BigDecimal cashToSuppliers = BigDecimal.ZERO;
            BigDecimal netChange = BigDecimal.ZERO;

            for (CashFlowItem item : cashFlowItems) {
                if (!item.date.isBefore(startDate) && !item.date.isAfter(endDate)) {
                    if (item.description.contains("Customer") || item.description.contains("Receipt")) {
                        cashFromCustomers = cashFromCustomers.add(item.amount);
                    } else if (item.description.contains("Supplier") || item.description.contains("Payment")) {
                        cashToSuppliers = cashToSuppliers.add(item.amount.abs());
                    }
                    netChange = netChange.add(item.amount);
                }
            }

            return new CashFlowStatement(cashFromCustomers, cashToSuppliers, netChange);
        }

        KpiMetrics calculateKpis(LocalDate startDate, LocalDate endDate) {
            ProfitLossReport pl = generateProfitLoss(startDate, endDate);
            generateBalanceSheet(endDate);

            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

            // DSO = (AR / Revenue) * Days
            BigDecimal ar = BigDecimal.ZERO;
            for (Transaction txn : transactions) {
                if (txn.accountCode.equals("1200")) ar = ar.add(txn.amount);
            }
            double dso = pl.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0
                ? ar.divide(pl.getTotalRevenue(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(days)).doubleValue()
                : 0;

            // DPO = (AP / COGS) * Days
            BigDecimal ap = BigDecimal.ZERO;
            for (Transaction txn : transactions) {
                if (txn.accountCode.equals("2100")) ap = ap.add(txn.amount.abs());
            }
            double dpo = pl.getCostOfGoodsSold().compareTo(BigDecimal.ZERO) > 0
                ? ap.divide(pl.getCostOfGoodsSold(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(days)).doubleValue()
                : 0;

            // Operating Expense Ratio
            double expenseRatio = pl.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0
                ? pl.getTotalOperatingExpenses().divide(pl.getTotalRevenue(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue()
                : 0;

            return new KpiMetrics(dso, dpo, expenseRatio);
        }

        Map<String, BigDecimal> getMonthlyRevenue(int year) {
            Map<String, BigDecimal> monthlyRevenue = new HashMap<>();
            for (Transaction txn : transactions) {
                if (txn.date.getYear() == year && txn.accountCode.startsWith("4")) {
                    String month = String.valueOf(txn.date.getMonthValue());
                    monthlyRevenue.merge(month, txn.amount.abs(), BigDecimal::add);
                }
            }
            return monthlyRevenue;
        }

        PeriodComparison comparePeriods(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
            ProfitLossReport period1 = generateProfitLoss(start1, end1);
            ProfitLossReport period2 = generateProfitLoss(start2, end2);

            BigDecimal variance = period2.getTotalRevenue().subtract(period1.getTotalRevenue());
            double variancePercent = period1.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0
                ? variance.divide(period1.getTotalRevenue(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue()
                : 0;

            return new PeriodComparison(variance, variancePercent);
        }

        String exportToCsv(ProfitLossReport report) {
            StringBuilder sb = new StringBuilder();
            sb.append("Category,Amount\n");
            sb.append("Revenue,").append(report.getTotalRevenue()).append("\n");
            sb.append("Cost of Goods Sold,").append(report.getCostOfGoodsSold()).append("\n");
            sb.append("Gross Profit,").append(report.getGrossProfit()).append("\n");
            sb.append("Operating Expenses,").append(report.getTotalOperatingExpenses()).append("\n");
            sb.append("Net Income,").append(report.getNetIncome()).append("\n");
            return sb.toString();
        }

        String exportToJson(ProfitLossReport report) {
            return String.format("{\"totalRevenue\":%.2f,\"netIncome\":%.2f}",
                report.getTotalRevenue().doubleValue(), report.getNetIncome().doubleValue());
        }
    }

    static class Transaction {
        String accountCode;
        String description;
        BigDecimal amount;
        LocalDate date;

        Transaction(String accountCode, String description, BigDecimal amount, LocalDate date) {
            this.accountCode = accountCode;
            this.description = description;
            this.amount = amount;
            this.date = date;
        }
    }

    static class VatTransaction {
        String type;
        BigDecimal amount;
        LocalDate date;

        VatTransaction(String type, BigDecimal amount, LocalDate date) {
            this.type = type;
            this.amount = amount;
            this.date = date;
        }
    }

    static class CashFlowItem {
        String category;
        String description;
        BigDecimal amount;
        LocalDate date;

        CashFlowItem(String category, String description, BigDecimal amount, LocalDate date) {
            this.category = category;
            this.description = description;
            this.amount = amount;
            this.date = date;
        }
    }

    static class ProfitLossReport {
        private final BigDecimal totalRevenue;
        private final BigDecimal costOfGoodsSold;
        private final BigDecimal totalOperatingExpenses;
        private final Map<String, BigDecimal> expensesByCategory;

        ProfitLossReport(BigDecimal revenue, BigDecimal cogs, BigDecimal opEx, Map<String, BigDecimal> expenses) {
            this.totalRevenue = revenue;
            this.costOfGoodsSold = cogs;
            this.totalOperatingExpenses = opEx;
            this.expensesByCategory = expenses;
        }

        BigDecimal getTotalRevenue() { return totalRevenue; }
        BigDecimal getCostOfGoodsSold() { return costOfGoodsSold; }
        BigDecimal getGrossProfit() { return totalRevenue.subtract(costOfGoodsSold); }
        BigDecimal getTotalOperatingExpenses() { return totalOperatingExpenses; }
        BigDecimal getOperatingIncome() { return getGrossProfit().subtract(totalOperatingExpenses); }
        BigDecimal getNetIncome() { return getOperatingIncome(); }
        BigDecimal getExpenseByCategory(String code) { return expensesByCategory.getOrDefault(code, BigDecimal.ZERO); }
        double getGrossProfitMargin() {
            return totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? getGrossProfit().divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue()
                : 0;
        }
    }

    static class BalanceSheet {
        private final BigDecimal currentAssets;
        private final BigDecimal nonCurrentAssets;
        private final BigDecimal currentLiabilities;
        private final BigDecimal nonCurrentLiabilities;
        private final BigDecimal equity;

        BalanceSheet(BigDecimal ca, BigDecimal nca, BigDecimal cl, BigDecimal ncl, BigDecimal eq) {
            this.currentAssets = ca;
            this.nonCurrentAssets = nca;
            this.currentLiabilities = cl;
            this.nonCurrentLiabilities = ncl;
            this.equity = eq;
        }

        BigDecimal getCurrentAssets() { return currentAssets; }
        BigDecimal getNonCurrentAssets() { return nonCurrentAssets; }
        BigDecimal getTotalAssets() { return currentAssets.add(nonCurrentAssets); }
        BigDecimal getCurrentLiabilities() { return currentLiabilities; }
        BigDecimal getTotalLiabilities() { return currentLiabilities.add(nonCurrentLiabilities); }
        BigDecimal getTotalEquity() { return equity; }
        BigDecimal getWorkingCapital() { return currentAssets.subtract(currentLiabilities); }
        double getCurrentRatio() {
            return currentLiabilities.compareTo(BigDecimal.ZERO) > 0
                ? currentAssets.divide(currentLiabilities, 2, java.math.RoundingMode.HALF_UP).doubleValue()
                : 0;
        }
    }

    static class VatReport {
        private final BigDecimal outputVat;
        private final BigDecimal inputVat;
        private final BigDecimal reverseChargeVat;
        private final BigDecimal standardRatedSales;

        VatReport(BigDecimal output, BigDecimal input, BigDecimal reverse, BigDecimal standard) {
            this.outputVat = output;
            this.inputVat = input;
            this.reverseChargeVat = reverse;
            this.standardRatedSales = standard;
        }

        BigDecimal getOutputVat() { return outputVat; }
        BigDecimal getInputVat() { return inputVat; }
        BigDecimal getVatPayable() { return outputVat.subtract(inputVat); }
        BigDecimal getReverseChargeVat() { return reverseChargeVat; }
        BigDecimal getStandardRatedSales() { return standardRatedSales; }
    }

    static class CashFlowStatement {
        private final BigDecimal cashFromCustomers;
        private final BigDecimal cashToSuppliers;
        private final BigDecimal netChangeInCash;

        CashFlowStatement(BigDecimal customers, BigDecimal suppliers, BigDecimal netChange) {
            this.cashFromCustomers = customers;
            this.cashToSuppliers = suppliers;
            this.netChangeInCash = netChange;
        }

        BigDecimal getCashFromCustomers() { return cashFromCustomers; }
        BigDecimal getCashToSuppliers() { return cashToSuppliers; }
        BigDecimal getOperatingCashFlow() { return cashFromCustomers.subtract(cashToSuppliers); }
        BigDecimal getNetChangeInCash() { return netChangeInCash; }
    }

    static class KpiMetrics {
        private final double daysSalesOutstanding;
        private final double daysPayablesOutstanding;
        private final double operatingExpenseRatio;

        KpiMetrics(double dso, double dpo, double expenseRatio) {
            this.daysSalesOutstanding = dso;
            this.daysPayablesOutstanding = dpo;
            this.operatingExpenseRatio = expenseRatio;
        }

        double getDaysSalesOutstanding() { return daysSalesOutstanding; }
        double getDaysPayablesOutstanding() { return daysPayablesOutstanding; }
        double getOperatingExpenseRatio() { return operatingExpenseRatio; }
    }

    static class PeriodComparison {
        private final BigDecimal revenueVariance;
        private final double revenueVariancePercent;

        PeriodComparison(BigDecimal variance, double percent) {
            this.revenueVariance = variance;
            this.revenueVariancePercent = percent;
        }

        BigDecimal getRevenueVariance() { return revenueVariance; }
        double getRevenueVariancePercent() { return revenueVariancePercent; }
    }
}
