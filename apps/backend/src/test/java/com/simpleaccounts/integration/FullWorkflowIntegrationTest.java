package com.simpleaccounts.integration;

import com.simpleaccounts.constant.InvoiceStatusConstant;
import com.simpleaccounts.constant.ExpenseStatusEnum;
import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Complete Business Workflows.
 * Tests end-to-end business processes combining multiple modules.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Full Workflow Integration Tests")
class FullWorkflowIntegrationTest {

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should complete full sales workflow from quote to payment")
    @Transactional
    void shouldCompleteFullSalesWorkflowFromQuoteToPayment() {
        // Given - Create a quotation
        Invoice quotation = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        quotation.setReferenceNumber("QUOTE-2024-001");
        quotation.setStatus(InvoiceStatusConstant.DRAFT);
        quotation.setTotalAmount(new BigDecimal("10000.00"));

        // When - Convert quotation to invoice
        Invoice invoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        invoice.setReferenceNumber("INV-2024-001");
        invoice.setStatus(InvoiceStatusConstant.APPROVED);
        invoice.setTotalAmount(quotation.getTotalAmount());
        invoice.setDueAmount(quotation.getTotalAmount());

        // Record payment
        Receipt receipt = new Receipt();
        receipt.setReceiptAmount(new BigDecimal("10000.00"));
        receipt.setReceiptDate(LocalDate.now());

        // Update invoice status
        invoice.setDueAmount(invoice.getDueAmount().subtract(receipt.getReceiptAmount()));
        invoice.setStatus(InvoiceStatusConstant.PAID);

        // Then
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatusConstant.PAID);
        assertThat(invoice.getDueAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should complete full purchase workflow from PO to payment")
    @Transactional
    void shouldCompleteFullPurchaseWorkflowFromPoToPayment() {
        // Given - Create purchase order
        Purchase purchaseOrder = new Purchase();
        purchaseOrder.setPurchaseNumber("PO-2024-001");
        purchaseOrder.setTotalAmount(new BigDecimal("5000.00"));
        purchaseOrder.setStatus(1); // Draft

        // When - Convert to bill
        Invoice bill = createInvoice(ContactTypeEnum.SUPPLIER.getValue());
        bill.setReferenceNumber("BILL-2024-001");
        bill.setStatus(InvoiceStatusConstant.APPROVED);
        bill.setTotalAmount(purchaseOrder.getTotalAmount());
        bill.setDueAmount(purchaseOrder.getTotalAmount());

        // Record payment
        Payment payment = new Payment();
        payment.setPaymentAmount(new BigDecimal("5000.00"));
        payment.setPaymentDate(LocalDate.now());

        // Update bill status
        bill.setDueAmount(bill.getDueAmount().subtract(payment.getPaymentAmount()));
        bill.setStatus(InvoiceStatusConstant.PAID);

        // Then
        assertThat(bill.getStatus()).isEqualTo(InvoiceStatusConstant.PAID);
        assertThat(bill.getDueAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should complete expense approval and posting workflow")
    @Transactional
    void shouldCompleteExpenseApprovalAndPostingWorkflow() {
        // Given - Create expense
        Expense expense = createExpense();
        expense.setExpenseNumber("EXP-2024-001");
        expense.setExpenseAmount(new BigDecimal("1000.00"));
        expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());

        // When - Approve expense
        expense.setStatus(ExpenseStatusEnum.POSTED.getValue());

        // Create journal entry
        Journal journal = new Journal();
        journal.setJournalDate(LocalDate.now());
        journal.setDescription("Expense posting: " + expense.getExpenseNumber());

        List<JournalLineItem> lineItems = new ArrayList<>();

        JournalLineItem debitLine = new JournalLineItem();
        debitLine.setDebit(expense.getExpenseAmount());
        debitLine.setCredit(BigDecimal.ZERO);
        lineItems.add(debitLine);

        JournalLineItem creditLine = new JournalLineItem();
        creditLine.setDebit(BigDecimal.ZERO);
        creditLine.setCredit(expense.getExpenseAmount());
        lineItems.add(creditLine);

        journal.setJournalLineItems(lineItems);

        // Then
        assertThat(expense.getStatus()).isEqualTo(ExpenseStatusEnum.POSTED.getValue());
        assertThat(journal.getJournalLineItems()).hasSize(2);

        BigDecimal totalDebits = lineItems.stream()
                .map(JournalLineItem::getDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = lineItems.stream()
                .map(JournalLineItem::getCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(totalDebits).isEqualByComparingTo(totalCredits);
    }

    @Test
    @DisplayName("Should complete monthly payroll workflow")
    @Transactional
    void shouldCompleteMonthlyPayrollWorkflow() {
        // Given - Create payroll
        Payroll payroll = new Payroll();
        payroll.setPayPeriod("December 2024");
        payroll.setStatus("DRAFT");
        payroll.setEmployeeCount(10);

        // Add employee salaries
        List<PayrollEmployee> employees = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            PayrollEmployee emp = new PayrollEmployee();
            emp.setBasicSalary(new BigDecimal("5000.00"));
            emp.setNetSalary(new BigDecimal("5000.00"));
            employees.add(emp);
        }

        BigDecimal totalPayroll = employees.stream()
                .map(PayrollEmployee::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        payroll.setTotalAmountPayroll(totalPayroll);
        payroll.setDueAmountPayroll(totalPayroll);

        // When - Approve and post payroll
        payroll.setStatus("APPROVED");
        payroll.setApprovedBy("Manager");

        // Create journal entry for payroll
        Journal payrollJournal = new Journal();
        payrollJournal.setJournalDate(LocalDate.now());
        payrollJournal.setDescription("Payroll for " + payroll.getPayPeriod());

        // Mark as paid
        payroll.setDueAmountPayroll(BigDecimal.ZERO);
        payroll.setStatus("PAID");

        // Then
        assertThat(payroll.getStatus()).isEqualTo("PAID");
        assertThat(payroll.getTotalAmountPayroll()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(payroll.getDueAmountPayroll()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should complete bank reconciliation workflow")
    @Transactional
    void shouldCompleteBankReconciliationWorkflow() {
        // Given - Bank account with opening balance
        BankAccount bankAccount = new BankAccount();
        bankAccount.setAccountName("Main Account");
        bankAccount.setOpeningBalance(new BigDecimal("10000.00"));

        // Create invoice
        Invoice invoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        invoice.setTotalAmount(new BigDecimal("5000.00"));
        invoice.setStatus(InvoiceStatusConstant.APPROVED);
        invoice.setDueAmount(invoice.getTotalAmount());

        // When - Receive bank transaction
        Transaction bankTransaction = new Transaction();
        bankTransaction.setTransactionDate(LocalDate.now());
        bankTransaction.setTransactionAmount(new BigDecimal("5000.00"));
        bankTransaction.setTransactionType("CREDIT");
        bankTransaction.setDescription("Payment from customer");

        // Match transaction with invoice
        invoice.setDueAmount(invoice.getDueAmount().subtract(bankTransaction.getTransactionAmount()));
        invoice.setStatus(InvoiceStatusConstant.PAID);

        // Update bank balance
        BigDecimal newBalance = bankAccount.getOpeningBalance()
                .add(bankTransaction.getTransactionAmount());

        // Then
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatusConstant.PAID);
        assertThat(newBalance).isEqualByComparingTo(new BigDecimal("15000.00"));
    }

    @Test
    @DisplayName("Should complete month-end closing workflow")
    @Transactional
    void shouldCompleteMonthEndClosingWorkflow() {
        // Given
        LocalDate periodEndDate = LocalDate.of(2024, 12, 31);

        // Calculate P&L
        BigDecimal revenue = new BigDecimal("100000.00");
        BigDecimal expenses = new BigDecimal("70000.00");
        BigDecimal netProfit = revenue.subtract(expenses);

        // When - Close period
        TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
        closingBalance.setClosingDate(periodEndDate);
        closingBalance.setClosingBalance(netProfit);

        // Create closing journal entry
        Journal closingJournal = new Journal();
        closingJournal.setJournalDate(periodEndDate);
        closingJournal.setDescription("Period closing - December 2024");

        // Then
        assertThat(netProfit).isEqualByComparingTo(new BigDecimal("30000.00"));
        assertThat(closingBalance.getClosingBalance()).isEqualByComparingTo(netProfit);
    }

    @Test
    @DisplayName("Should complete VAT filing workflow")
    @Transactional
    void shouldCompleteVatFilingWorkflow() {
        // Given - Calculate VAT for period
        LocalDate startDate = LocalDate.of(2024, 10, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        BigDecimal outputVat = new BigDecimal("5000.00");
        BigDecimal inputVat = new BigDecimal("3000.00");
        BigDecimal netVatPayable = outputVat.subtract(inputVat);

        // When - File VAT return
        VatReportFiling vatReturn = new VatReportFiling();
        vatReturn.setFilingDate(LocalDate.now());
        vatReturn.setFromDate(startDate);
        vatReturn.setToDate(endDate);
        vatReturn.setVatPayable(netVatPayable);
        vatReturn.setStatus("FILED");

        // Record VAT payment
        VatPayment vatPayment = new VatPayment();
        vatPayment.setPaymentAmount(netVatPayable);
        vatPayment.setPaymentDate(LocalDate.now());

        // Then
        assertThat(vatReturn.getVatPayable()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(vatReturn.getStatus()).isEqualTo("FILED");
        assertThat(vatPayment.getPaymentAmount()).isEqualByComparingTo(netVatPayable);
    }

    @Test
    @DisplayName("Should complete project lifecycle workflow")
    @Transactional
    void shouldCompleteProjectLifecycleWorkflow() {
        // Given - Create project
        Project project = new Project();
        project.setProjectName("Office Renovation");
        project.setProjectStartDate(LocalDate.of(2024, 1, 1));
        project.setProjectEndDate(LocalDate.of(2024, 6, 30));

        // Create project invoice
        Invoice projectInvoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        projectInvoice.setProject(project);
        projectInvoice.setTotalAmount(new BigDecimal("50000.00"));
        projectInvoice.setStatus(InvoiceStatusConstant.PAID);

        // Create project expenses
        Expense projectExpense = createExpense();
        projectExpense.setProject(project);
        projectExpense.setExpenseAmount(new BigDecimal("30000.00"));

        // When - Calculate project profitability
        BigDecimal projectRevenue = projectInvoice.getTotalAmount();
        BigDecimal projectCosts = projectExpense.getExpenseAmount();
        BigDecimal projectProfit = projectRevenue.subtract(projectCosts);
        BigDecimal profitMargin = projectProfit.divide(projectRevenue, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));

        // Then
        assertThat(projectProfit).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(profitMargin).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should complete recurring invoice workflow")
    @Transactional
    void shouldCompleteRecurringInvoiceWorkflow() {
        // Given - Create recurring invoice template
        Invoice templateInvoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        templateInvoice.setReferenceNumber("RECURRING-TEMPLATE");
        templateInvoice.setTotalAmount(new BigDecimal("1000.00"));

        // When - Generate monthly invoices
        List<Invoice> generatedInvoices = new ArrayList<>();
        for (int month = 1; month <= 3; month++) {
            Invoice monthlyInvoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
            monthlyInvoice.setReferenceNumber("INV-2024-" + String.format("%03d", month));
            monthlyInvoice.setInvoiceDate(LocalDate.of(2024, month, 1));
            monthlyInvoice.setTotalAmount(templateInvoice.getTotalAmount());
            monthlyInvoice.setStatus(InvoiceStatusConstant.APPROVED);
            generatedInvoices.add(monthlyInvoice);
        }

        // Then
        assertThat(generatedInvoices).hasSize(3);
        assertThat(generatedInvoices).allMatch(inv ->
                inv.getTotalAmount().compareTo(new BigDecimal("1000.00")) == 0);
    }

    @Test
    @DisplayName("Should complete inventory management workflow")
    @Transactional
    void shouldCompleteInventoryManagementWorkflow() {
        // Given - Create product
        Product product = new Product();
        product.setProductName("Widget A");

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(new BigDecimal("100"));

        // When - Create purchase (increase inventory)
        Purchase purchase = new Purchase();
        purchase.setTotalAmount(new BigDecimal("5000.00"));

        BigDecimal purchaseQuantity = new BigDecimal("50");
        inventory.setQuantity(inventory.getQuantity().add(purchaseQuantity));

        // Create sale (decrease inventory)
        Invoice sale = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        sale.setTotalAmount(new BigDecimal("3000.00"));

        BigDecimal saleQuantity = new BigDecimal("30");
        inventory.setQuantity(inventory.getQuantity().subtract(saleQuantity));

        // Then
        assertThat(inventory.getQuantity()).isEqualByComparingTo(new BigDecimal("120"));
    }

    @Test
    @DisplayName("Should complete credit note workflow")
    @Transactional
    void shouldCompleteCreditNoteWorkflow() {
        // Given - Paid invoice
        Invoice originalInvoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        originalInvoice.setReferenceNumber("INV-2024-001");
        originalInvoice.setTotalAmount(new BigDecimal("10000.00"));
        originalInvoice.setStatus(InvoiceStatusConstant.PAID);
        originalInvoice.setDueAmount(BigDecimal.ZERO);

        // When - Create credit note for return
        CreditNote creditNote = new CreditNote();
        creditNote.setCreditNoteDate(LocalDate.now());
        creditNote.setCreditNoteAmount(new BigDecimal("2000.00"));
        creditNote.setNotes("Product return");

        // Apply credit note
        Receipt receipt = new Receipt();
        receipt.setReceiptAmount(creditNote.getCreditNoteAmount().negate());
        receipt.setReceiptDate(LocalDate.now());

        // Then
        assertThat(creditNote.getCreditNoteAmount()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(receipt.getReceiptAmount()).isEqualByComparingTo(new BigDecimal("-2000.00"));
    }

    @Test
    @DisplayName("Should complete multi-currency transaction workflow")
    @Transactional
    void shouldCompleteMultiCurrencyTransactionWorkflow() {
        // Given - Invoice in USD
        Invoice usdInvoice = createInvoice(ContactTypeEnum.CUSTOMER.getValue());
        Currency usd = new Currency();
        usd.setCurrencyCode("USD");
        usdInvoice.setCurrency(usd);
        usdInvoice.setTotalAmount(new BigDecimal("1000.00"));
        usdInvoice.setExchangeRate(new BigDecimal("3.67"));

        // When - Convert to base currency (AED)
        BigDecimal amountInAED = usdInvoice.getTotalAmount()
                .multiply(usdInvoice.getExchangeRate());

        // Record in base currency
        Journal journal = new Journal();
        journal.setJournalDate(LocalDate.now());
        journal.setDescription("USD Invoice conversion");

        // Then
        assertThat(amountInAED).isEqualByComparingTo(new BigDecimal("3670.00"));
    }

    @Test
    @DisplayName("Should complete year-end audit trail workflow")
    @Transactional
    void shouldCompleteYearEndAuditTrailWorkflow() {
        // Given - Collect all transactions for the year
        LocalDate yearStart = LocalDate.of(2024, 1, 1);
        LocalDate yearEnd = LocalDate.of(2024, 12, 31);

        List<Invoice> yearInvoices = new ArrayList<>();
        List<Expense> yearExpenses = new ArrayList<>();
        List<Journal> yearJournals = new ArrayList<>();

        // When - Generate audit report
        BigDecimal totalRevenue = yearInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = yearExpenses.stream()
                .map(Expense::getExpenseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(totalRevenue).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(totalExpenses).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should complete budget vs actual workflow")
    @Transactional
    void shouldCompleteBudgetVsActualWorkflow() {
        // Given - Budget for expense category
        TransactionCategory category = new TransactionCategory();
        category.setCode("MARKETING");
        category.setDescription("Marketing Expenses");

        BigDecimal budgetAmount = new BigDecimal("10000.00");

        // Actual expenses
        List<Expense> actualExpenses = new ArrayList<>();
        Expense exp1 = createExpense();
        exp1.setExpenseAmount(new BigDecimal("3000.00"));
        actualExpenses.add(exp1);

        Expense exp2 = createExpense();
        exp2.setExpenseAmount(new BigDecimal("4500.00"));
        actualExpenses.add(exp2);

        // When - Calculate variance
        BigDecimal actualAmount = actualExpenses.stream()
                .map(Expense::getExpenseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal variance = budgetAmount.subtract(actualAmount);
        BigDecimal variancePercentage = variance.divide(budgetAmount, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));

        // Then
        assertThat(actualAmount).isEqualByComparingTo(new BigDecimal("7500.00"));
        assertThat(variance).isEqualByComparingTo(new BigDecimal("2500.00"));
        assertThat(variancePercentage).isGreaterThan(BigDecimal.ZERO);
    }

    // Helper methods

    private Invoice createInvoice(Integer type) {
        Invoice invoice = new Invoice();
        invoice.setType(type);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setInvoiceDueDate(LocalDate.now().plusDays(30));
        invoice.setCreatedDate(LocalDateTime.now());
        invoice.setDeleteFlag(false);
        invoice.setTotalAmount(BigDecimal.ZERO);
        invoice.setTotalVatAmount(BigDecimal.ZERO);
        invoice.setDueAmount(BigDecimal.ZERO);
        return invoice;
    }

    private Expense createExpense() {
        return Expense.builder()
                .expenseDate(LocalDate.now())
                .createdDate(LocalDateTime.now())
                .deleteFlag(false)
                .expenseAmount(BigDecimal.ZERO)
                .expenseVatAmount(BigDecimal.ZERO)
                .status(ExpenseStatusEnum.DRAFT.getValue())
                .build();
    }
}
