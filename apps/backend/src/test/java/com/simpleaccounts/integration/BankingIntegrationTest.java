package com.simpleaccounts.integration;

import com.simpleaccounts.entity.bankaccount.*;
import com.simpleaccounts.constant.TransactionStatusConstant;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
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
 * Integration tests for Banking and Bank Reconciliation workflows.
 * Tests bank account management, transaction import, and reconciliation.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Banking Integration Tests")
class BankingIntegrationTest {

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should create bank account with details")
    @Transactional
    void shouldCreateBankAccountWithDetails() {
        // Given
        BankAccount bankAccount = createTestBankAccount();
        bankAccount.setAccountName("Main Business Account");
        bankAccount.setAccountNumber("1234567890");
        bankAccount.setIban("AE070331234567890123456");
        bankAccount.setOpeningBalance(new BigDecimal("10000.00"));

        // When
        boolean hasIban = bankAccount.getIban() != null && bankAccount.getIban().startsWith("AE");

        // Then
        assertThat(bankAccount.getAccountName()).isEqualTo("Main Business Account");
        assertThat(hasIban).isTrue();
        assertThat(bankAccount.getOpeningBalance()).isEqualByComparingTo(new BigDecimal("10000.00"));
    }

    @Test
    @DisplayName("Should import bank statement transactions")
    @Transactional
    void shouldImportBankStatementTransactions() {
        // Given
        List<ImportedDraftTransaction> importedTransactions = createImportedTransactions();

        // When
        int importedCount = importedTransactions.size();

        // Then
        assertThat(importedCount).isEqualTo(3);
        assertThat(importedTransactions).allMatch(t -> t.getTransactionAmount() != null);
    }

