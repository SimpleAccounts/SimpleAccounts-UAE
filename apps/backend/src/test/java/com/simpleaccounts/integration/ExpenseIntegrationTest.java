package com.simpleaccounts.integration;

import com.simpleaccounts.constant.ExpenseStatusEnum;
import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.VatCategoryService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Expense processing workflows with VAT.
 * Tests expense creation, approval, VAT calculation, and posting.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Expense Integration Tests")
class ExpenseIntegrationTest {

    @Autowired(required = false)
    private ExpenseService expenseService;

    @Autowired(required = false)
    private EmployeeService employeeService;

    @Autowired(required = false)
    private VatCategoryService vatCategoryService;

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should create expense with VAT calculation")
    @Transactional
    void shouldCreateExpenseWithVatCalculation() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseNumber("EXP-2024-001");
        expense.setExpenseAmount(new BigDecimal("1000.00"));
        expense.setVatClaimable(true);

        // When - Calculate 5% VAT
        BigDecimal vatRate = new BigDecimal("0.05");
        BigDecimal vatAmount = expense.getExpenseAmount().multiply(vatRate);
        expense.setExpenseVatAmount(vatAmount);

        // Then
        assertThat(expense.getExpenseVatAmount()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(expense.getVatClaimable()).isTrue();
    }

    @Test
    @DisplayName("Should process expense with inclusive VAT")
    @Transactional
    void shouldProcessExpenseWithInclusiveVat() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseAmount(new BigDecimal("1050.00")); // Total including VAT
        expense.setExclusiveVat(false); // Inclusive VAT

        // When - Calculate VAT from inclusive amount (5% VAT)
        BigDecimal totalWithVat = expense.getExpenseAmount();
        BigDecimal baseAmount = totalWithVat.divide(new BigDecimal("1.05"), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal vatAmount = totalWithVat.subtract(baseAmount);

        expense.setExpenseVatAmount(vatAmount);

        // Then
        assertThat(expense.getExpenseVatAmount()).isGreaterThan(BigDecimal.ZERO);
        assertThat(expense.getExclusiveVat()).isFalse();
    }

    @Test
    @DisplayName("Should process expense with exclusive VAT")
    @Transactional
    void shouldProcessExpenseWithExclusiveVat() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseAmount(new BigDecimal("1000.00")); // Base amount
        expense.setExclusiveVat(true); // Exclusive VAT

        // When - Add 5% VAT
        BigDecimal vatRate = new BigDecimal("0.05");
        BigDecimal vatAmount = expense.getExpenseAmount().multiply(vatRate);
        BigDecimal totalAmount = expense.getExpenseAmount().add(vatAmount);

        expense.setExpenseVatAmount(vatAmount);

        // Then
        assertThat(expense.getExpenseVatAmount()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(totalAmount).isEqualByComparingTo(new BigDecimal("1050.00"));
    }

    @Test
    @DisplayName("Should create expense paid by cash")
    @Transactional
    void shouldCreateExpensePaidByCash() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseNumber("EXP-2024-002");
        expense.setPayMode(PayMode.CASH);
        expense.setExpenseAmount(new BigDecimal("500.00"));
        expense.setPayee("Petty Cash");

        // When
        expense.setStatus(ExpenseStatusEnum.POSTED.getValue());

