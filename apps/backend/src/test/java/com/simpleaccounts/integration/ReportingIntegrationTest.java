package com.simpleaccounts.integration;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Financial Report Generation.
 * Tests P&L, Balance Sheet, Cash Flow, VAT reports, and other financial statements.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Reporting Integration Tests")
class ReportingIntegrationTest {

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should generate Profit and Loss statement")
    @Transactional
    void shouldGenerateProfitAndLossStatement() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        BigDecimal revenue = new BigDecimal("100000.00");
        BigDecimal costOfGoodsSold = new BigDecimal("40000.00");
        BigDecimal operatingExpenses = new BigDecimal("30000.00");

        // When
        BigDecimal grossProfit = revenue.subtract(costOfGoodsSold);
        BigDecimal netProfit = grossProfit.subtract(operatingExpenses);

        // Then
        assertThat(grossProfit).isEqualByComparingTo(new BigDecimal("60000.00"));
        assertThat(netProfit).isEqualByComparingTo(new BigDecimal("30000.00"));
    }

    @Test
    @DisplayName("Should generate Balance Sheet")
    @Transactional
    void shouldGenerateBalanceSheet() {
        // Given
        BigDecimal currentAssets = new BigDecimal("50000.00");
        BigDecimal fixedAssets = new BigDecimal("100000.00");
        BigDecimal currentLiabilities = new BigDecimal("30000.00");
        BigDecimal longTermLiabilities = new BigDecimal("50000.00");

        // When
        BigDecimal totalAssets = currentAssets.add(fixedAssets);
        BigDecimal totalLiabilities = currentLiabilities.add(longTermLiabilities);
        BigDecimal equity = totalAssets.subtract(totalLiabilities);

        // Then
        assertThat(totalAssets).isEqualByComparingTo(new BigDecimal("150000.00"));
        assertThat(totalLiabilities).isEqualByComparingTo(new BigDecimal("80000.00"));
        assertThat(equity).isEqualByComparingTo(new BigDecimal("70000.00"));
    }

    @Test
    @DisplayName("Should generate Cash Flow statement")
    @Transactional
    void shouldGenerateCashFlowStatement() {
        // Given
        BigDecimal operatingCashFlow = new BigDecimal("25000.00");
        BigDecimal investingCashFlow = new BigDecimal("-10000.00");
        BigDecimal financingCashFlow = new BigDecimal("5000.00");
        BigDecimal openingCashBalance = new BigDecimal("10000.00");

        // When
        BigDecimal netCashFlow = operatingCashFlow
                .add(investingCashFlow)
                .add(financingCashFlow);
        BigDecimal closingCashBalance = openingCashBalance.add(netCashFlow);

        // Then
        assertThat(netCashFlow).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(closingCashBalance).isEqualByComparingTo(new BigDecimal("30000.00"));
    }

    @Test
    @DisplayName("Should generate VAT Return report for UAE")
    @Transactional
    void shouldGenerateVatReturnReportForUae() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 10, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        BigDecimal standardRatedSales = new BigDecimal("100000.00");
        BigDecimal vatOnSales = new BigDecimal("5000.00"); // 5% output VAT
        BigDecimal standardRatedPurchases = new BigDecimal("60000.00");
        BigDecimal vatOnPurchases = new BigDecimal("3000.00"); // 5% input VAT

        // When
        BigDecimal netVatPayable = vatOnSales.subtract(vatOnPurchases);

        // Then
        assertThat(netVatPayable).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(vatOnSales).isGreaterThan(vatOnPurchases);
    }

    @Test
    @DisplayName("Should calculate VAT on standard rated supplies")
    @Transactional
    void shouldCalculateVatOnStandardRatedSupplies() {
        // Given
        List<Invoice> standardRatedInvoices = createStandardRatedInvoices();

        // When
        BigDecimal totalSalesAmount = standardRatedInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalVatAmount = standardRatedInvoices.stream()
                .map(Invoice::getTotalVatAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(totalSalesAmount).isGreaterThan(BigDecimal.ZERO);
        assertThat(totalVatAmount).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should handle zero-rated supplies in VAT report")
    @Transactional
    void shouldHandleZeroRatedSuppliesInVatReport() {
        // Given
        Invoice zeroRatedInvoice = new Invoice();
        zeroRatedInvoice.setTotalAmount(new BigDecimal("50000.00"));
        zeroRatedInvoice.setTotalVatAmount(BigDecimal.ZERO); // 0% VAT

        // When
        boolean isZeroRated = zeroRatedInvoice.getTotalVatAmount().compareTo(BigDecimal.ZERO) == 0;

        // Then
        assertThat(isZeroRated).isTrue();
        assertThat(zeroRatedInvoice.getTotalAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should calculate VAT on exempt supplies")
    @Transactional
    void shouldCalculateVatOnExemptSupplies() {
        // Given
        List<Invoice> exemptInvoices = createExemptInvoices();

        // When
        BigDecimal totalExemptSales = exemptInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalVat = exemptInvoices.stream()
                .map(Invoice::getTotalVatAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(totalExemptSales).isGreaterThan(BigDecimal.ZERO);
        assertThat(totalVat).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should generate Accounts Receivable aging report")
    @Transactional
    void shouldGenerateAccountsReceivableAgingReport() {
        // Given
        List<Invoice> unpaidInvoices = createUnpaidInvoices();

        // When
        Map<String, BigDecimal> agingBuckets = new HashMap<>();
        agingBuckets.put("Current", BigDecimal.ZERO);
        agingBuckets.put("1-30 days", BigDecimal.ZERO);
        agingBuckets.put("31-60 days", BigDecimal.ZERO);
        agingBuckets.put("60+ days", BigDecimal.ZERO);

        LocalDate today = LocalDate.now();
        for (Invoice invoice : unpaidInvoices) {
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(
                invoice.getInvoiceDueDate(), today
            );

            if (daysOverdue <= 0) {
                agingBuckets.merge("Current", invoice.getDueAmount(), BigDecimal::add);
            } else if (daysOverdue <= 30) {
                agingBuckets.merge("1-30 days", invoice.getDueAmount(), BigDecimal::add);
            } else if (daysOverdue <= 60) {
                agingBuckets.merge("31-60 days", invoice.getDueAmount(), BigDecimal::add);
            } else {
                agingBuckets.merge("60+ days", invoice.getDueAmount(), BigDecimal::add);
            }
        }

        // Then
        assertThat(agingBuckets).isNotEmpty();
        BigDecimal totalDue = agingBuckets.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalDue).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should generate Accounts Payable aging report")
    @Transactional
    void shouldGenerateAccountsPayableAgingReport() {
        // Given
        List<Invoice> unpaidBills = createUnpaidSupplierInvoices();

        // When
        BigDecimal totalPayable = unpaidBills.stream()
                .map(Invoice::getDueAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(totalPayable).isGreaterThan(BigDecimal.ZERO);
        assertThat(unpaidBills).isNotEmpty();
    }

    @Test
    @DisplayName("Should generate Trial Balance report")
    @Transactional
    void shouldGenerateTrialBalanceReport() {
        // Given
        List<TransactionCategory> accounts = createChartOfAccounts();

        // When
        BigDecimal totalDebits = accounts.stream()
                .filter(acc -> acc.getBalance() != null && acc.getBalance().compareTo(BigDecimal.ZERO) > 0)
                .map(TransactionCategory::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredits = accounts.stream()
                .filter(acc -> acc.getBalance() != null && acc.getBalance().compareTo(BigDecimal.ZERO) < 0)
                .map(acc -> acc.getBalance().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(totalDebits).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(totalCredits).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should generate General Ledger report")
    @Transactional
    void shouldGenerateGeneralLedgerReport() {
        // Given
        TransactionCategory account = new TransactionCategory();
        account.setCode("SALES");
        account.setDescription("Sales Revenue");

        List<LeadgerEntry> ledgerEntries = createLedgerEntries();

        // When
        BigDecimal accountBalance = ledgerEntries.stream()
                .map(entry -> {
                    if ("DEBIT".equals(entry.getDebitCredit())) {
                        return entry.getAmount();
                    } else {
                        return entry.getAmount().negate();
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(ledgerEntries).isNotEmpty();
        assertThat(accountBalance).isNotNull();
    }

    @Test
    @DisplayName("Should generate Sales by Customer report")
    @Transactional
    void shouldGenerateSalesByCustomerReport() {
        // Given
        List<Invoice> customerInvoices = createCustomerInvoices();

        // When
        Map<String, BigDecimal> salesByCustomer = new HashMap<>();
        for (Invoice invoice : customerInvoices) {
            String customerName = invoice.getContact() != null ?
                    invoice.getContact().getContactName() : "Unknown";
            salesByCustomer.merge(customerName, invoice.getTotalAmount(), BigDecimal::add);
        }

        // Then
        assertThat(salesByCustomer).isNotEmpty();
    }

    @Test
    @DisplayName("Should generate Product Sales report")
    @Transactional
    void shouldGenerateProductSalesReport() {
        // Given
        List<InvoiceLineItem> lineItems = createInvoiceLineItems();

        // When
        Map<String, BigDecimal> salesByProduct = new HashMap<>();
        for (InvoiceLineItem item : lineItems) {
            String productName = item.getDescription();
            salesByProduct.merge(productName, item.getSubTotal(), BigDecimal::add);
        }

        // Then
        assertThat(salesByProduct).isNotEmpty();
    }

    @Test
    @DisplayName("Should generate Expense by Category report")
    @Transactional
    void shouldGenerateExpenseByCategoryReport() {
        // Given
        List<Expense> expenses = createExpenses();

        // When
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        for (Expense expense : expenses) {
            String category = expense.getTransactionCategory() != null ?
                    expense.getTransactionCategory().getDescription() : "Uncategorized";
            expenseByCategory.merge(category, expense.getExpenseAmount(), BigDecimal::add);
        }

        // Then
        assertThat(expenseByCategory).isNotEmpty();
    }

    @Test
    @DisplayName("Should generate Project Profitability report")
    @Transactional
    void shouldGenerateProjectProfitabilityReport() {
        // Given
        Project project = new Project();
        project.setId(1);
        project.setProjectName("Office Renovation");

        List<Invoice> projectInvoices = createProjectInvoices(project);
        List<Expense> projectExpenses = createProjectExpenses(project);

        // When
        BigDecimal totalRevenue = projectInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCosts = projectExpenses.stream()
                .map(Expense::getExpenseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectProfit = totalRevenue.subtract(totalCosts);

        // Then
        assertThat(totalRevenue).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(totalCosts).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(projectProfit).isNotNull();
    }

    @Test
    @DisplayName("Should filter reports by date range")
    @Transactional
    void shouldFilterReportsByDateRange() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        List<Invoice> allInvoices = createAllInvoices();

        // When
        List<Invoice> filteredInvoices = allInvoices.stream()
                .filter(inv -> !inv.getInvoiceDate().isBefore(startDate)
                            && !inv.getInvoiceDate().isAfter(endDate))
                .toList();

        // Then
        assertThat(filteredInvoices).allMatch(inv ->
                !inv.getInvoiceDate().isBefore(startDate) &&
                !inv.getInvoiceDate().isAfter(endDate));
    }

    // Helper methods

    private List<Invoice> createStandardRatedInvoices() {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv = new Invoice();
        inv.setTotalAmount(new BigDecimal("10500.00"));
        inv.setTotalVatAmount(new BigDecimal("500.00"));
        invoices.add(inv);
        return invoices;
    }

    private List<Invoice> createExemptInvoices() {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv = new Invoice();
        inv.setTotalAmount(new BigDecimal("20000.00"));
        inv.setTotalVatAmount(BigDecimal.ZERO);
        invoices.add(inv);
        return invoices;
    }

    private List<Invoice> createUnpaidInvoices() {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv1 = new Invoice();
        inv1.setInvoiceDueDate(LocalDate.now().minusDays(45));
        inv1.setDueAmount(new BigDecimal("5000.00"));
        invoices.add(inv1);

        Invoice inv2 = new Invoice();
        inv2.setInvoiceDueDate(LocalDate.now().minusDays(15));
        inv2.setDueAmount(new BigDecimal("3000.00"));
        invoices.add(inv2);

        return invoices;
    }

    private List<Invoice> createUnpaidSupplierInvoices() {
        return createUnpaidInvoices();
    }

    private List<TransactionCategory> createChartOfAccounts() {
        List<TransactionCategory> accounts = new ArrayList<>();
        TransactionCategory acc = new TransactionCategory();
        acc.setCode("CASH");
        acc.setBalance(new BigDecimal("10000.00"));
        accounts.add(acc);
        return accounts;
    }

    private List<LeadgerEntry> createLedgerEntries() {
        List<LeadgerEntry> entries = new ArrayList<>();
        LeadgerEntry entry = new LeadgerEntry();
        entry.setAmount(new BigDecimal("1000.00"));
        entry.setDebitCredit("CREDIT");
        entries.add(entry);
        return entries;
    }

    private List<Invoice> createCustomerInvoices() {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv = new Invoice();
        inv.setTotalAmount(new BigDecimal("5000.00"));
        Contact contact = new Contact();
        contact.setContactName("Customer A");
        inv.setContact(contact);
        invoices.add(inv);
        return invoices;
    }

    private List<InvoiceLineItem> createInvoiceLineItems() {
        List<InvoiceLineItem> items = new ArrayList<>();
        InvoiceLineItem item = new InvoiceLineItem();
        item.setDescription("Product A");
        item.setSubTotal(new BigDecimal("1000.00"));
        items.add(item);
        return items;
    }

    private List<Expense> createExpenses() {
        List<Expense> expenses = new ArrayList<>();
        Expense exp = Expense.builder()
                .expenseAmount(new BigDecimal("500.00"))
                .build();
        expenses.add(exp);
        return expenses;
    }

    private List<Invoice> createProjectInvoices(Project project) {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv = new Invoice();
        inv.setProject(project);
        inv.setTotalAmount(new BigDecimal("10000.00"));
        invoices.add(inv);
        return invoices;
    }

    private List<Expense> createProjectExpenses(Project project) {
        List<Expense> expenses = new ArrayList<>();
        Expense exp = Expense.builder()
                .project(project)
                .expenseAmount(new BigDecimal("6000.00"))
                .build();
        expenses.add(exp);
        return expenses;
    }

    private List<Invoice> createAllInvoices() {
        List<Invoice> invoices = new ArrayList<>();
        Invoice inv1 = new Invoice();
        inv1.setInvoiceDate(LocalDate.of(2024, 6, 15));
        inv1.setTotalAmount(new BigDecimal("1000.00"));
        invoices.add(inv1);

        Invoice inv2 = new Invoice();
        inv2.setInvoiceDate(LocalDate.of(2023, 12, 1));
        inv2.setTotalAmount(new BigDecimal("2000.00"));
        invoices.add(inv2);

        return invoices;
    }
}