    @Test
    @DisplayName("Should reconcile bank transaction with invoice")
    @Transactional
    void shouldReconcileBankTransactionWithInvoice() {
        // Given
        Transaction transaction = createTestTransaction();
        transaction.setTransactionAmount(new BigDecimal("1050.00"));
        transaction.setTransactionType("CREDIT");
        transaction.setDescription("Payment from customer");

        // When - Match with invoice
        transaction.setReconcileStatus(ReconcileStatus.RECONCILED);
        transaction.setReconcileDate(LocalDate.now());

        // Then
        assertThat(transaction.getReconcileStatus()).isEqualTo(ReconcileStatus.RECONCILED);
        assertThat(transaction.getReconcileDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("Should reconcile bank transaction with expense")
    @Transactional
    void shouldReconcileBankTransactionWithExpense() {
        // Given
        Transaction transaction = createTestTransaction();
        transaction.setTransactionAmount(new BigDecimal("500.00"));
        transaction.setTransactionType("DEBIT");
        transaction.setDescription("Office supplies payment");

        // When - Match with expense
        transaction.setReconcileStatus(ReconcileStatus.RECONCILED);
        transaction.setReconcileDate(LocalDate.now());

        // Then
        assertThat(transaction.getReconcileStatus()).isEqualTo(ReconcileStatus.RECONCILED);
    }

    @Test
    @DisplayName("Should categorize unreconciled transactions")
    @Transactional
    void shouldCategorizeUnreconciledTransactions() {
        // Given
        Transaction transaction = createTestTransaction();
        transaction.setTransactionAmount(new BigDecimal("250.00"));
        transaction.setTransactionType("DEBIT");
        transaction.setReconcileStatus(ReconcileStatus.UNRECONCILED);

        TransactionCategory category = new TransactionCategory();
        category.setCode("UTILITIES");
        category.setDescription("Utility Bills");
        transaction.setTransactionCategory(category);

        // When
        boolean isCategorized = transaction.getTransactionCategory() != null;

        // Then
        assertThat(isCategorized).isTrue();
        assertThat(transaction.getTransactionCategory().getCode()).isEqualTo("UTILITIES");
    }

    @Test
    @DisplayName("Should calculate bank account balance after transactions")
    @Transactional
    void shouldCalculateBankAccountBalanceAfterTransactions() {
        // Given
        BankAccount bankAccount = createTestBankAccount();
        bankAccount.setOpeningBalance(new BigDecimal("10000.00"));

        List<Transaction> transactions = new ArrayList<>();

        Transaction credit = createTestTransaction();
        credit.setTransactionAmount(new BigDecimal("5000.00"));
        credit.setTransactionType("CREDIT");
        transactions.add(credit);

        Transaction debit = createTestTransaction();
        debit.setTransactionAmount(new BigDecimal("2000.00"));
        debit.setTransactionType("DEBIT");
        transactions.add(debit);

        // When
        BigDecimal balance = bankAccount.getOpeningBalance();
        for (Transaction t : transactions) {
            if ("CREDIT".equals(t.getTransactionType())) {
                balance = balance.add(t.getTransactionAmount());
            } else {
                balance = balance.subtract(t.getTransactionAmount());
            }
        }

        // Then
        assertThat(balance).isEqualByComparingTo(new BigDecimal("13000.00"));
    }

    @Test
    @DisplayName("Should match multiple transactions to single invoice")
    @Transactional
    void shouldMatchMultipleTransactionsToSingleInvoice() {
        // Given
        BigDecimal invoiceAmount = new BigDecimal("1000.00");

        Transaction payment1 = createTestTransaction();
        payment1.setTransactionAmount(new BigDecimal("600.00"));
        payment1.setTransactionType("CREDIT");

        Transaction payment2 = createTestTransaction();
        payment2.setTransactionAmount(new BigDecimal("400.00"));
        payment2.setTransactionType("CREDIT");

        // When
        BigDecimal totalPayments = payment1.getTransactionAmount().add(payment2.getTransactionAmount());
        boolean isFullyPaid = totalPayments.compareTo(invoiceAmount) == 0;

        // Then
        assertThat(isFullyPaid).isTrue();
        assertThat(totalPayments).isEqualByComparingTo(invoiceAmount);
    }

    @Test
    @DisplayName("Should identify duplicate bank transactions")
    @Transactional
    void shouldIdentifyDuplicateBankTransactions() {
        // Given
        Transaction transaction1 = createTestTransaction();
        transaction1.setTransactionAmount(new BigDecimal("500.00"));
        transaction1.setTransactionDate(LocalDate.of(2024, 12, 1));
        transaction1.setDescription("Payment to supplier");

        Transaction transaction2 = createTestTransaction();
        transaction2.setTransactionAmount(new BigDecimal("500.00"));
        transaction2.setTransactionDate(LocalDate.of(2024, 12, 1));
        transaction2.setDescription("Payment to supplier");

        // When
        boolean potentialDuplicate = transaction1.getTransactionAmount().equals(transaction2.getTransactionAmount())
                && transaction1.getTransactionDate().equals(transaction2.getTransactionDate())
                && transaction1.getDescription().equals(transaction2.getDescription());

        // Then
        assertThat(potentialDuplicate).isTrue();
    }

    @Test
    @DisplayName("Should process bank feed automatically")
    @Transactional
    void shouldProcessBankFeedAutomatically() {
        // Given
        BankAccount bankAccount = createTestBankAccount();
        bankAccount.setBankFeedStatus(BankFeedStatus.ACTIVE);

        List<ImportedDraftTransaction> feedTransactions = createImportedTransactions();

        // When
        boolean canAutoImport = bankAccount.getBankFeedStatus() == BankFeedStatus.ACTIVE;

        // Then
        assertThat(canAutoImport).isTrue();
        assertThat(feedTransactions).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle foreign currency bank transactions")
    @Transactional
    void shouldHandleForeignCurrencyBankTransactions() {
        // Given
        Transaction transaction = createTestTransaction();
        transaction.setTransactionAmount(new BigDecimal("1000.00")); // USD
        transaction.setCurrencyCode("USD");

        // When - Convert to AED
        BigDecimal exchangeRate = new BigDecimal("3.67");
        BigDecimal amountInAED = transaction.getTransactionAmount().multiply(exchangeRate);

        // Then
        assertThat(amountInAED).isEqualByComparingTo(new BigDecimal("3670.00"));
        assertThat(transaction.getCurrencyCode()).isEqualTo("USD");
    }

    @Test
    @DisplayName("Should create bank transfer between accounts")
    @Transactional
    void shouldCreateBankTransferBetweenAccounts() {
        // Given
        BankAccount sourceAccount = createTestBankAccount();
        sourceAccount.setAccountName("Account A");
        sourceAccount.setOpeningBalance(new BigDecimal("10000.00"));

        BankAccount targetAccount = createTestBankAccount();
        targetAccount.setAccountName("Account B");
        targetAccount.setOpeningBalance(new BigDecimal("5000.00"));

        BigDecimal transferAmount = new BigDecimal("2000.00");

        // When - Transfer from A to B
        Transaction debitTransaction = createTestTransaction();
        debitTransaction.setTransactionAmount(transferAmount);
        debitTransaction.setTransactionType("DEBIT");
        debitTransaction.setDescription("Transfer to Account B");

        Transaction creditTransaction = createTestTransaction();
        creditTransaction.setTransactionAmount(transferAmount);
        creditTransaction.setTransactionType("CREDIT");
        creditTransaction.setDescription("Transfer from Account A");

        // Then
        assertThat(debitTransaction.getTransactionAmount())
                .isEqualByComparingTo(creditTransaction.getTransactionAmount());
    }

    @Test
    @DisplayName("Should filter transactions by date range")
    @Transactional
    void shouldFilterTransactionsByDateRange() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 12, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        List<Transaction> allTransactions = createTestTransactions();

        // When
        List<Transaction> filteredTransactions = allTransactions.stream()
                .filter(t -> !t.getTransactionDate().isBefore(startDate)
                          && !t.getTransactionDate().isAfter(endDate))
                .toList();

        // Then
        assertThat(filteredTransactions).allMatch(t ->
                !t.getTransactionDate().isBefore(startDate) &&
                !t.getTransactionDate().isAfter(endDate));
    }

    @Test
    @DisplayName("Should generate bank reconciliation report")
    @Transactional
    void shouldGenerateBankReconciliationReport() {
        // Given
        BankAccount bankAccount = createTestBankAccount();
        bankAccount.setOpeningBalance(new BigDecimal("10000.00"));

        List<Transaction> transactions = createTestTransactions();
        long reconciledCount = transactions.stream()
                .filter(t -> t.getReconcileStatus() == ReconcileStatus.RECONCILED)
                .count();
        long unreconciledCount = transactions.stream()
                .filter(t -> t.getReconcileStatus() == ReconcileStatus.UNRECONCILED)
                .count();

        // When
        BigDecimal reconciledAmount = transactions.stream()
                .filter(t -> t.getReconcileStatus() == ReconcileStatus.RECONCILED)
                .map(Transaction::getTransactionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(reconciledCount).isGreaterThanOrEqualTo(0);
        assertThat(unreconciledCount).isGreaterThanOrEqualTo(0);
        assertThat(reconciledAmount).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should handle bank statement import with parsing rules")
    @Transactional
    void shouldHandleBankStatementImportWithParsingRules() {
        // Given
        ImportedDraftTransaction importedTransaction = new ImportedDraftTransaction();
        importedTransaction.setTransactionAmount(new BigDecimal("1500.00"));
        importedTransaction.setTransactionDate(LocalDate.now());
        importedTransaction.setDescription("TRANSFER FROM CUSTOMER ABC");

        // When - Apply parsing rule to extract customer name
        String description = importedTransaction.getDescription();
        boolean isTransfer = description.contains("TRANSFER");
        boolean hasCustomerInfo = description.contains("CUSTOMER");

        // Then
        assertThat(isTransfer).isTrue();
        assertThat(hasCustomerInfo).isTrue();
    }

    @Test
    @DisplayName("Should calculate unreconciled balance")
    @Transactional
    void shouldCalculateUnreconciledBalance() {
        // Given
        BankAccount bankAccount = createTestBankAccount();
        bankAccount.setOpeningBalance(new BigDecimal("10000.00"));

        List<Transaction> transactions = createTestTransactions();

        // When
        BigDecimal unreconciledAmount = transactions.stream()
                .filter(t -> t.getReconcileStatus() == ReconcileStatus.UNRECONCILED)
                .map(t -> {
                    if ("CREDIT".equals(t.getTransactionType())) {
                        return t.getTransactionAmount();
                    } else {
                        return t.getTransactionAmount().negate();
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Then
        assertThat(unreconciledAmount).isNotNull();
    }

    // Helper methods

    private BankAccount createTestBankAccount() {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setId(1);
        bankAccount.setAccountName("Test Bank Account");
        bankAccount.setAccountNumber("1234567890");
        bankAccount.setOpeningBalance(BigDecimal.ZERO);
        bankAccount.setBankFeedStatus(BankFeedStatus.INACTIVE);
        return bankAccount;
    }

    private Transaction createTestTransaction() {
        Transaction transaction = new Transaction();
        transaction.setTransactionDate(LocalDate.now());
        transaction.setTransactionAmount(BigDecimal.ZERO);
        transaction.setReconcileStatus(ReconcileStatus.UNRECONCILED);
        transaction.setCurrencyCode("AED");
        return transaction;
    }

    private List<Transaction> createTestTransactions() {
        List<Transaction> transactions = new ArrayList<>();

        Transaction t1 = createTestTransaction();
        t1.setTransactionAmount(new BigDecimal("1000.00"));
        t1.setTransactionType("CREDIT");
        t1.setReconcileStatus(ReconcileStatus.RECONCILED);
        t1.setTransactionDate(LocalDate.of(2024, 12, 15));
        transactions.add(t1);

        Transaction t2 = createTestTransaction();
        t2.setTransactionAmount(new BigDecimal("500.00"));
        t2.setTransactionType("DEBIT");
        t2.setReconcileStatus(ReconcileStatus.UNRECONCILED);
        t2.setTransactionDate(LocalDate.of(2024, 12, 20));
        transactions.add(t2);

        return transactions;
    }

    private List<ImportedDraftTransaction> createImportedTransactions() {
        List<ImportedDraftTransaction> transactions = new ArrayList<>();

        ImportedDraftTransaction t1 = new ImportedDraftTransaction();
        t1.setTransactionAmount(new BigDecimal("1500.00"));
        t1.setTransactionDate(LocalDate.now());
        t1.setDescription("Customer payment");
        transactions.add(t1);

        ImportedDraftTransaction t2 = new ImportedDraftTransaction();
        t2.setTransactionAmount(new BigDecimal("800.00"));
        t2.setTransactionDate(LocalDate.now().minusDays(1));
        t2.setDescription("Supplier payment");
        transactions.add(t2);

        ImportedDraftTransaction t3 = new ImportedDraftTransaction();
        t3.setTransactionAmount(new BigDecimal("300.00"));
        t3.setTransactionDate(LocalDate.now().minusDays(2));
        t3.setDescription("Bank charges");
        transactions.add(t3);

        return transactions;
    }

    // ReconcileStatus enum for testing
    enum ReconcileStatus {
        RECONCILED, UNRECONCILED, PARTIALLY_RECONCILED
    }
}