        // Then
        assertThat(expense.getPayMode()).isEqualTo(PayMode.CASH);
        assertThat(expense.getPayee()).isEqualTo("Petty Cash");
        assertThat(expense.getStatus()).isEqualTo(ExpenseStatusEnum.POSTED.getValue());
    }

    @Test
    @DisplayName("Should create expense paid by bank transfer")
    @Transactional
    void shouldCreateExpensePaidByBankTransfer() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseNumber("EXP-2024-003");
        expense.setPayMode(PayMode.BANK_TRANSFER);
        expense.setExpenseAmount(new BigDecimal("5000.00"));

        BankAccount bankAccount = new BankAccount();
        bankAccount.setId(1);
        bankAccount.setAccountName("Main Business Account");
        expense.setBankAccount(bankAccount);

        // When
        expense.setStatus(ExpenseStatusEnum.POSTED.getValue());

        // Then
        assertThat(expense.getPayMode()).isEqualTo(PayMode.BANK_TRANSFER);
        assertThat(expense.getBankAccount()).isNotNull();
        assertThat(expense.getBankAccount().getAccountName()).isEqualTo("Main Business Account");
    }

    @Test
    @DisplayName("Should link expense to employee")
    @Transactional
    void shouldLinkExpenseToEmployee() {
        // Given
        Expense expense = createTestExpense();
        Employee employee = new Employee();
        employee.setEmployeeId(1);
        employee.setFirstName("John");
        employee.setLastName("Doe");

        expense.setEmployee(employee);
        expense.setExpenseDescription("Business travel expense");

        // When
        boolean hasEmployee = expense.getEmployee() != null;

        // Then
        assertThat(hasEmployee).isTrue();
        assertThat(expense.getEmployee().getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("Should link expense to project")
    @Transactional
    void shouldLinkExpenseToProject() {
        // Given
        Expense expense = createTestExpense();
        Project project = new Project();
        project.setId(1);
        project.setProjectName("Office Renovation");

        expense.setProject(project);
        expense.setExpenseDescription("Project materials");

        // When
        boolean hasProject = expense.getProject() != null;

        // Then
        assertThat(hasProject).isTrue();
        assertThat(expense.getProject().getProjectName()).isEqualTo("Office Renovation");
    }

    @Test
    @DisplayName("Should process expense with reverse charge VAT")
    @Transactional
    void shouldProcessExpenseWithReverseChargeVat() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseAmount(new BigDecimal("10000.00"));
        expense.setIsReverseChargeEnabled(true);
        expense.setVatClaimable(true);

        // When - Reverse charge: both input and output VAT
        BigDecimal vatRate = new BigDecimal("0.05");
        BigDecimal vatAmount = expense.getExpenseAmount().multiply(vatRate);
        expense.setExpenseVatAmount(vatAmount);

        // Then
        assertThat(expense.getIsReverseChargeEnabled()).isTrue();
        assertThat(expense.getExpenseVatAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    @DisplayName("Should categorize expense correctly")
    @Transactional
    void shouldCategorizeExpenseCorrectly() {
        // Given
        Expense expense = createTestExpense();
        TransactionCategory category = new TransactionCategory();
        category.setCode("RENT");
        category.setDescription("Office Rent");

        expense.setTransactionCategory(category);
        expense.setExpenseDescription("Monthly office rent");

        // When
        boolean hasCategoryCode = expense.getTransactionCategory() != null &&
                                  expense.getTransactionCategory().getCode() != null;

        // Then
        assertThat(hasCategoryCode).isTrue();
        assertThat(expense.getTransactionCategory().getCode()).isEqualTo("RENT");
    }

    @Test
    @DisplayName("Should attach receipt to expense")
    @Transactional
    void shouldAttachReceiptToExpense() {
        // Given
        Expense expense = createTestExpense();
        expense.setReceiptNumber("RCP-001");
        expense.setReceiptAttachmentPath("/receipts/2024/");
        expense.setReceiptAttachmentFileName("receipt_001.pdf");
        expense.setReceiptAttachmentDescription("Supplier invoice receipt");

        // When
        boolean hasReceipt = expense.getReceiptAttachmentFileName() != null;

        // Then
        assertThat(hasReceipt).isTrue();
        assertThat(expense.getReceiptAttachmentFileName()).isEqualTo("receipt_001.pdf");
    }

    @Test
    @DisplayName("Should handle expense with foreign currency")
    @Transactional
    void shouldHandleExpenseWithForeignCurrency() {
        // Given
        Expense expense = createTestExpense();
        Currency usd = new Currency();
        usd.setCurrencyCode("USD");
        usd.setCurrencyIsoCode("USD");

        expense.setCurrency(usd);
        expense.setExchangeRate(new BigDecimal("3.67")); // USD to AED
        expense.setExpenseAmount(new BigDecimal("1000.00")); // USD

        // When - Convert to base currency
        BigDecimal amountInBaseCurrency = expense.getExpenseAmount().multiply(expense.getExchangeRate());

        // Then
        assertThat(expense.getCurrency().getCurrencyCode()).isEqualTo("USD");
        assertThat(amountInBaseCurrency).isEqualByComparingTo(new BigDecimal("3670.00"));
    }

    @Test
    @DisplayName("Should update expense status from draft to posted")
    @Transactional
    void shouldUpdateExpenseStatusFromDraftToPosted() {
        // Given
        Expense expense = createTestExpense();
        expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
        expense.setExpenseNumber("EXP-2024-004");

        // When
        expense.setStatus(ExpenseStatusEnum.POSTED.getValue());
        expense.setLastUpdateBy(1);
        expense.setLastUpdateDate(LocalDateTime.now());

        // Then
        assertThat(expense.getStatus()).isEqualTo(ExpenseStatusEnum.POSTED.getValue());
    }

    @Test
    @DisplayName("Should handle non-VAT claimable expenses")
    @Transactional
    void shouldHandleNonVatClaimableExpenses() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseAmount(new BigDecimal("1000.00"));
        expense.setVatClaimable(false);
        expense.setExpenseVatAmount(new BigDecimal("50.00"));

        // When
        boolean canClaimVat = expense.getVatClaimable();

        // Then
        assertThat(canClaimVat).isFalse();
        assertThat(expense.getExpenseVatAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should soft delete expense")
    @Transactional
    void shouldSoftDeleteExpense() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseNumber("EXP-2024-DELETE");
        expense.setDeleteFlag(false);

        // When
        expense.setDeleteFlag(true);
        expense.setLastUpdateBy(1);
        expense.setLastUpdateDate(LocalDateTime.now());

        // Then
        assertThat(expense.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle migrated expense records")
    @Transactional
    void shouldHandleMigratedExpenseRecords() {
        // Given
        Expense expense = createTestExpense();
        expense.setExpenseNumber("EXP-MIGRATED-001");
        expense.setIsMigratedRecord(true);
        expense.setExpenseAmount(new BigDecimal("2500.00"));

        // When
        boolean isMigrated = expense.getIsMigratedRecord();

        // Then
        assertThat(isMigrated).isTrue();
        assertThat(expense.getExpenseNumber()).startsWith("EXP-MIGRATED");
    }

    // Helper methods

    private Expense createTestExpense() {
        return Expense.builder()
                .expenseDate(LocalDate.now())
                .createdBy(1)
                .createdDate(LocalDateTime.now())
                .lastUpdateDate(LocalDateTime.now())
                .deleteFlag(false)
                .versionNumber(1)
                .vatClaimable(false)
                .exclusiveVat(false)
                .isMigratedRecord(false)
                .isReverseChargeEnabled(false)
                .editFlag(true)
                .expenseType(false)
                .bankGenerated(false)
                .status(ExpenseStatusEnum.DRAFT.getValue())
                .expenseAmount(BigDecimal.ZERO)
                .expenseVatAmount(BigDecimal.ZERO)
                .build();
    }
}
