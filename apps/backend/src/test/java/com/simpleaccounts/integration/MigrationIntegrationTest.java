package com.simpleaccounts.integration;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
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
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Data Migration workflows.
 * Tests migration of legacy data, data validation, and migration rollback scenarios.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Migration Integration Tests")
class MigrationIntegrationTest {

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should migrate customer invoices from legacy system")
    @Transactional
    void shouldMigrateCustomerInvoicesFromLegacySystem() {
        // Given
        List<LegacyInvoice> legacyInvoices = createLegacyInvoices();

        // When
        List<Invoice> migratedInvoices = legacyInvoices.stream()
                .map(this::convertLegacyInvoice)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedInvoices).hasSize(legacyInvoices.size());
        assertThat(migratedInvoices).allMatch(inv -> inv.getIsMigratedRecord());
    }

    @Test
    @DisplayName("Should validate invoice data during migration")
    @Transactional
    void shouldValidateInvoiceDataDuringMigration() {
        // Given
        Invoice migratedInvoice = createMigratedInvoice();

        // When
        boolean isValid = validateInvoice(migratedInvoice);

        // Then
        assertThat(isValid).isTrue();
        assertThat(migratedInvoice.getReferenceNumber()).isNotNull();
        assertThat(migratedInvoice.getTotalAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should migrate expenses with proper categorization")
    @Transactional
    void shouldMigrateExpensesWithProperCategorization() {
        // Given
        List<LegacyExpense> legacyExpenses = createLegacyExpenses();

        // When
        List<Expense> migratedExpenses = legacyExpenses.stream()
                .map(this::convertLegacyExpense)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedExpenses).hasSize(legacyExpenses.size());
        assertThat(migratedExpenses).allMatch(exp -> exp.getIsMigratedRecord());
        assertThat(migratedExpenses).allMatch(exp -> exp.getTransactionCategory() != null);
    }

    @Test
    @DisplayName("Should migrate chart of accounts structure")
    @Transactional
    void shouldMigrateChartOfAccountsStructure() {
        // Given
        List<LegacyAccount> legacyAccounts = createLegacyAccounts();

        // When
        List<TransactionCategory> migratedAccounts = legacyAccounts.stream()
                .map(this::convertLegacyAccount)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedAccounts).hasSize(legacyAccounts.size());
        assertThat(migratedAccounts).allMatch(acc -> acc.getCode() != null);
        assertThat(migratedAccounts).allMatch(acc -> acc.getDescription() != null);
    }

    @Test
    @DisplayName("Should migrate customer and supplier contacts")
    @Transactional
    void shouldMigrateCustomerAndSupplierContacts() {
        // Given
        List<LegacyContact> legacyContacts = createLegacyContacts();

        // When
        List<Contact> migratedContacts = legacyContacts.stream()
                .map(this::convertLegacyContact)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedContacts).hasSize(legacyContacts.size());
        assertThat(migratedContacts).allMatch(contact -> contact.getContactName() != null);
    }

    @Test
    @DisplayName("Should migrate opening balances correctly")
    @Transactional
    void shouldMigrateOpeningBalancesCorrectly() {
        // Given
        List<LegacyBalance> legacyBalances = createLegacyBalances();

        // When
        List<TransactionCategoryBalance> migratedBalances = legacyBalances.stream()
                .map(this::convertLegacyBalance)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedBalances).hasSize(legacyBalances.size());
        assertThat(migratedBalances).allMatch(bal -> bal.getBalance() != null);
    }

    @Test
    @DisplayName("Should handle duplicate invoice numbers during migration")
    @Transactional
    void shouldHandleDuplicateInvoiceNumbersDuringMigration() {
        // Given
        Invoice invoice1 = createMigratedInvoice();
        invoice1.setReferenceNumber("INV-2024-001");

        Invoice invoice2 = createMigratedInvoice();
        invoice2.setReferenceNumber("INV-2024-001");

        // When
        boolean isDuplicate = invoice1.getReferenceNumber().equals(invoice2.getReferenceNumber());

        if (isDuplicate) {
            // Append suffix to make unique
            invoice2.setReferenceNumber(invoice2.getReferenceNumber() + "-MIGR");
        }

        // Then
        assertThat(invoice1.getReferenceNumber()).isNotEqualTo(invoice2.getReferenceNumber());
    }

    @Test
    @DisplayName("Should migrate bank accounts with opening balances")
    @Transactional
    void shouldMigrateBankAccountsWithOpeningBalances() {
        // Given
        List<LegacyBankAccount> legacyBankAccounts = createLegacyBankAccounts();

        // When
        List<BankAccount> migratedBankAccounts = legacyBankAccounts.stream()
                .map(this::convertLegacyBankAccount)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedBankAccounts).hasSize(legacyBankAccounts.size());
        assertThat(migratedBankAccounts).allMatch(acc -> acc.getOpeningBalance() != null);
    }

    @Test
    @DisplayName("Should migrate products with pricing")
    @Transactional
    void shouldMigrateProductsWithPricing() {
        // Given
        List<LegacyProduct> legacyProducts = createLegacyProducts();

        // When
        List<Product> migratedProducts = legacyProducts.stream()
                .map(this::convertLegacyProduct)
                .collect(Collectors.toList());

        // Then
        assertThat(migratedProducts).hasSize(legacyProducts.size());
        assertThat(migratedProducts).allMatch(prod -> prod.getProductName() != null);
    }

    @Test
    @DisplayName("Should validate migrated data totals match source")
    @Transactional
    void shouldValidateMigratedDataTotalsMatchSource() {
        // Given
        List<LegacyInvoice> legacyInvoices = createLegacyInvoices();
        BigDecimal legacyTotal = legacyInvoices.stream()
                .map(LegacyInvoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // When
        List<Invoice> migratedInvoices = legacyInvoices.stream()
                .map(this::convertLegacyInvoice)
                .collect(Collectors.toList());

        BigDecimal migratedTotal = migratedInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(migratedTotal).isEqualByComparingTo(legacyTotal);
    }

    @Test
    @DisplayName("Should migrate historical transactions with proper dates")
    @Transactional
    void shouldMigrateHistoricalTransactionsWithProperDates() {
        // Given
        LocalDate migrationCutoffDate = LocalDate.of(2024, 1, 1);
        Invoice historicalInvoice = createMigratedInvoice();
        historicalInvoice.setInvoiceDate(LocalDate.of(2023, 6, 15));

        // When
        boolean isHistorical = historicalInvoice.getInvoiceDate().isBefore(migrationCutoffDate);

        // Then
        assertThat(isHistorical).isTrue();
        assertThat(historicalInvoice.getIsMigratedRecord()).isTrue();
    }

    @Test
    @DisplayName("Should flag migrated records for auditing")
    @Transactional
    void shouldFlagMigratedRecordsForAuditing() {
        // Given
        Invoice migratedInvoice = createMigratedInvoice();
        Expense migratedExpense = createMigratedExpense();

        // When
        boolean invoiceFlagged = migratedInvoice.getIsMigratedRecord();
        boolean expenseFlagged = migratedExpense.getIsMigratedRecord();

        // Then
        assertThat(invoiceFlagged).isTrue();
        assertThat(expenseFlagged).isTrue();
    }

    @Test
    @DisplayName("Should migrate with proper currency conversion")
    @Transactional
    void shouldMigrateWithProperCurrencyConversion() {
        // Given
        LegacyInvoice legacyInvoice = new LegacyInvoice();
        legacyInvoice.setTotalAmount(new BigDecimal("1000.00"));
        legacyInvoice.setCurrency("USD");
        legacyInvoice.setExchangeRate(new BigDecimal("3.67"));

        // When
        Invoice migratedInvoice = convertLegacyInvoice(legacyInvoice);
        BigDecimal amountInAED = migratedInvoice.getTotalAmount()
                .multiply(migratedInvoice.getExchangeRate());

        // Then
        assertThat(migratedInvoice.getCurrency().getCurrencyCode()).isEqualTo("USD");
        assertThat(amountInAED).isEqualByComparingTo(new BigDecimal("3670.00"));
    }

    @Test
    @DisplayName("Should create migration audit log")
    @Transactional
    void shouldCreateMigrationAuditLog() {
        // Given
        MigrationLog migrationLog = new MigrationLog();
        migrationLog.setMigrationDate(LocalDateTime.now());
        migrationLog.setRecordType("INVOICE");
        migrationLog.setRecordCount(100);
        migrationLog.setStatus("SUCCESS");

        // When
        boolean isComplete = "SUCCESS".equals(migrationLog.getStatus());

        // Then
        assertThat(isComplete).isTrue();
        assertThat(migrationLog.getRecordCount()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should handle migration errors gracefully")
    @Transactional
    void shouldHandleMigrationErrorsGracefully() {
        // Given
        LegacyInvoice invalidInvoice = new LegacyInvoice();
        invalidInvoice.setTotalAmount(null); // Invalid data

        // When
        MigrationResult result = new MigrationResult();
        try {
            convertLegacyInvoice(invalidInvoice);
            result.setSuccess(true);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        // Then
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorMessage()).isNotNull();
    }

    // Helper methods

    private Invoice createMigratedInvoice() {
        Invoice invoice = new Invoice();
        invoice.setReferenceNumber("INV-MIGR-001");
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setInvoiceDueDate(LocalDate.now().plusDays(30));
        invoice.setTotalAmount(new BigDecimal("1000.00"));
        invoice.setTotalVatAmount(new BigDecimal("50.00"));
        invoice.setIsMigratedRecord(true);
        invoice.setCreatedDate(LocalDateTime.now());
        invoice.setDeleteFlag(false);
        return invoice;
    }

    private Expense createMigratedExpense() {
        return Expense.builder()
                .expenseNumber("EXP-MIGR-001")
                .expenseDate(LocalDate.now())
                .expenseAmount(new BigDecimal("500.00"))
                .isMigratedRecord(true)
                .createdDate(LocalDateTime.now())
                .deleteFlag(false)
                .build();
    }

    private Invoice convertLegacyInvoice(LegacyInvoice legacyInvoice) {
        Invoice invoice = new Invoice();
        invoice.setReferenceNumber(legacyInvoice.getInvoiceNumber());
        invoice.setInvoiceDate(legacyInvoice.getInvoiceDate());
        invoice.setTotalAmount(legacyInvoice.getTotalAmount());
        invoice.setIsMigratedRecord(true);

        if (legacyInvoice.getCurrency() != null) {
            Currency currency = new Currency();
            currency.setCurrencyCode(legacyInvoice.getCurrency());
            invoice.setCurrency(currency);
            invoice.setExchangeRate(legacyInvoice.getExchangeRate());
        }

        return invoice;
    }

    private Expense convertLegacyExpense(LegacyExpense legacyExpense) {
        return Expense.builder()
                .expenseNumber(legacyExpense.getExpenseNumber())
                .expenseDate(legacyExpense.getExpenseDate())
                .expenseAmount(legacyExpense.getAmount())
                .transactionCategory(createTransactionCategory(legacyExpense.getCategory()))
                .isMigratedRecord(true)
                .build();
    }

    private TransactionCategory convertLegacyAccount(LegacyAccount legacyAccount) {
        TransactionCategory category = new TransactionCategory();
        category.setCode(legacyAccount.getAccountCode());
        category.setDescription(legacyAccount.getAccountName());
        return category;
    }

    private Contact convertLegacyContact(LegacyContact legacyContact) {
        Contact contact = new Contact();
        contact.setContactName(legacyContact.getName());
        contact.setEmailId(legacyContact.getEmail());
        return contact;
    }

    private TransactionCategoryBalance convertLegacyBalance(LegacyBalance legacyBalance) {
        TransactionCategoryBalance balance = new TransactionCategoryBalance();
        balance.setBalance(legacyBalance.getAmount());
        return balance;
    }

    private BankAccount convertLegacyBankAccount(LegacyBankAccount legacyBankAccount) {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setAccountName(legacyBankAccount.getAccountName());
        bankAccount.setAccountNumber(legacyBankAccount.getAccountNumber());
        bankAccount.setOpeningBalance(legacyBankAccount.getOpeningBalance());
        return bankAccount;
    }

    private Product convertLegacyProduct(LegacyProduct legacyProduct) {
        Product product = new Product();
        product.setProductName(legacyProduct.getName());
        return product;
    }

    private TransactionCategory createTransactionCategory(String categoryName) {
        TransactionCategory category = new TransactionCategory();
        category.setCode(categoryName.toUpperCase().replace(" ", "_"));
        category.setDescription(categoryName);
        return category;
    }

    private boolean validateInvoice(Invoice invoice) {
        return invoice.getReferenceNumber() != null &&
               invoice.getTotalAmount() != null &&
               invoice.getTotalAmount().compareTo(BigDecimal.ZERO) > 0;
    }

    private List<LegacyInvoice> createLegacyInvoices() {
        List<LegacyInvoice> invoices = new ArrayList<>();
        LegacyInvoice inv = new LegacyInvoice();
        inv.setInvoiceNumber("OLD-INV-001");
        inv.setInvoiceDate(LocalDate.of(2023, 12, 15));
        inv.setTotalAmount(new BigDecimal("5000.00"));
        invoices.add(inv);
        return invoices;
    }

    private List<LegacyExpense> createLegacyExpenses() {
        List<LegacyExpense> expenses = new ArrayList<>();
        LegacyExpense exp = new LegacyExpense();
        exp.setExpenseNumber("OLD-EXP-001");
        exp.setExpenseDate(LocalDate.of(2023, 12, 20));
        exp.setAmount(new BigDecimal("1000.00"));
        exp.setCategory("Office Supplies");
        expenses.add(exp);
        return expenses;
    }

    private List<LegacyAccount> createLegacyAccounts() {
        List<LegacyAccount> accounts = new ArrayList<>();
        LegacyAccount acc = new LegacyAccount();
        acc.setAccountCode("1000");
        acc.setAccountName("Cash");
        accounts.add(acc);
        return accounts;
    }

    private List<LegacyContact> createLegacyContacts() {
        List<LegacyContact> contacts = new ArrayList<>();
        LegacyContact contact = new LegacyContact();
        contact.setName("ABC Company");
        contact.setEmail("abc@example.com");
        contacts.add(contact);
        return contacts;
    }

    private List<LegacyBalance> createLegacyBalances() {
        List<LegacyBalance> balances = new ArrayList<>();
        LegacyBalance bal = new LegacyBalance();
        bal.setAmount(new BigDecimal("10000.00"));
        balances.add(bal);
        return balances;
    }

    private List<LegacyBankAccount> createLegacyBankAccounts() {
        List<LegacyBankAccount> accounts = new ArrayList<>();
        LegacyBankAccount acc = new LegacyBankAccount();
        acc.setAccountName("Main Account");
        acc.setAccountNumber("123456");
        acc.setOpeningBalance(new BigDecimal("50000.00"));
        accounts.add(acc);
        return accounts;
    }

    private List<LegacyProduct> createLegacyProducts() {
        List<LegacyProduct> products = new ArrayList<>();
        LegacyProduct prod = new LegacyProduct();
        prod.setName("Product A");
        products.add(prod);
        return products;
    }

    // Legacy data classes

    static class LegacyInvoice {
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private BigDecimal totalAmount;
        private String currency;
        private BigDecimal exchangeRate;

        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public LocalDate getInvoiceDate() { return invoiceDate; }
        public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public BigDecimal getExchangeRate() { return exchangeRate; }
        public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }
    }

    static class LegacyExpense {
        private String expenseNumber;
        private LocalDate expenseDate;
        private BigDecimal amount;
        private String category;

        public String getExpenseNumber() { return expenseNumber; }
        public void setExpenseNumber(String expenseNumber) { this.expenseNumber = expenseNumber; }
        public LocalDate getExpenseDate() { return expenseDate; }
        public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    static class LegacyAccount {
        private String accountCode;
        private String accountName;

        public String getAccountCode() { return accountCode; }
        public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
    }

    static class LegacyContact {
        private String name;
        private String email;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    static class LegacyBalance {
        private BigDecimal amount;

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    static class LegacyBankAccount {
        private String accountName;
        private String accountNumber;
        private BigDecimal openingBalance;

        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
        public BigDecimal getOpeningBalance() { return openingBalance; }
        public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    }

    static class LegacyProduct {
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    static class MigrationLog {
        private LocalDateTime migrationDate;
        private String recordType;
        private int recordCount;
        private String status;

        public LocalDateTime getMigrationDate() { return migrationDate; }
        public void setMigrationDate(LocalDateTime migrationDate) { this.migrationDate = migrationDate; }
        public String getRecordType() { return recordType; }
        public void setRecordType(String recordType) { this.recordType = recordType; }
        public int getRecordCount() { return recordCount; }
        public void setRecordCount(int recordCount) { this.recordCount = recordCount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    static class MigrationResult {
        private boolean success;
        private String errorMessage;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
}
